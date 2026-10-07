# Ceklis Pre-Push NetKit

WAJIB jalan sebelum commit & push. Ditaruh sini biar nggak keulang: bug navigasi & FAB
yang lolos di build #12–#15 semuanya ketangkep sama ceklis ini.

## 1. Peta navigasi (kelas bug paling sering — cek satu-satu)

| Aksi | Harusnya ke |
|---|---|
| Tap baris sesi SSH | `SshTerminal` (terminal xterm.js + pty), **BUKAN** `ToolRunner` |
| Tap tools (ping/telnet/DNS/HTTP-SSL) | `ToolRunner` |
| Tap baris klien | `ClientDetail` |
| Tombol tambah / edit klien | `ClientForm` |
| FAB di tab SSH / SFTP | `SessionForm` |
| Gear di header | `Settings` |

## 2. FAB

Muncul di tab **Klien, SSH, SFTP** — bukan cuma Klien.

## 3. Form

- Form klien (tambah **dan** edit): ada pilihan label IP **Otomatis/Lokal/Publik**
- Form sesi SSH: ada field **password**

## 4. Hapus = beneran hilang

Hapus sesi SSH/SFTP/klien → tutup app → buka lagi → data **tidak** muncul lagi (SQLite).

## 5. Build check lokal

- `npx tsc --noEmit` → exit 0
- `npm test` → 7/7 lulus
- `npx react-native bundle` → sukses

## 6. APK

Release asset `app-debug.apk` tag `debug` harus berisi `assets/index.android.bundle`
(bukan red screen "Unable to load script").
