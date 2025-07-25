import { useState, useEffect } from "react";
import type { Socket } from "socket.io-client";

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string => {
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : "";
};

interface CulturalItem {
  province: string;
  media_type: string;
  media_url: string;
  cultural_category: string;
  query: string;
  cultural_context: string;
}

interface CulturalDisplayState {
  currentIndex: number;
  displayState:
    | "initial_loading"
    | "displaying"
    | "inter_loading"
    | "completed"
    | "error";
  timeRemaining: number;
  totalItems: number;
  currentItem: CulturalItem | null;
}

interface CulturalDataDisplayProps {
  socket: Socket | null;
  roomId: string | null;
  gameStarted?: boolean;
  onStart?: () => void;
  onComplete?: () => void;
}

export default function CulturalDataDisplay({
  socket,
  roomId,
  gameStarted = false,
  onStart,
  onComplete,
}: CulturalDataDisplayProps) {
  const [displayState, setDisplayState] = useState<CulturalDisplayState>({
    currentIndex: -1,
    displayState: "initial_loading",
    timeRemaining: 0,
    totalItems: 0,
    currentItem: null,
  });

  const [error, setError] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);

  // WebSocket event handling
  useEffect(() => {
    if (!socket || !roomId) {
      console.log("CulturalDataDisplay: Missing socket or roomId", {
        socket: !!socket,
        roomId,
      });
      return;
    }

    console.log(
      "CulturalDataDisplay: Setting up WebSocket listeners for room:",
      roomId
    );
    console.log("CulturalDataDisplay: Socket connected:", socket.connected);
    console.log("CulturalDataDisplay: Socket ID:", socket.id);

    const handleCulturalDataStateUpdate = (data: CulturalDisplayState) => {
      console.log(
        "CulturalDataDisplay: Cultural data state update received:",
        data
      );
      setDisplayState(data);
      setError(null); // Clear any previous errors

      if (!isActive) {
        console.log("CulturalDataDisplay: Activating cultural display");
        setIsActive(true);
        onStart?.();
      }

      if (data.displayState === "completed") {
        console.log("CulturalDataDisplay: Cultural display completed");
        onComplete?.();
        setIsActive(false);
      }
    };

    const handleError = (errorData: any) => {
      console.error("CulturalDataDisplay: Cultural data error:", errorData);
      setError(errorData.message || "An error occurred");
      setDisplayState((prev) => ({
        ...prev,
        displayState: "error",
      }));
    };

    const handleConnect = () => {
      console.log(
        "CulturalDataDisplay: Socket connected, ready to receive cultural data"
      );
    };

    const handleDisconnect = (reason: string) => {
      console.log("CulturalDataDisplay: Socket disconnected, reason:", reason);
      setIsActive(false);

      // Only show error for unexpected disconnects
      if (
        reason !== "io client disconnect" &&
        reason !== "client namespace disconnect"
      ) {
        setError(
          "Connection lost. Cultural data will resume when reconnected."
        );
        setDisplayState((prev) => ({
          ...prev,
          displayState: "error",
        }));
      }
    };

    // Add all event listeners
    socket.on("culturalDataStateUpdate", handleCulturalDataStateUpdate);
    socket.on("error", handleError);
    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    // Log all event listeners to verify they're set up
    console.log("CulturalDataDisplay: Event listeners registered:", {
      culturalDataStateUpdate: !!socket.listeners("culturalDataStateUpdate")
        .length,
      error: !!socket.listeners("error").length,
    });

    // Only request cultural state if game has already started (not during ready phase)
    const requestCulturalState = () => {
      if (gameStarted) {
        console.log(
          "CulturalDataDisplay: Requesting current cultural state for room:",
          roomId
        );
        socket.emit("requestCulturalState", { roomId });
      } else {
        console.log(
          "CulturalDataDisplay: Game not started yet, not requesting cultural state"
        );
      }
    };

    // Only request if game has already started (for players joining mid-game)
    if (gameStarted && socket.connected) {
      console.log(
        "CulturalDataDisplay: Game already started and socket connected, requesting cultural state"
      );
      requestCulturalState();
    }

    return () => {
      console.log("CulturalDataDisplay: Cleaning up WebSocket listeners");
      socket.off("culturalDataStateUpdate", handleCulturalDataStateUpdate);
      socket.off("error", handleError);
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket, roomId, onStart, onComplete]);

  // Fallback mechanism - request cultural state if not received within 3 seconds (only if game started)
  useEffect(() => {
    if (!socket || !roomId || isActive || !gameStarted) return;

    const fallbackTimer = setTimeout(() => {
      if (!isActive && gameStarted) {
        console.log(
          "CulturalDataDisplay: No cultural data received within 3 seconds, requesting state again"
        );
        socket.emit("requestCulturalState", { roomId });
      }
    }, 3000);

    return () => clearTimeout(fallbackTimer);
  }, [socket, roomId, isActive, gameStarted]);

  const renderLoadingSpinner = () => (
    <div className="flex items-center justify-center space-x-3">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
      <span className="text-gray-700 font-semibold">
        {displayState.displayState === "initial_loading"
          ? "Loading cultural data..."
          : "Loading next item..."}
      </span>
    </div>
  );

  const renderCurrentItem = () => {
    const currentItem = displayState.currentItem;
    if (!currentItem) return null;

    return (
      <div className="space-y-4 animate-fade-in">
        {/* Media Display */}
        {currentItem.media_type === "image" ? (
          <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden shadow-lg">
            <img
              src={currentItem.media_url}
              alt={currentItem.cultural_context}
              className="w-full h-full object-contain"
              loading="lazy"
              onError={(e) => {
                console.error("Image failed to load:", currentItem.media_url);
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : currentItem.media_type === "video" ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden shadow-lg">
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                currentItem.media_url
              )}`}
              title={currentItem.cultural_context}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center shadow-lg">
            <span className="text-gray-500">Media not available</span>
          </div>
        )}

        {/* Cultural Information - only show during results/inter-loading phase */}
        {displayState.displayState === "inter_loading" && (
          <div className="space-y-3 animate-fade-in">
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 rounded-lg border-l-4 border-rose-400">
              <h3 className="text-xl font-bold text-rose-700 mb-2">
                ✅ Correct Answer: {currentItem.province}
              </h3>
              <p className="text-lg font-semibold text-gray-800 mb-1">
                Cultural Element: {currentItem.cultural_context}
              </p>
              <p className="text-md text-gray-700 mb-2">
                Category: {currentItem.cultural_category}
              </p>
              {currentItem.cultural_context !== currentItem.query && (
                <p className="text-sm text-gray-600 mb-2">
                  Search Query: {currentItem.query}
                </p>
              )}
            </div>
            {/* Fun Fact section with special styling */}
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <h4 className="text-sm font-bold text-blue-800 mb-1">
                💡 Did you know?
              </h4>
              <p className="text-sm text-blue-700 italic">
                Take a moment to learn about Indonesian culture!
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProgressIndicator = () => {
    const getPhaseLabel = () => {
      switch (displayState.displayState) {
        case "initial_loading":
          return "Loading cultural data...";
        case "displaying":
          return "Guess the province! (or waiting for other player)";
        case "inter_loading":
          return "Learn about this culture!";
        case "completed":
          return "Cultural journey complete!";
        default:
          return "Cultural experience";
      }
    };

    return (
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-semibold text-rose-600">
          {displayState.currentIndex >= 0
            ? `Round ${displayState.currentIndex + 1}/${
                displayState.totalItems || "?"
              } - ${getPhaseLabel()}`
            : `${getPhaseLabel()} (${displayState.totalItems} items ready)`}
        </div>
        <div className="text-sm text-gray-600">
          {displayState.timeRemaining > 0 && (
            <>
              {displayState.displayState === "inter_loading"
                ? `Learning time: ${displayState.timeRemaining}s`
                : `Time remaining: ${displayState.timeRemaining}s`}
            </>
          )}
        </div>
      </div>
    );
  };

  // If not active yet, show waiting state
  if (!isActive) {
    return (
      <div className="bg-white/90 p-6 rounded-xl shadow-xl border border-rose-100">
        <h3 className="text-lg font-bold text-rose-600 mb-4">
          Indonesian Cultural Experience
        </h3>
        <p className="text-gray-600 mb-4">Waiting for game to start...</p>
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500"></div>
          <span className="text-gray-600">Ready to begin cultural journey</span>
        </div>
      </div>
    );
  }

  if (displayState.displayState === "error") {
    return (
      <div className="bg-white/90 p-6 rounded-xl shadow-xl border border-rose-100">
        <h3 className="text-lg font-bold text-red-600 mb-4">
          Connection Error
        </h3>
        <p className="text-red-600 mb-4">
          {error || "Failed to load cultural data"}
        </p>
        <p className="text-gray-600 text-sm">
          Cultural content will automatically retry in the next game.
        </p>
      </div>
    );
  }

  if (displayState.displayState === "completed") {
    return (
      <div className="bg-white/90 p-6 rounded-xl shadow-xl border border-rose-100">
        <h3 className="text-lg font-bold text-green-600 mb-4">
          Cultural Journey Complete!
        </h3>
        <p className="text-gray-600 mb-4">
          You've experienced {displayState.totalItems} pieces of Indonesian
          culture
        </p>
        <p className="text-gray-600 text-sm">
          Continue playing or start a new game for more cultural discoveries!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white/90 p-6 rounded-xl shadow-xl border border-rose-100">
      <h3 className="text-lg font-bold text-rose-600 mb-4">
        Indonesian Cultural Experience
      </h3>

      {renderProgressIndicator()}

      <div className="min-h-[300px] flex flex-col justify-center">
        {displayState.displayState === "initial_loading" ||
        displayState.displayState === "inter_loading"
          ? renderLoadingSpinner()
          : renderCurrentItem()}
      </div>
    </div>
  );
}
