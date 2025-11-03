/**
 * Apple Human Interface Guidelines (HIG) Design System
 * Based on official Apple HIG specifications
 * https://developer.apple.com/design/human-interface-guidelines/
 */

// ============================================================================
// SPACING SYSTEM - 8pt Grid (scaled to 80%)
// ============================================================================
// Apple uses an 8pt grid system for consistent spacing and alignment
export const spacing = {
  0: '0',
  1: '0.1rem',    // 1.6px - hairline
  2: '0.2rem',    // 3.2px - tight
  4: '0.4rem',    // 6.4px - base unit
  6: '0.6rem',    // 9.6px
  8: '0.8rem',    // 12.8px - standard padding
  12: '1.2rem',   // 19.2px
  16: '1.6rem',   // 25.6px
  20: '2rem',     // 32px
  24: '2.4rem',   // 38.4px
  25: '1.25rem',  // 20px - custom for horizontal page margins
  28: '1.5625rem',// 25px - custom for vertical page margins
  32: '3.2rem',   // 51.2px
  40: '4rem',     // 64px
  48: '4.8rem',   // 76.8px
  56: '5.6rem',   // 89.6px
  64: '6.4rem',   // 102.4px
  96: '7.68rem',  // 122.88px - for header padding
} as const;

// ============================================================================
// LAYOUT MARGINS - Responsive
// ============================================================================
export const margins = {
  mobile: {
    top: '2.813rem',      // 45px
    bottom: '2.813rem',   // 45px
    vertical: '3.75rem',  // 60px
    container: '87.5%',   // fluid width
  },
  tablet: {
    top: '5.625rem',      // 90px
    bottom: '5.625rem',   // 90px
    vertical: '7.5rem',   // 120px
    container: '43.25rem', // 692px
  },
  desktop: {
    top: '5.75rem',       // 92px
    bottom: '5.75rem',    // 92px
    vertical: '8.75rem',  // 140px
    container: '61.25rem', // 980px
  },
} as const;

// ============================================================================
// TYPOGRAPHY - SF Pro Display
// ============================================================================
export const typography = {
  fontFamily: {
    system: '"Helvetica", -apple-system, BlinkMacSystemFont, sans-serif',
    display: '"Helvetica", -apple-system, BlinkMacSystemFont, sans-serif',
    text: '"Helvetica", -apple-system, BlinkMacSystemFont, sans-serif',
    mono: '"Helvetica", monospace',
  },

  // iOS/macOS Typography Scale (scaled to 80%)
  fontSize: {
    // Large Titles
    largeTitle: '1.7rem',       // 27.2px
    largeTitleMobile: '1.6rem', // 25.6px

    // Title Hierarchy
    title1: '1.4rem',           // 22.4px
    title2: '1.1rem',           // 17.6px
    title3: '1rem',             // 16px

    // Headline
    headline: '0.85rem',        // 13.6px (SF Pro Display)

    // Body
    body: '0.85rem',            // 13.6px (default iOS body)
    bodySmall: '0.75rem',       // 12px

    // Callout
    callout: '0.8rem',          // 12.8px

    // Subheadline & Footnote
    subheadline: '0.75rem',     // 12px
    footnote: '0.65rem',        // 10.4px

    // Caption
    caption1: '0.6rem',         // 9.6px
    caption2: '0.55rem',        // 8.8px

    // Hero/Display (for web)
    displayLarge: '2.4rem',     // 38.4px desktop
    displayMedium: '2rem',      // 32px tablet
    displaySmall: '1.6rem',     // 25.6px mobile
  },

  fontWeight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    heavy: 800,
    black: 900,
  },

  lineHeight: {
    tight: 1.08365,     // Display/Hero text
    normal: 1.1,        // Tablet display
    comfortable: 1.125, // Mobile display
    body: 1.42857,      // Body text (17pt → ~24pt)
    relaxed: 1.5,       // Loose body text
  },

  letterSpacing: {
    tight: '-0.02em',
    normal: '0',
    wide: '0.01em',
  },
} as const;

