# HANDOFF BRIEF — NetKit v7 (untuk agent omh)

> Brief ini siap ditempel sebagai task Hermes. Agent pelaksana: dev (React Native).
> Prioritas: MEDIUM. Estimasi: prototype 2–3 hari kerja agent.
>
> **v7 — pivot penting (dari user):** support TIDAK bisa konek VPN dari HP, jadi
> IP lokal lembaga tidak terjangkau sama sekali. Data client = **murni pencatatan
> (direktori)**, tanpa status live. Yang dikerjakan: direktori klien + tools
> diagnostik (Ping, Telnet, DNS, HTTP/SSL ke target custom) + terminal SSH +
> SFTP browser. VpnStrip v6 SUDAH DICABUT dari desain.

## 1. Tugas

Bangun **prototype aplikasi mobile React Native** (Android dulu, iOS menyusul bila
lancar) bernama **NetKit** — toolkit teknisi lapangan untuk tim DFS Support:
direktori data koneksi client BPR + tools diagnostik + SSH + SFTP.

Dokumen acuan (WAJIB dibaca dulu, jangan ngarang):
- `~/workspace/projects/active/netkit/DESIGN.md` — konsep, user flow, data model,
  spek tiap layar, design tokens, format teks share, acceptance criteria (v7).
- Mockup v7 (nama berversi agar tidak ketuker cache — jangan timpa dengan nama yang sama):
  - `~/workspace/projects/active/netkit/mockups/01-klien-light-v7.png` (direktori)
  - `~/workspace/projects/active/netkit/mockups/02-tools-light-v7.png` (hub tools)
  - `~/workspace/projects/active/netkit/mockups/03-ping-light-v7.png` (pola layar tool)
  - `~/workspace/projects/active/netkit/mockups/04-ssh-light-v7.png` (terminal SSH)
  - `~/workspace/projects/active/netkit/mockups/05-sftp-light-v7.png` (browser SFTP)
  - `~/workspace/projects/active/netkit/mockups/06-pengaturan-light-v7-pty.png` (pengaturan, info full pty)
  (nama file berversi agar tidak ketuker cache — jangan timpa dengan nama yang sama)

Ikuti mockup sedekat mungkin: layout, warna (lihat §6 DESIGN.md), dan copywriting
Bahasa Indonesia. Kalau ada yang ambigu di mockup, DESIGN.md yang menang.

## 2. Scope prototype (fase 1) — JANGAN lebih, JANGAN kurang

1. **Direktori klien** (CRUD): nama BPR, alamat, IP gateway, port, IP VPN (catatan),
   catatan. Baris bertag `·lokal`/`·publik` via `isPrivateIp()`. TIDAK ada status
   live per klien. Detail: spec sheet + tombol "Cek koneksi" HANYA untuk target publik;
   target lokal menampilkan strip info "hanya tercatat".
2. **Tools**: Ping (ICMP best-effort, fallback TCP ping — tulis mode di output),
   Telnet (TCP connect + latency + banner), DNS, HTTP/SSL — semua ke target custom,
   hasil gaya terminal, tombol salin/bagikan, riwayat per tool.
3. **SSH**: daftar sesi + terminal **full pty** — SSH `shell` channel + xterm.js
   di WebView (bridge dua arah), extra key row (Esc/Ctrl/Tab/panah), kirim
   window-change saat resize. vim/htop harus jalan.
4. **SFTP**: daftar sesi + browser file (path bar, list, download, upload).
5. **Pengaturan**: info versi + hapus semua data (konfirmasi). Tab Info digabung ke sini.
6. Storage lokal saja (MMKV). Kredensial SSH/SFTP HANYA di Keychain/Keystore.
   Tanpa backend, tanpa login.

## 3. Tech spec

