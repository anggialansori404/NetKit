/**
 * NetKit Design Tokens — v7 Light Theme ("Buku Log")
 * Sumber kebenaran: DESIGN.md §6.1 & §6.2
 * Aturan keras: Semua warna WAJIB dari theme — tidak ada hex hardcode di component.
 */

export const theme = {
  colors: {
    bg: '#F6F6F3', // paper
    panel: '#FFFFFF', // surface: input, spec sheet, blok log
    hairline: '#E0E2E8', // border hairline
    text: '#191C20', // ink
    dim: '#5C6470', // secondary text
    faint: '#9AA1AD', // placeholder / micro labels
    accent: '#0B5FFF', // deep blue primary
    accentDim: '#E2EEFF', // light blue background / container
    segmenAktifBg: '#191C20',
    segmenAktifText: '#FFFFFF',
    ok: '#15803D',
    warn: '#B45309',
    fail: '#DC2626',
    termBg: '#0D1117',
    termText: '#D7DEE6',
    termGreen: '#4ADE80',
    termDim: '#788291',
    white: '#FFFFFF',
  },
  fonts: {
    sans: 'Plus Jakarta Sans',
    mono: 'DejaVu Sans Mono',
  },
  sizes: {
    micro: 11,
    xs: 12,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    stat: 32,
  },
  radii: {
    sm: 6,
    md: 10,
    lg: 12,
    pill: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    margin: 16,
  },
} as const;

export type Theme = typeof theme;
