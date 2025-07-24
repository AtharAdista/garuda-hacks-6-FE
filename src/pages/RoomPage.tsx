import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useLocation, useNavigate } from "react-router-dom";

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

  useEffect(() => {
    // Check for room data in localStorage (in case of refresh)
    let currentRoomId = roomId;
    let currentPlayerId = playerId;
    let currentIsCreator = isCreator;

    if (!currentRoomId || !currentPlayerId) {
      const savedRoomData = localStorage.getItem('currentRoom');
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
      localStorage.setItem('currentRoom', JSON.stringify({
        roomId: currentRoomId,
        playerId: currentPlayerId,
        isCreator: currentIsCreator
      }));
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
          console.log("Auto-creating room after connect:", currentRoomId, "for user:", currentPlayerId);
          socket.emit("createRoom", { roomId: currentRoomId, userId: currentPlayerId });
        } else {
          console.log("Auto-joining room after connect:", currentRoomId, "for user:", currentPlayerId);
          socket.emit("joinRoom", { roomId: currentRoomId, userId: currentPlayerId });
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
      setReconnectAttempts(prev => prev + 1);
    });

    // Room events
    const handleRoomCreated = ({ roomId, userId, health }: any) => {
      console.log("Room created:", roomId, "User:", userId, "Health:", health);
      // Request room data after a short delay to ensure room is properly set up
      setTimeout(() => socket.emit("requestRoomData", { roomId }), 200);
    };

    const handleRoomJoined = ({ roomId, userId, health }: any) => {
      console.log("Room joined:", roomId, "User:", userId, "Health:", health);
      // Request room data after a short delay to ensure room is properly set up
      setTimeout(() => socket.emit("requestRoomData", { roomId }), 200);
    };

    const handleRoomData = ({ roomId, players: roomPlayers, playerCount }: any) => {
      console.log("Room data received:", roomId, roomPlayers, "Player count:", playerCount);
      const playerArray = Object.entries(roomPlayers).map(
        ([userId, playerData]: [string, any]) => ({
          id: userId,
          username: playerData.userId, // or fetch username from your user data
          health: playerData.health,
        })
      );
      setPlayers(playerArray);
    };

    const handleError = (error: any) => {
      console.error("Socket error:", error);
      
      // Show error to user
      if (typeof error === 'string') {
        alert(`Error: ${error}`);
      } else if (error?.message) {
        alert(`Error: ${error.message}`);
      }
      
      // If error is about room not found and we have saved data, try to rejoin
      if (error.includes && error.includes("Room not found") && reconnectAttempts < 3) {
        console.log("Room not found, attempting to rejoin...");
        setTimeout(() => {
          if (currentIsCreator) {
            socket.emit("createRoom", { roomId: currentRoomId, userId: currentPlayerId });
          } else {
            socket.emit("joinRoom", { roomId: currentRoomId, userId: currentPlayerId });
          }
          setReconnectAttempts(prev => prev + 1);
        }, 1000);
      }
    };

    const handlePlayerLeft = ({ userId }: any) => {
      console.log("Player left:", userId);
      // Refresh room data when someone leaves
      setTimeout(() => socket.emit("requestRoomData", { roomId: currentRoomId }), 500);
    };

    const handleGameStarted = ({ roomId: eventRoomId } = {}) => {
      console.log("Game is starting! Event data:", { eventRoomId });
      console.log("Current room data:", { currentRoomId, currentPlayerId });
      console.log("Socket instance:", socketRef.current?.id);
      
      // Save game data to localStorage for GamePage to use
      localStorage.setItem('gameRoom', JSON.stringify({
        roomId: currentRoomId,
        playerId: currentPlayerId,
        socketId: socketRef.current?.id
      }));
      
      // Clear room data from localStorage since we're moving to game
      localStorage.removeItem('currentRoom');
      
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
      setReconnectAttempts(prev => prev + 1);
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
      
      // Don't emit leaveRoom or disconnect here since we want to maintain
      // the connection when navigating to the game page
    };
  }, [navigate, reconnectAttempts]); // Removed roomId, playerId, isCreator from deps since we get them from localStorage

  // Get current room data (from props or localStorage)
  const currentRoomId = roomId || JSON.parse(localStorage.getItem('currentRoom') || '{}').roomId;
  const currentPlayerId = playerId || JSON.parse(localStorage.getItem('currentRoom') || '{}').playerId;

  return (
    <div className="m-24">
      <h2>Room ID: {currentRoomId}</h2>
      
      {/* Connection Status */}
      <div className="mb-4">
        <h3 className={`text-lg font-semibold ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
          Connection Status: {isConnected ? "Connected" : isReconnecting ? "Reconnecting..." : "Disconnected"}
        </h3>
        {reconnectAttempts > 0 && (
          <p className="text-yellow-600">Reconnect attempts: {reconnectAttempts}</p>
        )}
      </div>

      {/* Player List */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Player List ({players.length}/2 players):</h3>
        {players.length === 0 ? (
          <p className="text-gray-600">Loading players...</p>
        ) : (
          <ul className="list-disc list-inside">
            {players.map((player) => (
              <li key={player.id} className={`mb-1 ${player.id === currentPlayerId ? 'font-bold text-blue-600' : ''}`}>
                {player.username} (Health: {player.health || 3})
                {player.id === currentPlayerId && " (You)"}
              </li>
            ))}
          </ul>
        )}
        
        {players.length === 1 && (
          <p className="text-yellow-600 mt-2">Waiting for another player to join...</p>
        )}
      </div>

      {/* Start Game Button - Allow both players to start */}
      {players.length === 2 && isConnected && (
        <div className="mb-4">
          <button
            onClick={() => {
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
              
              console.log(`Emitting startGame event for room: ${currentRoomId}`);
              socketRef.current.emit("startGame", { roomId: currentRoomId });
            }}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
          >
            Start Game
          </button>
          <p className="text-sm text-gray-600 mt-2">Any player can start the game when ready</p>
        </div>
      )}

      {/* Room Link for Sharing */}
      <div className="mt-6 p-4 bg-gray-100 rounded-lg">
        <h4 className="font-semibold mb-2">Share this room:</h4>
        <p className="text-sm text-gray-700">Room Code: <code className="bg-white px-2 py-1 rounded">{currentRoomId}</code></p>
      </div>
    </div>
  );
}
