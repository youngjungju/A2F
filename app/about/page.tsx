'use client';

import { useState } from 'react';
import Link from 'next/link';
import NoiseGradientCanvas from '@/components/NoiseGradientCanvas';
import { DEFAULT_NOISE_PARAMS } from '@/lib/types';
import { spacing, typography, colors, interaction } from '@/lib/designTokens';

export default function Home() {
  const [params] = useState(DEFAULT_NOISE_PARAMS);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Background Noise Gradient */}
      <div className="absolute inset-0 z-0">
        <NoiseGradientCanvas params={params} />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white">
        {/* Logo / Title */}
        <div
          className="text-center px-4"
          style={{
            marginBottom: spacing[48],
          }}
        >
          <h1
            style={{
              fontSize: typography.fontSize.displayLarge,
              fontWeight: typography.fontWeight.bold,
              letterSpacing: typography.letterSpacing.tight,
              marginBottom: spacing[16],
              color: colors.dark.label.primary,
            }}
            className="text-7xl md:text-9xl"
          >
            A2F
          </h1>
          <p
            style={{
              fontSize: typography.fontSize.title1,
              fontWeight: typography.fontWeight.regular,
              letterSpacing: typography.letterSpacing.wide,
              color: colors.dark.label.primary,
              opacity: 0.9,
            }}
            className="text-xl md:text-2xl"
          >
            Archive to Football
          </p>
          <p
            style={{
              fontSize: typography.fontSize.headline,
              fontWeight: typography.fontWeight.regular,
              letterSpacing: typography.letterSpacing.wide,
              color: colors.dark.label.secondary,
              marginTop: spacing[8],
            }}
            className="text-lg md:text-xl"
          >
            한국 축구선수들의 해외 커리어 시각화 프로젝트
          </p>
        </div>

        {/* Project Description */}
        <div
          className="max-w-2xl mx-auto text-center"
          style={{
            paddingLeft: spacing[24],
            paddingRight: spacing[24],
            marginBottom: spacing[48],
          }}
        >
          <p
            style={{
              fontSize: typography.fontSize.body,
              lineHeight: typography.lineHeight.relaxed,
              color: colors.dark.label.secondary,
            }}
            className="text-base md:text-lg"
          >
            선수들의 클럽 이력을 노이즈 그라디언트로 재구성하고,
            <br />
            3D 유니폼에 적용하여 데이터를 시각적 아이덴티티로 표현합니다.
          </p>
        </div>

        {/* Navigation Cards */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto"
          style={{
            gap: spacing[24],
            paddingLeft: spacing[24],
            paddingRight: spacing[24],
          }}
        >
          <Link
            href="/player/park-jisung"
            className="group relative overflow-hidden"
            style={{
              backgroundColor: colors.dark.fill.primary,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${colors.dark.fill.tertiary}`,
              borderRadius: interaction.borderRadius.xlarge,
              padding: spacing[32],
              transition: `all ${interaction.duration.slow} ${interaction.easing.standard}`,
              textDecoration: 'none',
              color: colors.dark.label.primary,
            }}
          >
            <div className="relative z-10">
              <h3
                style={{
                  fontSize: typography.fontSize.title2,
                  fontWeight: typography.fontWeight.semibold,
                  marginBottom: spacing[8],
                }}
              >
                Player Profile
              </h3>
              <p
                style={{
                  fontSize: typography.fontSize.footnote,
                  color: colors.dark.label.secondary,
                }}
              >
                선수별 커리어 시각화
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link
            href="/studio"
            className="group relative overflow-hidden"
            style={{
              backgroundColor: colors.dark.fill.primary,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${colors.dark.fill.tertiary}`,
              borderRadius: interaction.borderRadius.xlarge,
              padding: spacing[32],
              transition: `all ${interaction.duration.slow} ${interaction.easing.standard}`,
              textDecoration: 'none',
              color: colors.dark.label.primary,
            }}
          >
            <div className="relative z-10">
              <h3
                style={{
                  fontSize: typography.fontSize.title2,
                  fontWeight: typography.fontWeight.semibold,
                  marginBottom: spacing[8],
                }}
              >
                Interactive Studio
              </h3>
              <p
                style={{
                  fontSize: typography.fontSize.footnote,
                  color: colors.dark.label.secondary,
                }}
              >
                실시간 그라디언트 편집
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>

          <Link
            href="/gallery"
            className="group relative overflow-hidden"
            style={{
              backgroundColor: colors.dark.fill.primary,
              backdropFilter: 'blur(10px)',
              border: `1px solid ${colors.dark.fill.tertiary}`,
              borderRadius: interaction.borderRadius.xlarge,
              padding: spacing[32],
              transition: `all ${interaction.duration.slow} ${interaction.easing.standard}`,
              textDecoration: 'none',
              color: colors.dark.label.primary,
            }}
          >
            <div className="relative z-10">
              <h3
                style={{
                  fontSize: typography.fontSize.title2,
                  fontWeight: typography.fontWeight.semibold,
                  marginBottom: spacing[8],
                }}
              >
                Gallery
              </h3>
              <p
                style={{
                  fontSize: typography.fontSize.footnote,
                  color: colors.dark.label.secondary,
                }}
              >
                모든 선수 시각화 갤러리
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        </div>

        {/* Footer */}
        <div
          className="absolute left-0 right-0 text-center"
          style={{
            bottom: spacing[32],
          }}
        >
          <p
            style={{
              fontSize: typography.fontSize.footnote,
              color: colors.dark.label.quaternary,
            }}
          >
            © 2025 A2F Project. Visual Identity for Korean Football Players.
          </p>
        </div>
      </div>
    </div>
  );
}
