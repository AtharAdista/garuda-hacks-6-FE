import { useState, useEffect, useCallback, useRef } from "react";

interface StreamDataItem {
  province: string;
  media_type: string;
  media_url: string;
  cultural_category: string;
  query: string;
  cultural_context: string;
}

export interface SSEData {
  data: StreamDataItem[];
  error: string | null;
  isConnected: boolean;
  isCompleted: boolean;
  connectionState: "idle" | "connecting" | "connected" | "error" | "completed";
}

export const useSSE = (url: string) => {
  const [data, setData] = useState<StreamDataItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [connectionState, setConnectionState] =
    useState<SSEData["connectionState"]>("idle");

  const eventSourceRef = useRef<EventSource | null>(null);
  const backendUrl =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

  const connect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setConnectionState("connecting");
    setError(null);
    setData([]);
    setIsCompleted(false);

    try {
      const fullUrl = `${backendUrl}${url}`;
      const eventSource = new EventSource(fullUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        setIsConnected(true);
        setConnectionState("connected");
      };

      eventSource.onmessage = (event) => {
        try {
          const parsedData = JSON.parse(event.data);

          console.log("SSE message received:", parsedData);

          // Check if it's an error response
          if (parsedData.detail) {
            console.error("SSE error received:", parsedData.detail);
            setError(parsedData.detail);
            setConnectionState("error");
            return;
          }

          // Check if it's a status message (ignore for now)
          if (parsedData.type === "status") {
            console.log("SSE status:", parsedData.message);
            return;
          }

          // Check if it's a valid cultural media data response
          if (
            parsedData.province &&
            parsedData.media_url &&
            parsedData.media_type &&
            parsedData.cultural_category
          ) {
            console.log("Valid cultural media item received:", parsedData);
            const streamItem: StreamDataItem = {
              province: parsedData.province,
              media_type: parsedData.media_type,
              media_url: parsedData.media_url,
              cultural_category: parsedData.cultural_category,
              query: parsedData.query || "Unknown query",
              cultural_context:
                parsedData.cultural_context ||
                parsedData.query ||
                "Unknown context",
            };
            setData((prevData) => [...prevData, streamItem]);
          } else {
            console.warn(
              "Received data does not match expected format:",
              parsedData
            );
          }
        } catch (parseError) {
          console.error(
            "Error parsing SSE data:",
            parseError,
            "Raw data:",
            event.data
          );
          setError("Failed to parse received data");
          setConnectionState("error");
        }
      };

      eventSource.onerror = (event) => {
        console.error("SSE connection error:", event);
        setIsConnected(false);

        if (eventSource.readyState === EventSource.CLOSED) {
          console.log("SSE connection closed by server");
          setConnectionState("completed");
          setIsCompleted(true);
        } else {
          console.error("SSE connection error, state:", eventSource.readyState);
          setConnectionState("error");
          setError("Connection error occurred");
        }
      };

      // Handle custom completion event if backend sends it
      eventSource.addEventListener("complete", (event) => {
        console.log("SSE completion event received:", event.data);
        setConnectionState("completed");
        setIsCompleted(true);
        setIsConnected(false);
        eventSource.close();
      });
    } catch (connectionError) {
      console.error("Failed to establish SSE connection:", connectionError);
      setError("Failed to establish connection");
      setConnectionState("error");
    }
  }, [url, backendUrl]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsConnected(false);
    setConnectionState("idle");
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    data,
    error,
    isConnected,
    isCompleted,
    connectionState,
    connect,
    disconnect,
  };
};
