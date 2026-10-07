/**
 * NetKit MD3 Theme — STRICT Material Design 3 baseline
 * Sumber: https://m3.material.io/ (baseline light scheme, seed #6750A4)
 *
 * Prinsip: pakai MD3LightTheme dari react-native-paper TANPA kustomisasi
 * warna. Ini adalah implementasi resmi baseline MD3 untuk React Native.
 * Kustomisasi hanya di level yang diizinkan MD3 (mis. density via props).
 */

import { MD3LightTheme } from 'react-native-paper';

// Strict baseline: tidak ada override warna.
// MD3LightTheme sudah berisi token resmi:
//   primary #6750A4, onPrimary #FFFFFF,
//   primaryContainer #EADDFF, onPrimaryContainer #21005D,
//   secondary #625B71, tertiary #7D5260,
//   surface #FEF7FF, onSurface #1D1B20,
//   surfaceContainerLowest #FFFFFF … surfaceContainerHighest #E6E0E9,
//   outline #79747E, outlineVariant #CAC4D0,
//   error #B3261E, dst.
// Shape scale MD3: 0 / 4 / 8 / 12 / 16 / 28 / full (di-handle Paper).
// Type scale MD3: display/headline/title/label/body (via <Text variant>).
export const md3Theme = {
  ...MD3LightTheme,
};

export type MD3Theme = typeof md3Theme;
