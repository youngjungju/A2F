'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { DEFAULT_NOISE_PARAMS, NoiseParams } from '@/lib/types';
import { getPlayerById } from '@/lib/playerData';
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
  const [noiseParams] = useState<NoiseParams>(DEFAULT_NOISE_PARAMS);

  useEffect(() => {
    // localStorage에서 마지막으로 본 player ID 가져오기
    const lastPlayerId = localStorage.getItem('lastViewedPlayer');
    if (lastPlayerId) {
      setPlayerId(lastPlayerId);
    } else {
      // 기본값으로 park-jisung 설정
      setPlayerId('park-jisung');
      localStorage.setItem('lastViewedPlayer', 'park-jisung');
    }
  }, []);

  if (!playerId) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  const player = getPlayerById(playerId);

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
                        <div
                          key={i}
                          className="rounded-full"
                          style={{
                            width: spacing[32],
                            height: spacing[32],
                            backgroundColor: color,
                            border: `2px solid ${colors.dark.fill.tertiary}`,
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
                      {club.years} {club.years > 1 ? 'years' : 'year'} • {club.percentage}% of career
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
              }}
            >
              마우스로 드래그하여 회전, 스크롤로 확대/축소할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
