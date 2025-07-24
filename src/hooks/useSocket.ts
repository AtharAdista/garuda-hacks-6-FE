import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  useEffect(() => {
    const socket = io(SOCKET_URL);
    setSocketInstance(socket);

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Connected to socket:", socket.id);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Disconnected from socket");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return {
    socket: socketInstance,
    isConnected,
  };
};
