import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { ProvinceData, ProvinceProperties } from "../interfaces/gametype";
import type { Feature as GeoJSONFeature } from "geojson";

// Province data
const provinceInfo: ProvinceData = {
  "ID-AC": {
    name: "Aceh",
    capital: "Banda Aceh",
    population: "5.3 million",
    area: "57,956 km²",
  },
  "ID-SU": {
    name: "Sumatera Utara",
    capital: "Medan",
    population: "14.8 million",
    area: "72,981 km²",
  },
  "ID-SB": {
    name: "Sumatera Barat",
    capital: "Padang",
    population: "5.5 million",
    area: "42,012 km²",
  },
  "ID-RI": {
    name: "Riau",
    capital: "Pekanbaru",
    population: "6.4 million",
    area: "87,023 km²",
  },
  "ID-JA": {
    name: "Jambi",
    capital: "Jambi",
    population: "3.5 million",
    area: "50,058 km²",
  },
  "ID-SS": {
    name: "Sumatera Selatan",
    capital: "Palembang",
    population: "8.5 million",
    area: "91,592 km²",
  },
  "ID-BE": {
    name: "Bengkulu",
    capital: "Bengkulu",
    population: "2.0 million",
    area: "19,919 km²",
  },
  "ID-LA": {
    name: "Lampung",
    capital: "Bandar Lampung",
    population: "9.0 million",
    area: "34,623 km²",
  },
  "ID-BB": {
    name: "Kepulauan Bangka Belitung",
    capital: "Pangkal Pinang",
    population: "1.5 million",
    area: "16,424 km²",
  },
  "ID-KR": {
    name: "Kepulauan Riau",
    capital: "Tanjung Pinang",
    population: "2.1 million",
    area: "8,201 km²",
  },
  "ID-JK": {
    name: "DKI Jakarta",
    capital: "Jakarta",
    population: "10.6 million",
    area: "664 km²",
  },
  "ID-JB": {
    name: "Jawa Barat",
    capital: "Bandung",
    population: "48.3 million",
    area: "35,377 km²",
  },
  "ID-JT": {
    name: "Jawa Tengah",
    capital: "Semarang",
    population: "36.5 million",
    area: "32,800 km²",
  },
  "ID-YO": {
    name: "DI Yogyakarta",
    capital: "Yogyakarta",
    population: "3.8 million",
    area: "3,133 km²",
  },
  "ID-JI": {
    name: "Jawa Timur",
    capital: "Surabaya",
    population: "40.7 million",
    area: "47,799 km²",
  },
  "ID-BT": {
    name: "Banten",
    capital: "Serang",
    population: "12.9 million",
    area: "9,662 km²",
  },
  "ID-BA": {
    name: "Bali",
    capital: "Denpasar",
    population: "4.3 million",
    area: "5,780 km²",
  },
  "ID-NB": {
    name: "Nusa Tenggara Barat",
    capital: "Mataram",
    population: "5.3 million",
    area: "18,572 km²",
  },
  "ID-NT": {
    name: "Nusa Tenggara Timur",
    capital: "Kupang",
    population: "5.5 million",
    area: "48,718 km²",
  },
  "ID-KB": {
    name: "Kalimantan Barat",
    capital: "Pontianak",
    population: "5.4 million",
    area: "147,307 km²",
  },
  "ID-KT": {
    name: "Kalimantan Tengah",
    capital: "Palangka Raya",
    population: "2.7 million",
    area: "153,564 km²",
  },
  "ID-KS": {
    name: "Kalimantan Selatan",
    capital: "Banjarmasin",
    population: "4.2 million",
    area: "38,744 km²",
  },
  "ID-KI": {
    name: "Kalimantan Timur",
    capital: "Samarinda",
    population: "3.8 million",
    area: "129,066 km²",
  },
  "ID-KU": {
    name: "Kalimantan Utara",
    capital: "Tanjung Selor",
    population: "0.7 million",
    area: "75,467 km²",
  },
  "ID-SA": {
    name: "Sulawesi Utara",
    capital: "Manado",
    population: "2.6 million",
    area: "13,892 km²",
  },
  "ID-ST": {
    name: "Sulawesi Tengah",
    capital: "Palu",
    population: "3.0 million",
    area: "61,841 km²",
  },
  "ID-SN": {
    name: "Sulawesi Selatan",
    capital: "Makassar",
    population: "9.1 million",
    area: "46,717 km²",
  },
  "ID-SG": {
    name: "Sulawesi Tenggara",
    capital: "Kendari",
    population: "2.7 million",
    area: "38,067 km²",
  },
  "ID-GO": {
    name: "Gorontalo",
    capital: "Gorontalo",
    population: "1.2 million",
    area: "11,257 km²",
  },
  "ID-SR": {
    name: "Sulawesi Barat",
    capital: "Mamuju",
    population: "1.4 million",
    area: "16,787 km²",
  },
  "ID-MA": {
    name: "Maluku",
    capital: "Ambon",
    population: "1.8 million",
    area: "46,914 km²",
  },
  "ID-MU": {
    name: "Maluku Utara",
    capital: "Sofifi",
    population: "1.3 million",
    area: "31,982 km²",
  },
  "ID-PB": {
    name: "Papua Barat",
    capital: "Manokwari",
    population: "1.1 million",
    area: "102,955 km²",
  },
  "ID-PA": {
    name: "Papua",
    capital: "Jayapura",
    population: "4.3 million",
    area: "319,036 km²",
  },
};

