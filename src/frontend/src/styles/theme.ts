const theme = {
  colors: {
    // Primary Brand Colors (matching landing page)
    primary: {
      cyan: '#38BDF8',
      fuchsia: '#D946EF',
      gradient: 'linear-gradient(135deg, #38BDF8 0%, #D946EF 100%)',
      gradientHover: 'linear-gradient(135deg, #22D3EE 0%, #EC4899 100%)',
    },
    
    // Extended Palette
    success: {
      50: '#ECFDF5',
      500: '#10B981',
      600: '#059669',
    },
    warning: {
      50: '#FFFBEB',
      500: '#F59E0B',
      600: '#D97706',
    },
    error: {
      50: '#FEF2F2',
      500: '#EF4444',
      600: '#DC2626',
    },
    info: {
      50: '#EFF6FF',
      500: '#3B82F6',
      600: '#2563EB',
    },

    // Neutral Scale
    neutral: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0A0A0F',
    },

    // Background & Surface Colors
    bg: {
      primary: '#0A0A0F',
      secondary: '#0F1016',
      tertiary: '#1A1B23',
      glass: 'rgba(255, 255, 255, 0.03)',
      glassHover: 'rgba(255, 255, 255, 0.06)',
    },

    // Text Colors
    text: {
      primary: '#FFFFFF',
      secondary: '#E6E6F0',
      tertiary: '#B3B3C3',
      muted: '#9CA3AF',
      inverse: '#0A0A0F',
    },

    // Border Colors
    border: {
      primary: '#1C1C25',
      secondary: '#2A2A35',
      accent: '#38BDF8',
      glass: 'rgba(255, 255, 255, 0.1)',
    },

    // Legacy compatibility
    cyan: '#38BDF8',
    fuchsia: '#D946EF',
    gradient: 'linear-gradient(90deg, #06b6d4 0%, #8b5cf6 50%, #ec4899 100%)',
    glass: 'rgba(255, 255, 255, 0.03)',
    panel: '#0F1016',
    textMuted: '#9CA3AF',
  },

  // Typography
  fonts: {
    sans: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    display: '"Space Grotesk", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  },

  // Border Radius
  radii: {
    none: '0px',
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '20px',
    '3xl': '24px',
    full: '9999px',
  },

  // Shadows
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    glow: {
      cyan: '0 0 20px rgba(56, 189, 248, 0.3)',
      fuchsia: '0 0 20px rgba(217, 70, 239, 0.3)',
      gradient: '0 0 20px rgba(56, 189, 248, 0.2), 0 0 40px rgba(217, 70, 239, 0.1)',
    },
  },

  // Spacing
  spacing: {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
    20: '80px',
    24: '96px',
  },

  // Motion
  motion: {
    fast: '150ms',
    medium: '300ms',
    slow: '600ms',
    spring: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
};

export default theme;
