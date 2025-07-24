export interface ProvinceInfo {
  name: string;
  capital: string;
  population: string;
  area: string;
}

export interface ProvinceData {
  [key: string]: ProvinceInfo;
}

export interface ProvinceProperties {
  iso_code?: string;
  kode?: string;
  code?: string;
  name?: string;
  [key: string]: any;
}

export interface GeoJSONData {
  type: "FeatureCollection";
  features: GeoJSON.Feature<GeoJSON.Geometry, ProvinceProperties>[];
}
