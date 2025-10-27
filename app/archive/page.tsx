'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlayerData } from '@/lib/types';
import { getAllPlayersFromSupabase } from '@/lib/playerData';
import { spacing, typography, colors, interaction } from '@/lib/designTokens';

export default function ArchivePage() {
  const router = useRouter();
  const [players, setPlayers] = useState<PlayerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPlayers = async () => {
      setIsLoading(true);
      const data = await getAllPlayersFromSupabase();
      setPlayers(data);
      setIsLoading(false);
    };

    loadPlayers();
  }, []);

  const handlePlayerClick = (player: PlayerData) => {
    // Player ID를 localStorage에 저장하고 explore 페이지로 이동
    localStorage.setItem('lastViewedPlayer', player.id);
    router.push('/explore');
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Loading Players...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen min-h-screen bg-black text-white">
      <div
        style={{
          padding: spacing[48],
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: spacing[48],
          }}
        >
          <h1
            style={{
              fontSize: typography.fontSize.displayLarge,
              fontWeight: typography.fontWeight.bold,
              marginBottom: spacing[16],
              color: colors.dark.label.primary,
            }}
          >
            Archive
          </h1>
          <p
            style={{
              fontSize: typography.fontSize.title2,
              color: colors.dark.label.secondary,
            }}
          >
            {players.length} player uniforms
          </p>
        </div>

        {/* Player Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: spacing[24],
          }}
        >
          {players.map((player) => (
            <div
              key={player.id}
              onClick={() => handlePlayerClick(player)}
              className="cursor-pointer transition-all hover:scale-105"
              style={{
                backgroundColor: colors.dark.fill.primary,
                borderRadius: interaction.borderRadius.large,
                padding: spacing[24],
                border: `1px solid ${colors.dark.fill.tertiary}`,
              }}
            >
              {/* Color Preview */}
              <div
                style={{
                  height: '160px',
                  borderRadius: interaction.borderRadius.medium,
                  marginBottom: spacing[16],
                  background:
                    player.clubs.length > 0
                      ? `linear-gradient(135deg, ${player.clubs
                          .map((club) => club.colors[0])
                          .join(', ')})`
                      : colors.dark.fill.secondary,
                }}
              />

              {/* Title */}
              <h3
                style={{
                  fontSize: typography.fontSize.headline,
                  fontWeight: typography.fontWeight.semibold,
                  marginBottom: spacing[8],
                  color: colors.dark.label.primary,
                }}
              >
                {player.name}
              </h3>

              {/* Korean Name */}
              <p
                style={{
                  fontSize: typography.fontSize.body,
                  color: colors.dark.label.secondary,
                  marginBottom: spacing[12],
                }}
              >
                {player.nameKo}
              </p>

              {/* Clubs Info */}
              <p
                style={{
                  fontSize: typography.fontSize.footnote,
                  color: colors.dark.label.tertiary,
                  marginBottom: spacing[16],
                }}
              >
                {player.clubs.length} clubs
              </p>

              {/* Color Stops */}
              <div
                style={{
                  display: 'flex',
                  gap: spacing[8],
                  flexWrap: 'wrap',
                }}
              >
                {player.clubs.map((club, index) => (
                  <div
                    key={index}
                    style={{
                      width: spacing[24],
                      height: spacing[24],
                      borderRadius: '50%',
                      backgroundColor: club.colors[0],
                      border: `2px solid ${colors.dark.fill.tertiary}`,
                    }}
                    title={`${club.name} - ${club.percentage.toFixed(1)}%`}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {players.length === 0 && (
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
                color: colors.dark.label.secondary,
              }}
            >
              No players found
            </h2>
            <p
              style={{
                fontSize: typography.fontSize.body,
                color: colors.dark.label.tertiary,
              }}
            >
              Please check your database connection
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
