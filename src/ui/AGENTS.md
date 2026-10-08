<!-- Parent: ../../AGENTS.md -->
# UI Subtree

Design system tokens, Material Design 3 baseline theme, and reusable component libraries.

## Architecture
- Active System (`md3theme.ts`): Strict baseline Material Design 3 theme via `react-native-paper` (`MD3LightTheme`).
- Legacy System (`theme.ts`, `components.tsx`): Custom "Buku Log" retro terminal tokens and SVG instrument components.

## Key Files & Entry Points
- `src/ui/md3theme.ts`: Active MD3 baseline theme definition:
  - Seed color: `#6750A4` (Purple baseline).
  - Primary tokens: `primary` (#6750A4), `onPrimary` (#FFFFFF), `surface` (#FEF7FF), `error` (#B3261E).
  - Type scale: Paper type tokens (`display*`, `headline*`, `title*`, `label*`, `body*`).
- `src/ui/theme.ts`: Legacy tokens (`theme.colors.paper`, `theme.colors.primary`, border styles).
- `src/ui/components.tsx`: Legacy custom components (`InstrumentHeader`, `ChunkyButton`, `TerminalSearch`, `WavyNavBar`).

## Local Invariants & Rules
- Strict MD3 Baseline: Do not override colors in `md3Theme`. Preserve official Material 3 color assignments.
- Typography: Use `<Text variant="...">` from `react-native-paper` instead of custom font sizes or manual text styling.
- Component Source: Active screens must consume components from `react-native-paper` (e.g. `Card`, `Button`, `TextInput`, `FAB`, `Appbar`).

## Anti-Patterns & Forbidden Patterns
- NEVER mix legacy `components.tsx` components inside `*MD3.tsx` screens.
- NEVER override `md3Theme` colors with arbitrary hex colors in screen stylesheets.
- NEVER use raw `react-native` `Text` with inline `fontSize`; always use `react-native-paper` `Text` with `variant`.

## Dependencies
- External: `react-native-paper`, `react-native-safe-area-context`, `react-native-vector-icons`, `react-native-svg`

## Cross-References
<!-- Parent: ../../AGENTS.md -->
<!-- Siblings: ../screens/AGENTS.md, ../engine/AGENTS.md, ../storage/AGENTS.md -->
