# NetKit — Design Document v1.0

**Working title:** NetKit — Network Diagnostic Toolkit
**Untuk:** Tim DFS Support (PT USSI PPS) — support IBS Branchless, VA, QRIS untuk BPR/BPRS/Koperasi
**Status:** Rancangan untuk handoff implementasi ke agent (omh)
**Tanggal:** 2026-10-07

---

## 1. Ringkasan

Aplikasi mobile (React Native, Android + iOS) untuk teknisi support: menyimpan data
koneksi tiap client BPR, menjalankan diagnostik network dalam hitungan detik,
dan membagikan hasilnya ke grup WA/Telegram. Tujuannya: **komplain "nggak bisa
konek" terjawab dengan data, bukan tebakan.**

Prinsip desain: utilitarian field-tool. Padat, cepat, terbaca di bawah matahari,
semua aksi penting terjangkau jempol. Tanpa dekorasi yang tidak punya fungsi.

> **v7 — pivot (dari user):** support TIDAK bisa konek VPN dari HP, jadi IP lokal
> lembaga tidak terjangkau sama sekali. Konsekuensi:
> - Data client = **murni pencatatan (direktori)** — tanpa status live bohongan.
> - Yang tetap bisa dipakai dari HP: **ping IP custom, telnet (TCP), terminal SSH,
>   SFTP** — masing-masing jadi menu sendiri.
> - Strip VPN v6 dicabut; header client kembali jujur: `N KLIEN | N LOKAL | N PUBLIK`.

---

## 2. User Flow (v7)

```
[Klien] ──(+)──> [Form Client] ──simpan──> [Klien]      (direktori: cari, lihat, copy)
   │ tap baris
   v
[Detail Client] ── target PUBLIK: [Cek koneksi] ──> hasil ── Bagikan
                └─ target LOKAL: strip info "hanya tercatat"

[Tools] ──> [Ping] / [Telnet] / [DNS] / [HTTP/SSL] ──> hasil ── riwayat tool
[SSH]   ──> daftar sesi ──> [Terminal] (full pty: xterm.js + shell channel)
[SFTP]  ──> daftar sesi ──> [Browser file] ── download / upload
```

Flow utama:
1. Client lapor gangguan → buka NetKit → cari BPR di direktori → copy IP/detail ke grup.
2. Butuh cek cepat ke IP publik → Tools → Ping/Telnet → bagikan hasil.
3. Butuh eksekusi di server → SSH → terminal; butuh ambil/kirim file → SFTP.

## 3. Data Model

### Client
| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| id | uuid | ya | generated |
| namaBpr | string | ya | "BPR Artha Prima" |
| alamat | string | ya | "Jl. Merdeka No. 88, Bandung" |
| ipGateway | string | ya | IP mini PC gateway |
| port | integer | ya | port gateway (default 8080) |
| ipVpn | string | ya | IP VPN client |
| catatan | string | tidak | mis. "PIC: Pak Dedi 0812…" |
| createdAt / updatedAt | datetime | ya | — |

### CheckResult (satu sesi cek)
| Field | Tipe | Keterangan |
|---|---|---|
| id, clientId, timestamp | — | — |
| tcp | object | `{ ok, latencyMs, error? }` — TCP connect ke ipGateway:port, timeout 5 dtk |
| dns | object | `{ ok, hostname, ips[], latencyMs, error? }` — resolve hostname (input, default: ipGateway bila berupa hostname) |
| http | object | `{ ok, url, statusCode, latencyMs, finalUrl?, error? }` — coba HTTPS dulu, fallback HTTP |
| ssl | object | `{ ok, valid, expiresAt, daysLeft, issuer, subject, error? }` — dari handshake TLS |
| whois | object | `{ ok, domain, registrar, expiresAt, error? }` — query TCP port 43 (input domain) |

### SshSession
| Field | Tipe | Keterangan |
|---|---|---|
| id | uuid | generated |
| nama | string | "gw-bpr-artha" |
| host | string | IP/hostname publik |
| port | integer | default 22 |
| username | string | — |
| auth | enum | password / key |
| secretRef | string | referensi ke secure storage (Keychain/Keystore) — JANGAN di MMKV |

