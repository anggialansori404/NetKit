# NetKit — Catatan verifikasi teknis (riset 2026-10-07)

Suplemen untuk HANDOFF-OMH.md. Hasil verifikasi library — silakan dilipat ke brief
sebelum handoff ke agent omh.

## Temuan utama: TIDAK perlu tulis native module custom (Kotlin/Swift)

Brief saat ini (§3 HANDOFF-OMH.md) meminta agent menulis native module kecil untuk
DNS lookup & detail sertifikat SSL. Verifikasi menunjukkan keduanya sudah ter-cover
library yang maintained — bagian paling berisiko di prototype ini bisa dihapus.

### 1. SSL detail — `react-native-tcp-socket` sudah punya `getPeerCertificate()`

- Library: `react-native-tcp-socket` v6.x (Rapsssito, MIT, commit terakhir ~Sep 2026,
  395 stars, RN >= 0.60). Sumber: https://github.com/rapsssito/react-native-tcp-socket
- `tls.connectTLS({host, port})` → event `secureConnect` → `socket.getPeerCertificate()`
  mengembalikan info sertifikat peer (subject, issuer, valid_from/valid_to — bentuk
  persisnya mengikuti Node `tls.getPeerCertificate`, dengan sedikit perbedaan interface
  yang ditandai di README; **verifikasi bentuk return saat build**).
- Artinya: SSL check (valid hingga kapan, sisa hari, issuer, warning < 30 hari, deteksi
  expired) bisa dikerjakan murni dari JS via library ini. Tanpa `SSLSocket` custom di
  Kotlin, tanpa `SecTrust` custom di Swift.
- Catatan: bila `ca` tidak diisi, handshake memakai trust store bawaan device (perilaku
  yang diinginkan untuk alat diagnostik). Opsi `connectTimeout` tersedia untuk timeout.

### 2. DNS lookup — dua opsi tanpa native code custom

- **Opsi A (disarankan): DNS-over-HTTPS via `fetch`** — `https://dns.google/resolve?name=<host>&type=A`.
  Pure JS, nol native dependency, hasil JSON berisi daftar IP + TTL. Kelemahan: butuh
  akses ke dns.google (jarang diblokir, tapi sebutkan sebagai fallback).
- **Opsi B: `react-native-dns-lookup`** (npm) — `getIpAddressesForHostname("host")` → `Promise<string[]>`,
  memakai API networking bawaan iOS/Android. Ini library prebuilt (autolink), BUKAN code
  custom yang ditulis agent — tetap kompatibel dengan Expo dev client.
- Keduanya menghilangkan kebutuhan `InetAddress.getAllByName()` / `getaddrinfo` custom.

### 3. TCP port check & whois (fase 2) — library yang sama

- `TcpSocket.createConnection({host, port, connectTimeout})` → ukur waktu connect =
  TCP port check + "TCP ping" (pengganti ping ICMP yang memang tidak bisa di mobile
  tanpa root).
- Whois fase 2: TCP biasa ke port 43, tulis `domain\r\n`, baca respons — tidak ada
  library khusus yang dibutuhkan.

### 4. Expo: dev client wajib, Expo Go tidak bisa — sudah benar di brief

- Konfirmasi: custom native module (apa pun, termasuk dari library di atas) TIDAK jalan
  di Expo Go (sandbox prebuilt). Brief sudah benar merekomendasikan Expo + dev client.
- Untuk testing cepat di HP Kang Anggi: `npx expo run:android` (perlu Android SDK di VM —
  cek ketersediaan) atau EAS Build (cloud, menghasilkan APK).

## Rekomendasi perubahan ke HANDOFF-OMH.md §3

Ganti bullet "Native module kecil untuk: DNS lookup & detail sertifikat SSL" menjadi:

- **SSL detail:** pakai `TLSSocket.getPeerCertificate()` dari `react-native-tcp-socket`
  (verifikasi bentuk return saat implementasi; fallback: native module hanya bila
  field yang dibutuhkan tidak tersedia).
- **DNS:** DNS-over-HTTPS via fetch (primer); `react-native-dns-lookup` sebagai fallback.
  Tidak ada native code custom.
- **Storage:** brief menyebut `react-native-mmkv` — tetap valid; alternatif Expo SDK
  `@react-native-async-storage/async-storage` bila MMKV bermasalah di dev client.

Dampak estimasi: menghilangkan satu-satunya pekerjaan Kotlin+Swift dari prototype —
estimasi 1–2 hari kerja agent menjadi lebih realistis.
