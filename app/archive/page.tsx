'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { PlayerData } from '@/lib/types';
import { getAllPlayersFromSupabase } from '@/lib/playerData';
import { spacing, typography, colors, interaction } from '@/lib/designTokens';

export default function ArchivePage() {
  const router = useRouter();
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<PlayerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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
  const positionOrder = ['FW', 'ST', 'CF', 'LW', 'RW', 'SS', 'AM', 'MF', 'CM', 'DM', 'LM', 'RM', 'DF', 'CB', 'LB', 'RB', 'WB', 'GK'];
  const sortedPositions = uniquePositions.sort((a, b) => {
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

  const positions = ['All Position', ...sortedPositions];

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
          top: `calc(${spacing[25]} + 40px + 15px)`, // Navigation top + Navigation height + 15px gap
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
            padding: `${spacing[12]} ${spacing[16]}`,
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
            padding: `${spacing[12]} ${spacing[16]}`,
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
          paddingTop: `calc(${spacing[25]} + 40px + 15px)`, // About button top + height + 15px gap
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
            gap: spacing[32],
            paddingBottom: spacing[48],
          }}
        >
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              onClick={() => handlePlayerClick(player)}
              className="cursor-pointer transition-all hover:opacity-80"
              style={{
                minWidth: '210.96px', // 80% of 263.7px
              }}
            >
              {/* Player Image */}
              <div
                style={{
                  width: '100%',
                  height: '295.34px', // 80% of 369.18px
                  borderRadius: '12px',
                  overflow: 'hidden',
                  marginBottom: spacing[12],
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

      {/* About Button - Top Right */}
      <div
        className="fixed z-50"
        style={{
          top: spacing[28],
          right: spacing[25],
          backgroundColor: 'rgba(28, 28, 30, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '8px',
          padding: '4px',
        }}
      >
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '6px 10px',
            backgroundColor: 'transparent',
            borderRadius: '6px',
            color: colors.dark.label.primary,
            fontSize: '16px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 400,
            border: 'none',
            transition: `all ${interaction.duration.normal} ${interaction.easing.standard}`,
            cursor: 'pointer',
            minHeight: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '89.34px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          About
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(20px)',
            padding: spacing[25],
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            className="relative"
            style={{
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button - Outside the box */}
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: 'absolute',
                top: `-${spacing[32]}`,
                right: `-${spacing[32]}`,
                width: spacing[32],
                height: spacing[32],
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: typography.fontSize.headline,
                color: 'rgba(0, 0, 0, 0.5)',
                transition: `all ${interaction.duration.normal} ${interaction.easing.standard}`,
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 10,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)';
                e.currentTarget.style.color = 'rgba(0, 0, 0, 0.8)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                e.currentTarget.style.color = 'rgba(0, 0, 0, 0.5)';
              }}
            >
              ×
            </button>

            {/* Modal Content Box */}
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(40px)',
                borderRadius: '32px',
                padding: `${spacing[40]} ${spacing[32]}`,
                maxWidth: '480px',
                width: '100%',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
              }}
            >

              {/* Logo */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: spacing[25],
                }}
              >
                <Image
                  src="/assets/images/logo_white.svg"
                  alt="ArchiveAtlas Logo"
                  width={84}
                  height={28}
                  style={{
                    height: '28px',
                    filter: 'invert(1)',
                  }}
                />
              </div>

              {/* Content */}
              <div
                style={{
                  color: 'rgba(0, 0, 0, 0.85)',
                  lineHeight: typography.lineHeight.relaxed,
                }}
              >
                <p
                  style={{
                    fontSize: typography.fontSize.subheadline,
                    marginBottom: spacing[20],
                    fontWeight: typography.fontWeight.regular,
                  }}
                >
                  ArchiveAtlas is a graduation project that visually documents the overseas careers of Korean footballers. It takes a narrative approach to data and reconstructs it into an interactive atlas to trace patterns of movement and adaptation.
                </p>

                <p
                  style={{
                    fontSize: typography.fontSize.subheadline,
                    marginBottom: spacing[32],
                    fontWeight: typography.fontWeight.regular,
                  }}
                >
                  For a full introduction to the project, click the Home button below.
                </p>

                {/* Home Button */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Link
                    href="/about"
                    onClick={() => setShowModal(false)}
                    style={{
                      padding: `${spacing[12]} ${spacing[40]}`,
                      backgroundColor: '#60A5FA',
                      color: '#000000',
                      fontSize: typography.fontSize.body,
                      fontWeight: typography.fontWeight.semibold,
                      borderRadius: interaction.borderRadius.medium,
                      textDecoration: 'none',
                      transition: `all ${interaction.duration.normal} ${interaction.easing.standard}`,
                      minHeight: interaction.minTouchTarget,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#3B82F6';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#60A5FA';
                    }}
                  >
                    Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
