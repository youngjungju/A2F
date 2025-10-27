'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { DEFAULT_NOISE_PARAMS, NoiseParams, PlayerData } from '@/lib/types';
import { getPlayerById, getPlayerByIdFromSupabase, createArchive, testSupabaseConnection } from '@/lib/playerData';
import { spacing, typography, colors, interaction } from '@/lib/designTokens';

const UniformRenderer = dynamic(() => import('@/components/UniformRenderer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <p className="text-white">Loading 3D uniform...</p>
    </div>
  ),
});

export default function ExplorePage() {
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [player, setPlayer] = useState<PlayerData | null>(null);
  const [noiseParams, setNoiseParams] = useState<NoiseParams>(DEFAULT_NOISE_PARAMS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleColorChange = (newColor: string) => {
    setNoiseParams({
      ...noiseParams,
      colorStops: [
        { position: 0, color: newColor },
        { position: 0.33, color: newColor },
        { position: 0.66, color: newColor },
        { position: 1.0, color: newColor },
      ],
    });
  };

  const handleSaveArchive = async () => {
    if (!playerId || !player) return;

    setIsSaving(true);
    try {
      const archive = await createArchive({
        player_id: playerId,
        noise_params: noiseParams,
        title: `${player.name} - Archive`,
        description: 'Generated from explore page',
      });

      if (archive) {
        alert('Archive saved successfully!');
      } else {
        alert('Failed to save archive');
      }
    } catch (error) {
      console.error('Error saving archive:', error);
      alert('Error saving archive');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const loadPlayer = async () => {
      setIsLoading(true);

      // Supabase 연결 테스트
      await testSupabaseConnection();

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
          const fallbackPlayer = await getPlayerByIdFromSupabase('1');
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

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Main Content */}
      <div className="flex h-full">
        {/* Left Side: Player Info */}
        <div
          className="w-1/3 overflow-y-auto text-white"
          style={{
            padding: spacing[48],
          }}
        >
          <div className="max-w-md">
            <h1
              style={{
                fontSize: typography.fontSize.displayLarge,
                fontWeight: typography.fontWeight.bold,
                marginBottom: spacing[8],
                color: colors.dark.label.primary,
              }}
            >
              {player.name}
            </h1>
            <h2
              style={{
                fontSize: typography.fontSize.title1,
                fontWeight: typography.fontWeight.regular,
                color: colors.dark.label.secondary,
                marginBottom: spacing[32],
              }}
            >
              {player.nameKo}
            </h2>

            {player.position && (
              <p
                style={{
                  fontSize: typography.fontSize.headline,
                  color: colors.dark.label.secondary,
                  marginBottom: spacing[8],
                }}
              >
                Position: {player.position}
              </p>
            )}
            {player.birthYear && (
              <p
                style={{
                  fontSize: typography.fontSize.headline,
                  color: colors.dark.label.secondary,
                  marginBottom: spacing[32],
                }}
              >
                Born: {player.birthYear}
              </p>
            )}

            {/* Career Timeline */}
            <div
              style={{
                marginTop: spacing[48],
              }}
            >
              <h3
                style={{
                  fontSize: typography.fontSize.title2,
                  fontWeight: typography.fontWeight.semibold,
                  marginBottom: spacing[24],
                  color: colors.dark.label.primary,
                }}
              >
                Career Timeline
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: spacing[24],
                }}
              >
                {player.clubs.map((club, index) => (
                  <div
                    key={index}
                    style={{
                      borderLeft: `4px solid ${colors.dark.fill.tertiary}`,
                      paddingLeft: spacing[24],
                      paddingTop: spacing[8],
                      paddingBottom: spacing[8],
                    }}
                  >
                    <h4
                      style={{
                        fontSize: typography.fontSize.headline,
                        fontWeight: typography.fontWeight.medium,
                        marginBottom: spacing[8],
                        color: colors.dark.label.primary,
                      }}
                    >
                      {club.name}
                    </h4>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: spacing[12],
                        marginBottom: spacing[8],
                      }}
                    >
                      {club.colors.map((color, i) => (
                        <input
                          key={i}
                          type="color"
                          defaultValue={color}
                          onChange={(e) => handleColorChange(e.target.value)}
                          className="rounded-full cursor-pointer transition-transform hover:scale-110"
                          style={{
                            width: spacing[32],
                            height: spacing[32],
                            backgroundColor: color,
                            border: `2px solid ${colors.dark.fill.tertiary}`,
                            padding: 0,
                            appearance: 'none',
                            WebkitAppearance: 'none',
                          }}
                          title={color}
                        />
                      ))}
                    </div>
                    <p
                      style={{
                        fontSize: typography.fontSize.footnote,
                        color: colors.dark.label.tertiary,
                      }}
                    >
                      {club.percentage.toFixed(1)}% of career
                      {club.years > 0 && ` • ${club.years} ${club.years > 1 ? 'years' : 'year'}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Color Mapping Info */}
            <div
              style={{
                marginTop: spacing[48],
                padding: spacing[24],
                backgroundColor: colors.dark.fill.primary,
                borderRadius: interaction.borderRadius.large,
                border: `1px solid ${colors.dark.fill.tertiary}`,
              }}
            >
              <h3
                style={{
                  fontSize: typography.fontSize.headline,
                  fontWeight: typography.fontWeight.semibold,
                  marginBottom: spacing[12],
                  color: colors.dark.label.primary,
                }}
              >
                Visual Identity
              </h3>
              <p
                style={{
                  fontSize: typography.fontSize.footnote,
                  color: colors.dark.label.secondary,
                  lineHeight: typography.lineHeight.relaxed,
                }}
              >
                이 선수의 유니폼에 적용된 노이즈 그라디언트는 클럽 경력의 색상과 비율을 기반으로
                생성되었습니다. 각 클럽의 대표 색상이 재직 기간에 따라 혼합되어 독특한 시각적
                패턴을 만들어냅니다.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: 3D Uniform Visualization */}
        <div className="flex-1 relative">
          <UniformRenderer params={noiseParams} autoRotate />

          {/* Overlay Info */}
          <div
            className="absolute text-white max-w-md"
            style={{
              bottom: spacing[32],
              right: spacing[32],
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              borderRadius: interaction.borderRadius.large,
              padding: spacing[24],
            }}
          >
            <h3
              style={{
                fontSize: typography.fontSize.headline,
                fontWeight: typography.fontWeight.semibold,
                marginBottom: spacing[8],
                color: colors.dark.label.primary,
              }}
            >
              3D Uniform Preview
            </h3>
            <p
              style={{
                fontSize: typography.fontSize.footnote,
                color: colors.dark.label.secondary,
                marginBottom: spacing[16],
              }}
            >
              마우스로 드래그하여 회전, 스크롤로 확대/축소할 수 있습니다.
            </p>
            <button
              onClick={handleSaveArchive}
              disabled={isSaving}
              className="w-full transition-all hover:opacity-80 disabled:opacity-50"
              style={{
                backgroundColor: colors.dark.fill.tertiary,
                color: colors.dark.label.primary,
                padding: `${spacing[12]}px ${spacing[24]}px`,
                borderRadius: interaction.borderRadius.medium,
                fontSize: typography.fontSize.body,
                fontWeight: typography.fontWeight.semibold,
                border: 'none',
                cursor: isSaving ? 'not-allowed' : 'pointer',
              }}
            >
              {isSaving ? 'Saving...' : 'Save to Archive'}
            </button>
          </div>
        </div>
      </div>

      {/* About Button - Top Right */}
      <div
        className="fixed z-50"
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