### ToolRun (riwayat per tool)
| Field | Tipe | Keterangan |
|---|---|---|
| id, tool, target, timestamp | — | — |
| ringkasan | string | "avg 14ms" / "OPEN 61ms" |
| output | string | teks penuh hasil |

### Aturan status (v7)
- Direktori klien TIDAK punya status live. Tiap baris menampilkan tag
  `·lokal` / `·publik` dari `isPrivateIp()` — jujur soal keterjangkauan.
- Cek manual hanya tersedia untuk target publik (detail client / tools).

## 4. Spesifikasi Layar (v7)

### 4.1 Klien — direktori (Home)
- Header: "NETKIT" + ikon gear (→ Pengaturan).
- Stat jujur: `N KLIEN | N LOKAL | N PUBLIK` (dari `isPrivateIp()`).
- Search (`> cari bpr / ip_`).
- Baris: nama • alamat • `ip:port` mono + tag `·lokal` (dim) / `·publik` (accent).
- Tap baris → Detail Client. FAB `+` → Form Client.
- Bottom nav (WavyNavBar): Klien | Tools | SSH | SFTP.

### 4.2 Detail Client
- Spec sheet: Alamat, IP Gateway, Port, IP VPN, Catatan — tiap baris ada ikon copy.
- Target **publik**: tombol "Cek koneksi" (TCP ke ip:port) → hasil inline + Bagikan.
- Target **lokal**: strip info "IP lokal — hanya tercatat di sini, tidak terjangkau dari HP".
- Edit / hapus (konfirmasi).

### 4.3 Form Client (Tambah/Edit)
- Field: Nama BPR*, Alamat*, IP Gateway (Mini PC)*, Port* (default 8080),
  IP VPN* (catatan saja), Catatan opsional.
- Validasi: format IPv4, port 1–65535.

### 4.4 Tools (hub)
- Grid 2×2: [PING — ip/hostname custom] [TELNET — tcp host:port]
  [DNS — lookup & reverse] [HTTP/SSL — status + sertifikat].
- Section TERAKHIR: riwayat tool (timestamp • tool • ringkasan).

### 4.5 Layar tool (pola: Ping, Telnet, DNS, HTTP/SSL)
- Input target (+ port untuk Telnet), tombol mulai, blok hasil gaya terminal,
  tombol "Salin hasil". Tiap run tersimpan ke riwayat tool.
- Telnet fase 1: connect + ukur latency + baca banner (2 dtk). Mode interaktif
  kirim-baris opsional.

### 4.6 SSH (full pty)
- Daftar sesi: nama • `user@host:port` • tap → Terminal.
- Terminal **full pty**: SSH `shell` channel (pty di sisi server) + emulator
  **xterm.js di dalam WebView**; data dipiping dua arah via bridge.
- Aplikasi interaktif (vim, htop, top) harus jalan.
- **Extra key row** di atas keyboard: `Esc` `Ctrl` `Tab` `←` `→` `|` —
  keyboard HP tidak punya tombol-tombol ini.
- Window resize → kirim `window-change` (NAWS) ke channel.
- Blok terminal tetap gaya "buku log": gelap di dalam app terang (mockup 04).
- FAB `+` → form sesi baru (host, port, username, password/key).

### 4.7 SFTP
- Daftar sesi → Browser: path bar (`/home/bpr/`), daftar file/folder
  (nama • ukuran • tanggal), tombol Download / Upload.

### 4.8 Pengaturan
- Ikon gear di header Klien. Isi: info versi + tentang singkat +
  "Hapus semua data" (konfirmasi). Tab Info digabung ke sini.

## 5. Spesifikasi Engine (v7)

