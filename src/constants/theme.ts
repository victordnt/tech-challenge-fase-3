import '@/global.css';

import { Platform } from 'react-native';

export type ColorScheme = {
  text: string;
  textSecondary: string;
  textMuted: string;
  background: string;
  backgroundElement: string;
  backgroundSelected: string;
  primary: string;
  primaryHover: string;
  success: string;
  danger: string;
  warning: string;
  border: string;
  borderSubtle: string;
  shadow: string;

  // Card & Glassmorphism Tokens
  cardBg: string;
  cardBorder: string;
  cardBorderSubtle: string;
  cardSeparator: string;

  // Badge Tokens
  badgeActiveBg: string;
  badgeActiveText: string;
  badgeInactiveBg: string;
  badgeInactiveBorder: string;
  badgeInactiveText: string;

  // Finance & Charts Tokens
  income: string;
  expense: string;
  incomeGlow: string;
  expenseGlow: string;

  // Category Palette Tokens
  chartPalette: string[];

  // Legacy / Brand
  neon?: string;
  neonAccent?: string;
  neonGlow?: string;
  lilac?: string;
  lilacAccent?: string;
  lilacGlow?: string;
};

let _colors: { light: ColorScheme; dark: ColorScheme; unspecified: ColorScheme } = {
  light: {
    text: '#101415',
    textSecondary: '#4A4E59',
    textMuted: '#6B7280',
    background: '#101415',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E2E8F0',
    primary: '#7C3AED',
    primaryHover: '#6D28D9',
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',
    border: '#E2E8F0',
    borderSubtle: 'rgba(0, 0, 0, 0.05)',
    shadow: 'rgba(0, 0, 0, 0.08)',

    // Card & Glassmorphism
    cardBg: 'rgba(255, 255, 255, 0.05)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    cardBorderSubtle: 'rgba(255, 255, 255, 0.05)',
    cardSeparator: '#2E2E33',

    // Badge
    badgeActiveBg: '#7C3AED',
    badgeActiveText: '#FFFFFF',
    badgeInactiveBg: 'rgba(255, 255, 255, 0.05)',
    badgeInactiveBorder: 'rgba(255, 255, 255, 0.1)',
    badgeInactiveText: '#CCC3D8',

    // Finance & Charts
    income: '#D2BBFF',
    expense: '#FFB4AB',
    incomeGlow: 'rgba(210, 187, 255, 0.2)',
    expenseGlow: 'rgba(255, 180, 171, 0.2)',

    // Category Palette
    chartPalette: [
      '#D2BBFF',
      '#FFB4AB',
      '#B9C5F2',
      '#FFB4A3',
      '#A7F3D0',
      '#FDE68A',
      '#C4B5FD',
    ],

    lilac: '#7C3AED',
    lilacAccent: '#6D28D9',
    lilacGlow: 'rgba(124, 58, 237, 0.2)',
  },
  dark: {
    text: '#E0E3E5',
    textSecondary: '#CCC3D8',
    textMuted: '#94A3B8',
    background: '#101415',
    backgroundElement: '#1E293B',
    backgroundSelected: '#334155',
    primary: '#7C3AED',
    primaryHover: '#8A56FF',
    success: '#34D399',
    danger: '#FFB4AB',
    warning: '#FBBF24',
    border: '#2E2E33',
    borderSubtle: 'rgba(255, 255, 255, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.3)',

    // Card & Glassmorphism
    cardBg: 'rgba(255, 255, 255, 0.05)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    cardBorderSubtle: 'rgba(255, 255, 255, 0.05)',
    cardSeparator: '#2E2E33',

    // Badge
    badgeActiveBg: '#7C3AED',
    badgeActiveText: '#EDE0FF',
    badgeInactiveBg: 'rgba(255, 255, 255, 0.05)',
    badgeInactiveBorder: 'rgba(255, 255, 255, 0.1)',
    badgeInactiveText: '#CCC3D8',

    // Finance & Charts
    income: '#D2BBFF',
    expense: '#FFB4AB',
    incomeGlow: 'rgba(210, 187, 255, 0.2)',
    expenseGlow: 'rgba(255, 180, 171, 0.2)',

    // Category Palette
    chartPalette: [
      '#D2BBFF',
      '#FFB4AB',
      '#B9C5F2',
      '#FFB4A3',
      '#A7F3D0',
      '#FDE68A',
      '#C4B5FD',
    ],

    neon: '#7C3AED',
    neonAccent: '#8A56FF',
    neonGlow: 'rgba(124, 58, 237, 0.5)',
    lilac: '#D2BBFF',
    lilacAccent: '#EDE0FF',
    lilacGlow: 'rgba(210, 187, 255, 0.3)',
  },
  unspecified: {} as ColorScheme,
};
_colors['unspecified'] = _colors.dark;
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
