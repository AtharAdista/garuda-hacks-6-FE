import { useEffect, useState } from "react";

interface RoundResultModalProps {
  isOpen: boolean;
  roundNumber: number;
  correctAnswer: string;
  culturalData?: {
    cultural_category?: string;
    cultural_context?: string;
    cultural_fun_fact?: string;
    query?: string;
  };
  playerAnswer: string;
  playerCorrect: boolean;
  opponentAnswer: string;
  opponentCorrect: boolean;
  opponentLabel?: string; // "AI" for AI games, or opponent name for multiplayer
  playerHealth: number;
  opponentHealth: number;
  resultMessage?: string;
  onClose: () => void;
  onTimeComplete: () => void;
  duration?: number; // in seconds, default 8
}

export default function RoundResultModal({
  isOpen,
  roundNumber,
  correctAnswer,
  culturalData,
  playerAnswer,
  playerCorrect,
  opponentAnswer,
  opponentCorrect,
  opponentLabel = "Opponent",
  playerHealth,
  opponentHealth,
  resultMessage,
  onClose,
  onTimeComplete,
  duration = 8,
}: RoundResultModalProps) {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isOpen) {
      setTimeRemaining(duration);
      setProgress(100);
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 0.1;
        const newProgress = (newTime / duration) * 100;
        setProgress(Math.max(0, newProgress));

        if (newTime <= 0) {
          onTimeComplete();
          return 0;
        }
        return newTime;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [isOpen, duration, onTimeComplete]);

  const handleManualClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
        {/* Progress Bar */}
        <div className="h-2 bg-gray-200">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Round {roundNumber} Result
              </h2>
              <p className="text-sm text-gray-600">
                Auto-closing in {Math.ceil(timeRemaining)}s
              </p>
            </div>
            <button
              onClick={handleManualClose}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
            >
              ×
            </button>
          </div>

          {/* Correct Answer Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-blue-800 mb-2 flex items-center">
              <span className="text-lg mr-2">🎯</span>
              Correct Answer: {correctAnswer}
            </h3>
            {culturalData && (
              <div className="space-y-2">
                {culturalData.cultural_context && (
                  <p className="text-sm text-blue-700">
                    <strong>Cultural Element:</strong> {culturalData.cultural_context}
                  </p>
                )}
                {culturalData.cultural_category && (
                  <p className="text-sm text-blue-700">
                    <strong>Category:</strong> {culturalData.cultural_category}
                  </p>
                )}
                {culturalData.cultural_fun_fact && (
                  <p className="text-sm text-blue-600 italic">
                    💡 <strong>Fun Fact:</strong> {culturalData.cultural_fun_fact}
                  </p>
                )}
                {!culturalData.cultural_fun_fact && culturalData.query && (
                  <p className="text-sm text-blue-600 italic">
                    "{culturalData.query}"
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Player Comparison Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Player Result */}
            <div
              className={`p-4 rounded-lg border-2 transition-all ${
                playerCorrect
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <h3 className="font-bold text-gray-800 mb-2">Your Answer</h3>
              <p className="text-lg font-semibold mb-2">
                {playerAnswer || "No selection"}
              </p>
              <p
                className={`text-sm font-bold ${
                  playerCorrect ? "text-green-600" : "text-red-600"
                }`}
              >
                {playerCorrect ? "✅ Correct!" : "❌ Wrong"}
              </p>
              <div className="mt-2">
                <p className="text-xs text-gray-600">Your Health</p>
                <p className="text-lg font-bold text-rose-700">
                  {"❤️".repeat(Math.max(0, playerHealth))}
                  {playerHealth === 0 && (
                    <span className="text-gray-400 ml-1">💀</span>
                  )}
                </p>
              </div>
            </div>

            {/* Opponent Result */}
            <div
              className={`p-4 rounded-lg border-2 transition-all ${
                opponentCorrect
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <h3 className="font-bold text-gray-800 mb-2">{opponentLabel} Answer</h3>
              <p className="text-lg font-semibold mb-2 text-blue-800">
                {opponentAnswer || "No selection"}
              </p>
              <p
                className={`text-sm font-bold ${
                  opponentCorrect ? "text-green-600" : "text-red-600"
                }`}
              >
                {opponentCorrect ? "✅ Correct!" : "❌ Wrong"}
              </p>
              <div className="mt-2">
                <p className="text-xs text-gray-600">{opponentLabel} Health</p>
                <p className="text-lg font-bold text-blue-700">
                  {"❤️".repeat(Math.max(0, opponentHealth))}
                  {opponentHealth === 0 && (
                    <span className="text-gray-400 ml-1">💀</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Result Message */}
          {resultMessage && (
            <div className="text-center mb-4">
              <div
                className={`inline-block px-6 py-3 rounded-lg font-bold text-lg ${
                  resultMessage.includes("Both correct") || resultMessage.includes("Both wrong")
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                    : resultMessage.includes("You're correct") || resultMessage.includes("correct, you're wrong")
                    ? playerCorrect 
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-red-100 text-red-800 border border-red-300"
                    : "bg-blue-100 text-blue-800 border border-blue-300"
                }`}
              >
                {resultMessage}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleManualClose}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Continue to Next Round
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}