import { useState } from "react";

interface ReadyModalProps {
  isOpen: boolean;
  currentUserId: string;
  readyPlayers: string[];
  totalPlayers: number;
  onReady: () => void;
  onUnready: () => void;
}

export default function ReadyModal({
  isOpen,
  currentUserId,
  readyPlayers,
  totalPlayers,
  onReady,
  onUnready,
}: ReadyModalProps) {
  const [isCurrentUserReady, setIsCurrentUserReady] = useState(
    readyPlayers.includes(currentUserId)
  );

  const handleToggleReady = () => {
    if (isCurrentUserReady) {
      onUnready();
      setIsCurrentUserReady(false);
    } else {
      onReady();
      setIsCurrentUserReady(true);
    }
  };

  const readyCount = readyPlayers.length;
  const allReady = readyCount === totalPlayers && totalPlayers >= 2;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999]">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Explore Indonesian Culture?
          </h2>
          
          <p className="text-gray-600 mb-6">
            Get ready to discover amazing Indonesian provinces through their unique cultural heritage!
          </p>

          {/* Ready Status */}
          <div className="mb-6">
            <div className="flex justify-center items-center space-x-4 mb-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-rose-600">
                  {readyCount}
                </div>
                <div className="text-sm text-gray-600">Ready</div>
              </div>
              <div className="text-2xl text-gray-400">/</div>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-400">
                  {totalPlayers}
                </div>
                <div className="text-sm text-gray-600">Players</div>
              </div>
            </div>

            {/* Ready Players List */}
            <div className="space-y-2">
              {readyPlayers.map((playerId) => (
                <div
                  key={playerId}
                  className="flex items-center justify-center space-x-2 text-green-600"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">
                    {playerId === currentUserId ? "You" : `Player ${playerId.slice(-4)}`} is ready!
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ready Button */}
          {!allReady && (
            <button
              onClick={handleToggleReady}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all transform hover:scale-105 ${
                isCurrentUserReady
                  ? "bg-gray-400 hover:bg-gray-500 text-white"
                  : "bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white"
              }`}
            >
              {isCurrentUserReady ? "Not Ready" : "I'm Ready!"}
            </button>
          )}

          {/* All Ready Message */}
          {allReady && (
            <div className="space-y-4">
              <div className="text-green-600 font-bold text-xl">
                🎉 All players are ready!
              </div>
              <div className="text-gray-600">
                Starting the cultural journey...
              </div>
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-500"></div>
              </div>
            </div>
          )}

          {/* Waiting Message */}
          {!allReady && readyCount > 0 && (
            <div className="mt-4 text-gray-500 text-sm">
              Waiting for {totalPlayers - readyCount} more player{totalPlayers - readyCount !== 1 ? 's' : ''} to be ready...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}