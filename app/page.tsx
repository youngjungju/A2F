'use client';

import { useState, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Webcam from 'react-webcam';
import NoiseGradientCanvas from '@/components/NoiseGradientCanvas';
import ControlPanel from '@/components/ControlPanel';
import AboutButton from '@/components/AboutButton';
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
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const webcamRef = useRef<Webcam>(null);

  const handleWebcamError = useCallback((error: string | DOMException) => {
    console.error('Webcam error:', error);
    alert('Unable to access webcam. Please check your camera permissions.');
  }, []);

  const handleWebcamLoad = useCallback(() => {
    console.log('Webcam loaded successfully');
    if (webcamRef.current?.video) {
      console.log('Webcam video element:', webcamRef.current.video);
      console.log('Video dimensions:', webcamRef.current.video.videoWidth, 'x', webcamRef.current.video.videoHeight);
    }
  }, []);

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
    <div className="relative w-screen h-screen overflow-hidden" style={{ backgroundColor: '#000000' }}>
      {/* Control Panel - Below Navigation */}
      <div
        className="absolute"
        style={{
          top: 'calc(25px + 40px + 15px)',
          left: spacing[25],
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          zIndex: 100,
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
            fontSize: '14px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 400,
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
            fontSize: '14px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 400,
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

      {/* About Button */}
      <AboutButton />

      {/* Info Box - Bottom Right */}
      <div
        className="absolute"
        style={{
          bottom: spacing[28],
          right: spacing[25],
          zIndex: 100,
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
            fontSize: '14px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 400,
            color: 'rgba(0, 0, 0, 0.9)',
            marginBottom: spacing[8],
          }}
        >
          {viewMode === '2d' ? '2D Uniform Preview' : '3D Uniform Preview'}
        </h2>
        <p
          style={{
            fontSize: '10px',
            fontFamily: 'Helvetica, Arial, sans-serif',
            fontWeight: 400,
            color: 'rgba(0, 0, 0, 0.7)',
            lineHeight: typography.lineHeight.relaxed,
          }}
        >
          {viewMode === '2d'
            ? 'Adjust the parameters to generate your unique pattern.'
            : 'Rotate and explore your pattern in 3D space.'}
        </p>
      </div>

      {/* Canvas Area - Base Layer */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
        }}
      >
        {/* Webcam Background - Always show in 3D mode */}
        {viewMode === '3d' ? (
          <>
            {/* Webcam Layer */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1,
              }}
            >
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                mirrored={true}
                videoConstraints={{
                  width: 1920,
                  height: 1080,
                  facingMode: 'user',
                }}
                onUserMedia={handleWebcamLoad}
                onUserMediaError={handleWebcamError}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            </div>
            {/* 3D Uniform on top of webcam */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 2,
              }}
            >
              <UniformRenderer params={params} autoRotate key="uniform-renderer" transparentBackground={true} />
            </div>
          </>
        ) : (
          /* Normal rendering without webcam */
          <div style={{ width: '100%', height: '100%' }}>
            {viewMode === '2d' ? (
              <NoiseGradientCanvas params={params} />
            ) : (
              <UniformRenderer params={params} autoRotate key="uniform-renderer" transparentBackground={false} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
