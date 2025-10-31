import { createClient } from '@supabase/supabase-js';
import { PlayerRow, NoiseParams } from '../lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Player 데이터를 기반으로 NoiseParams 생성
function generateNoiseParamsFromPlayer(player: PlayerRow): NoiseParams {
  const colorStops = [];
  let totalPercentage = 0;

  // Team 1-6까지 색상 수집
  for (let i = 1; i <= 6; i++) {
    const teamColor = player[`Team ${i} Color` as keyof PlayerRow] as string | null;

    if (teamColor) {
      // 색상과 퍼센티지 파싱: "#F62C8A(21.4%)"
      const colorMatch = teamColor.match(/(#[0-9A-Fa-f]{6})\(([0-9.]+)%\)/);

      if (colorMatch) {
        const color = colorMatch[1];
        const percentage = parseFloat(colorMatch[2]);

        colorStops.push({
          position: totalPercentage / 100,
          color: color,
        });

        totalPercentage += percentage;
      }
    }
  }

  // 마지막 color stop의 position을 1.0으로 설정
  if (colorStops.length > 0) {
    colorStops[colorStops.length - 1].position = 1.0;
  }

  return {
    amplitude: 2.0,
    saturation: 1.0,
    layers: 4,
    lacunarity: 2.3,
    gain: 0.65,
    warpStrength: 1.0,
    halftonePattern: 0,
    halftoneScale: 50.0,
    colorStops: colorStops.length > 0 ? colorStops : [
      { position: 0, color: '#5B4E8E' },
      { position: 1.0, color: '#B8614D' },
    ],
  };
}

async function createArchivesForAllPlayers() {
  console.log('Fetching all players...');

  // 모든 선수 데이터 가져오기
  const { data: players, error: fetchError } = await supabase
    .from('Player')
    .select('*')
    .order('id', { ascending: true });

  if (fetchError) {
    console.error('Error fetching players:', fetchError);
    return;
  }

  if (!players || players.length === 0) {
    console.log('No players found');
    return;
  }

  console.log(`Found ${players.length} players`);

  // 각 선수에 대해 Archive 생성
  for (const player of players as PlayerRow[]) {
    const noiseParams = generateNoiseParamsFromPlayer(player);

    const archive = {
      player_id: player.id,
      noise_params: noiseParams,
      title: `${player['Player Name']} - Career Colors`,
      description: `Auto-generated archive for ${player['Player Name']}`,
    };

    console.log(`Creating archive for ${player['Player Name']} (ID: ${player.id})...`);

    const { data, error } = await supabase
      .from('Archive')
      .insert([archive])
      .select();

    if (error) {
      console.error(`Error creating archive for ${player['Player Name']}:`, error);
    } else {
      console.log(`✓ Created archive for ${player['Player Name']}`);
    }
  }

  console.log('Finished creating archives!');
}

createArchivesForAllPlayers();
