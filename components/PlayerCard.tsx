'use client';

import { useState } from 'react';
import Image from 'next/image';
import { PlayerData, DEFAULT_NOISE_PARAMS } from '@/lib/types';
import { typography, spacing } from '@/lib/designTokens';
import UniformRenderer from '@/components/UniformRenderer';

interface PlayerCardProps {
  player: PlayerData;
  onClick: () => void;
}

export default function PlayerCard({ player, onClick }: PlayerCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Player의 club 데이터로부터 NoiseParams 생성
  const getPlayerNoiseParams = () => {
    if (player.clubs.length === 0) {
      return DEFAULT_NOISE_PARAMS;
    }

    // PlayerData의 heatmap 파라미터 사용 (있는 경우)
    const amplitude = player.amplitude ?? DEFAULT_NOISE_PARAMS.amplitude;
    const saturation = player.saturation ?? DEFAULT_NOISE_PARAMS.saturation;
    const lacunarity = player.lacunarity ?? DEFAULT_NOISE_PARAMS.lacunarity;
    const grain = player.grain ?? DEFAULT_NOISE_PARAMS.gain;
    const warpStrength = player.warpStrength ?? DEFAULT_NOISE_PARAMS.warpStrength;

    // Club 색상으로 colorStops 생성
    const colorStops = player.clubs.map((club, index) => {
      const position = player.clubs
        .slice(0, index + 1)
        .reduce((sum, c) => sum + c.percentage, 0) / 100;

      // club.colors 배열의 첫 번째 색상 사용
      const color = club.colors[0] || '#000000';

      return {
        position,
        color,
      };
    });

    return {
      amplitude,
      saturation,
      layers: DEFAULT_NOISE_PARAMS.layers,
      lacunarity,
      gain: grain,
      warpStrength,
      halftonePattern: DEFAULT_NOISE_PARAMS.halftonePattern,
      halftoneScale: DEFAULT_NOISE_PARAMS.halftoneScale,
      colorStops,
    };
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="cursor-pointer"
      style={{
        width: '263.7px',
        perspective: '1000px',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '369.18px',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s ease-in-out',
          transform: isHovered ? 'rotateY(180deg)' : 'rotateY(0deg)',
          marginBottom: '10px',
        }}
      >
        {/* Front Side - Player Image */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
          }}
        >
          {/* Player Image */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '12px',
              overflow: 'hidden',
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
        </div>

        {/* Back Side - 3D Uniform Preview */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          {/* 3D Uniform Container */}
          <div
            style={{
              width: '100%',
              height: '100%',
              borderRadius: '12px',
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: '#f5f5f5',
            }}
          >
            {isHovered && (
              <UniformRenderer
                params={getPlayerNoiseParams()}
                autoRotate={true}
                transparentBackground={false}
                className="w-full h-full"
              />
            )}
          </div>
        </div>
      </div>

      {/* Player Info - Below the card */}
      <div>
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
    </div>
  );
}