| Tool | Cara kerja | Timeout | Output |
|---|---|---|---|
| Ping | Coba ICMP native; bila tak tersedia (iOS / Android non-root) → TCP ping ke 80/443. Tampilkan mode di output | 5 dtk | `avg/min/max ms`, `% loss` |
| Telnet | TCP connect ke host:port + ukur latency + baca banner 2 dtk | 5 dtk | `OPEN 61ms` / `REFUSED` / `TIMEOUT` |
| DNS | resolve + reverse (native) | 5 dtk | daftar IP / PTR |
| HTTP/SSL | GET https (fallback http), redirect maks 3; ambil peer cert | 10 dtk | status + latency; subject/issuer/notAfter/daysLeft |
| SSH | full pty: shell channel + xterm.js di WebView, extra key row, NAWS resize | — | terminal interaktif (vim/htop jalan) |
| SFTP | list / get / put via SFTP channel | — | — |

- Semua tool: bisa dibatalkan; hasil bisa disalin/dibagikan; run tersimpan di riwayat.
- `isPrivateIp()`: 10/8, 172.16/12, 192.168/16, 169.254/16 — untuk tag direktori.
- Kredensial SSH/SFTP WAJIB di secure storage (Keychain/Keystore), bukan MMKV.
- Library SSH/SFTP untuk RN dievaluasi saat implementasi
  (kandidat: `react-native-ssh-sftp`; agent wajib verifikasi API sebelum pakai).

## 6. Art Direction v4 — "Buku log" LIGHT (work order teknisi)

Evolusi dari v3 ("konsol montir"): struktur dan kepadatan dipertahankan,
tapi diterjemahkan ke LIGHT mode — bukan sekadar invert warna.
Rasanya seperti work order / logbook teknisi: kertas, tinta, tabular.

Keputusan yang bikin ini bukan template:

- **Kertas, bukan kartu.** Background paper `#F6F6F3`, permukaan putih,
  pemisah hairline. Tidak ada kartu generik bertumpuk.
- **Satu aksen** (`#0B5FFF`, biru dalam) hanya untuk aksi & fokus.
- **Data teknis SELALU monospace**, rata kanan bila berupa nilai.
- Micro-label uppercase + letterspacing HANYA untuk panel instrumen.
- Segmented control: segmen aktif = pil tinta gelap + teks putih.

### 6.1 Tokens (light)

```
bg        #F6F6F3   (paper)
panel     #FFFFFF   (permukaan: input, spec sheet, blok log)
hairline  #E0E2E8
text      #191C20   (ink)   dim #5C6470   faint #9AA1AD
accent    #0B5FFF   accentDim #E2EEFF
segmen aktif: bg #191C20 + teks putih
ok   #15803D   warn #B45309   fail #DC2626
```

### 6.2 Type

UI: Plus Jakarta Sans (nama, label). Data: DejaVu Sans Mono —
IP, port, latency, timestamp, label tombol diagnostik.

### 6.3 Komponen (custom — didefinisikan SEKALI di `src/ui/`) (v7)

| Komponen | Deskripsi |
|---|---|
| `InstrumentHeader` | Wordmark + 3 stat (angka mono besar + micro label); slot aksi kanan (gear) |
| `WavyNavBar` | Lekukan gelombang tengah; 4 destinasi: Klien \| Tools \| SSH \| SFTP; aktif = ikon+label accent |
| `CenterFab` | FAB `+` accent di lekukan; aksi kontekstual per tab (Klien: tambah klien; SSH: sesi baru) |
| `TerminalSearch` | Panel putih + prompt `>` accent + hint mono |
| `ChunkyButton` | Tombol penuh accent / outline |
| `ClientRow` | Nama • alamat • `ip:port` mono + tag `·lokal`/`·publik`; TANPA dot status |
| `SpecSheet` | Baris label:nilai + ikon copy |
| `ToolCard` | Kartu grid hub (judul mono + sub dim) |
| `LogBlock` | Blok hasil: varian terang (panel putih) & terminal (gelap, prompt hijau) |
| `TerminalView` | Terminal SSH full pty: WebView xterm.js + extra key row (Esc/Ctrl/Tab/arrows) |
| `FileRow` | Ikon folder/file • nama • ukuran mono • tanggal dim |
| `SessionRow` | Nama sesi • `user@host:port` mono |

