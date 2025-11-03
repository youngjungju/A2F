'use client';

import { useState } from 'react';
import { spacing, typography, colors, interaction } from '@/lib/designTokens';

export default function AboutButton() {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      {/* About Button - Top Right */}
      <div
        className="fixed z-50"
        style={{
          top: spacing[28],
          right: spacing[25],
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(28, 28, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '8px',
            padding: '4px',
          }}
        >
          <button
            onClick={() => setShowAbout(!showAbout)}
            style={{
              padding: '6px 10px',
              backgroundColor: showAbout ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
              borderRadius: '6px',
              color: colors.dark.label.primary,
              fontSize: '16px',
              fontFamily: 'Helvetica, Arial, sans-serif',
              fontWeight: 400,
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
            top: 'calc(25px + 40px + 10px)',
            right: spacing[25],
          }}
        >
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRadius: '10px',
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
                gap: '6px',
                fontSize: typography.fontSize.footnote,
                color: 'rgba(0, 0, 0, 0.7)',
              }}
            >
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ minWidth: '70px', fontWeight: typography.fontWeight.medium }}>
                  Email
                </span>
                <span>johnwkim82@gmail.com</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{ minWidth: '70px', fontWeight: typography.fontWeight.medium }}>
                  Instagram
                </span>
                <span>joelkim.82</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
