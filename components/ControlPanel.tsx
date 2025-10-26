'use client';

import { NoiseParams, ColorStop } from '@/lib/types';
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

  const updateColorStop = (index: number, color: string) => {
    const newColorStops = [...params.colorStops];
    newColorStops[index] = { ...newColorStops[index], color };
    onParamsChange({ ...params, colorStops: newColorStops });
  };

  const removeColorStop = (index: number) => {
    if (params.colorStops.length > 2) {
      const newColorStops = params.colorStops.filter((_, i) => i !== index);
      onParamsChange({ ...params, colorStops: newColorStops });
    }
  };

  const sectionStyle = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '8px',
    padding: '10px',
    minWidth: '284px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  };

  const sectionTitleStyle = {
    fontSize: '12px',
    fontWeight: typography.fontWeight.semibold,
    marginBottom: '8px',
    color: '#000000',
  };

  const labelStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    marginBottom: '4px',
    color: '#000000',
    fontWeight: typography.fontWeight.regular,
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
      }}
    >
      {/* View Mode Section */}
      {onViewModeChange && (
        <div style={sectionStyle}>
          <h3 style={sectionTitleStyle}>View Mode</h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => onViewModeChange('2d')}
              style={{
                flex: 1,
                minHeight: '28px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: typography.fontWeight.semibold,
                fontSize: '11px',
                transition: `all ${interaction.duration.normal} ${interaction.easing.standard}`,
                backgroundColor: viewMode === '2d' ? '#000000' : 'rgba(0, 0, 0, 0.05)',
                color: viewMode === '2d' ? '#FFFFFF' : '#000000',
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
                minHeight: '28px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontWeight: typography.fontWeight.semibold,
                fontSize: '11px',
                transition: `all ${interaction.duration.normal} ${interaction.easing.standard}`,
                backgroundColor: viewMode === '3d' ? '#000000' : 'rgba(0, 0, 0, 0.05)',
                color: viewMode === '3d' ? '#FFFFFF' : '#000000',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              3D
            </button>
          </div>
        </div>
      )}

      {/* Color Control Section */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Color Control</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Header Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '35px 1fr 35px 20px', gap: '4px', paddingBottom: '4px', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <span style={{ fontSize: '9px', fontWeight: typography.fontWeight.semibold, color: '#000000' }}>Portion</span>
            <span style={{ fontSize: '9px', fontWeight: typography.fontWeight.semibold, color: '#000000' }}>Color Code</span>
            <span></span>
            <span></span>
          </div>

          {/* Color Rows */}
          {params.colorStops.map((stop, index) => (
            <div key={index} style={{ display: 'grid', gridTemplateColumns: '35px 1fr 35px 20px', gap: '4px', alignItems: 'center' }}>
              <span style={{ fontSize: '9px', color: '#000000' }}>{Math.round(stop.position * 100)} %</span>
              <div style={{
                height: '16px',
                borderRadius: '3px',
                backgroundColor: stop.color,
                pointerEvents: 'none',
              }}></div>
              <input
                type="color"
                value={stop.color}
                onChange={(e) => updateColorStop(index, e.target.value)}
                style={{
                  width: '100%',
                  height: '16px',
                  border: 'none',
                  borderRadius: '3px',
                  cursor: 'pointer',
                  padding: '0',
                }}
              />
              <button
                onClick={() => removeColorStop(index)}
                style={{
                  padding: '1px',
                  fontSize: '12px',
                  color: '#000000',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  opacity: params.colorStops.length > 2 ? 1 : 0.3,
                }}
                disabled={params.colorStops.length <= 2}
              >-</button>
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Control Section */}
      <div style={sectionStyle}>
        <h3 style={sectionTitleStyle}>Heatmap Control</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Saturation */}
          <div>
            <label style={labelStyle}>
              <span>Saturation</span>
              <span style={{ fontWeight: typography.fontWeight.medium }}>{params.saturation.toFixed(2)}</span>
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
                height: '3px',
                borderRadius: '3px',
                cursor: 'pointer',
                accentColor: '#000000',
              }}
            />
          </div>

          {/* Amplitude */}
          <div>
            <label style={labelStyle}>
              <span>Amplitude</span>
              <span style={{ fontWeight: typography.fontWeight.medium }}>{params.amplitude.toFixed(2)}</span>
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
                height: '3px',
                borderRadius: '3px',
                cursor: 'pointer',
                accentColor: '#000000',
              }}
            />
          </div>

          {/* Lacunarity */}
          <div>
            <label style={labelStyle}>
              <span>Lacunarity</span>
              <span style={{ fontWeight: typography.fontWeight.medium }}>{params.lacunarity.toFixed(2)}</span>
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
                height: '3px',
                borderRadius: '3px',
                cursor: 'pointer',
                accentColor: '#000000',
              }}
            />
          </div>

          {/* Gain */}
          <div>
            <label style={labelStyle}>
              <span>Grain</span>
              <span style={{ fontWeight: typography.fontWeight.medium }}>{params.gain.toFixed(2)}</span>
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
                height: '3px',
                borderRadius: '3px',
                cursor: 'pointer',
                accentColor: '#000000',
              }}
            />
          </div>

          {/* Warp Strength */}
          <div>
            <label style={labelStyle}>
              <span>Warp Strength</span>
              <span style={{ fontWeight: typography.fontWeight.medium }}>{params.warpStrength.toFixed(2)}</span>
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
                height: '3px',
                borderRadius: '3px',
                cursor: 'pointer',
                accentColor: '#000000',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
