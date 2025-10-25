'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
  const [showModal, setShowModal] = useState(false);

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

      {/* Canvas Area */}
      <div className="w-full h-full">
        {viewMode === '2d' ? (
          <NoiseGradientCanvas params={params} />
        ) : (
          <UniformRenderer params={params} autoRotate key="uniform-renderer" />
        )}
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
