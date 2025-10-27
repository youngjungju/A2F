import { PlayerData, Archive, PlayerRow, Club } from './types';
import { supabase } from './supabase';

// Supabase PlayerRow를 PlayerData로 변환하는 함수
function convertPlayerRowToPlayerData(row: PlayerRow): PlayerData {
  const clubs: Club[] = [];

  // Team 1-6까지 순회하면서 clubs 배열 생성
  for (let i = 1; i <= 6; i++) {
    const teamName = row[`Team ${i}` as keyof PlayerRow] as string | null;
    const teamColor = row[`Team ${i} Color` as keyof PlayerRow] as string | null;

    if (teamName && teamColor) {
      // 색상과 퍼센티지 파싱
      // 예: "#F62C8A(21.4%)" -> color: "#F62C8A", percentage: 21.4
      const colorMatch = teamColor.match(/(#[0-9A-Fa-f]{6})\(([0-9.]+)%\)/);

      if (colorMatch) {
        const color = colorMatch[1];
        const percentage = parseFloat(colorMatch[2]);

        clubs.push({
          name: teamName,
          colors: [color],
          years: 0, // 년수는 계산하거나 기본값 사용
          percentage: percentage,
        });
      }
    }
  }

  return {
    id: row.id.toString(),
    name: row['Player Name'] || 'Unknown Player',
    nameKo: row['Player Name'] || 'Unknown Player',
    clubs: clubs,
    careerTimeline: [], // 필요시 계산
    position: undefined,
    birthYear: undefined,
  };
}

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

// Test Supabase connection
export async function testSupabaseConnection(): Promise<void> {
  console.log('Testing Supabase connection...');
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  try {
    const { data, error, count } = await supabase
      .from('Player')
      .select('*', { count: 'exact' })
      .limit(1);

    console.log('Test query result:', { data, error, count });
  } catch (err) {
    console.error('Test connection error:', err);
  }
}

// Fallback to local data if Supabase fetch fails
export function getPlayerById(id: string): PlayerData | undefined {
  return SAMPLE_PLAYERS.find((player) => player.id === id);
}

// Fetch player data from Supabase
export async function getPlayerByIdFromSupabase(
  id: string | number
): Promise<PlayerData | null> {
  try {
    const numericId = typeof id === 'number' ? id : parseInt(id, 10);

    // NaN 체크
    if (isNaN(numericId)) {
      console.error('Invalid player ID:', id);
      return null;
    }

    console.log('Fetching player with ID:', numericId);

    const { data, error } = await supabase
      .from('Player')
      .select('*')
      .eq('id', numericId)
      .single();

    console.log('Supabase response:', { data, error });

    if (error) {
      console.error('Error fetching player from Supabase:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return null;
    }

    if (!data) {
      console.log('No data returned from Supabase');
      return null;
    }

    const playerData = convertPlayerRowToPlayerData(data as PlayerRow);
    console.log('Converted player data:', playerData);
    return playerData;
  } catch (err) {
    console.error('Error in getPlayerByIdFromSupabase:', err);
    return null;
  }
}

// Fetch all players from Supabase
export async function getAllPlayersFromSupabase(): Promise<PlayerData[]> {
  try {
    const { data, error } = await supabase
      .from('Player')
      .select('*')
      .order('Player Name', { ascending: true });

    if (error) {
      console.error('Error fetching players from Supabase:', error);
      return SAMPLE_PLAYERS;
    }

    if (!data) return SAMPLE_PLAYERS;

    return data.map((row) => convertPlayerRowToPlayerData(row as PlayerRow));
  } catch (err) {
    console.error('Error in getAllPlayersFromSupabase:', err);
    return SAMPLE_PLAYERS;
  }
}

// Create a new archive entry
export async function createArchive(
  archive: Omit<Archive, 'id' | 'created_at'>
): Promise<Archive | null> {
  try {
    const { data, error } = await supabase
      .from('Archive')
      .insert([archive])
      .select()
      .single();

    if (error) {
      console.error('Error creating archive:', error);
      return null;
    }

    return data as Archive;
  } catch (err) {
    console.error('Error in createArchive:', err);
    return null;
  }
}

// Fetch archives for a specific player
export async function getArchivesByPlayerId(
  playerId: string
): Promise<Archive[]> {
  try {
    const { data, error } = await supabase
      .from('Archive')
      .select('*')
      .eq('player_id', playerId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching archives:', error);
      return [];
    }

    return (data as Archive[]) || [];
  } catch (err) {
    console.error('Error in getArchivesByPlayerId:', err);
    return [];
  }
}

// Fetch all archives
export async function getAllArchives(): Promise<Archive[]> {
  try {
    const { data, error } = await supabase
      .from('Archive')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all archives:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return [];
    }

    console.log('Fetched archives:', data?.length || 0);
    return (data as Archive[]) || [];
  } catch (err) {
    console.error('Error in getAllArchives:', err);
    return [];
  }
}

// Delete an archive
export async function deleteArchive(archiveId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('Archive')
      .delete()
      .eq('id', archiveId);

    if (error) {
      console.error('Error deleting archive:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in deleteArchive:', err);
    return false;
  }
}
