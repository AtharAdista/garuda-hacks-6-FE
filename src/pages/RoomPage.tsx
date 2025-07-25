import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";
import type { GameStartedPayload, PlayerLeftPayload, RoomDataPayload, RoomEventPayload } from "@/interfaces/game-type";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;

interface Player {
  id: string;
  username: string;
  health?: number;
}

export default function RoomPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId, playerId, isCreator } = location.state || {};

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isStartingGame, setIsStartingGame] = useState(false);

  useEffect(() => {
    // Check for room data in localStorage (in case of refresh)
    let currentRoomId = roomId;
    let currentPlayerId = playerId;
    let currentIsCreator = isCreator;

    if (!currentRoomId || !currentPlayerId) {
      const savedRoomData = localStorage.getItem("currentRoom");
      if (savedRoomData) {
        const roomData = JSON.parse(savedRoomData);
        currentRoomId = roomData.roomId;
        currentPlayerId = roomData.playerId;
        currentIsCreator = roomData.isCreator;
        console.log("Recovered room data from localStorage:", roomData);
      } else {
        navigate("/");
        return;
      }
    } else {
      // Save room data to localStorage
      localStorage.setItem(
        "currentRoom",
        JSON.stringify({
          roomId: currentRoomId,
          playerId: currentPlayerId,
          isCreator: currentIsCreator,
        })
      );
    }

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      setIsConnected(true);
      setIsReconnecting(false);
      setReconnectAttempts(0);
      console.log("Connected:", socket.id);

      // Auto-rejoin room if we were already in one (after refresh/reconnect)
      setTimeout(() => {
        if (currentIsCreator) {
          console.log(
            "Auto-creating room after connect:",
            currentRoomId,
            "for user:",
            currentPlayerId
          );
          socket.emit("createRoom", {
            roomId: currentRoomId,
            userId: currentPlayerId,
          });
        } else {
          console.log(
            "Auto-joining room after connect:",
            currentRoomId,
            "for user:",
            currentPlayerId
          );
          socket.emit("joinRoom", {
            roomId: currentRoomId,
            userId: currentPlayerId,
          });
        }
      }, 500); // Small delay to ensure connection is stable
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setIsReconnecting(true);
      console.log("Disconnected");
    });

    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setReconnectAttempts((prev) => prev + 1);
    });

    // Room events
    const handleRoomCreated = ({ roomId, userId, health }: RoomEventPayload) => {
      console.log("Room created:", roomId, "User:", userId, "Health:", health);
      setTimeout(() => socket.emit("requestRoomData", { roomId }), 200);
    };

    const handleRoomJoined = ({ roomId, userId, health }: RoomEventPayload) => {
      console.log("Room joined:", roomId, "User:", userId, "Health:", health);
      setTimeout(() => socket.emit("requestRoomData", { roomId }), 200);
    };

    const handleRoomData = ({ roomId, players: roomPlayers, playerCount }: RoomDataPayload) => {
      console.log("Room data received:", roomId, roomPlayers, "Player count:", playerCount);
      const playerArray = Object.entries(roomPlayers).map(
        ([userId, playerData]: [string, any]) => ({
          id: userId,
          username: playerData.userId, 
          health: playerData.health,
        })
      );
      setPlayers(playerArray);
    };

    const handleError = (error: any) => {
      console.error("Socket error:", error);
      
      if (typeof error === 'string') {
        alert(`Error: ${error}`);
      } else if (error?.message) {
        alert(`Error: ${error.message}`);
      }

      if (
        error.includes &&
        error.includes("Room not found") &&
        reconnectAttempts < 3
      ) {
        console.log("Room not found, attempting to rejoin...");
        setTimeout(() => {
          if (currentIsCreator) {
            socket.emit("createRoom", {
              roomId: currentRoomId,
              userId: currentPlayerId,
            });
          } else {
            socket.emit("joinRoom", {
              roomId: currentRoomId,
              userId: currentPlayerId,
            });
          }
          setReconnectAttempts((prev) => prev + 1);
        }, 1000);
      }
    };

    const handlePlayerLeft = ({ userId }: PlayerLeftPayload) => {
      console.log("Player left:", userId);
      // Refresh room data when someone leaves
      setTimeout(
        () => socket.emit("requestRoomData", { roomId: currentRoomId }),
        500
      );
    };

    const handleGameStarted = ({ roomId: eventRoomId }: GameStartedPayload = {roomId: ""}) => {
      console.log("Game is starting! Event data:", { eventRoomId });
      console.log("Current room data:", { currentRoomId, currentPlayerId });
      console.log("Socket instance:", socketRef.current?.id);

      // Save game data to localStorage for GamePage to use
      localStorage.setItem(
        "gameRoom",
        JSON.stringify({
          roomId: currentRoomId,
          playerId: currentPlayerId,
          socketId: socketRef.current?.id,
        })
      );

      // Clear room data from localStorage since we're moving to game
      localStorage.removeItem("currentRoom");

      // Navigate without passing socket object (causes DataCloneError)
      navigate("/game", {
        state: {
          roomId: currentRoomId,
          playerId: currentPlayerId,
          // Don't pass socket object - it can't be serialized
        },
      });

      console.log("Navigation to /game initiated");
    };

    // Register all event listeners
    socket.on("gameStarted", handleGameStarted);
    socket.on("roomCreated", handleRoomCreated);
    socket.on("joinedRoom", handleRoomJoined);
    socket.on("roomData", handleRoomData);
    socket.on("playerLeft", handlePlayerLeft);
    socket.on("error", handleError);
    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setReconnectAttempts((prev) => prev + 1);
    });

    // Room join/create is now handled in the connect event handler

    // Cleanup function
    return () => {
      console.log("Cleaning up room page");
      // Only disconnect if we're not navigating to game
      // The GamePage will handle the socket connection
      socket.off("gameStarted");
      socket.off("roomCreated");
      socket.off("joinedRoom");
      socket.off("roomData");
      socket.off("playerLeft");
      socket.off("error");
      socket.off("connect_error");
    };
  }, [navigate, reconnectAttempts]); // Removed roomId, playerId, isCreator from deps since we get them from

  // Get current room data (from props or localStorage)
  const currentRoomId =
    roomId || JSON.parse(localStorage.getItem("currentRoom") || "{}").roomId;
  const currentPlayerId =
    playerId ||
    JSON.parse(localStorage.getItem("currentRoom") || "{}").playerId;

  const copyRoomCode = async () => {
    try {
      await navigator.clipboard.writeText(currentRoomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleStartGame = () => {
    console.log("Start Game button clicked");
    console.log("Socket connected:", socketRef.current?.connected);
    console.log("Room ID:", currentRoomId);
    console.log("Player count:", players.length);

    if (!socketRef.current?.connected) {
      console.error("Socket not connected!");
      return;
    }

    if (!currentRoomId) {
      console.error("No room ID available!");
      return;
    }

    setIsStartingGame(true);
    console.log(`Emitting startGame event for room: ${currentRoomId}`);
    socketRef.current.emit("startGame", { roomId: currentRoomId });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-rose-100 to-pink-100 pt-20">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-20 w-32 h-32 bg-rose-400 rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-32 w-48 h-48 bg-rose-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-pink-400 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500 bg-clip-text text-transparent mb-4">
            Game Room
          </h1>
          <p className="text-gray-600 text-lg">
            Gather your friends and get ready to play!
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid gap-8 md:grid-cols-2">
          {/* Left Column - Room Info & Players */}
          <div className="space-y-6">
            {/* Room Code Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Share2 className="w-6 h-6 text-rose-600" />
                  Room Code
                </h3>
                {/* Connection Status */}
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <Wifi className="w-5 h-5" />
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-500">
                      <WifiOff className="w-5 h-5" />
                      <span className="text-sm font-medium">
                        {isReconnecting ? "Reconnecting..." : "Disconnected"}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500 rounded-xl p-4 text-center">
                <div className="text-3xl font-mono font-bold text-white tracking-wider mb-2">
                  {currentRoomId}
                </div>
                <button
                  onClick={copyRoomCode}
                  className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                >
                  {copied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Code
                    </>
                  )}
                </button>
              </div>

              {reconnectAttempts > 0 && (
                <div className="mt-3 text-center">
                  <span className="inline-flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reconnect attempts: {reconnectAttempts}
                  </span>
                </div>
              )}
            </div>

            {/* Players List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-rose-600" />
                  Players ({players.length}/2)
                </span>
              </h3>

              {players.length === 0 ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">Loading players...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {players.map((player, index) => (
                    <div
                      key={player.id}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all duration-200 ${
                        player.id === currentPlayerId
                          ? "bg-gradient-to-r from-pink-100 to-blue-100 border-2 border-pink-200"
                          : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                            index === 0
                              ? "bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500"
                              : "bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500"
                          }`}
                        >
                          {player.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">
                              {player.username}
                            </span>
                            {player.id === currentPlayerId && (
                              <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-medium">
                                You
                              </span>
                            )}
                            {isCreator && player.id === currentPlayerId && (
                              <Crown className="w-4 h-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span className="text-sm text-gray-600">
                              Health: {player.health || 3}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  ))}

                  {/* Empty slot */}
                  {players.length === 1 && (
                    <div className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-xl">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Users className="w-6 h-6 text-gray-400" />
                        </div>
                        <p className="text-gray-500 font-medium">
                          Waiting for another player to join...
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Share the room code above
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Game Controls & Info */}
          <div className="space-y-6">
            {/* Game Status & Start Button */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                Game Status
              </h3>

              {players.length === 2 && isConnected ? (
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-green-700 mb-2">
                    Ready to Start!
                  </h4>
                  <p className="text-gray-600 mb-6">
                    All players have joined the room
                  </p>

                  <button
                    onClick={handleStartGame}
                    disabled={isStartingGame}
                    className="w-full bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500 hover:from-pink-500 hover:to-rose-500 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isStartingGame ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Starting Game...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Play className="w-5 h-5" />
                        Start Game
                      </span>
                    )}
                  </button>

                  <p className="text-sm text-gray-500 mt-3">
                    Any player can start when everyone is ready
                  </p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-yellow-600" />
                  </div>
                  <h4 className="text-lg font-semibold text-yellow-700 mb-2">
                    Waiting for Players
                  </h4>
                  <p className="text-gray-600">
                    Need {2 - players.length} more player
                    {2 - players.length !== 1 ? "s" : ""} to start
                  </p>
                </div>
              )}
            </div>

            {/* How to Play */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
              <h3 className="text-xl font-bold text-gray-800 mb-4">
                How to Play
              </h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-pink-600 font-bold text-sm">1</span>
                  </div>
                  <p className="text-gray-600">
                    Share the room code with your friend
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-pink-600 font-bold text-sm">2</span>
                  </div>
                  <p className="text-gray-600">
                    Wait for them to join the room
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-pink-600 font-bold text-sm">3</span>
                  </div>
                  <p className="text-gray-600">Click "Start Game" when ready</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-pink-600 font-bold text-sm">4</span>
                  </div>
                  <p className="text-gray-600">Enjoy the game together!</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
