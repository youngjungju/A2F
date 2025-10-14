export interface Club {
  name: string;
  colors: string[];
  years: number;
  percentage: number;
}

export interface PlayerData {
  id: string;
  name: string;
  nameKo: string;
  clubs: Club[];
  careerTimeline: number[];
  position?: string;
  birthYear?: number;
}

export interface NoiseParams {
  amplitude: number;
  saturation: number;
  layers: number;
  lacunarity: number;
  gain: number;
  warpStrength: number;
  halftonePattern: number;
  halftoneScale: number;
}

export const DEFAULT_NOISE_PARAMS: NoiseParams = {
  amplitude: 0.5,
  saturation: 1.0,
  layers: 4,
  lacunarity: 2.0,
  gain: 0.5,
  warpStrength: 0.3,
  halftonePattern: 0,
  halftoneScale: 50.0,
};
