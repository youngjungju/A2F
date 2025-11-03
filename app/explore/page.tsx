'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { DEFAULT_NOISE_PARAMS, NoiseParams, PlayerData } from '@/lib/types';
import { getPlayerById, getPlayerByIdFromSupabase, testSupabaseConnection, getAllPlayersFromSupabase } from '@/lib/playerData';
import { spacing, typography, colors, interaction } from '@/lib/designTokens';
import Navigation from '@/components/Navigation';

const UniformRenderer = dynamic(() => import('@/components/UniformRenderer'), {
  ssr: false,
  loading: () => null,
});

export default function ExplorePage() {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [noiseParams, setNoiseParams] = useState<NoiseParams>(DEFAULT_NOISE_PARAMS);
  const [isLoading, setIsLoading] = useState(true);
  const [showAbout, setShowAbout] = useState(false);
  const [allPlayers, setAllPlayers] = useState<PlayerData[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState<number>(0);

  useEffect(() => {
    const loadPlayer = async () => {
      setIsLoading(true);

      // Supabase 연결 테스트
      await testSupabaseConnection();

      // 전체 선수 목록 가져오기
      const players = await getAllPlayersFromSupabase();
      setAllPlayers(players);

      // localStorage에서 마지막으로 본 player ID 가져오기
      let lastPlayerId = localStorage.getItem('lastViewedPlayer');

      // 유효하지 않은 값이면 기본값으로 설정
      const parsedId = lastPlayerId ? parseInt(lastPlayerId, 10) : NaN;
      if (!lastPlayerId || isNaN(parsedId) || parsedId < 1) {
        console.log('Invalid or missing player ID, using default (1)');
        lastPlayerId = '1'; // 기본값: 박지성
        localStorage.setItem('lastViewedPlayer', lastPlayerId);
      }

      console.log('Loading player with ID:', lastPlayerId);
      setPlayerId(lastPlayerId);

      // 현재 선수의 인덱스 찾기
      const playerIndex = players.findIndex(p => p.id === lastPlayerId);
      if (playerIndex !== -1) {
        setCurrentPlayerIndex(playerIndex);
      }

      // Supabase에서 데이터 가져오기 시도
      const supabasePlayer = await getPlayerByIdFromSupabase(parseInt(lastPlayerId, 10));

      if (supabasePlayer) {
        setPlayer(supabasePlayer);
        localStorage.setItem('lastViewedPlayer', lastPlayerId);

        // 클럽 색상들로 노이즈 파라미터 생성
        if (supabasePlayer.clubs.length > 0) {
          const colorStops = supabasePlayer.clubs.map((club, index) => {
            const totalClubs = supabasePlayer.clubs.length;
            return {
              position: index / (totalClubs - 1 || 1),
              color: club.colors[0] || '#FFFFFF',
            };
          });

          setNoiseParams({
            ...DEFAULT_NOISE_PARAMS,
            colorStops,
          });
        }
      } else {
        // Fallback to local data
        const localPlayer = getPlayerById(lastPlayerId);
        if (localPlayer) {
          setPlayer(localPlayer);
        } else {
          // 최후의 수단: ID 1로 다시 시도
          const fallbackPlayer = await getPlayerByIdFromSupabase(1);
          setPlayer(fallbackPlayer);
        }
      }

      setIsLoading(false);
    };

    loadPlayer();
  }, []);

  if (isLoading || !playerId) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Player Not Found</h1>
        </div>
      </div>
    );
  }

  // 이전 선수로 이동
  const handlePrevPlayer = async () => {
    if (allPlayers.length === 0) return;

    const newIndex = currentPlayerIndex > 0 ? currentPlayerIndex - 1 : allPlayers.length - 1;
    const newPlayer = allPlayers[newIndex];

    setCurrentPlayerIndex(newIndex);
    await loadPlayerById(newPlayer.id);
  };

  // 다음 선수로 이동
  const handleNextPlayer = async () => {
    if (allPlayers.length === 0) return;

    const newIndex = currentPlayerIndex < allPlayers.length - 1 ? currentPlayerIndex + 1 : 0;
    const newPlayer = allPlayers[newIndex];

    setCurrentPlayerIndex(newIndex);
    await loadPlayerById(newPlayer.id);
  };

  // 선수 ID로 선수 데이터 로드
  const loadPlayerById = async (id: string) => {
    setIsLoading(true);
    const supabasePlayer = await getPlayerByIdFromSupabase(parseInt(id, 10));

    if (supabasePlayer) {
      setPlayer(supabasePlayer);
      setPlayerId(id);
      localStorage.setItem('lastViewedPlayer', id);

      // 클럽 색상들로 노이즈 파라미터 생성
      if (supabasePlayer.clubs.length > 0) {
        const colorStops = supabasePlayer.clubs.map((club, index) => {
          const totalClubs = supabasePlayer.clubs.length;
          return {
            position: index / (totalClubs - 1 || 1),
            color: club.colors[0] || '#FFFFFF',
          };
        });

        setNoiseParams({
          ...DEFAULT_NOISE_PARAMS,
          colorStops,
        });
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Navigation Bar */}
      <Navigation />

      {/* About Button - Top Right (Fixed Position) */}
      <div
        className="fixed z-50"
        style={{
          top: spacing[28],
          right: spacing[25],
        }}
      >
        {/* About Button */}
        <div
          style={{
            backgroundColor: 'rgba(28, 28, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '8px',
            padding: '4px',
          }}
        >
          <button
            onClick={() => setShowAbout(!showAbout)}
            style={{
              padding: '6px 10px',
              backgroundColor: showAbout ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
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
              if (!showAbout) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            About
          </button>
        </div>
      </div>

      {/* About Info Box - Below About Button */}
      {showAbout && (
        <div
          className="fixed z-50"
          style={{
            top: 'calc(25px + 40px + 15px)',
            right: spacing[25],
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              padding: '12px',
              maxWidth: '320px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
            }}
          >
            {/* Title */}
            <h3
              style={{
                fontSize: typography.fontSize.title3,
                fontWeight: typography.fontWeight.bold,
                color: 'rgba(0, 0, 0, 0.9)',
                marginBottom: '11px',
              }}
            >
              A2F: From Archive to Football
            </h3>

            {/* Divider */}
            <div
              style={{
                width: '100%',
                height: '1px',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                marginBottom: '11px',
              }}
            />

            {/* Description */}
            <p
              style={{
                fontSize: typography.fontSize.footnote,
                color: 'rgba(0, 0, 0, 0.7)',
                lineHeight: typography.lineHeight.relaxed,
                marginBottom: spacing[20],
              }}
            >
              A2F is an archival project that visualizes the career data of Korean football players who have played abroad. Expanding the concept of the football heatmap, it generates unique color patterns by combining each player&apos;s duration of stay with the uniform colors of their clubs, exploring the transformation of statistical data into visual identity.
            </p>

            {/* Contact Info */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                fontSize: typography.fontSize.footnote,
                color: 'rgba(0, 0, 0, 0.7)',
              }}
            >
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ minWidth: '70px', fontWeight: typography.fontWeight.medium }}>
                  Email
                </span>
                <span>johnwkim82@gmail.com</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ minWidth: '70px', fontWeight: typography.fontWeight.medium }}>
                  Instagram
                </span>
                <span>joelkim.82</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Player Info Box - Below Navigation */}
      <div
        className="fixed z-50"
        style={{
          top: 'calc(25px + 40px + 15px)',
          left: spacing[25],
          width: '284px',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '8px',
            padding: '10px',
            minWidth: '284px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2
            style={{
              fontSize: '12px',
              fontWeight: typography.fontWeight.semibold,
              color: '#000000',
              marginBottom: '6px',
            }}
          >
            {player.name}
          </h2>

          {/* Divider */}
          <div
            style={{
              width: '100%',
              height: '1px',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              marginBottom: '6px',
            }}
          />

          <p
            style={{
              fontSize: '10px',
              color: '#000000',
              lineHeight: typography.lineHeight.relaxed,
              fontWeight: typography.fontWeight.regular,
            }}
          >
            {player.clubs.map(club => club.name).join(', ')} 등 총 {player.clubs.length}개 팀에서 {player.clubs.reduce((sum, club) => sum + (club.years || 0), 0)}년간 활동했습니다.
          </p>
        </div>
      </div>

      {/* Career Timeline Box - Below Player Info */}
      <div
        className="fixed z-50"
        style={{
          top: 'calc(25px + 40px + 15px + 90px)',
          left: spacing[25],
          width: '284px',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '8px',
            padding: '10px',
            minWidth: '284px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h3
            style={{
              fontSize: '12px',
              fontWeight: typography.fontWeight.semibold,
              color: '#000000',
              marginBottom: '8px',
            }}
          >
            Career Timeline
          </h3>

          {/* Divider */}
          <div
            style={{
              width: '100%',
              height: '1px',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              marginBottom: '8px',
            }}
          />

          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '50px 1fr 60px',
              gap: '9.95px',
              marginBottom: '6px',
            }}
          >
            <span
              style={{
                fontSize: '9px',
                fontWeight: typography.fontWeight.semibold,
                color: '#000000',
              }}
            >
              Career
            </span>
            <span
              style={{
                fontSize: '9px',
                fontWeight: typography.fontWeight.semibold,
                color: '#000000',
              }}
            >
              Team Name
            </span>
            <span></span>
          </div>

          {/* Career Bars */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9.95px' }}>
            {player.clubs.map((club, index) => (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 1fr 60px',
                  gap: '9.95px',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: '9px',
                    color: '#000000',
                    fontWeight: typography.fontWeight.regular,
                  }}
                >
                  {club.percentage.toFixed(0)} %
                </span>
                <span
                  style={{
                    fontSize: '9px',
                    color: '#000000',
                    fontWeight: typography.fontWeight.regular,
                  }}
                >
                  {club.name} ({club.years}y)
                </span>
                <div
                  style={{
                    width: '100%',
                    height: '16px',
                    backgroundColor: club.colors[0] || '#000000',
                    borderRadius: '3px',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Career Palette Box - Bottom Right */}
      <div
        className="fixed z-50"
        style={{
          bottom: spacing[28],
          right: spacing[25],
          minWidth: '283px',
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '12px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          }}
        >
          <h3
            style={{
              fontSize: typography.fontSize.headline,
              fontWeight: typography.fontWeight.semibold,
              color: 'rgba(0, 0, 0, 0.9)',
              marginBottom: spacing[8],
            }}
          >
            Career Palette
          </h3>
          <p
            style={{
              fontSize: typography.fontSize.footnote,
              color: 'rgba(0, 0, 0, 0.7)',
              lineHeight: typography.lineHeight.relaxed,
            }}
          >
            Each color represents a team from {player.name}&apos;s overseas career.
          </p>
        </div>
      </div>

      {/* Background Player Image */}
      {player.image && (
        <div
          className="absolute inset-0"
          style={{
            zIndex: 1,
          }}
        >
          <Image
            src={player.image}
            alt={player.name}
            fill
            priority
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* 3D Uniform with Transparent Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 10,
        }}
      >
        <UniformRenderer params={noiseParams} autoRotate transparentBackground />
      </div>

      {/* Left Arrow - Previous Player */}
      <button
        onClick={handlePrevPlayer}
        className="fixed z-50"
        style={{
          left: spacing[25],
          top: '50%',
          transform: 'translateY(-50%)',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: `all ${interaction.duration.normal} ${interaction.easing.standard}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15 18L9 12L15 6"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Right Arrow - Next Player */}
      <button
        onClick={handleNextPlayer}
        className="fixed z-50"
        style={{
          right: spacing[25],
          top: '50%',
          transform: 'translateY(-50%)',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: `all ${interaction.duration.normal} ${interaction.easing.standard}`,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M9 18L15 12L9 6"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </div>
  );
}
