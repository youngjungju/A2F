'use client';

import { NoiseParams } from '@/lib/types';
import { spacing, typography, colors, interaction, shadows } from '@/lib/designTokens';

interface ControlPanelProps {
  params: NoiseParams;
  onParamsChange: (params: NoiseParams) => void;
  viewMode?: '2d' | '3d';
  onViewModeChange?: (mode: '2d' | '3d') => void;
  className?: string;
}

export default function ControlPanel({
  params,
  onParamsChange,
  viewMode = '3d',
  onViewModeChange,
  className = ''
}: ControlPanelProps) {
  const updateParam = (key: keyof NoiseParams, value: number) => {
    onParamsChange({ ...params, [key]: value });
  };

  return (
    <div
      className={`backdrop-blur-lg text-white ${className}`}
      style={{
        backgroundColor: colors.dark.systemBackground.secondary,
        borderRadius: interaction.borderRadius.large,
        padding: spacing[16],
        minWidth: '320px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: shadows.large,
      }}
    >
      <h3
        style={{
          fontSize: typography.fontSize.headline,
          fontWeight: typography.fontWeight.semibold,
          textAlign: 'center',
          marginBottom: spacing[16],
          color: colors.dark.label.primary,
        }}
      >
        Controls
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[12] }}>
        {/* View Mode Toggle */}
        {onViewModeChange && (
          <div>
            <label
              style={{
                display: 'block',
                fontSize: typography.fontSize.footnote,
                marginBottom: spacing[8],
                color: colors.dark.label.secondary,
                fontWeight: typography.fontWeight.medium,
              }}
            >
              View Mode
            </label>
            <div style={{ display: 'flex', gap: spacing[8] }}>
              <button
                onClick={() => onViewModeChange('2d')}
                style={{
                  flex: 1,
                  minHeight: interaction.minTouchTarget,
                  padding: `${spacing[8]} ${spacing[16]}`,
                  borderRadius: interaction.borderRadius.medium,
                  fontWeight: typography.fontWeight.medium,
                  fontSize: typography.fontSize.body,
                  transition: `all ${interaction.duration.normal} ${interaction.easing.standard}`,
                  backgroundColor: viewMode === '2d' ? colors.system.blue : colors.dark.fill.secondary,
                  color: viewMode === '2d' ? '#FFFFFF' : colors.dark.label.secondary,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                2D
              </button>
              <button
                onClick={() => onViewModeChange('3d')}
                style={{
                  flex: 1,
                  minHeight: interaction.minTouchTarget,
                  padding: `${spacing[8]} ${spacing[16]}`,
                  borderRadius: interaction.borderRadius.medium,
                  fontWeight: typography.fontWeight.medium,
                  fontSize: typography.fontSize.body,
                  transition: `all ${interaction.duration.normal} ${interaction.easing.standard}`,
                  backgroundColor: viewMode === '3d' ? colors.system.blue : colors.dark.fill.secondary,
                  color: viewMode === '3d' ? '#FFFFFF' : colors.dark.label.secondary,
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                3D
              </button>
            </div>
          </div>
        )}
        {/* Amplitude */}
        <div>
          <label
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: typography.fontSize.footnote,
              marginBottom: spacing[8],
              color: colors.dark.label.secondary,
              fontWeight: typography.fontWeight.medium,
            }}
          >
            <span>Amplitude</span>
            <span style={{ color: colors.dark.label.tertiary }}>{params.amplitude.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            value={params.amplitude}
            onChange={(e) => updateParam('amplitude', parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: spacing[4],
              borderRadius: interaction.borderRadius.full,
              cursor: 'pointer',
              accentColor: colors.system.blue,
            }}
          />
        </div>

        {/* Saturation */}
        <div>
          <label
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: typography.fontSize.footnote,
              marginBottom: spacing[8],
              color: colors.dark.label.secondary,
              fontWeight: typography.fontWeight.medium,
            }}
          >
            <span>Saturation</span>
            <span style={{ color: colors.dark.label.tertiary }}>{params.saturation.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0"
            max="2"
            step="0.01"
            value={params.saturation}
            onChange={(e) => updateParam('saturation', parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: spacing[4],
              borderRadius: interaction.borderRadius.full,
              cursor: 'pointer',
              accentColor: colors.system.blue,
            }}
          />
        </div>

        {/* Lacunarity */}
        <div>
          <label
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: typography.fontSize.footnote,
              marginBottom: spacing[8],
              color: colors.dark.label.secondary,
              fontWeight: typography.fontWeight.medium,
            }}
          >
            <span>Lacunarity</span>
            <span style={{ color: colors.dark.label.tertiary }}>{params.lacunarity.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="1"
            max="4"
            step="0.1"
            value={params.lacunarity}
            onChange={(e) => updateParam('lacunarity', parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: spacing[4],
              borderRadius: interaction.borderRadius.full,
              cursor: 'pointer',
              accentColor: colors.system.blue,
            }}
          />
        </div>

        {/* Gain */}
        <div>
          <label
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: typography.fontSize.footnote,
              marginBottom: spacing[8],
              color: colors.dark.label.secondary,
              fontWeight: typography.fontWeight.medium,
            }}
          >
            <span>Gain</span>
            <span style={{ color: colors.dark.label.tertiary }}>{params.gain.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={params.gain}
            onChange={(e) => updateParam('gain', parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: spacing[4],
              borderRadius: interaction.borderRadius.full,
              cursor: 'pointer',
              accentColor: colors.system.blue,
            }}
          />
        </div>

        {/* Warp Strength */}
        <div>
          <label
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: typography.fontSize.footnote,
              marginBottom: spacing[8],
              color: colors.dark.label.secondary,
              fontWeight: typography.fontWeight.medium,
            }}
          >
            <span>Warp Strength</span>
            <span style={{ color: colors.dark.label.tertiary }}>{params.warpStrength.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={params.warpStrength}
            onChange={(e) => updateParam('warpStrength', parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: spacing[4],
              borderRadius: interaction.borderRadius.full,
              cursor: 'pointer',
              accentColor: colors.system.blue,
            }}
          />
        </div>

        {/* Halftone Pattern */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: typography.fontSize.footnote,
              marginBottom: spacing[8],
              color: colors.dark.label.secondary,
              fontWeight: typography.fontWeight.medium,
            }}
          >
            Halftone Pattern
          </label>
          <select
            value={params.halftonePattern}
            onChange={(e) => updateParam('halftonePattern', parseInt(e.target.value))}
            style={{
              width: '100%',
              padding: spacing[8],
              backgroundColor: colors.dark.fill.secondary,
              border: `1px solid ${colors.dark.fill.tertiary}`,
              borderRadius: interaction.borderRadius.medium,
              color: colors.dark.label.primary,
              fontSize: typography.fontSize.body,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="0">None</option>
            <option value="1">Square</option>
            <option value="2">Hexagonal</option>
            <option value="3">Radial</option>
          </select>
        </div>

        {/* Halftone Scale */}
        <div>
          <label
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: typography.fontSize.footnote,
              marginBottom: spacing[8],
              color: colors.dark.label.secondary,
              fontWeight: typography.fontWeight.medium,
            }}
          >
            <span>Halftone Scale</span>
            <span style={{ color: colors.dark.label.tertiary }}>{params.halftoneScale.toFixed(1)}</span>
          </label>
          <input
            type="range"
            min="10"
            max="200"
            step="5"
            value={params.halftoneScale}
            onChange={(e) => updateParam('halftoneScale', parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: spacing[4],
              borderRadius: interaction.borderRadius.full,
              cursor: 'pointer',
              accentColor: colors.system.blue,
            }}
          />
        </div>
      </div>
    </div>
  );
}
