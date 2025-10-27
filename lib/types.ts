export interface Club {
  name: string;
  colors: string[];
  years: number;
  percentage: number;
}

// Supabase Player 테이블 구조
export interface PlayerRow {
  id: number;
  'Player Name': string | null;
  'Team 1': string | null;
  'Team 1 Color': string | null;
  'Team 2': string | null;
  'Team 2 Color': string | null;
  'Team 3': string | null;
  'Team 3 Color': string | null;
  'Team 4': string | null;
  'Team 4 Color': string | null;
  'Team 5': string | null;
  'Team 5 Color': string | null;
  'Team 6': string | null;
  'Team 6 Color': string | null;
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

export interface Archive {
  id?: string;
  player_id: string;
  created_at?: string;
  noise_params: NoiseParams;
  thumbnail_url?: string;
  title?: string;
  description?: string;
}

export interface ColorStop {
  position: number;
  color: string;
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
  colorStops: ColorStop[];
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
  colorStops: [
    { position: 0, color: '#5B4E8E' },
    { position: 0.5, color: '#0A1A3E' },
    { position: 0.7, color: '#7B9FC4' },
    { position: 1.0, color: '#B8614D' },
  ],
};
