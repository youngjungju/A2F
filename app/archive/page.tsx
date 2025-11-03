'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PlayerData } from '@/lib/types';
import { getAllPlayersFromSupabase } from '@/lib/playerData';
import { spacing, typography } from '@/lib/designTokens';
import AboutButton from '@/components/AboutButton';

export default function ArchivePage() {
  const router = useRouter();
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPosition, setSelectedPosition] = useState('All Position');

  useEffect(() => {
    const loadPlayers = async () => {
      setIsLoading(true);
      const data = await getAllPlayersFromSupabase();
      setPlayers(data);
      setFilteredPlayers(data);
      setIsLoading(false);
    };

    loadPlayers();
  }, []);

  useEffect(() => {
    let filtered = players;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (player) =>
          player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          player.nameKo.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by position
    if (selectedPosition !== 'All Position') {
      filtered = filtered.filter((player) => {
        if (!player.position) return false;
        // Split by comma and check if any position matches
        const playerPositions = player.position.split(',').map(p => p.trim());
        return playerPositions.includes(selectedPosition);
      });
    }

    setFilteredPlayers(filtered);
  }, [searchQuery, selectedPosition, players]);

  const handlePlayerClick = (player: PlayerData) => {
    localStorage.setItem('lastViewedPlayer', player.id);
    router.push('/explore');
  };

  // Get unique positions from players (split by comma and remove duplicates)
  const uniquePositions = Array.from(new Set(
    players.flatMap((p) => {
      if (!p.position) return [];
      return p.position.split(',').map(pos => pos.trim());
    })
  ));

  // Sort positions by category: 공격 -> 미드필더 -> 수비 -> 골키퍼
  const positionOrder = ['FW', 'ST', 'CF', 'LW', 'RW', 'SS', 'AM', 'CAM', 'MF', 'CM', 'DM', 'CDM', 'LM', 'RM', 'DF', 'CB', 'LB', 'RB', 'WB', 'GK'];
  const sortedPositions = uniquePositions
    .filter(pos => pos !== 'Custom') // Exclude 'Custom' from sorting
    .sort((a, b) => {
      const indexA = positionOrder.indexOf(a);
      const indexB = positionOrder.indexOf(b);

      // If both positions are in the order list, sort by their index
      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB;
      }
      // If only one is in the list, prioritize it
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      // Otherwise, sort alphabetically
      return a.localeCompare(b);
    });

  // Add 'Custom' at the end if it exists in the data
  const hasCustom = uniquePositions.includes('Custom');
  const positions = ['All Position', ...sortedPositions, ...(hasCustom ? ['Custom'] : [])];

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-black">Loading Players...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen min-h-screen bg-white">
      {/* Search and Filter Section - Fixed position below Navigation */}
      <div
        className="fixed z-50"
        style={{
          top: 'calc(25px + 40px + 15px)', // Navigation top + Navigation height + 10px gap
          left: spacing[25],
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          minWidth: '284px', // Same as Navigation
        }}
      >
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search players..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            height: '47.49px',
            padding: `0 ${spacing[16]}`,
            backgroundColor: '#E5E5E5',
            border: 'none',
            borderRadius: '8px',
            fontSize: typography.fontSize.body,
            color: '#000000',
            outline: 'none',
          }}
        />

        {/* Position Dropdown */}
        <select
          value={selectedPosition}
          onChange={(e) => setSelectedPosition(e.target.value)}
          style={{
            width: '100%',
            height: '47.49px',
            padding: `0 ${spacing[16]}`,
            backgroundColor: '#E5E5E5',
            border: 'none',
            borderRadius: '8px',
            fontSize: typography.fontSize.body,
            color: '#000000',
            outline: 'none',
            appearance: 'none',
            cursor: 'pointer',
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23000000' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 16px center',
            paddingRight: spacing[40],
          }}
        >
          {positions.map((position) => (
            <option key={position} value={position}>
              {position}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          marginLeft: 'calc(284px + 48px)', // Navigation width + spacing
          marginRight: spacing[25],
          paddingTop: 'calc(25px + 40px + 15px)', // About button top + height + 10px gap
          paddingLeft: spacing[25],
          paddingRight: spacing[25],
          paddingBottom: 0,
        }}
      >

        {/* Player Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            columnGap: '10px',
            rowGap: '40.58px',
            paddingBottom: spacing[48],
          }}
        >
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              onClick={() => handlePlayerClick(player)}
              className="cursor-pointer transition-all hover:opacity-80"
              style={{
                width: '263.7px',
              }}
            >
              {/* Player Image */}
              <div
                style={{
                  width: '100%',
                  height: '369.18px',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: '10px',
                  position: 'relative',
                }}
              >
                <Image
                  src={player.image || '/assets/images/a2f.png'}
                  alt={player.name}
                  fill
                  style={{
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/assets/images/a2f.png';
                  }}
                />
              </div>

              {/* Player Name */}
              <h3
                style={{
                  fontSize: typography.fontSize.body,
                  fontWeight: typography.fontWeight.regular,
                  color: '#000000',
                  marginBottom: spacing[4],
                }}
              >
                {player.name}
              </h3>

              {/* Player Position */}
              <p
                style={{
                  fontSize: typography.fontSize.body,
                  fontWeight: typography.fontWeight.regular,
                  color: '#000000',
                }}
              >
                {player.position || 'Position'}
              </p>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPlayers.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: spacing[48],
            }}
          >
            <h2
              style={{
                fontSize: typography.fontSize.title1,
                fontWeight: typography.fontWeight.semibold,
                marginBottom: spacing[16],
                color: '#000000',
              }}
            >
              No players found
            </h2>
            <p
              style={{
                fontSize: typography.fontSize.body,
                color: '#666666',
              }}
            >
              Try adjusting your search or filter
            </p>
          </div>
        )}
      </div>

      {/* About Button */}
      <AboutButton />
    </div>
  );
}
