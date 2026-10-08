# NetKit Knowledge Base

Network diagnostic and client management mobile utility for BPR and banking field engineers, built with React Native 0.87.1, React 19.3.0, and Android SDK 37.

## Architecture Overview
NetKit operates on a modular architecture divided into active Material Design 3 screens, SQLite persistence, and a decoupled TypeScript network engine:
- Presentation: Active v8 screens (`src/screens/*MD3.tsx`) use `react-native-paper` baseline theme and React Navigation (Stack + BottomTabs). Legacy v7 screens (`src/screens/*Screen.tsx`) remain unmounted.
- Persistence: Active storage (`src/storage/storage-sqlite.ts`) operates directly on SQLite (`netkit.db`) via `@op-engineering/op-sqlite` JSI bindings.
- Diagnostics Engine: Pure TypeScript logic (`src/engine/network.ts`) handles IPv4 validation, RFC 1918 detection, share formatting, and Ping/Telnet/DoH/SSL runners.
- Native Host: Android project (`android/`) with Hermes engine, New Architecture enabled, and bundled WebView terminal assets.

## Subtree Map
| Directory | AGENTS.md | Responsibility | Key Exports / Entry Points |
|---|---|---|---|
| `src/screens` | [src/screens/AGENTS.md](src/screens/AGENTS.md) | Active v8 MD3 screens, modal dialogs, and navigation | `src/screens/KlienScreenMD3.tsx`, `src/screens/SshTerminalScreenMD3.tsx` |
| `src/engine` | [src/engine/AGENTS.md](src/engine/AGENTS.md) | Network diagnostics, IP validation, share formatters | `src/engine/network.ts`, `src/engine/__tests__/network.test.ts` |
| `src/storage` | [src/storage/AGENTS.md](src/storage/AGENTS.md) | SQLite database layer (`netkit.db`) & mock fallback | `src/storage/storage-sqlite.ts`, `src/storage/storage.ts` |
| `src/ui` | [src/ui/AGENTS.md](src/ui/AGENTS.md) | Material Design 3 baseline theme & legacy tokens | `src/ui/md3theme.ts`, `src/ui/theme.ts`, `src/ui/components.tsx` |
| `android` | [android/AGENTS.md](android/AGENTS.md) | Native Gradle build, Hermes/NewArch setup, PTY assets | `android/build.gradle`, `android/app/build.gradle` |

## Essential Commands
```bash
# Run engine test suite (Node test runner)
npm test

# Typecheck TypeScript codebase
npx tsc --noEmit

# Start Metro bundler
npx react-native start

# Run on connected Android device/emulator
npx react-native run-android

# Build standalone debug APK (includes offline JS bundle)
cd android && ./gradlew assembleDebug --no-daemon

# Build release APK
cd android && ./gradlew assembleRelease --no-daemon
```

## Central Invariants
- Route Isolation: `App.tsx` routes MUST exclusively mount `*MD3.tsx` screens. Unmounted legacy screens in `src/screens/` are design archives.
- Persistence Layer: Active application components MUST import storage from `src/storage/storage-sqlite.ts`, never `src/storage/storage.ts`.
- RFC 1918 Classification: Client IP classification MUST run through `isPrivateIp` in `src/engine/network.ts` (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16).
- Share Layout Conformity: Diagnostic report format strings for WhatsApp/Telegram MUST match `DESIGN.md §8` layout exactly (verified by `src/engine/__tests__/network.test.ts`).
- Standalone Debug APK: `android/app/build.gradle` defines `debuggableVariants = []` to bundle JS directly into debug APK for offline field device testing.
- Platform Engine: React Native New Architecture (`newArchEnabled=true`) and Hermes (`hermesEnabled=true`) are strictly enabled.

## Anti-Patterns & Forbidden Patterns
- NEVER import legacy screens without MD3 suffix into `App.tsx` navigation.
- NEVER import `MemoryStore` or `src/storage/storage.ts` in MD3 screens.
- NEVER execute diagnostic network requests directly inside UI components; route through `src/engine/network.ts`.
- NEVER bypass or remove `debuggableVariants = []` in `android/app/build.gradle`.
- NEVER use soft deletes for client records; deletions must permanently execute `DELETE FROM clients WHERE id = ?`.
- NEVER use arbitrary hardcoded hex colors in MD3 screens; consume `react-native-paper` theme tokens.

## Key Files
- `App.tsx`: Main React Native application root, PaperProvider setup, and navigation hierarchies.
- `index.js`: AppRegistry bootstrap file.
- `package.json`: Manifest declaring ES modules (`type: "module"`), dependencies, and test runner.
- `tsconfig.json`: TypeScript compiler configuration using bundler module resolution.
- `DESIGN.md`: UI reference documentation, color tokens, and share format specifications (§8).
- `TECH-NOTES.md`: Architecture transition notes from v7 retro layout to v8 Material 3.
- `PRE-PUSH-CHECKLIST.md`: Quality checklist covering deletion persistence, back buttons, and APK builds.
