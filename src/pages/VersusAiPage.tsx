import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Feature as GeoJSONFeature } from "geojson";
import geoData from "../data/38ProvinsiIndonesia-Provinsi.json";

import { provinceInfo, kodeToId } from "../data/provinceInfo";
import CulturalDataDisplayVersusAi from "@/components/CulturalDataDisplayVersusAi";

export default function VersusAiPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const selectedLayerRef = useRef<L.Layer | null>(null);
  const [playerHealth, setPlayerHealth] = useState(3);
  const [opponentHealth, setOpponentHealth] = useState(3);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<"player" | "ai" | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [gameResult, setGameResult] = useState<{
    playerGuess: string;
    aiGuess: string;
    correctAnswer: string;
    playerCorrect: boolean;
    aiCorrect: boolean;
    result: string;
  } | null>(null);

  const [culturalData, setCulturalData] = useState<any>();

  // Styles
  const getDefaultStyle = (): L.PathOptions => ({
    fillColor: "#3388ff",
    weight: 2,
    opacity: 1,
    color: "white",
    fillOpacity: 0.6,
  });

  const getLockedStyle = (): L.PathOptions => ({
    fillColor: "#95a5a6",
    weight: 2,
    opacity: 0.5,
    color: "#7f8c8d",
    fillOpacity: 0.3,
  });

  const handleCulturalDataUpate = (culturalData: any) => {
    setCulturalData(culturalData);
  };

  const fetchAi = async (input_url: string, actual_province: string) => {
    try {
      const response = await fetch(
        "https://culturate-ai-257967680019.us-central1.run.app/game/guess",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            input_url,
            actual_province,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result);

      return result;
    } catch (error) {
      console.error("Fetch AI failed:", error);
      return null;
    }
  };

  const resetGameRound = () => {
    setSelectedProvince(null);
    setIsSubmitted(false);
    setGameResult(null);

    // Reset map styles
    if (geojsonLayerRef.current) {
      geojsonLayerRef.current.eachLayer((layer) => {
        (layer as L.Path).setStyle(getDefaultStyle());
      });
    }

    // Clear selected layer
    selectedLayerRef.current = null;

    // Reset map view
    if (mapInstanceRef.current && geojsonLayerRef.current) {
      const bounds = geojsonLayerRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [10, 10] });
      }
    }
  };

  const startNewRound = () => {
    setCurrentRound((prev) => prev + 1);
    resetGameRound();
  };

  const restartGame = () => {
    setPlayerHealth(3);
    setOpponentHealth(3);
    setGameOver(false);
    setWinner(null);
    setCurrentRound(1);
    resetGameRound();
  };

  const handleSubmit = async () => {
    if (!selectedProvince || gameOver) {
      if (gameOver) {
        alert("Game sudah selesai! Mulai game baru untuk bermain lagi.");
      } else {
        alert("Pilih provinsi terlebih dahulu!");
      }
      return;
    }

    setIsAiThinking(true);

    // Data untuk testing - nanti bisa diganti dengan data dinamis
    const correctAnswer = culturalData.province; // Jawaban yang benar
    const imageUrl = culturalData.media_url; // URL gambar provinsi

    console.log(correctAnswer);
    console.log(imageUrl);

    try {
      // Fetch AI guess
      const result = await fetchAi(imageUrl, correctAnswer);

      setIsAiThinking(false);

      if (!result) {
        alert("Gagal mendapatkan jawaban dari AI");
        return;
      }

      const playerGuess = selectedProvince.name;
      const aiGuess = result.ai_guess || result.guess || "Unknown";

      // Check apakah jawaban benar
      const playerCorrect =
        playerGuess.toLowerCase() === correctAnswer.toLowerCase();
      const aiCorrect = aiGuess.toLowerCase() === correctAnswer.toLowerCase();

      // Update health berdasarkan hasil
      let resultMessage = "";
      let newPlayerHealth = playerHealth;
      let newOpponentHealth = opponentHealth;

      if (playerCorrect && aiCorrect) {
        // Dua-duanya benar - tidak ada yang berkurang darah
        resultMessage = "Both correct! No health lost.";
      } else if (playerCorrect && !aiCorrect) {
        // Player benar, AI salah - AI kehilangan darah
        newOpponentHealth = Math.max(0, opponentHealth - 1);
        setOpponentHealth(newOpponentHealth);
        resultMessage = "You're correct, AI is wrong! AI loses health.";
      } else if (!playerCorrect && aiCorrect) {
        // Player salah, AI benar - Player kehilangan darah
        newPlayerHealth = Math.max(0, playerHealth - 1);
        setPlayerHealth(newPlayerHealth);
        resultMessage = "AI is correct, you're wrong! You lose health.";
      } else {
        // Dua-duanya salah - keduanya kehilangan darah
        newPlayerHealth = Math.max(0, playerHealth - 1);
        newOpponentHealth = Math.max(0, opponentHealth - 1);
        setPlayerHealth(newPlayerHealth);
        setOpponentHealth(newOpponentHealth);
        resultMessage = "Both wrong! Both lose health.";
      }

      // Set game result untuk ditampilkan
      setGameResult({
        playerGuess,
        aiGuess,
        correctAnswer,
        playerCorrect,
        aiCorrect,
        result: resultMessage,
      });

      // Check if game is over
      if (newPlayerHealth === 0 || newOpponentHealth === 0) {
        setGameOver(true);
        if (newPlayerHealth === 0 && newOpponentHealth === 0) {
          setWinner(null); // Draw
        } else if (newPlayerHealth === 0) {
          setWinner("ai");
        } else {
          setWinner("player");
        }
      }

      console.log({
        playerGuess,
        aiGuess,
        correctAnswer,
        playerCorrect,
        aiCorrect,
        result: resultMessage,
        newPlayerHealth,
        newOpponentHealth,
        gameOver: newPlayerHealth === 0 || newOpponentHealth === 0,
      });
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setIsAiThinking(false);
      alert("Terjadi kesalahan saat memproses jawaban");
      return;
    }

    setIsSubmitted(true);

    // Update semua layer yang tidak terpilih menjadi locked style
    if (geojsonLayerRef.current) {
      geojsonLayerRef.current.eachLayer((layer) => {
        if (layer !== selectedLayerRef.current) {
          (layer as L.Path).setStyle(getLockedStyle());
        }
      });
    }
  };

  const getHoverStyle = (): L.PathOptions => ({
    fillColor: "#ff7800",
    weight: 3,
    color: "#666",
    fillOpacity: 0.7,
  });

  const getSelectedStyle = (): L.PathOptions => ({
    fillColor: "#e74c3c",
    weight: 3,
    color: "#333",
    fillOpacity: 0.8,
  });

  const highlightFeature = (e: L.LeafletMouseEvent) => {
    // Tidak ada hover effect jika sudah submit atau game over
    if (isSubmitted || gameOver) return;

    const layer = e.target as L.Path;
    if (layer !== selectedLayerRef.current) {
      layer.setStyle(getHoverStyle());
      layer.bringToFront?.();
    }
  };

  const resetHighlight = (e: L.LeafletMouseEvent) => {
    // Tidak reset highlight jika sudah submit atau game over
    if (isSubmitted || gameOver) return;

    const layer = e.target as L.Path;
    if (layer !== selectedLayerRef.current && geojsonLayerRef.current) {
      geojsonLayerRef.current.resetStyle(layer);
    }
  };

  const selectProvince = (e: L.LeafletMouseEvent) => {
    // Mencegah pemilihan provinsi jika sudah submit atau game over
    if (isSubmitted || gameOver) {
      console.log(
        "Cannot change province after submission or when game is over"
      );
      return;
    }

    const layer = e.target as L.Path & { feature: GeoJSONFeature };
    if (
      selectedLayerRef.current &&
      selectedLayerRef.current !== layer &&
      geojsonLayerRef.current
    ) {
      geojsonLayerRef.current.resetStyle(selectedLayerRef.current as L.Path);
    }
    layer.setStyle(getSelectedStyle());
    layer.bringToFront?.();
    selectedLayerRef.current = layer;

    if (!layer.feature || !layer.feature.properties) return;
    setSelectedProvince(layer.feature.properties);
    if (mapInstanceRef.current && (layer as L.Polygon).getBounds) {
      mapInstanceRef.current.fitBounds((layer as L.Polygon).getBounds());
    }
  };

  const onEachFeature = (feature: GeoJSONFeature, layer: L.Layer) => {
    if (feature.properties) {
      // Ambil kode provinsi dari berbagai kemungkinan field
      let code: string | undefined;
      const props = feature.properties;
      if (props.KODE_PROV) {
        code = kodeToId[parseInt(props.KODE_PROV)];
      } else if (props.kode) {
        code = kodeToId[parseInt(props.kode)];
      } else if (props.iso_code) {
        code = props.iso_code;
      }
      // Nama dari GeoJSON
      const name =
        props.PROVINSI ||
        props.Provinsi ||
        props.name ||
        props.provinsi ||
        (code && provinceInfo[code]?.name) ||
        "";

      // Gabungkan semua info
      feature.properties = {
        ...(code ? provinceInfo[code] : {}),
        ...props,
        name,
        kode: code,
      };
    }

    const pathLayer = layer as L.Path;
    pathLayer.on({
      mouseover: highlightFeature,
      mouseout: resetHighlight,
      click: selectProvince,
    });

    if (feature.properties?.name) {
      pathLayer.bindTooltip(feature.properties.name, {
        permanent: false,
        direction: "auto",
      });
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      preferCanvas: true,
      zoomControl: true,
      attributionControl: true,
    }).setView([-2.5, 118], 5);

    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geojsonLayer = L.geoJSON(geoData as any, {
      style: getDefaultStyle,
      onEachFeature: onEachFeature,
    });

    geojsonLayer.addTo(map);
    geojsonLayerRef.current = geojsonLayer;
    const bounds = geojsonLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [10, 10] });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      geojsonLayerRef.current = null;
      selectedLayerRef.current = null;
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-rose-200">
      <div className="h-20" />
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-2 drop-shadow-2xl">
            Indonesia Game Map
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-4 drop-shadow">
            Explore Indonesian provinces while playing
          </p>
        </div>

        <div className="flex justify-center gap-10 mb-4">
          <div className="bg-white px-4 py-2 rounded-lg shadow">
            <p
              className={`font-bold ${
                playerHealth <= 1 ? "text-red-600" : "text-rose-700"
              }`}
            >
              Your Health: ❤️ {playerHealth}
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow">
            <p
              className={`font-bold ${
                opponentHealth <= 1 ? "text-red-600" : "text-blue-700"
              }`}
            >
              AI Health: ❤️ {opponentHealth}
            </p>
          </div>
        </div>

        {gameOver && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-white rounded-xl shadow-lg border-4 border-yellow-400 p-8 text-center">
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                🎮 Game Over!
              </h2>

              {winner === "player" && (
                <div className="mb-6">
                  <div className="text-6xl mb-4">🏆</div>
                  <h3 className="text-3xl font-bold text-green-600 mb-2">
                    You Win!
                  </h3>
                  <p className="text-lg text-gray-600">
                    Congratulations! You defeated the AI!
                  </p>
                </div>
              )}

              {winner === "ai" && (
                <div className="mb-6">
                  <div className="text-6xl mb-4">🤖</div>
                  <h3 className="text-3xl font-bold text-red-600 mb-2">
                    AI Wins!
                  </h3>
                  <p className="text-lg text-gray-600">
                    Better luck next time! The AI was victorious.
                  </p>
                </div>
              )}

              {winner === null && (
                <div className="mb-6">
                  <div className="text-6xl mb-4">🤝</div>
                  <h3 className="text-3xl font-bold text-yellow-600 mb-2">
                    It's a Draw!
                  </h3>
                  <p className="text-lg text-gray-600">
                    Both players ran out of health at the same time!
                  </p>
                </div>
              )}

              <div className="bg-gray-100 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-gray-800 mb-2">Final Stats</h4>
                <div className="flex justify-center gap-8">
                  <div>
                    <p className="text-sm text-gray-600">Rounds Played</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {currentRound - 1}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Your Final Health</p>
                    <p className="text-2xl font-bold text-rose-700">
                      ❤️ {playerHealth}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">AI Final Health</p>
                    <p className="text-2xl font-bold text-blue-700">
                      ❤️ {opponentHealth}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={restartGame}
                className="bg-green-500 text-white px-8 py-3 rounded-lg font-bold text-lg hover:bg-green-600 transition-colors shadow-lg"
              >
                🎮 Start New Game
              </button>
            </div>
          </div>
        )}

        {/* AI Thinking Display */}
        {isAiThinking && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                <div>
                  <h2 className="text-xl font-bold text-blue-800">
                    AI is thinking...
                  </h2>
                  <p className="text-gray-600">
                    Please wait while the AI analyzes the image and makes its
                    guess.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Game Result Display */}
        {gameResult && !isAiThinking && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-white rounded-xl shadow-lg border border-rose-200 p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                Round {currentRound - (gameOver ? 1 : 0)} Result
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Player Result */}
                <div
                  className={`p-4 rounded-lg border-2 ${
                    gameResult.playerCorrect
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <h3 className="font-bold text-gray-800 mb-2">Your Answer</h3>
                  <p className="text-lg font-semibold">
                    {gameResult.playerGuess}
                  </p>
                  <p
                    className={`text-sm font-bold ${
                      gameResult.playerCorrect
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {gameResult.playerCorrect ? "✓ Correct" : "✗ Wrong"}
                  </p>
                </div>

                {/* Correct Answer */}
                <div className="p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
                  <h3 className="font-bold text-gray-800 mb-2">
                    Correct Answer
                  </h3>
                  <p className="text-lg font-semibold text-blue-800">
                    {gameResult.correctAnswer}
                  </p>
                  <p className="text-sm text-blue-600">🎯 Target Province</p>
                </div>

                {/* AI Result */}
                <div
                  className={`p-4 rounded-lg border-2 ${
                    gameResult.aiCorrect
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <h3 className="font-bold text-gray-800 mb-2">AI Answer</h3>
                  <p className="text-lg font-semibold">{gameResult.aiGuess}</p>
                  <p
                    className={`text-sm font-bold ${
                      gameResult.aiCorrect ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {gameResult.aiCorrect ? "✓ Correct" : "✗ Wrong"}
                  </p>
                </div>
              </div>

              {/* Result Message */}
              <div className="text-center mb-4">
                <div
                  className={`inline-block px-6 py-3 rounded-lg font-bold text-lg ${
                    gameResult.result.includes("Both correct")
                      ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                      : gameResult.result.includes("You're correct")
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : gameResult.result.includes("AI is correct")
                      ? "bg-red-100 text-red-800 border border-red-300"
                      : "bg-red-100 text-red-800 border border-red-300"
                  }`}
                >
                  {gameResult.result}
                </div>
              </div>

              {/* Health Status */}
              <div className="flex justify-center gap-8 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Your Health</p>
                  <p
                    className={`text-2xl font-bold ${
                      playerHealth <= 1 ? "text-red-600" : "text-rose-700"
                    }`}
                  >
                    {"❤️".repeat(playerHealth)}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">AI Health</p>
                  <p
                    className={`text-2xl font-bold ${
                      opponentHealth <= 1 ? "text-red-600" : "text-blue-700"
                    }`}
                  >
                    {"❤️".repeat(opponentHealth)}
                  </p>
                </div>
              </div>

              {/* Next Round Button */}
              {!gameOver && (
                <div className="text-center">
                  <button
                    onClick={startNewRound}
                    className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition-colors shadow-lg"
                  >
                    ▶️ Next Round
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {(isSubmitted || gameOver) && !gameResult && (
          <div className="flex justify-center mb-4">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg">
              ⚠️ Province locked! You cannot change your selection after
              submission.
            </div>
          </div>
        )}

        {/* Display Selected Province */}
        {selectedProvince && (
          <div className="max-w-2xl mx-auto mb-6">
            <div className="bg-white rounded-xl shadow-lg border border-rose-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Your Selection
                </h2>
                {isSubmitted && (
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    ✓ Submitted
                  </span>
                )}
              </div>

              <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-lg p-4 border border-rose-100">
                <div className="flex items-center mb-3">
                  <div className="w-4 h-4 bg-red-500 rounded mr-3"></div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {selectedProvince.name}
                    {isSubmitted && (
                      <span className="ml-2 text-green-600">🔒</span>
                    )}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Capital:
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {selectedProvince.capital || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Province Code:
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {selectedProvince.KODE_PROV ||
                          selectedProvince.kode ||
                          "N/A"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Population:
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {selectedProvince.population || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">Area:</span>
                      <span className="text-gray-900 font-semibold">
                        {selectedProvince.area || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {!isSubmitted && !gameOver && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-blue-800 text-sm">
                      💡 <strong>Tip:</strong> Make sure this is your final
                      choice before submitting!
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="relative">
          <div className="bg-white/90 rounded-2xl shadow-2xl overflow-hidden border border-rose-100">
            <div ref={mapRef} className="h-[70vh] w-full relative z-100" />
          </div>
        </div>
        <div className="lg:col-span-1">
          <button
            onClick={handleSubmit}
            disabled={!selectedProvince || isSubmitted}
            className={`mt-4 px-4 py-2 rounded-lg shadow transition-colors ${
              !selectedProvince || isSubmitted
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            {isSubmitted ? "Submitted ✓" : "Submit Answer"}
          </button>
          <CulturalDataDisplayVersusAi
            onCulturalDataUpdate={handleCulturalDataUpate}
          />
        </div>
      </div>
    </div>
  );
}