- React Native — rekomendasi **Expo + dev client** (bukan Expo Go).
- **UI: custom component kit — BUKAN React Native Paper.** Art direction "buku log"
  light (§6 DESIGN.md) tidak memetakan ke komponen Material; memaksakan Paper
  justru mengembalikan tampilan generik yang sudah ditolak user.
  Bangun komponen SEKALI di `src/ui/` sesuai tabel §6.3 DESIGN.md
  (`InstrumentHeader`, `WavyNavBar`, `CenterFab`, `TerminalSearch`, `ChunkyButton`,
  `ClientRow`, `SpecSheet`, `ToolCard`, `LogBlock`, `TerminalView`, `FileRow`,
  `SessionRow`).
- **Theming:** SATU file `src/ui/theme.ts` berisi seluruh token §6.1
  (warna, type, radius). Semua warna WAJIB dari theme —
  tidak ada hex hardcode di component.
  v7 = LIGHT theme ("paper" `#F6F6F3`, ink `#191C20`, aksen `#0B5FFF`).
  Checklist quality gate ada di §6.4 DESIGN.md (skill `antislop-ui`,
  `~/workspace/skills/antislop-ui/SKILL.md`) — agent WAJIB menjalankan
  UI Skill Checklist-nya dan semua jawaban harus yes sebelum lapor selesai.
- TCP: `react-native-tcp-socket` (TCP ping, telnet).
- SSH/SFTP: library RN dievaluasi saat implementasi (kandidat `react-native-ssh-sftp` —
  agent WAJIB verifikasi API & maintenance status library sebelum pakai, PASTIKAN
  mendukung `shell` channel dengan event data dua arah; bila tidak cocok, usulkan
  alternatif di laporan, jangan ngarang integrasi).
- Terminal: `react-native-webview` + xterm.js (full pty); extra key row custom.
- Native module kecil untuk: DNS lookup, detail sertifikat SSL, ICMP ping (best-effort).
  - Android: `InetAddress.getAllByName()` (DNS); `SSLSocket.getSession().getPeerCertificates()` (SSL).
  - iOS: `getaddrinfo` (DNS); `SecTrust` (SSL).
  - Definisikan interface JS-nya dulu; bila native belum jadi, pakai stub mock
    yang jelas ditandai `// TODO stub` agar UI bisa dites.
- Util JS `isPrivateIp()` (10/8, 172.16/12, 192.168/16, 169.254/16) + unit test.
- Navigasi: React Navigation (stack + bottom tabs custom: Klien | Tools | SSH | SFTP;
  WavyNavBar + CenterFab kontekstual per tab).
- Storage lokal: `react-native-mmkv` (client, sesi metadata, riwayat tool).
  Kredensial: Keychain (iOS) / Keystore (Android) via `react-native-keychain`.
- Share: Share API bawaan → format teks §8 DESIGN.md.
- Struktur folder: `src/screens`, `src/ui`, `src/engine` (logic tool),
  `src/storage`, `src/native` (spesifikasi interface native module).

## 4. Aturan verifikasi (wajib sebelum lapor selesai)

1. `npx tsc --noEmit` (atau setara) lolos tanpa error.
2. Build Android debug APK sukses.
3. Jalankan di emulator/device: tambah client lokal & publik → tag benar;
   ping 8.8.8.8 → hasil tampil + masuk riwayat; telnet ke host mati → TIMEOUT < 6 dtk;
   SSH ke host test → perintah `uptime` mengembalikan output; SFTP list direktori tampil;
   bagikan → teks sesuai format; restart app → data tetap ada.
4. Lampirkan di laporan: daftar file yang dibuat/diubah (termasuk untracked) +
   screenshot hasil run.

## 5. Acceptance criteria (ringkas; lengkap di §9 DESIGN.md)

- Validasi menolak IP ngawur & port invalid dengan pesan inline.
- Client IP lokal: TIDAK ada tombol cek; strip info "hanya tercatat".
- SSH: kredensial tidak tampil di log manapun.
- Terminal full pty — `top`/`vim` bisa dibuka, extra key row berfungsi.
- Tidak crash saat tool dibatalkan di tengah jalan.

## 6. Yang TIDAK dikerjakan sekarang

Whois, full-pty terminal, sinkronisasi key SSH via file import, push notification,
backend/sync, iOS build store. Itu fase 2 — jangan dicampur ke prototype ini.
