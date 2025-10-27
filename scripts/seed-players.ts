import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedPlayers() {
  console.log('Starting to seed players...');

  const player = {
    id: 1,
    'Player Name': 'Park Ji-sung',
    'Team 1': 'Kyoto Purple Sanga',
    'Team 1 Color': '#66C8A(21.4%)',
    'Team 2': 'PSV Eindhoven',
    'Team 2 Color': '#F00000(21.4%)',
    'Team 3': 'Manchester United',
    'Team 3 Color': '#DA020E(50.0%)',
    'Team 4': 'Queens Park Rangers',
    'Team 4 Color': '#1D5BA4(7.2%)',
    'Team 5': null,
    'Team 5 Color': null,
    'Team 6': null,
    'Team 6 Color': null,
  };

  const { data, error } = await supabase
    .from('Player')
    .insert([player])
    .select();

  if (error) {
    console.error('Error inserting player:', error);
  } else {
    console.log('Successfully inserted player:', data);
  }
}

seedPlayers();
