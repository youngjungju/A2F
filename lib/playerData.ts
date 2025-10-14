import { PlayerData } from './types';

export const PARK_JISUNG: PlayerData = {
  id: 'park-jisung',
  name: 'Park Ji-sung',
  nameKo: '박지성',
  position: 'Midfielder',
  birthYear: 1981,
  clubs: [
    {
      name: 'Myongji University',
      colors: ['#000080'], // Navy
      years: 2,
      percentage: 9,
    },
    {
      name: 'Kyoto Purple Sanga',
      colors: ['#6B2F8E'], // Purple
      years: 3,
      percentage: 15,
    },
    {
      name: 'PSV Eindhoven',
      colors: ['#ED1C24', '#FFFFFF'], // Red & White
      years: 3,
      percentage: 12,
    },
    {
      name: 'Manchester United',
      colors: ['#DA291C', '#FBE122'], // Red & Gold
      years: 7,
      percentage: 45,
    },
    {
      name: 'Queens Park Rangers',
      colors: ['#1D5BA4', '#FFFFFF'], // Blue & White
      years: 1,
      percentage: 19,
    },
  ],
  careerTimeline: [2000, 2003, 2005, 2012, 2014],
};

export const SAMPLE_PLAYERS: PlayerData[] = [PARK_JISUNG];

export function getPlayerById(id: string): PlayerData | undefined {
  return SAMPLE_PLAYERS.find((player) => player.id === id);
}
