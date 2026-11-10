import "@/global.css";

import { Platform } from "react-native";

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
  neon: string;
  neonAccent: string;
  neonGlow: string;
  lilac: string;
  lilacAccent: string;
  lilacGlow: string;
};

let _colors: {
  light: ColorScheme;
  dark: ColorScheme;
  unspecified: ColorScheme;
} = {
  light: {
    text: "#18122B",
    background: "#F8F7FD",
    backgroundElement: "#FFFFFF",
    backgroundSelected: "#F1EDFA",
    textSecondary: "#6D6880",
    primary: "#7C3AED",
    success: "#10B981",
    danger: "#EF4444",
    warning: "#F59E0B",
    border: "#E9E3F5",
    shadow: "rgba(124, 58, 237, 0.08)",
    neon: "#7C3AED",
    neonAccent: "#A855F7",
    neonGlow: "rgba(124, 58, 237, 0.22)",
    lilac: "#8B5CF6",
    lilacAccent: "#C084FC",
    lilacGlow: "rgba(139, 92, 246, 0.16)",
  },
  dark: {
    text: "#F5F3FF",
    background: "#0D0B14",
    backgroundElement: "#171424",
    backgroundSelected: "#262038",
    textSecondary: "#9CA3AF",
    primary: "#A855F7",
    success: "#34D399",
    danger: "#F87171",
    warning: "#FBBF24",
    border: "#2C2540",
    shadow: "rgba(0, 0, 0, 0.4)",
    neon: "#A855F7",
    neonAccent: "#EC4899",
    neonGlow: "rgba(168, 85, 247, 0.45)",
    lilac: "#C084FC",
    lilacAccent: "#F472B6",
    lilacGlow: "rgba(192, 132, 252, 0.35)",
  },
  unspecified: {} as ColorScheme,
};
_colors["unspecified"] = _colors.light;
export const Colors = Object.freeze(_colors);
export type ColorTheme = "light" | "dark";
export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
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
