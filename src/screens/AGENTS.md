<!-- Parent: ../../AGENTS.md -->
# Screens Subtree

User interface screens and navigation flows for NetKit network diagnostics and client management.

## Architecture
- Active Generation (v8): 11 screens (`*MD3.tsx`) using Material Design 3 via `react-native-paper` and persistent SQLite storage.
- Navigation Hierarchy: Root Stack Navigator (`App.tsx`) enclosing `MainTabs` (`createBottomTabNavigator`: Klien, Tools, SSH, SFTP) and modal screens (`ClientForm`, `ClientDetail`, `SessionForm`, `SshTerminal`, `ToolRunner`, `ToolDetail`, `Pengaturan`).
- Legacy Generation (v7): 9 unmounted screens (`*Screen.tsx` without MD3 suffix) retained for design reference.

## Key Files & Entry Points
- `src/screens/KlienScreenMD3.tsx`: Client directory hub; search, IP filtering (RFC 1918 private vs public), floating action button.
- `src/screens/ClientDetailScreenMD3.tsx`: Client detail view; quick-action triggers (Ping, Telnet, SSH, SFTP).
- `src/screens/ClientFormScreenMD3.tsx`: Client create/edit form; validates IPv4 octets and port.
- `src/screens/ToolsScreenMD3.tsx`: Diagnostic tools launcher (Ping, Telnet, DNS, HTTP/SSL).
- `src/screens/ToolRunnerScreenMD3.tsx`: Live diagnostic runner; log view and WhatsApp/Telegram share generators.
- `src/screens/ToolDetailScreenMD3.tsx`: Diagnostic run history detail.
- `src/screens/SshScreenMD3.tsx`: SSH session list and launcher.
- `src/screens/SshTerminalScreenMD3.tsx`: Full interactive SSH terminal emulator using `react-native-webview` + bundled `xterm.js`.
- `src/screens/SessionFormScreenMD3.tsx`: SSH/SFTP session credential editor.
- `src/screens/SftpScreenMD3.tsx`: SFTP remote file browser and directory lister.
- `src/screens/PengaturanScreenMD3.tsx`: Settings, SQLite diagnostics, version metadata.

## Local Invariants & Rules
- Active Navigation: `App.tsx` routes MUST only mount `*MD3.tsx` screens.
- Persistence Import: Active screens MUST import storage from `src/storage/storage-sqlite.ts`, never `storage.ts`.
- Input Validation: IPv4 inputs must validate via `isValidIpv4` (0.0.0.0 - 255.255.255.255); ports must validate via `isValidPort` (1 - 65535).
- Terminal PTY Focus: `SshTerminalScreenMD3.tsx` requires `keyboardShouldPersistTaps="always"` to maintain PTY focus.
- Hardware Back: Back navigation must cleanly exit or prompt confirmation when forms contain unsaved edits.

## Anti-Patterns & Forbidden Patterns
- NEVER import legacy screens (`*Screen.tsx` without MD3 suffix) in `App.tsx` navigation.
- NEVER import `MemoryStore` or `src/storage/storage.ts` in MD3 screens.
- NEVER execute network calls directly in UI components; delegate to `src/engine/network.ts`.
- NEVER hardcode layout padding or font sizes; use MD3 spacing tokens and `<Text variant="...">`.

## Dependencies
- Internal: `src/storage/storage-sqlite.ts`, `src/engine/network.ts`, `src/ui/md3theme.ts`
- External: `react-native-paper`, `@react-navigation/native`, `@react-navigation/bottom-tabs`, `@react-navigation/native-stack`, `react-native-webview`, `@dylankenneally/react-native-ssh-sftp`

## Cross-References
<!-- Parent: ../../AGENTS.md -->
<!-- Siblings: ../engine/AGENTS.md, ../storage/AGENTS.md, ../ui/AGENTS.md -->
