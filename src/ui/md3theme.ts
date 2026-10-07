/**
 * NetKit MD3 Theme — Material Design 3 by Google
 * Base: react-native-paper MD3LightTheme, customized for NetKit.
 * Density: compact (user feedback: custom UI "gak compact").
 */

import { MD3LightTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  // Use system fonts for reliability; Paper handles the MD3 type scale.
  fontFamily: 'sans-serif',
} as const;

export const md3Theme = {
  ...MD3LightTheme,
  // Brand: deep blue primary (from original NetKit identity)
  colors: {
    ...MD3LightTheme.colors,
    primary: '#0B5FFF',
    onPrimary: '#FFFFFF',
    primaryContainer: '#E2EEFF',
    onPrimaryContainer: '#001D35',
    secondary: '#5C6470',
    surface: '#FFFFFF',
    surfaceVariant: '#F6F6F3',
    background: '#F6F6F3',
    outline: '#E0E2E8',
  },
  // Compact density: tighter spacing than default MD3
  // (applied via component props like `density="compact"` where supported,
  // and reduced content padding in screens)
  fonts: configureFonts({ config: fontConfig }),
};

export type MD3Theme = typeof md3Theme;
