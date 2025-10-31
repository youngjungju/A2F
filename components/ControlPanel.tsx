'use client';

import React from 'react';
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
  // 입력 중인 Portion 값을 저장하는 state
  const [editingPortions, setEditingPortions] = React.useState<{[key: number]: string}>({});

  // colorStops의 position을 비율로 변환하여 표시
  const getPortionPercentages = () => {
    const portions: number[] = [];
    for (let i = 0; i < params.colorStops.length; i++) {
      if (i === 0) {
        portions.push(params.colorStops[0].position * 100);
      } else {
        portions.push((params.colorStops[i].position - params.colorStops[i - 1].position) * 100);
      }
    }
    return portions;
  };

  // 비율을 누적 position으로 변환
  const recalculatePositions = (portions: number[]) => {
    let cumulative = 0;
    return portions.map((portion) => {
      cumulative += portion / 100;
      return cumulative;
    });
  };

  const updateParam = (key: keyof NoiseParams, value: number) => {
    onParamsChange({ ...params, [key]: value });
  };

  const updateColorStop = (index: number, color: string) => {
    const newColorStops = [...params.colorStops];
    newColorStops[index] = { ...newColorStops[index], color };
    onParamsChange({ ...params, colorStops: newColorStops });
  };

  const updateColorHex = (index: number, hexValue: string) => {
    // 입력값을 그대로 받되, # 제거하고 처리
    let hex = hexValue.replace('#', '').toUpperCase();

    // 입력값 검증: 0-9, A-F만 허용, 최대 6자리
    hex = hex.replace(/[^0-9A-F]/g, '').slice(0, 6);

    // 항상 업데이트 (입력 중에도 실시간 반영)
    const newColorStops = [...params.colorStops];
    newColorStops[index] = { ...newColorStops[index], color: `#${hex}` };
    onParamsChange({ ...params, colorStops: newColorStops });
  };

  const updatePortionPercentage = (index: number, percentage: number) => {
    // 입력값 검증: 0-100 사이
    const clampedPercentage = Math.max(0, Math.min(100, percentage));

    // 현재 비율들을 가져오기
    const currentPortions = getPortionPercentages();

    // 다른 항목들의 합계 계산
    const otherPortionsSum = currentPortions
      .filter((_, i) => i !== index)
      .reduce((sum, portion) => sum + portion, 0);

    // 전체 합계가 100%를 넘지 않도록 검증
    if (otherPortionsSum + clampedPercentage > 100) {
      alert(`Total cannot exceed 100%. Current sum of other items: ${otherPortionsSum.toFixed(0)}%`);
      return;
    }

    // 비율 배열 업데이트
    currentPortions[index] = clampedPercentage;

    // 누적 position으로 변환
    const newPositions = recalculatePositions(currentPortions);

    // colorStops 업데이트
    const newColorStops = params.colorStops.map((stop, i) => ({
      ...stop,
      position: newPositions[i],
    }));

    onParamsChange({ ...params, colorStops: newColorStops });
  };

  const addColorStop = () => {
    // 최대 4개까지만 추가 가능
    if (params.colorStops.length >= 4) {
      alert('Maximum 4 colors allowed');
      return;
    }

    // 현재 비율들 가져오기
    const currentPortions = getPortionPercentages();

    // 새로운 색상은 기본 10% 또는 남은 공간의 절반
    const usedPercentage = currentPortions.reduce((sum, p) => sum + p, 0);
    const remainingPercentage = 100 - usedPercentage;
    const newPortion = Math.min(10, remainingPercentage / 2);

    // 비율 배열에 새 항목 추가
    const newPortions = [...currentPortions, newPortion];

    // 누적 position으로 변환
    const newPositions = recalculatePositions(newPortions);

    // 새로운 색상 추가 (랜덤 색상)
    const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase();

    const newColorStops = [
      ...params.colorStops.map((stop, i) => ({
        ...stop,
        position: newPositions[i],
      })),
      {
        position: newPositions[newPositions.length - 1],
        color: randomColor,
      }
    ];

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
    fontSize: '14px',
    fontFamily: 'Helvetica, Arial, sans-serif',
    fontWeight: 400,
    marginBottom: '8px',
    color: '#000000',
  };

  const labelStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '10px',
    fontFamily: 'Helvetica, Arial, sans-serif',
    marginBottom: '4px',
    color: '#000000',
    fontWeight: 400,
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
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 400,
                fontSize: '12px',
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
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontWeight: 400,
                fontSize: '12px',
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h3 style={{ ...sectionTitleStyle, marginBottom: '0' }}>Color Control</h3>
          <span style={{ fontSize: '10px', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: getPortionPercentages().reduce((sum, p) => sum + p, 0) > 100 ? '#FF0000' : '#000000' }}>
            Total: {getPortionPercentages().reduce((sum, p) => sum + p, 0).toFixed(0)}%
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Header Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '45px 1fr 35px 20px', gap: '4px', paddingBottom: '4px', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
            <span style={{ fontSize: '10px', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: '#000000' }}>Portion</span>
            <span style={{ fontSize: '10px', fontFamily: 'Helvetica, Arial, sans-serif', fontWeight: 400, color: '#000000' }}>Color Code</span>
            <span></span>
            <span></span>
          </div>

          {/* Color Rows */}
          {params.colorStops.map((stop, index) => {
            const portions = getPortionPercentages();
            const displayValue = editingPortions[index] !== undefined
              ? editingPortions[index]
              : Math.round(portions[index]).toString();

            return (
              <div key={index} style={{ display: 'grid', gridTemplateColumns: '45px 1fr 35px 20px', gap: '4px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={displayValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    // 숫자만 입력 가능, 빈 문자열 허용
                    if (value === '' || /^\d+$/.test(value)) {
                      setEditingPortions({ ...editingPortions, [index]: value });
                    }
                  }}
                  onBlur={(e) => {
                    const value = e.target.value;
                    const numValue = value === '' ? 0 : parseInt(value);
                    updatePortionPercentage(index, numValue);
                    // 편집 상태 제거
                    const newEditingPortions = { ...editingPortions };
                    delete newEditingPortions[index];
                    setEditingPortions(newEditingPortions);
                  }}
                  onFocus={(e) => {
                    // 포커스 시 전체 선택
                    e.target.select();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  style={{
                    width: '100%',
                    fontSize: '10px',
                    fontFamily: 'Helvetica, Arial, sans-serif',
                    color: '#000000',
                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '3px',
                    padding: '2px 4px',
                    textAlign: 'center',
                    fontWeight: 400,
                  }}
                />
              <input
                type="text"
                value={stop.color.toUpperCase()}
                onChange={(e) => updateColorHex(index, e.target.value)}
                placeholder="#000000"
                maxLength={7}
                style={{
                  width: '100%',
                  fontSize: '9px',
                  color: '#000000',
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '3px',
                  padding: '2px 4px',
                  textAlign: 'center',
                  fontWeight: typography.fontWeight.regular,
                  fontFamily: 'monospace',
                }}
              />
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
            );
          })}

          {/* Add Color Button */}
          {params.colorStops.length < 4 && (
            <button
              onClick={addColorStop}
              style={{
                width: '100%',
                padding: '6px',
                marginTop: '4px',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '3px',
                fontSize: '9px',
                fontWeight: typography.fontWeight.semibold,
                color: '#000000',
                cursor: 'pointer',
                transition: `all ${interaction.duration.normal} ${interaction.easing.standard}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
              }}
            >
              + Add Color ({params.colorStops.length}/4)
            </button>
          )}
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
