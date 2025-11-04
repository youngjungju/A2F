export interface Club {
  name: string;
  colors: string[];
  years: number;
  percentage: number;
}

// Supabase Players 테이블 구조
export interface PlayerRow {
  id: number;
  'Player Name': string | null;
  'Total Years': number | null;
  'Description': string | null;
  'Position': string | null;
  'Image': string | null;
  'Teams/0/Team': string | null;
  'Teams/0/Percentage': string | null;
  'Teams/0/Years': number | null;
  'Teams/0/Color': string | null;
  'Teams/1/Team': string | null;
  'Teams/1/Percentage': string | null;
  'Teams/1/Years': number | null;
  'Teams/1/Color': string | null;
  'Teams/2/Team': string | null;
  'Teams/2/Percentage': string | null;
  'Teams/2/Years': number | null;
  'Teams/2/Color': string | null;
  'Teams/3/Team': string | null;
  'Teams/3/Percentage': string | null;
  'Teams/3/Years': number | null;
  'Teams/3/Color': string | null;
  'Teams/4/Team': string | null;
  'Teams/4/Percentage': string | null;
  'Teams/4/Years': string | null;
  'Teams/4/Color': string | null;
  'Teams/5/Team': string | null;
  'Teams/5/Percentage': string | null;
  'Teams/5/Years': string | null;
  'Teams/5/Color': string | null;
  'Teams/6/Team': string | null;
  'Teams/6/Percentage': string | null;
  'Teams/6/Years': string | null;
  'Teams/6/Color': string | null;
  'Teams/7/Team': string | null;
  'Teams/7/Percentage': string | null;
  'Teams/7/Years': string | null;
  'Teams/7/Color': string | null;
  'Teams/8/Team': string | null;
  'Teams/8/Percentage': string | null;
  'Teams/8/Years': string | null;
  'Teams/8/Color': string | null;
  // Heatmap Control parameters
  'Saturation': number | null;
  'Amplitude': number | null;
  'Lacunarity': number | null;
  'Grain': number | null;
  'Warp Strength': number | null;
}

export interface PlayerData {
  id: string;
  name: string;
  nameKo: string;
  clubs: Club[];
  careerTimeline: number[];
  position?: string;
  birthYear?: number;
  image?: string;
  description?: string;
  // Heatmap Control parameters (for custom uniforms)
  saturation?: number | null;
  amplitude?: number | null;
  lacunarity?: number | null;
  grain?: number | null;
  warpStrength?: number | null;
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
  amplitude: 2.0,
  saturation: 1.0,
  layers: 4,
  lacunarity: 2.3,
  gain: 0.65,
  warpStrength: 1.0,
  halftonePattern: 0,
  halftoneScale: 50.0,
  colorStops: [
    { position: 0.25, color: '#00459E' },   // 25% (0 -> 0.25)
    { position: 0.50, color: '#E11F09' },   // 25% (0.25 -> 0.50)
    { position: 0.75, color: '#1F1358' },   // 25% (0.50 -> 0.75)
    { position: 1.00, color: '#000000' },   // 25% (0.75 -> 1.00)
  ],
};
