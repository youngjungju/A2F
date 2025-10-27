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
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

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

      {/* About Button - Top Right */}
      <div
        className="absolute z-50"
        style={{
          top: spacing[24],
          right: spacing[24],
          backgroundColor: 'rgba(28, 28, 30, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '8px',
          padding: '4px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        }}
      >
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '6px 10px',
            backgroundColor: 'transparent',
            borderRadius: '6px',
            color: colors.dark.label.primary,
            fontSize: '11px',
            fontWeight: typography.fontWeight.semibold,
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
            padding: spacing[24],
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
                  marginBottom: spacing[24],
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
