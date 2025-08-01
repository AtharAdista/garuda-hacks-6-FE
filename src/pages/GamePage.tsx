import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Feature as GeoJSONFeature } from "geojson";
import CulturalDataDisplay from "@/components/CulturalDataDisplay";
import RoundResultModal from "@/components/RoundResultModal";

import geoData from "../data/38ProvinsiIndonesia-Provinsi.json";
import { io, Socket } from "socket.io-client";
import ReadyModal from "@/components/ReadyModal";
import { useLocation, useNavigate } from "react-router-dom";

import { provinceInfo, kodeToId } from "../data/provinceInfo";
import type { GameOverData } from "@/interfaces/game-type";

export default function GamePage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const selectedLayerRef = useRef<L.Layer | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const location = useLocation();
  const { roomId, playerId } = location.state || {};

  const getGameData = () => {
    if (roomId && playerId) {
      return { roomId, playerId };
    }

    const savedGameData = localStorage.getItem("gameRoom");
    if (savedGameData) {
      const gameData = JSON.parse(savedGameData);
      console.log("Recovered game data from localStorage:", gameData);
      return { roomId: gameData.roomId, playerId: gameData.playerId };
    }

    return { roomId: null, playerId: null };
  };

  const { roomId: currentRoomId, playerId: currentPlayerId } = getGameData();

  const [opponentProvince, setOpponentProvince] = useState<any>(null);
  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [opponentHasSubmitted, setOpponentHasSubmitted] = useState(false);
  const [bothSubmitted, setBothSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [bothSubmittedMessage, setBothSubmittedMessage] = useState("");
  const [playerHealth, setPlayerHealth] = useState(3);
  const [opponentHealth, setOpponentHealth] = useState(3);
  const [gameOverData, setGameOverData] = useState<GameOverData | null>();
  const [currentCulturalData, setCurrentCulturalData] = useState<any>(null);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");
  const [gameHistory, setGameHistory] = useState<any[]>([]);
  const [showGameRecap, setShowGameRecap] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [currentRound, setCurrentRound] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    if (gameOverData) {
      generateMatchSummary();
    }
  }, [gameOverData]);

  const [gameStarted, setGameStarted] = useState(false);
  const [showReadyModal, setShowReadyModal] = useState(true);
  const [readyPlayers, setReadyPlayers] = useState<string[]>([]);
  const [totalPlayers, setTotalPlayers] = useState(0);

  // Tambahkan state baru setelah line 60 (setelah state yang sudah ada):
  const [matchSummary, setMatchSummary] = useState<string>("");
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [showMatchSummary, setShowMatchSummary] = useState(false);

  useEffect(() => {
    if (!currentRoomId || !currentPlayerId) {
      console.error("No room or player data available for game");
      return;
    }

    const socket = io(import.meta.env.VITE_BACKEND_URL);
    socketRef.current = socket;

    // Handle page refresh/close with proper cleanup
    const handleBeforeUnload = () => {
      console.log("Page is being unloaded, cleaning up socket connection");
      if (socket.connected) {
        socket.emit("leaveRoom", {
          roomId: currentRoomId,
          userId: currentPlayerId,
        });
        socket.disconnect();
      }
      localStorage.removeItem("gameRoom");
    };

    // Add event listeners for cleanup
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Handle visibility change (when user switches tabs or minimizes)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        console.log("Page hidden, maintaining socket connection");
      } else {
        console.log("Page visible again, checking socket connection");
        if (!socket.connected) {
          socket.connect();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    socket.on("connect", () => {
      console.log("GamePage socket connected:", socket.id);
      setTimeout(() => {
        console.log(
          "Rejoining room for game:",
          currentRoomId,
          "user:",
          currentPlayerId
        );
        socket.emit("rejoinRoom", {
          roomId: currentRoomId,
          userId: currentPlayerId,
        });
      }, 500);
    });

    socket.on("roomRejoined", ({ roomId, userId, health }) => {
      console.log(
        "Successfully rejoined room for game:",
        roomId,
        userId,
        health
      );
    });

    socket.on("error", (error) => {
      console.error("GamePage socket error:", error);
    });

    const handleProvinceSelected = ({ province, userId }: any) => {
      console.log("Province selected:", province, "by user:", userId);
      if (userId !== currentPlayerId) {
        console.log("Opponent is hovering/selecting:", province.name);
      }
    };

    const handleOpponentSubmitted = ({ userId, province }: any) => {
      console.log(
        "Opponent has submitted:",
        userId,
        "with province:",
        province
      );
      console.log("My playerId:", currentPlayerId);
      console.log(
        "Setting opponentHasSubmitted to true and opponentProvince to:",
        province.name
      );
      if (userId !== currentPlayerId) {
        setOpponentHasSubmitted(true);
        setOpponentProvince(province);
      }
    };

    const handleBothPlayersSubmitted = ({ message }: any) => {
      console.log("Both players submitted:", message);
      setBothSubmitted(true);
      setBothSubmittedMessage(message);
    };

    const handleShowResults = ({
      results,
      correctAnswer,
      culturalData,
    }: any) => {
      console.log(
        "Show results:",
        results,
        "Correct answer:",
        correctAnswer,
        "Cultural data:",
        culturalData
      );
      setShowResults(true);
      setCorrectAnswer(correctAnswer);
      setCurrentCulturalData(culturalData);

      const opponentResult = results.find(
        (r: any) => r.userId !== currentPlayerId
      );

      const myResult = results.find((r: any) => r.userId === currentPlayerId);

      if (myResult) setPlayerHealth(myResult.health);
      if (opponentResult) {
        setOpponentHealth(opponentResult.health);
        setOpponentProvince(opponentResult.province);
      }

      // Store round data in game history for recap
      const roundData = {
        roundNumber: gameHistory.length + 1,
        correctAnswer,
        culturalData,
        playerAnswer: myResult?.province?.name || "No answer",
        opponentAnswer: opponentResult?.province?.name || "No answer",
        playerCorrect: myResult?.isCorrect || false,
        opponentCorrect: opponentResult?.isCorrect || false,
        playerHealthAfter: myResult?.health || 0,
        opponentHealthAfter: opponentResult?.health || 0,
        timestamp: new Date().toISOString(),
      };

      setGameHistory((prev) => [...prev, roundData]);
      setShowResultModal(true);
    };

    const handleGameStarted = ({ roomId }: any) => {
      console.log("Game started in room:", roomId);
      setGameStarted(true);
      setShowReadyModal(false);
    };

    const handleReadyStateUpdate = ({ readyPlayers, totalPlayers }: any) => {
      console.log("Ready state update:", { readyPlayers, totalPlayers });
      setReadyPlayers(readyPlayers);
      setTotalPlayers(totalPlayers);
    };

    const handleRoomData = (roomData: any) => {
      console.log("Room data received:", roomData);
      setTotalPlayers(roomData.playerCount);
    };

    socket.on("nextRound", ({ roundMessage, players }: any) => {
      console.log("Next round triggered:", roundMessage);

      const me = players.find((p: any) => p.userId === currentPlayerId);
      const opponent = players.find((p: any) => p.userId !== currentPlayerId);

      if (me) setPlayerHealth(me.health);
      if (opponent) setOpponentHealth(opponent.health);

      setShowResults(false);
      setShowResultModal(false);
      setHasSubmitted(false);
      setOpponentHasSubmitted(false);
      setBothSubmitted(false);
      setSelectedProvince(null);
      setCurrentCulturalData(null);
      setCorrectAnswer("");
      setCurrentRound(prev => prev + 1);
      selectedLayerRef.current = null;
    });

    socket.on("gameOver", ({ winner, players }: any) => {
      setGameOverData({ winner, players });
      setShowGameRecap(true);
    });
    socket.on("provinceSelected", handleProvinceSelected);
    socket.on("opponentSubmitted", handleOpponentSubmitted);
    socket.on("bothPlayersSubmitted", handleBothPlayersSubmitted);
    socket.on("showResults", handleShowResults);
    socket.on("gameStarted", handleGameStarted);
    socket.on("readyStateUpdate", handleReadyStateUpdate);
    socket.on("roomData", handleRoomData);

    return () => {
      // Remove event listeners
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);

      // Remove socket event listeners
      socket.off("connect");
      socket.off("roomRejoined");
      socket.off("error");
      socket.off("provinceSelected", handleProvinceSelected);
      socket.off("opponentSubmitted", handleOpponentSubmitted);
      socket.off("bothPlayersSubmitted", handleBothPlayersSubmitted);
      socket.off("showResults", handleShowResults);
      socket.off("gameStarted", handleGameStarted);
      socket.off("readyStateUpdate", handleReadyStateUpdate);
      socket.off("roomData", handleRoomData);

      console.log("GamePage cleanup: disconnecting socket and leaving room");
      if (socket.connected) {
        socket.emit("leaveRoom", {
          roomId: currentRoomId,
          userId: currentPlayerId,
        });
        socket.disconnect();
      }

      localStorage.removeItem("gameRoom");
    };
  }, [currentPlayerId, currentRoomId]);

  // Styles
  const getDefaultStyle = (): L.PathOptions => ({
    fillColor: "#3388ff",
    weight: 2,
    opacity: 1,
    color: "white",
    fillOpacity: 0.6,
  });

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
    const layer = e.target as L.Path;
    if (layer !== selectedLayerRef.current) {
      layer.setStyle(getHoverStyle());
      layer.bringToFront?.();
    }
  };

  const resetHighlight = (e: L.LeafletMouseEvent) => {
    const layer = e.target as L.Path;
    if (layer !== selectedLayerRef.current && geojsonLayerRef.current) {
      geojsonLayerRef.current.resetStyle(layer);
    }
  };

  const selectProvince = (e: L.LeafletMouseEvent) => {
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

    // Emit untuk real-time preview (opsional)
    socketRef.current?.emit("selectProvince", {
      province: layer.feature.properties,
      userId: currentPlayerId,
      roomId: currentRoomId,
    });

    if (mapInstanceRef.current && (layer as L.Polygon).getBounds) {
      mapInstanceRef.current.fitBounds((layer as L.Polygon).getBounds());
    }
  };

  const handleSubmit = () => {
    if (!selectedProvince || hasSubmitted) return;

    // Emit final submission
    socketRef.current?.emit("submitProvince", {
      province: selectedProvince,
      userId: currentPlayerId,
      roomId: currentRoomId,
    });

    setHasSubmitted(true);
    console.log("Submitted province:", selectedProvince.name);
  };

  const handlePlayerReady = () => {
    console.log("Player ready");
    socketRef.current?.emit("playerReady", {
      roomId: currentRoomId,
      userId: currentPlayerId,
    });
  };

  const handlePlayerUnready = () => {
    console.log("Player unready");
    socketRef.current?.emit("playerUnready", {
      roomId: currentRoomId,
      userId: currentPlayerId,
    });
  };

  const generateMatchSummary = async () => {
    if (gameHistory.length === 0) {
      console.log("No game history available for summary");
      return;
    }

    setIsLoadingSummary(true);
    try {
      console.log("Generating match summary for game history:", gameHistory);

      // Format game history untuk AI API
      const summaryPayload = gameHistory.map((round) => ({
        playerCorrect: round.playerCorrect,
        playerAnswer: round.playerAnswer,
        correctAnswer: round.correctAnswer,
        culturalData: round.culturalData
          ? {
              cultural_category: round.culturalData.cultural_category,
              cultural_context: round.culturalData.cultural_context,
              cultural_fun_fact: round.culturalData.cultural_fun_fact,
            }
          : null,
      }));

      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/match-summary`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(summaryPayload),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setMatchSummary(data.feedback);
      setShowMatchSummary(true);

      console.log("Match summary generated successfully:", data.feedback);
    } catch (error) {
      console.error("Error generating match summary:", error);
      setMatchSummary(
        "Sorry, we couldn't generate your match summary at this time. Please try again later."
      );
      setShowMatchSummary(true);
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const onEachFeature = (feature: GeoJSONFeature, layer: L.Layer) => {
    if (feature.properties) {
      let code: string | undefined;
      const props = feature.properties;
      if (props.KODE_PROV) {
        code = kodeToId[parseInt(props.KODE_PROV)];
      } else if (props.kode) {
        code = kodeToId[parseInt(props.kode)];
      } else if (props.iso_code) {
        code = props.iso_code;
      }

      const name =
        props.PROVINSI ||
        props.Provinsi ||
        props.name ||
        props.provinsi ||
        (code && provinceInfo[code]?.name) ||
        "";

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
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-rose-200">
      <ReadyModal
        isOpen={showReadyModal && !gameStarted}
        currentUserId={currentPlayerId || ""}
        readyPlayers={readyPlayers}
        totalPlayers={totalPlayers}
        onReady={handlePlayerReady}
        onUnready={handlePlayerUnready}
      />

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
            <p className="text-rose-700 font-bold">
              Your Health: ❤️ {playerHealth}
            </p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow">
            <p className="text-blue-700 font-bold">
              Opponent Health: ❤️ {opponentHealth}
            </p>
          </div>
        </div>
        {/* AI Match Summary */}
        {showMatchSummary && matchSummary && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-300 rounded-xl shadow-xl mt-6 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-green-700 flex items-center gap-2">
                🤖 AI Match Summary
              </h2>
              <button
                onClick={() => setShowMatchSummary(false)}
                className="text-gray-500 hover:text-gray-700 text-xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-200">
              <div className="prose prose-sm max-w-none">
                {matchSummary.split("\n").map((paragraph, index) => (
                  <p key={index} className="mb-3 text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <button
                onClick={generateMatchSummary}
                disabled={isLoadingSummary}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  isLoadingSummary
                    ? "bg-gray-400 text-white cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"
                }`}
              >
                {isLoadingSummary ? "Regenerating..." : "🔄 Regenerate Summary"}
              </button>
            </div>
          </div>
        )}
        {/* Game Recap */}
        {showGameRecap && gameHistory.length > 0 && (
          <div className="bg-white border border-blue-300 rounded-xl shadow-xl mt-6 p-6">
            <h2 className="text-2xl font-bold text-blue-700 mb-4 text-center">
              📊 Game Recap
            </h2>

            {/* Game Statistics */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold text-blue-800">Your Performance</h3>
                <p className="text-sm text-blue-700">
                  Correct: {gameHistory.filter((r) => r.playerCorrect).length}/
                  {gameHistory.length}
                </p>
                <p className="text-sm text-blue-700">
                  Accuracy:{" "}
                  {Math.round(
                    (gameHistory.filter((r) => r.playerCorrect).length /
                      gameHistory.length) *
                      100
                  )}
                  %
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold text-gray-800">
                  Opponent Performance
                </h3>
                <p className="text-sm text-gray-700">
                  Correct: {gameHistory.filter((r) => r.opponentCorrect).length}
                  /{gameHistory.length}
                </p>
                <p className="text-sm text-gray-700">
                  Accuracy:{" "}
                  {Math.round(
                    (gameHistory.filter((r) => r.opponentCorrect).length /
                      gameHistory.length) *
                      100
                  )}
                  %
                </p>
              </div>
            </div>

            {/* Round by Round Recap */}
            <div className="space-y-3">
              <h3 className="font-bold text-gray-800 mb-3">Round by Round</h3>
              {gameHistory.map((round, index) => (
                <div key={index} className="bg-gray-50 p-3 rounded-lg border">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-semibold text-gray-800">
                      Round {round.roundNumber}
                    </h4>
                    <span className="text-sm font-bold text-green-600">
                      ✅ {round.correctAnswer}
                    </span>
                  </div>

                  {round.culturalData && (
                    <p className="text-xs text-blue-600 mb-2 italic">
                      {round.culturalData.cultural_category}:{" "}
                      {round.culturalData.cultural_context}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div
                      className={`p-2 rounded ${
                        round.playerCorrect
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <strong>You:</strong> {round.playerAnswer}{" "}
                      {round.playerCorrect ? "✅" : "❌"}
                    </div>
                    <div
                      className={`p-2 rounded ${
                        round.opponentCorrect
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      <strong>Opponent:</strong> {round.opponentAnswer}{" "}
                      {round.opponentCorrect ? "✅" : "❌"}
                    </div>
                  </div>

                  {round.culturalData?.cultural_fun_fact && (
                    <div className="mt-2 p-2 bg-yellow-50 border-l-4 border-yellow-400">
                      <p className="text-xs text-yellow-800">
                        💡 <strong>Fun Fact:</strong>{" "}
                        {round.culturalData.cultural_fun_fact}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Cultural Learning Summary */}
            <div className="mt-6 bg-purple-50 p-4 rounded-lg">
              <h3 className="font-bold text-purple-800 mb-2">
                🎨 Cultural Journey
              </h3>
              <p className="text-sm text-purple-700 mb-2">
                You explored{" "}
                <strong>
                  {new Set(gameHistory.map((r) => r.correctAnswer)).size}
                </strong>{" "}
                different Indonesian provinces
              </p>
              <p className="text-sm text-purple-700">
                Cultural categories discovered:{" "}
                <strong>
                  {
                    new Set(
                      gameHistory
                        .map((r) => r.culturalData?.cultural_category)
                        .filter(Boolean)
                    ).size
                  }
                </strong>
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {Array.from(
                  new Set(gameHistory.map((r) => r.correctAnswer))
                ).map((province, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-purple-200 text-purple-800 text-xs rounded"
                  >
                    {province}
                  </span>
                ))}
              </div>
            </div>

            <div className="text-center mt-4">
              <button
                onClick={() => navigate("/")}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        {!hasSubmitted && selectedProvince && (
          <div className="text-center mb-6">
            <button
              className="px-8 py-4 bg-rose-600 text-white rounded-lg shadow-lg hover:bg-rose-700 transition-all transform hover:scale-105 font-bold text-lg"
              onClick={handleSubmit}
              disabled={hasSubmitted}
            >
              Submit My Province
            </button>
          </div>
        )}

        {/* Status Messages */}
        {hasSubmitted && !showResults && (
          <div className="text-center mb-6">
            {!bothSubmitted ? (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded-lg">
                <p className="font-medium">
                  ✅ You submitted: <strong>{selectedProvince?.name}</strong>
                </p>
                {!opponentHasSubmitted && (
                  <p className="text-sm mt-1">
                    Waiting for opponent to submit...
                  </p>
                )}
                {opponentHasSubmitted && !bothSubmitted && (
                  <p className="text-sm mt-1">
                    Opponent has submitted! Processing results...
                  </p>
                )}
              </div>
            ) : (
              <div className="bg-blue-100 border border-blue-400 text-blue-800 px-4 py-3 rounded-lg">
                <p className="font-medium text-lg">🎯 {bothSubmittedMessage}</p>
                <p className="text-sm mt-1">Preparing to show results...</p>
              </div>
            )}
          </div>
        )}

        {/* Round Result Modal */}
        {showResultModal && gameHistory.length > 0 && (
          <RoundResultModal
            isOpen={showResultModal}
            roundNumber={currentRound}
            correctAnswer={correctAnswer}
            culturalData={currentCulturalData}
            playerAnswer={selectedProvince?.name || "No selection"}
            playerCorrect={selectedProvince?.name === correctAnswer}
            opponentAnswer={opponentProvince?.name || "No selection"}
            opponentCorrect={opponentProvince?.name === correctAnswer}
            opponentLabel="Opponent"
            playerHealth={playerHealth}
            opponentHealth={opponentHealth}
            onClose={() => setShowResultModal(false)}
            onTimeComplete={() => setShowResultModal(false)}
          />
        )}

        {/* Main Game Content - Map and Cultural Experience Side by Side */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <div className="bg-white/90 rounded-2xl shadow-2xl overflow-hidden border border-rose-100 relative">
            <div ref={mapRef} className="h-[70vh] w-full relative" />            
          </div>

          <CulturalDataDisplay
            socket={socketRef.current}
            roomId={currentRoomId}
            gameStarted={gameStarted}
            playerHealth={playerHealth}
            opponentHealth={opponentHealth}
            gameOver={!!gameOverData}
          />
        </div>
      </div>
    </div>
  );
}
