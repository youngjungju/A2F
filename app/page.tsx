'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import NoiseGradientCanvas from '@/components/NoiseGradientCanvas';
import ControlPanel from '@/components/ControlPanel';
import { DEFAULT_NOISE_PARAMS, NoiseParams } from '@/lib/types';
import { spacing, typography, colors, interaction } from '@/lib/designTokens';

// Dynamically import UniformRenderer with no SSR
const UniformRenderer = dynamic(() => import('@/components/UniformRenderer'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-900">
      <p className="text-white">Loading 3D renderer...</p>
    </div>
  ),
});

export default function Home() {
  const [params, setParams] = useState<NoiseParams>(DEFAULT_NOISE_PARAMS);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('3d');
  const [showAbout, setShowAbout] = useState(false);

  const handleDownload = () => {
    // Find the canvas element (works for both 2D and 3D)
    const canvas = document.querySelector('canvas');
    if (canvas) {
      try {
        // Convert canvas to PNG data URL
        const dataURL = canvas.toDataURL('image/png');

        // Create download link
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `a2f-${viewMode}-${timestamp}.png`;
        link.href = dataURL;

        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Download failed:', error);
        alert('Download failed. Please try again.');
      }
    } else {
      alert('Canvas not found. Please wait for the render to complete.');
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* Control Panel - Below Navigation */}
      <div
        className="absolute z-50"
        style={{
          top: 'calc(24px + 40px + 25px)',
          left: spacing[24],
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <ControlPanel
          params={params}
          onParamsChange={setParams}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Archive Uniform Button */}
        <button
          style={{
            padding: '8px 12px',
            backgroundColor: '#000000',
            borderRadius: '6px',
            color: colors.dark.label.primary,
            fontSize: '11px',
            fontWeight: typography.fontWeight.semibold,
            border: 'none',
            transition: `all ${interaction.duration.normal} ${interaction.easing.standard}`,
            cursor: 'pointer',
            minHeight: '32px',
            minWidth: '284px',
          }}
        >
          Archive Uniform
        </button>

        {/* Export Uniform Button */}
        <button
          onClick={handleDownload}
          style={{
            padding: '8px 12px',
            backgroundColor: '#000000',
            borderRadius: '6px',
            color: colors.dark.label.primary,
            fontSize: '11px',
            fontWeight: typography.fontWeight.semibold,
            border: 'none',
            transition: `all ${interaction.duration.normal} ${interaction.easing.standard}`,
            cursor: 'pointer',
            minHeight: '32px',
            minWidth: '284px',
          }}
        >
          Export Uniform
        </button>
      </div>

      {/* About Button - Top Right (Fixed Position) */}
      <div
        className="fixed z-50"
        style={{
          top: spacing[24],
          right: spacing[24],
        }}
      >
        {/* About Button */}
        <div
          style={{
            backgroundColor: 'rgba(28, 28, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '8px',
            padding: '4px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          }}
        >
          <button
            onClick={() => setShowAbout(!showAbout)}
            style={{
              padding: '6px 10px',
              backgroundColor: showAbout ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
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
            top: `calc(${spacing[24]} + 40px + ${spacing[12]})`,
            right: spacing[24],
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(40px)',
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
                gap: spacing[8],
                fontSize: typography.fontSize.footnote,
                color: 'rgba(0, 0, 0, 0.7)',
              }}
            >
              <div style={{ display: 'flex', gap: spacing[16] }}>
                <span style={{ minWidth: '70px', fontWeight: typography.fontWeight.medium }}>
                  Email
                </span>
                <span>johnwkim82@gmail.com</span>
              </div>
              <div style={{ display: 'flex', gap: spacing[16] }}>
                <span style={{ minWidth: '70px', fontWeight: typography.fontWeight.medium }}>
                  Instagram
                </span>
                <span>joelkim.82</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Info Box - Bottom Right */}
      <div
        className="absolute z-50"
        style={{
          bottom: spacing[24],
          right: spacing[24],
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: `${spacing[16]} ${spacing[20]}`,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          minWidth: '283px',
          minHeight: '83.87px',
        }}
      >
        <h2
          style={{
            fontSize: typography.fontSize.headline,
            fontWeight: typography.fontWeight.bold,
            color: 'rgba(0, 0, 0, 0.9)',
            marginBottom: spacing[8],
          }}
        >
          {viewMode === '2d' ? '2D Uniform Preview' : '3D Uniform Preview'}
        </h2>
        <p
          style={{
            fontSize: typography.fontSize.footnote,
            color: 'rgba(0, 0, 0, 0.7)',
            lineHeight: typography.lineHeight.relaxed,
          }}
        >
          {viewMode === '2d'
            ? 'Adjust the parameters to generate your unique pattern.'
            : 'Rotate and explore your pattern in 3D space.'}
        </p>
      </div>

      {/* Canvas Area */}
      <div className="w-full h-full">
        {viewMode === '2d' ? (
          <NoiseGradientCanvas params={params} />
        ) : (
          <UniformRenderer params={params} autoRotate key="uniform-renderer" />
        )}
      </div>
    </div>
  );
}
