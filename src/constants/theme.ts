import '@/global.css';

import { Platform } from 'react-native';

export type ColorScheme = {
  text: string;
  background: string;
  backgroundElement: string;
  backgroundSelected: string;
  textSecondary: string;
  primary: string;
  success: string;
  danger: string;
  warning: string;
  border: string;
  shadow: string;
  neon?: string;
  neonAccent?: string;
  neonGlow?: string;
  lilac?: string;
  lilacAccent?: string;
  lilacGlow?: string;
};

let _colors: { light: ColorScheme; dark: ColorScheme; unspecified: ColorScheme } = {
  light: {
    text: '#1A1A2E',
    background: '#101415',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E8EBF5',
    textSecondary: '#6B7280',
    primary: '#3B82F6',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    border: '#E5E7EB',
    shadow: 'rgba(0, 0, 0, 0.08)',
    lilac: '#C084FC',
    lilacAccent: '#E879F9',
    lilacGlow: 'rgba(224, 121, 249, 0.3)',
  },
  dark: {
    text: '#F3F4F6',
    background: '#101415',
    backgroundElement: '#1E293B',
    backgroundSelected: '#334155',
    textSecondary: '#94A3B8',
    primary: '#60A5FA',
    success: '#34D399',
    danger: '#F87171',
    warning: '#FBBF24',
    border: '#475569',
    shadow: 'rgba(0, 0, 0, 0.3)',
    neon: '#A855F7',
    neonAccent: '#EC4899',
    neonGlow: 'rgba(168, 85, 247, 0.5)',
  },
  unspecified: {} as ColorScheme,
};
_colors['unspecified'] = _colors.light;
export const Colors = Object.freeze(_colors);
export type ColorTheme = 'light' | 'dark';
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
