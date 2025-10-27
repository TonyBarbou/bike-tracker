/**
 * Shared color configuration for Bike Tracker
 * Can be imported in both TypeScript/JavaScript and CSS
 */

export const colors = {
  // Brand Colors
  brand: {
    primaryRed: '#dc2626',
    primaryOrange: '#ea580c',
    accentRed: '#ef4444',
    accentOrange: '#f97316',
  },

  // Background Colors
  bg: {
    primary: '#ffffff',
    secondary: '#f9fafb',
    tertiary: '#f3f4f6',
    muted: '#e5e7eb',
    dark: '#1f2937',
    darker: '#0a0a0a',
  },

  // Text Colors
  text: {
    primary: '#111827',
    secondary: '#4b5563',
    tertiary: '#6b7280',
    muted: '#9ca3af',
    white: '#ffffff',
    inversePrimary: '#ededed',
    inverseSecondary: '#d1d5db',
  },

  // Status Colors
  status: {
    success: {
      bg: '#dcfce7',
      text: '#166534',
      border: '#22c55e',
      button: '#16a34a',
      buttonHover: '#15803d',
    },
    warning: {
      bg: '#fef3c7',
      text: '#92400e',
      border: '#fbbf24',
      lightBg: '#fffbeb',
      lightBorder: '#fef3c7',
      button: '#ca8a04',
      buttonHover: '#a16207',
    },
    error: {
      bg: '#fee2e2',
      text: '#991b1b',
      border: '#ef4444',
      button: '#dc2626',
      buttonHover: '#b91c1c',
    },
    info: {
      bg: '#dbeafe',
      text: '#1e3a8a',
      border: '#3b82f6',
      lightBg: '#eff6ff',
      lightBorder: '#dbeafe',
      button: '#2563eb',
      buttonHover: '#1d4ed8',
    },
  },

  // Border Colors
  border: {
    light: '#f3f4f6',
    default: '#e5e7eb',
    medium: '#d1d5db',
    dark: '#9ca3af',
    focus: '#ef4444',
  },

  // Timeline Colors
  timeline: {
    past: {
      bg: '#f9fafb',
      border: '#9ca3af',
    },
    today: {
      bg: '#fff7ed',
      border: '#f97316',
      ring: '#fb923c',
      badgeBg: '#f97316',
    },
    future: {
      bg: '#eff6ff',
      border: '#3b82f6',
    },
  },

  // Map Colors
  map: {
    routePlanned: '#9ca3af',
    routeCompleted: '#f59e0b',
    routeGpx: '#d90e0e',
    livePosition: '#ef4444',
    popup: {
      heading: '#1f2937',
      text: '#374151',
      muted: '#6b7280',
      meta: '#9ca3af',
    },
  },

  // Special Effects
  overlay: {
    dark: 'rgba(0, 0, 0, 0.9)',
    medium: 'rgba(0, 0, 0, 0.5)',
    hover: 'rgba(0, 0, 0, 0.75)',
  },
  whiteTranslucent: 'rgba(255, 255, 255, 0.95)',
  whiteOverlay: 'rgba(255, 255, 255, 0.5)',
  whiteBackdrop: 'rgba(255, 255, 255, 0.8)',
} as const;

// Export individual color groups for convenience
export const { brand, bg, text, status, border, timeline, map, overlay } = colors;