### 6.4 Quality gate — antislop-ui (WAJIB)

Skill `~/workspace/skills/antislop-ui/SKILL.md` (dari katalog
museai-eight.vercel.app) adalah gate wajib untuk pekerjaan UI ini —
untuk mockup maupun implementasi agent. Jalankan UI Skill Checklist-nya;
semua jawaban harus **yes** sebelum presentasi/laporan selesai.

Hasil audit v4 (2026-10-07) — lolos dengan 2 tindakan:
1. **Glow pada LED dihapus** (Decorative Status Dot: dot menandai state
   real → tanpa glow, tanpa pulse).
2. Mono + micro-label uppercase dipertahankan dengan alasan tertulis:
   mono = data tabular fungsional (bukan estetika); micro-label hanya
   di panel instrumen (bukan "Generic AI Typography").
Catatan untuk implementasi: Filler Data — jangan pakai data contoh
yang terlihat real di build; state kosong/error/loading harus
menyebut sebab + aksi lanjutan (R-27).

## 7. Catatan Teknis untuk Implementasi (dibaca agent)

- **Stack:** React Native. Rekomendasi: Expo + dev client (bukan Expo Go) karena butuh native module.
- **TCP socket:** `react-native-tcp-socket` (ping TCP, telnet, whois bila perlu).
- **Storage lokal:** `react-native-mmkv` (client, sesi SSH/SFTP metadata, riwayat tool). 100% offline-first.
- **SSH/SFTP:** library RN dievaluasi saat implementasi (kandidat `react-native-ssh-sftp` —
  agent WAJIB verifikasi: mendukung `shell` channel dengan event data dua arah;
  bila tidak, usulkan alternatif). Kredensial HANYA di Keychain/Keystore.
- **Terminal full pty:** xterm.js di `react-native-webview`; bridge RN ↔ WebView untuk
  stdin/stdout; extra key row custom (Esc/Ctrl/Tab/arrows); kirim window-change
  saat resize/rotasi.
- **DNS & SSL detail:** native module kecil (Android `InetAddress`/`SSLSocket`;
  iOS `getaddrinfo`/`SecTrust`). Spesifikasikan interface JS dulu, boleh stub saat dev UI.
- **ICMP ping:** best-effort native; fallback TCP ping (tulis mode di output).
- **Share:** Share API bawaan → format teks §8.
- **Navigasi:** React Navigation (stack + bottom tabs custom WavyNavBar).

## 8. Format Teks "Bagikan Hasil"

```
[NetKit] Ping 8.8.8.8 — 07 Okt 2026 10:41
3 sent, 3 received, 0% loss, avg 12.4ms (TCP ping)

[NetKit] Telnet 103.147.8.20:9090 — 07 Okt 2026 10:41
OPEN (61 ms)
Banner: SSH-2.0-OpenSSH_8.9
```

## 9. Acceptance Criteria (untuk QA) (v7)

1. Tambah client IP lokal → baris bertag `·lokal`; IP publik → `·publik`.
2. Validasi menolak IP ngawur ("999.1.1.1") dan port di luar 1–65535.
3. Detail client IP lokal → strip info "hanya tercatat", TIDAK ada tombol cek.
4. Detail client IP publik → "Cek koneksi" jalan < 6 dtk untuk host mati (TIMEOUT).
5. Ping 8.8.8.8 → hasil tampil + tersimpan di TERAKHIR Tools.
6. SSH: sesi tersimpan, kredensial tidak tampil di log; terminal full pty — `top`/`vim` bisa dibuka, extra key row (Esc/Ctrl/Tab) berfungsi.
7. SFTP: list direktori tampil; download 1 file berhasil.
8. Bagikan → teks sesuai format §8, bisa dipaste ke WA.
9. Tutup-buka app → data tetap ada; tidak ada crash saat tool dibatalkan.

