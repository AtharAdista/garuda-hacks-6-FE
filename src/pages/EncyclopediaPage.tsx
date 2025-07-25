import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Feature as GeoJSONFeature } from "geojson";
import geoData from "../data/38ProvinsiIndonesia-Provinsi.json";

import { provinceInfo, kodeToId } from "../data/provinceInfo";

import CultureEntryList from "../components/CultureEntryCard";
import cultureEntries from "../data/CultureEntries.json";
import type { CultureEntry } from "@/interfaces/cultureentry-type";

import Chatbot from "../components/Chatbot";

export default function EncyclopediaPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const selectedLayerRef = useRef<L.Layer | null>(null);

  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [selectedEntry, setSelectedEntry] = useState<CultureEntry | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null);

  // Enhanced styles with better gradients and animations
  const getDefaultStyle = (): L.PathOptions => ({
    fillColor: "#3b82f6",
    weight: 1.5,
    opacity: 1,
    color: "#ffffff",
    fillOpacity: 0.7,
  });

  const getHoverStyle = (): L.PathOptions => ({
    fillColor: "#f59e0b",
    weight: 3,
    color: "#ffffff",
    fillOpacity: 0.9,
  });

  const getSelectedStyle = (): L.PathOptions => ({
    fillColor: "#dc2626",
    weight: 4,
    color: "#ffffff",
    fillOpacity: 0.95,
  });

  const highlightFeature = (e: L.LeafletMouseEvent) => {
    const layer = e.target as L.Path;
    const feature = (layer as any).feature;

    if (layer !== selectedLayerRef.current) {
      layer.setStyle(getHoverStyle());
      layer.bringToFront?.();
      setHoveredProvince(feature?.properties?.name || null);
    }
  };

  const resetHighlight = (e: L.LeafletMouseEvent) => {
    const layer = e.target as L.Path;
    if (layer !== selectedLayerRef.current && geojsonLayerRef.current) {
      geojsonLayerRef.current.resetStyle(layer);
      setHoveredProvince(null);
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
    if (mapInstanceRef.current && (layer as L.Polygon).getBounds) {
      mapInstanceRef.current.fitBounds((layer as L.Polygon).getBounds(), {
        padding: [20, 20],
      });
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
      pathLayer.bindTooltip(
        `<div class="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-3 shadow-lg">
           <div class="font-bold text-sm text-gray-800">${feature.properties.name}</div>
           <div class="text-xs text-gray-600 mt-1">Click to explore</div>
         </div>`,
        {
          permanent: false,
          direction: "auto",
          className: "!bg-transparent !border-none !shadow-none !p-0",
        }
      );
    }
  };


  useEffect(() => {
    if (!mapRef.current) return;

    const map = L.map(mapRef.current, {
      preferCanvas: true,
      zoomControl: false,
      attributionControl: false,
    }).setView([-2.5, 118], 5);

    mapInstanceRef.current = map;

    // Custom tile layer with better styling
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      {
        attribution: "© CARTO",
        maxZoom: 19,
        subdomains: "abcd",
      }
    ).addTo(map);

    // Custom zoom control
    L.control
      .zoom({
        position: "topright",
      })
      .addTo(map);

    const geojsonLayer = L.geoJSON(geoData as any, {
      style: getDefaultStyle,
      onEachFeature: onEachFeature,
    });

    geojsonLayer.addTo(map);
    geojsonLayerRef.current = geojsonLayer;
    const bounds = geojsonLayer.getBounds();
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [20, 20] });
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

  const selectedProvinceName = selectedProvince?.name;

  // Enhanced filtering
  const categories = ["All", ...new Set(cultureEntries.map((e) => e.type))];

  const filteredEntries = cultureEntries.filter((entry) => {
    const matchesProvince = selectedProvinceName
      ? entry.province === selectedProvinceName
      : true;
    const matchesSearch =
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || entry.type === selectedCategory;

    return matchesProvince && matchesSearch && matchesCategory;
  });

  const provinceStats = selectedProvinceName
    ? {
        totalEntries: cultureEntries.filter(
          (e) => e.province === selectedProvinceName
        ).length,
        categories: [
          ...new Set(
            cultureEntries
              .filter((e) => e.province === selectedProvinceName)
              .map((e) => e.type)
          ),
        ],
      }
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="h-20" />
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500 text-white py-16">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-black mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
            Cultural Encyclopedia
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Explore the rich tapestry of Indonesian heritage through our
            interactive map
          </p>

          {/* Search and Filter Bar */}
          <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search cultures, traditions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <div className="absolute right-3 top-3 text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-xl bg-white/90 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <div className="flex items-center justify-center bg-white/20 rounded-xl px-4 py-3">
                <span className="text-sm font-semibold">
                  {filteredEntries.length} Cultural Items
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Interactive Map Section */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 mb-8">
          <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Interactive Indonesia Map
            </h2>
            <p className="text-gray-600">
              {hoveredProvince
                ? `Hovering: ${hoveredProvince}`
                : selectedProvinceName
                ? `Selected: ${selectedProvinceName}`
                : "Click on any province to explore its cultural heritage"}
            </p>
          </div>

          <div className="relative">
            <div ref={mapRef} className="h-[75vh] w-full" />

            {/* Enhanced Info Panel */}
            <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl border border-gray-100 min-w-[280px] max-w-[350px]">
              <div className="flex items-center mb-4">
                <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-3"></div>
                <h3 className="text-lg font-bold text-gray-800">
                  Province Details
                </h3>
              </div>

              {!selectedProvince ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm">
                    Click on any province to explore its cultural treasures
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl">
                    <h4 className="font-bold text-xl text-gray-800 mb-2">
                      {selectedProvince.name}
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Capital:</span>
                        <p className="font-semibold text-gray-800">
                          {selectedProvince.capital || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Population:</span>
                        <p className="font-semibold text-gray-800">
                          {selectedProvince.population || "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {provinceStats && (
                    <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-xl">
                      <h5 className="font-bold text-gray-800 mb-2">
                        Cultural Heritage
                      </h5>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          Total Items:
                        </span>
                        <span className="font-bold text-green-600">
                          {provinceStats.totalEntries}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {provinceStats.categories.map((cat) => (
                          <span
                            key={cat}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Enhanced Legend */}
            <div className="absolute bottom-6 left-6 bg-white/95 backdrop-blur-sm p-4 rounded-2xl shadow-xl border border-gray-100">
              <h4 className="font-bold text-gray-800 mb-3 flex items-center">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mr-2"></div>
                Map Legend
              </h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <div
                    className="w-4 h-4 mr-3 rounded border-2 border-white shadow-sm"
                    style={{ backgroundColor: "#3b82f6" }}
                  ></div>
                  <span className="text-gray-700">Default Province</span>
                </div>
                <div className="flex items-center text-sm">
                  <div
                    className="w-4 h-4 mr-3 rounded border-2 border-white shadow-sm"
                    style={{ backgroundColor: "#f59e0b" }}
                  ></div>
                  <span className="text-gray-700">Hovered Province</span>
                </div>
                <div className="flex items-center text-sm">
                  <div
                    className="w-4 h-4 mr-3 rounded border-2 border-white shadow-sm"
                    style={{ backgroundColor: "#dc2626" }}
                  ></div>
                  <span className="text-gray-700">Selected Province</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cultural Entries Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="animate-fade-in delay-100">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                {selectedProvinceName
                  ? `Cultural Heritage of ${selectedProvinceName}`
                  : "All Cultural Heritage"}
              </h2>
              <p className="text-gray-600">
                Discover {filteredEntries.length} cultural treasures
                {selectedProvinceName && ` from ${selectedProvinceName}`}
              </p>
            </div>

            {selectedProvinceName && (
              <button
                onClick={() => {
                  setSelectedProvince(null);
                  if (selectedLayerRef.current && geojsonLayerRef.current) {
                    geojsonLayerRef.current.resetStyle(
                      selectedLayerRef.current as L.Path
                    );
                    selectedLayerRef.current = null;
                  }
                }}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 animate-fade-in delay-200"
              >
                Show All Provinces
              </button>
            )}
          </div>

          <div className="animate-fade-in delay-300">
            <CultureEntryList
              entries={filteredEntries}
              onEntryClick={setSelectedEntry}
            />
          </div>
        </div>
      </div>
      <Chatbot
        culturalItem={
          selectedEntry
            ? (selectedEntry as unknown as Record<string, unknown>)
            : undefined
        }
      />
      {selectedEntry && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 animate-scale-in">
            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="animate-fade-in delay-100">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {selectedEntry.title}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold animate-fade-in delay-200">
                      {selectedEntry.type}
                    </span>
                    <span className="bg-gradient-to-r from-green-100 to-teal-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold animate-fade-in delay-300">
                      {selectedEntry.province}
                    </span>
                  </div>
                </div>
                <button
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 animate-fade-in delay-100"
                  onClick={() => setSelectedEntry(null)}
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 animate-fade-in delay-200">
              {selectedEntry.image && (
                <img
                  src={selectedEntry.image}
                  alt={selectedEntry.title}
                  className="w-full h-64 object-cover rounded-xl mb-4 shadow-lg animate-fade-in delay-300"
                />
              )}
              <p className="text-gray-700 leading-relaxed whitespace-pre-line mb-4 animate-fade-in delay-400">
                {selectedEntry.description}
              </p>
              {selectedEntry.author && (
                <div className="flex items-center text-sm text-gray-500 bg-gray-50 p-3 rounded-xl animate-fade-in delay-500">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Author: {selectedEntry.author}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}