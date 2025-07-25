import { useState, useEffect, useCallback } from "react";
import { useSSE } from "@/hooks/useSSE";
import type { CulturalDisplayState } from "@/interfaces/streamData";

// Helper function to extract YouTube video ID from URL
const getYouTubeVideoId = (url: string): string => {
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : "";
};

interface CulturalDataDisplayProps {
  onStart?: () => void;
  onComplete?: () => void;
  onAnswer?: (answer: boolean) => void;
  province?: string; // Optional province filter
}

export default function CulturalDataDisplayVersusAi({
  onStart,
  onComplete,
  
}: CulturalDataDisplayProps) {
  const { data, error, connect } = useSSE("/api/stream-data-questions");

  const [displayState, setDisplayState] = useState<CulturalDisplayState>({
    currentIndex: -1,
    displayState: "idle",
    timeRemaining: 0,
    totalItems: 0,
  });

  const [isActive, setIsActive] = useState(false);

  const startDisplay = useCallback(() => {
    setIsActive(true);
    setDisplayState({
      currentIndex: -1,
      displayState: "initial_loading",
      timeRemaining: 10,
      totalItems: 0,
    });
    onStart?.();
    connect();
  }, [connect, onStart]);

  useEffect(() => {
    if (!isActive) return;

    let interval: NodeJS.Timeout;

    if (displayState.displayState === "initial_loading") {
      // 10-second initial loading
      interval = setInterval(() => {
        setDisplayState((prev) => {
          if (prev.timeRemaining <= 1) {
            // Check if we have data to display
            if (data.length > 0) {
              return {
                ...prev,
                currentIndex: 0,
                displayState: "displaying",
                timeRemaining: 30,
                totalItems: data.length,
              };
            } else {
              // Still waiting for data
              return {
                ...prev,
                timeRemaining: 10, // Reset loading timer
              };
            }
          }
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1,
          };
        });
      }, 1000);
    } else if (displayState.displayState === "displaying") {
      // 30-second display timer
      interval = setInterval(() => {
        setDisplayState((prev) => {
          if (prev.timeRemaining <= 1) {
            // Check if we have more items to display
            if (prev.currentIndex + 1 < data.length) {
              return {
                ...prev,
                displayState: "inter_loading",
                timeRemaining: 5,
              };
            } else {
              // All items displayed
              setIsActive(false);
              onComplete?.();
              return {
                ...prev,
                displayState: "completed",
                timeRemaining: 0,
              };
            }
          }
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1,
          };
        });
      }, 1000);
    } else if (displayState.displayState === "inter_loading") {
      // 5-second inter-item loading
      interval = setInterval(() => {
        setDisplayState((prev) => {
          if (prev.timeRemaining <= 1) {
            return {
              ...prev,
              currentIndex: prev.currentIndex + 1,
              displayState: "displaying",
              timeRemaining: 30,
            };
          }
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1,
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [displayState, data.length, isActive, onComplete]);

  // Handle errors
  useEffect(() => {
    if (error && isActive) {
      setDisplayState((prev) => ({
        ...prev,
        displayState: "error",
      }));
      setIsActive(false);
    }
  }, [error, isActive]);

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
    const currentItem = data[displayState.currentIndex];
    if (!currentItem) return null;

    return (
      <div className="space-y-4 animate-fade-in">
        {/* Media Display */}
        {currentItem.media_type === "image" ? (
          <div className="relative">
            <img
              src={currentItem.media_url}
              alt={currentItem.cultural_context}
              className="w-full h-48 object-cover rounded-lg shadow-lg"
              loading="lazy"
              onError={(e) => {
                console.error("Image failed to load:", currentItem.media_url);
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        ) : currentItem.media_type === "video" ? (
          <div className="relative">
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeVideoId(
                currentItem.media_url
              )}`}
              title={currentItem.cultural_context}
              className="w-full h-48 rounded-lg shadow-lg"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-500">Media not available</span>
          </div>
        )}

        {/* Cultural Information */}
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-rose-600">
            {currentItem.cultural_context}
          </h3>
          <p className="text-lg font-semibold text-gray-800">
            Province: {currentItem.province}
          </p>
          <p className="text-md text-gray-700">
            Category: {currentItem.cultural_category}
          </p>
          <p className="text-sm text-gray-600">Query: {currentItem.query}</p>
        </div>
      </div>
    );
  };

  const renderProgressIndicator = () => {
    if (displayState.displayState === "idle") return null;

    return (
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm font-semibold text-rose-600">
          {displayState.currentIndex >= 0
            ? `${displayState.currentIndex + 1}/${data.length || "?"}`
            : `Loading... (${data.length} items ready)`}
        </div>
        <div className="text-sm text-gray-600">
          {displayState.timeRemaining > 0 && (
            <>Time remaining: {displayState.timeRemaining}s</>
          )}
        </div>
      </div>
    );
  };

  if (displayState.displayState === "idle") {
    return (
      <div className="bg-white/90 p-6 rounded-xl shadow-xl border border-rose-100">
        <h3 className="text-lg font-bold text-rose-600 mb-4">
          Indonesian Cultural Experience
        </h3>
        <p className="text-gray-600 mb-4">
          Discover Indonesian culture through a guided visual journey
        </p>
        <button
          onClick={startDisplay}
          className="w-full px-4 py-2 bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500 text-white rounded-lg font-bold hover:from-rose-500 hover:to-pink-600 transition-all"
        >
          Start Cultural Journey
        </button>
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
        <button
          onClick={() => {
            setDisplayState({
              currentIndex: -1,
              displayState: "idle",
              timeRemaining: 0,
              totalItems: 0,
            });
            setIsActive(false);
          }}
          className="w-full px-4 py-2 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-lg font-bold hover:from-gray-500 hover:to-gray-600 transition-all"
        >
          Try Again
        </button>
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
          You've experienced {data.length} pieces of Indonesian culture
        </p>
        <button
          onClick={() => {
            setDisplayState({
              currentIndex: -1,
              displayState: "idle",
              timeRemaining: 0,
              totalItems: 0,
            });
            setIsActive(false);
          }}
          className="w-full px-4 py-2 bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500 text-white rounded-lg font-bold hover:from-rose-500 hover:to-pink-600 transition-all"
        >
          Start New Journey
        </button>
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