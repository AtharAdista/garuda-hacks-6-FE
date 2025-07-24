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

  useEffect(() => {
    if (!roomId || !playerId) {
      navigate("/");
      return;
    }

    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    // Connection events
    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected:", socket.id);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected");
    });

    // Room events
    const handleRoomCreated = ({ roomId, userId, health }: any) => {
      console.log("Room created:", roomId, "User:", userId, "Health:", health);
      socket.emit("requestRoomData", { roomId });
    };

    const handleRoomJoined = ({ roomId, userId, health }: any) => {
      console.log("Room joined:", roomId, "User:", userId, "Health:", health);
      socket.emit("requestRoomData", { roomId });
    };

    const handleRoomData = ({ roomId, players: roomPlayers }: any) => {
      console.log("Room data received:", roomId, roomPlayers);
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
    };

    const handlePlayerLeft = ({ userId }: any) => {
      console.log("Player left:", userId);
    };

    // Register all event listeners
    socket.on("roomCreated", handleRoomCreated);
    socket.on("joinedRoom", handleRoomJoined);
    socket.on("roomData", handleRoomData);
    socket.on("playerLeft", handlePlayerLeft);
    socket.on("error", handleError);

    // Join or create room
    if (isCreator) {
      console.log("Creating room:", roomId, "for user:", playerId);
      socket.emit("createRoom", { roomId, userId: playerId });
    } else {
      console.log("Joining room:", roomId, "for user:", playerId);
      socket.emit("joinRoom", { roomId, userId: playerId });
    }

    // Cleanup function
    return () => {
      console.log("Cleaning up socket connection");
      socket.emit("leaveRoom", { roomId, userId: playerId });
      socket.off("connect");
      socket.off("disconnect");
      socket.off("roomCreated");
      socket.off("joinedRoom");
      socket.off("roomData");
      socket.off("playerLeft");
      socket.off("error");
      socket.disconnect();
    };
  }, [roomId, playerId, isCreator, navigate]);

  return (
    <div className="m-24">
      <h2>Room ID: {roomId}</h2>
      <h3>Connection Status: {isConnected ? "Connected" : "Disconnected"}</h3>
      <h3>Player List ({players.length} players):</h3>
      <ul>
        {players.map((player) => (
          <li key={player.id}>
            {player.username} (Health: {player.health || 3})
          </li>
        ))}
      </ul>

      {players.length == 2 && (
        <button
          onClick={() => console.log("Game started")}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Start Game
        </button>
      )}
      {players.length === 0 && <p>Loading players...</p>}
    </div>
  );
}