// ============================================================================
// COLORS - Apple System Colors
// ============================================================================
export const colors = {
  // System Background Colors
  systemBackground: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#FFFFFF',
  },

  // System Grouped Background
  systemGroupedBackground: {
    primary: '#F2F2F7',
    secondary: '#FFFFFF',
    tertiary: '#F2F2F7',
  },

  // Label Colors (Text)
  label: {
    primary: 'rgba(0, 0, 0, 0.85)',
    secondary: 'rgba(60, 60, 67, 0.6)',
    tertiary: 'rgba(60, 60, 67, 0.3)',
    quaternary: 'rgba(60, 60, 67, 0.18)',
  },

  // Fill Colors
  fill: {
    primary: 'rgba(120, 120, 128, 0.2)',
    secondary: 'rgba(120, 120, 128, 0.16)',
    tertiary: 'rgba(118, 118, 128, 0.12)',
    quaternary: 'rgba(116, 116, 128, 0.08)',
  },

  // System Colors (Accent)
  system: {
    blue: '#007AFF',
    green: '#34C759',
    indigo: '#5856D6',
    orange: '#FF9500',
    pink: '#FF2D55',
    purple: '#AF52DE',
    red: '#FF3B30',
    teal: '#5AC8FA',
    yellow: '#FFCC00',
  },

  // Dark Mode Colors
  dark: {
    systemBackground: {
      primary: '#000000',
      secondary: '#1C1C1E',
      tertiary: '#2C2C2E',
    },
    label: {
      primary: 'rgba(255, 255, 255, 0.85)',
      secondary: 'rgba(235, 235, 245, 0.6)',
      tertiary: 'rgba(235, 235, 245, 0.3)',
      quaternary: 'rgba(235, 235, 245, 0.18)',
    },
    fill: {
      primary: 'rgba(120, 120, 128, 0.36)',
      secondary: 'rgba(120, 120, 128, 0.32)',
      tertiary: 'rgba(118, 118, 128, 0.24)',
      quaternary: 'rgba(118, 118, 128, 0.18)',
    },
  },

  // Separator Colors
  separator: {
    opaque: 'rgba(60, 60, 67, 0.36)',
    nonOpaque: 'rgba(60, 60, 67, 0.29)',
    dark: {
      opaque: 'rgba(84, 84, 88, 0.65)',
      nonOpaque: 'rgba(84, 84, 88, 0.6)',
    },
  },
} as const;

// ============================================================================
// INTERACTION - Touch Targets & States (scaled to 80%)
// ============================================================================
export const interaction = {
  // Minimum Touch Target (HIG Recommendation)
  minTouchTarget: '35.2px',  // 80% of 44px

  // Border Radius
  borderRadius: {
    none: '0',
    small: '0.2rem',     // 3.2px
    medium: '0.4rem',    // 6.4px - common for buttons
    large: '0.6rem',     // 9.6px - cards
    xlarge: '0.8rem',    // 12.8px - large cards
    full: '9999px',      // pill shape
  },

  // Opacity States
  opacity: {
    disabled: 0.3,
    pressed: 0.6,
    hover: 0.85,
    default: 1,
  },

  // Transition Duration
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },

  // Easing Functions
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
  },
} as const;

// ============================================================================
// SHADOWS & DEPTH
// ============================================================================
export const shadows = {
  small: '0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)',
  medium: '0 3px 6px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.12)',
  large: '0 10px 20px rgba(0, 0, 0, 0.15), 0 3px 6px rgba(0, 0, 0, 0.10)',
  xlarge: '0 15px 25px rgba(0, 0, 0, 0.15), 0 5px 10px rgba(0, 0, 0, 0.05)',
} as const;

// ============================================================================
// BREAKPOINTS - Responsive Design
// ============================================================================
export const breakpoints = {
  mobile: '0px',
  tablet: '744px',
  desktop: '1068px',
  wide: '1440px',
} as const;

// ============================================================================
// Z-INDEX - Stacking Order
// ============================================================================
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

// ============================================================================
// TYPE EXPORTS
// ============================================================================
export type Spacing = keyof typeof spacing;
export type FontSize = keyof typeof typography.fontSize;
export type FontWeight = keyof typeof typography.fontWeight;
export type BorderRadius = keyof typeof interaction.borderRadius;
export type Breakpoint = keyof typeof breakpoints;
