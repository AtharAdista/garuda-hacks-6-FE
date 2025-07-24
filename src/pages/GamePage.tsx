import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Feature as GeoJSONFeature } from "geojson";
import CulturalDataDisplay from "@/components/CulturalDataDisplay";

import geoData from "../data/38ProvinsiIndonesia-Provinsi.json";
import { io, Socket } from "socket.io-client";
import { useLocation } from "react-router-dom";

import { provinceInfo, kodeToId } from "../data/provinceInfo";

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

  useEffect(() => {
    if (!currentRoomId || !currentPlayerId) {
      console.error("No room or player data available for game");
      return;
    }

    const socket = io(import.meta.env.VITE_BACKEND_URL);
    socketRef.current = socket;

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

    const handleProvinceSelected = ({ province, userId }) => {
      console.log("Province selected:", province, "by user:", userId);
      if (userId !== currentPlayerId) {
        console.log("Opponent is hovering/selecting:", province.name);
      }
    };

    const handleOpponentSubmitted = ({ userId, province }) => {
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

    const handleBothPlayersSubmitted = ({
      message,
      submissionCount,
      totalPlayers,
    }) => {
      console.log("Both players submitted:", message);
      setBothSubmitted(true);
      setBothSubmittedMessage(message);
    };

    const handleShowResults = ({ results }) => {
      console.log("Show results:", results);
      setShowResults(true);
      const opponentResult = results.find((r) => r.userId !== currentPlayerId);
      if (opponentResult) {
        setOpponentProvince(opponentResult.province);
      }
    };

    socket.on("provinceSelected", handleProvinceSelected);
    socket.on("opponentSubmitted", handleOpponentSubmitted);
    socket.on("bothPlayersSubmitted", handleBothPlayersSubmitted);
    socket.on("showResults", handleShowResults);

    return () => {
      socket.off("connect");
      socket.off("roomRejoined");
      socket.off("error");
      socket.off("provinceSelected", handleProvinceSelected);
      socket.off("opponentSubmitted", handleOpponentSubmitted);
      socket.off("bothPlayersSubmitted", handleBothPlayersSubmitted);
      socket.off("showResults", handleShowResults);

      console.log("GamePage cleanup: disconnecting socket and leaving room");
      socket.emit("leaveRoom", {
        roomId: currentRoomId,
        userId: currentPlayerId,
      });
      socket.disconnect();

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

        <div className="relative">
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
                  <p className="font-medium text-lg">
                    🎯 {bothSubmittedMessage}
                  </p>
                  <p className="text-sm mt-1">Preparing to show results...</p>
                </div>
              )}
            </div>
          )}

          {/* Results */}
          {showResults && (
            <div className="text-center mb-6">
              <div className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded-lg">
                <h3 className="font-bold text-lg mb-2">🎯 Results</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/50 p-3 rounded">
                    <p className="font-medium">Your Answer:</p>
                    <p className="text-lg font-bold">
                      {selectedProvince?.name || "No selection"}
                    </p>
                  </div>
                  <div className="bg-white/50 p-3 rounded">
                    <p className="font-medium">Opponent's Answer:</p>
                    <p className="text-lg font-bold">
                      {opponentProvince?.name || "No selection"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white/90 rounded-2xl shadow-2xl overflow-hidden border border-rose-100">
            <div ref={mapRef} className="h-[70vh] w-full relative" />

            {/* Info Panel */}
            <div className="absolute top-4 right-4 bg-white/90 p-5 rounded-xl shadow-xl border border-rose-100 z-[1000] min-w-[250px] max-w-[300px]">
              <h3 className="text-lg font-bold text-rose-600 mb-3">
                Province Information
              </h3>
              {!selectedProvince ? (
                <p className="text-gray-600">
                  Click on any province to see details
                </p>
              ) : (
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">Province:</span>
                    <span className="ml-2 text-gray-900 font-bold">
                      {selectedProvince.name}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Capital:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedProvince.capital || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">
                      Population:
                    </span>
                    <span className="ml-2 text-gray-900">
                      {selectedProvince.population || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Area:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedProvince.area || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Kode:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedProvince.KODE_PROV ||
                        selectedProvince.kode ||
                        "-"}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-white/90 p-4 rounded-xl shadow-lg border border-rose-100 z-[1000]">
              <h4 className="font-semibold text-rose-600 mb-3">Legend</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div
                    className="w-5 h-5 mr-3 border border-gray-400 rounded"
                    style={{ backgroundColor: "#3388ff" }}
                  ></div>
                  <span className="text-sm text-gray-700 font-semibold">
                    Default Province
                  </span>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-5 h-5 mr-3 border border-gray-400 rounded"
                    style={{ backgroundColor: "#ff7800" }}
                  ></div>
                  <span className="text-sm text-gray-700 font-semibold">
                    Hovered Province
                  </span>
                </div>
                <div className="flex items-center">
                  <div
                    className="w-5 h-5 mr-3 border border-gray-400 rounded"
                    style={{ backgroundColor: "#e74c3c" }}
                  ></div>
                  <span className="text-sm text-gray-700 font-semibold">
                    Selected Province
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cultural Data Display Section */}
        <div className="lg:col-span-1">
          <CulturalDataDisplay />
        </div>
      </div>
    </div>
  );
}