// Mapping kode angka ke kode string provinceInfo
const kodeToId: Record<number, string> = {
  11: "ID-AC",
  12: "ID-SU",
  13: "ID-SB",
  14: "ID-RI",
  15: "ID-JA",
  16: "ID-SS",
  17: "ID-BE",
  18: "ID-LA",
  19: "ID-BB",
  21: "ID-KR",
  31: "ID-JK",
  32: "ID-JB",
  33: "ID-JT",
  34: "ID-YO",
  35: "ID-JI",
  36: "ID-BT",
  51: "ID-BA",
  52: "ID-NB",
  53: "ID-NT",
  61: "ID-KB",
  62: "ID-KT",
  63: "ID-KS",
  64: "ID-KI",
  65: "ID-KU",
  71: "ID-SA",
  72: "ID-ST",
  73: "ID-SN",
  74: "ID-SG",
  75: "ID-GO",
  76: "ID-SR",
  81: "ID-MA",
  82: "ID-MU",
  91: "ID-PB",
  94: "ID-PA",
  85: "ID-PA", // Untuk kasus IRIAN JAYA TIMUR (Papua)
};

export default function GamePage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);
  const selectedLayerRef = useRef<L.Layer | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvince, setSelectedProvince] =
    useState<ProvinceProperties | null>(null);

  // Styles for provinces
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

    // Update selected province state
    if (!layer.feature || !layer.feature.properties) return;
    setSelectedProvince(layer.feature.properties);
    // Fit map to selected province
    if (mapInstanceRef.current && (layer as L.Polygon).getBounds) {
      mapInstanceRef.current.fitBounds((layer as L.Polygon).getBounds());
    }
  };

  const onEachFeature = (feature: GeoJSONFeature, layer: L.Layer) => {
    if (feature.properties) {
      const props = feature.properties;
      let code: string | undefined;
      if (typeof props.kode === "number") {
        code = kodeToId[props.kode];
      } else if (
        typeof props.kode === "string" &&
        kodeToId[parseInt(props.kode)]
      ) {
        code = kodeToId[parseInt(props.kode)];
      } else {
        code = props.iso_code || props.code;
      }

      const name = props.name || props.Propinsi || props.provinsi || "";
      if (code && provinceInfo[code]) {
        feature.properties = {
          ...provinceInfo[code],
          ...props,
          name,
          kode: code,
        };
      } else {
        feature.properties = { ...props, name, kode: code };
      }
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

  const resetView = () => {
    if (mapInstanceRef.current && geojsonLayerRef.current) {
      mapInstanceRef.current.fitBounds(geojsonLayerRef.current.getBounds());

      if (selectedLayerRef.current) {
        geojsonLayerRef.current.resetStyle(selectedLayerRef.current as L.Path);
        selectedLayerRef.current = null;
        setSelectedProvince(null);
      }
    }
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const initializeMap = () => {
      if (!mapRef.current) return;

      // Initialize map
      const map = L.map(mapRef.current, {
        preferCanvas: true, // Better performance
        zoomControl: true,
        attributionControl: true,
      }).setView([-2.5, 118], 5);

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      map.whenReady(() => {
        // Custom reset control
        const ResetControl = L.Control.extend({
          onAdd: function () {
            const container = L.DomUtil.create(
              "div",
              "leaflet-bar leaflet-control leaflet-control-custom"
            );
            const btn = L.DomUtil.create("button", "", container);
            btn.innerHTML = "Reset View";
            btn.style.cssText =
              "background: white; padding: 8px 12px; border: none; border-radius: 4px; cursor: pointer; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,0.3);";

            L.DomEvent.on(btn, "click", (e) => {
              L.DomEvent.stopPropagation(e);
              L.DomEvent.preventDefault(e);
              resetView();
            });

            return container;
          },
        });

        new ResetControl({ position: "topright" }).addTo(map);

        // Load GeoJSON data after map is ready
        loadGeoJSONData(map);
      });
    };

    const loadGeoJSONData = async (map: L.Map) => {
      const geoJsonUrls = [
        "https://raw.githubusercontent.com/superpikar/indonesia-geojson/master/indonesia-province-simple.json",
      ];

      for (let i = 0; i < geoJsonUrls.length; i++) {
        try {
          console.log(`Trying URL ${i + 1}:`, geoJsonUrls[i]);

          const response = await fetch(geoJsonUrls[i], {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          console.log("GeoJSON data loaded:", data);

          // Validate data structure
          if (!data || !data.features || !Array.isArray(data.features)) {
            throw new Error("Invalid GeoJSON format - missing features array");
          }

          if (data.features.length === 0) {
            throw new Error("GeoJSON contains no features");
          }

          setLoading(false);

          // Add GeoJSON layer to map
          const geojsonLayer = L.geoJSON(data, {
            style: getDefaultStyle,
            onEachFeature: onEachFeature,
          });

          // Add to map only if map still exists
          if (mapInstanceRef.current && mapRef.current) {
            geojsonLayer.addTo(map);
            geojsonLayerRef.current = geojsonLayer;

            // Fit map to GeoJSON bounds
            const bounds = geojsonLayer.getBounds();
            if (bounds.isValid()) {
              map.fitBounds(bounds, { padding: [10, 10] });
            }
          }

          return; // Success, exit the loop
        } catch (err) {
          console.error(`Failed to load from URL ${i + 1}:`, err);

          if (i === geoJsonUrls.length - 1) {
            // Last URL failed, show error
            setError(
              `Failed to load map data: ${
                err instanceof Error ? err.message : "Unknown error"
              }`
            );
            setLoading(false);
          }
        }
      }
    };

    // Initialize with a small delay to ensure DOM is ready
    const timer = setTimeout(initializeMap, 100);

    // Cleanup
    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      geojsonLayerRef.current = null;
      selectedLayerRef.current = null;
    };
  }, []);

  const getProvinceInfo = (properties: ProvinceProperties) => {
    const code =
      properties.iso_code || properties.kode || properties.code || "";
    return provinceInfo[code] || {};
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-200 to-rose-200">
      {/* Navigation spacer */}
      <div className="h-20" />

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-800 mb-2 drop-shadow-2xl">
            Indonesia Interactive Map
          </h1>
          <p className="text-lg md:text-xl text-gray-700 mb-4 drop-shadow">
            Explore Indonesian provinces and learn about their culture
          </p>
        </div>

        <div className="relative">
          <div className="bg-white/90 rounded-2xl shadow-2xl overflow-hidden border border-rose-100">
            <div ref={mapRef} className="h-[70vh] w-full relative">
              {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-[1000]">
                  <div className="bg-white p-6 rounded-xl shadow-xl flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-rose-500"></div>
                    <span className="text-gray-700 font-semibold">
                      Loading map data...
                    </span>
                  </div>
                </div>
              )}

              {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-[1000]">
                  <div className="bg-rose-50 border border-rose-200 p-6 rounded-xl shadow-xl max-w-md">
                    <div className="flex items-center space-x-3">
                      <svg
                        className="w-6 h-6 text-rose-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-rose-700 font-semibold">
                        {error}
                      </span>
                    </div>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-rose-400 via-rose-500 to-pink-500 text-white rounded-full font-bold hover:from-rose-500 hover:to-pink-600 transition-all"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>

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
                  {(() => {
                    const info = getProvinceInfo(selectedProvince);
                    const code =
                      selectedProvince.iso_code ||
                      selectedProvince.kode ||
                      selectedProvince.code ||
                      "N/A";

                    return (
                      <>
                        <div>
                          <span className="font-medium text-gray-700">
                            Province:
                          </span>
                          <span className="ml-2 text-gray-900 font-bold">
                            {info.name || selectedProvince.name || "Unknown"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Capital:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {info.capital || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Population:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {info.population || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Area:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {info.area || "N/A"}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Code:
                          </span>
                          <span className="ml-2 text-gray-900">{code}</span>
                        </div>
                      </>
                    );
                  })()}
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
      </div>
    </div>
  );
}
