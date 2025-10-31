import { createClient } from '@supabase/supabase-js';
import { PlayerRow, NoiseParams } from '../lib/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Player 데이터를 기반으로 NoiseParams 생성 (새로운 Players 테이블 구조 반영)
function generateNoiseParamsFromPlayer(player: PlayerRow): NoiseParams {
  const colorStops = [];
  let totalPercentage = 0;

  // Teams/0 부터 Teams/8까지 색상 수집
  for (let i = 0; i <= 8; i++) {
    const teamColor = player[`Teams/${i}/Color` as keyof PlayerRow] as string | null;
    const teamPercentage = player[`Teams/${i}/Percentage` as keyof PlayerRow] as string | null;

    if (teamColor && teamPercentage) {
      const percentage = parseFloat(teamPercentage);

      colorStops.push({
        position: totalPercentage / 100,
        color: teamColor,
      });

      totalPercentage += percentage;
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

async function updateExistingArchives() {
  console.log('Fetching all players from Players table...');

  // 모든 선수 데이터 가져오기 (새로운 Players 테이블)
  const { data: players, error: fetchError } = await supabase
    .from('Players')
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

  // 각 선수에 대해 Archive 업데이트
  for (const player of players as PlayerRow[]) {
    const noiseParams = generateNoiseParamsFromPlayer(player);

    console.log(`Updating archives for ${player['Player Name']} (ID: ${player.id})...`);

    // 해당 선수의 모든 Archive 찾기
    const { data: archives, error: findError } = await supabase
      .from('Archive')
      .select('id')
      .eq('player_id', player.id);

    if (findError) {
      console.error(`Error finding archives for ${player['Player Name']}:`, findError);
      continue;
    }

    if (!archives || archives.length === 0) {
      console.log(`  ⚠ No archives found for ${player['Player Name']}`);
      continue;
    }

    // 각 Archive의 noise_params 업데이트
    for (const archive of archives) {
      const { error: updateError } = await supabase
        .from('Archive')
        .update({ noise_params: noiseParams })
        .eq('id', archive.id);

      if (updateError) {
        console.error(`  ✗ Error updating archive ${archive.id}:`, updateError);
      } else {
        console.log(`  ✓ Updated archive ${archive.id}`);
      }
    }
  }

  console.log('Finished updating archives!');
}

updateExistingArchives();
