/**
 * NetKit MD3 Theme — STRICT Material Design 3 baseline
 * Sumber: https://m3.material.io/ (baseline light scheme, seed #6750A4)
 *
 * Prinsip: pakai MD3LightTheme / MD3DarkTheme dari react-native-paper TANPA
 * kustomisasi warna. Ini adalah implementasi resmi baseline MD3 untuk React
 * Native. Kustomisasi hanya di level yang diizinkan MD3 (mis. density via props).
 *
 * Color roles yang tersedia di MD3LightTheme.colors (baseline #6750A4):
 *   primary              #6750A4    onPrimary              #FFFFFF
 *   primaryContainer     #EADDFF    onPrimaryContainer     #21005D
 *   secondary            #625B71    onSecondary            #FFFFFF
 *   secondaryContainer   #E8DEF8    onSecondaryContainer   #1D192B
 *   tertiary             #7D5260    onTertiary             #FFFFFF
 *   tertiaryContainer    #FFD8E4    onTertiaryContainer    #31111D
 *   surface              #FEF7FF    onSurface              #1D1B20
 *   surfaceVariant       #E7E0EC    onSurfaceVariant       #49454F
 *   surfaceContainerLowest  #FFFFFF
 *   surfaceContainerLow     #F7F2FA
 *   surfaceContainer        #F3EDF7
 *   surfaceContainerHigh    #ECE6F0
 *   surfaceContainerHighest #E6E0E9
 *   outline              #79747E    outlineVariant         #CAC4D0
 *   error                #B3261E    onError                #FFFFFF
 *   errorContainer       #F9DEDC    onErrorContainer       #410002
 *   inverseSurface       #322F35    inverseOnSurface       #F5EFF7
 *   inversePrimary       #D0BCFF
 *   background           #FEF7FF    onBackground           #1D1B20
 *   shadow               #000000    scrim                  #000000
 *
 * Dark variants: same roles, inverted luminance (MD3DarkTheme baseline).
 *
 * Shape scale MD3: 0 / 4 / 8 / 12 / 16 / 28 / full (di-handle Paper).
 * Type scale MD3: display/headline/title/label/body (via <Text variant>).
 */

import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Strict baseline: tidak ada override warna.
export const md3Theme = {
  ...MD3LightTheme,
};

export const md3DarkTheme = {
  ...MD3DarkTheme,
};

export type MD3Theme = typeof md3Theme;
