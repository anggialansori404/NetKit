# UI-FIXES NetKit v7 — Checklist Implementasi

Sumber: `UI-RESEARCH.md` (temuan MUST-FIX) + audit mockup `01-klien-light-v7.png` vs kode aktual + gate `antislop-ui`.
Art direction: DESIGN.md §6 — "buku log" light, paper `#F6F6F3`, ink `#191C20`, aksen tunggal `#0B5FFF`.

## MUST-FIX

### 1. Hapus shadow/elevation di CenterFab
- **File:** `src/ui/components.tsx` (~baris 905-913, style `centerFab`)
- **Masalah:** `elevation: 4` + `shadowColor/Offset/Opacity/Radius` = "Overly Soft Shadows" (antislop). Mockup: FAB flat, tanpa bayangan.
- **Fix:** Hapus ke-5 properti shadow/elevation. FAB tetap `backgroundColor: accent`, lingkaran penuh.
- **Kriteria selesai:** `grep -n "elevation\|shadow" src/ui/components.tsx` → kosong.

### 2. Tajamkan radius — hilangkan kesan "kartu generik"
- **File:** `src/ui/theme.ts` (token `radii`)
- **Masalah:** `radii.md: 10`, `radii.lg: 12` dipakai di ~20 tempat (search, tombol, spec sheet, tool card, log block, terminal, session row, history). "Excessive Border Radius" (antislop): radius seragam di semua elemen = default, bukan keputusan. Mockup: panel/search/sheet nyaris kotak, hanya sedikit melunak.
- **Fix:** Ubah token: `sm: 2`, `md: 4`, `lg: 6`. (`pill: 999` tetap untuk FAB/tag.) Tidak perlu ubah pemakaian satu per satu — semua ngikut token.
- **Kriteria selesai:** `theme.radii` = `{ sm: 2, md: 4, lg: 6, pill: 999 }`; tidak ada `borderRadius` hardcode di luar token.

### 3. Ganti emoji navbar → ikon garis SVG
- **File:** `src/ui/components.tsx` (`WavyNavBar`, ~baris 640-700)
- **Masalah:** Ikon nav pakai emoji `🏛 🛠 💻 📁` = "Emoji as Decoration" (antislop). Mockup `01-klien-light-v7.png`: ikon garis outline (house, wrench, terminal, folder), aktif = accent, nonaktif = dim.
- **Fix:** Buat komponen `NavIcon` baru di `components.tsx` pakai `react-native-svg` (sudah di dependencies): 4 ikon stroke `currentColor`-style (prop `color`), strokeWidth 1.8, size 22:
  - Klien: house outline; Tools: wrench; SSH: terminal `>_` ; SFTP: folder.
  - Warna: aktif `theme.colors.accent`, nonaktif `theme.colors.dim` (ganti `navIcon` Text → Svg).
- **Kriteria selesai:** Tidak ada emoji di `WavyNavBar`; ikon tampil sebagai garis, bukan gambar warna.

### 4. Pindahkan warna terminal hardcode ke theme.ts
- **File:** `src/ui/theme.ts` + `src/ui/components.tsx` (~baris 770, 781, 791)
- **Masalah:** `'#161B22'` (extraKeyRow, termInputBar) dan `'#21262D'` (extraKeyButton) hardcode di component = melanggar "Semua warna WAJIB dari theme.ts".
- **Fix:** Tambah ke `theme.colors`: `termPanel: '#161B22'`, `termKey: '#21262D'`. Ganti 3 pemakaian hardcode dengan token.
- **Kriteria selesai:** `grep -rn "#161B22\|#21262D" src/ --include="*.tsx" | grep -v theme.ts` → kosong.

### 5. Padatkan spacing baris (ritme "buku log")
- **File:** `src/ui/components.tsx` (style `clientRow`, `fileRow`, `sessionRow`)
- **Masalah:** `paddingVertical: theme.spacing.md` (12) di ClientRow/FileRow terlalu longgar ala e-commerce; mockup: baris rapat, hairline tegas, data padat.
- **Fix:**
  - `clientRow.paddingVertical`: `md` → `sm` (8)
  - `fileRow.paddingVertical`: `md` → `sm` (8)
  - `sessionRow`: `padding: md` → `paddingVertical: sm, paddingHorizontal: md`
- **Kriteria selesai:** Layar Klien muat ≥1 baris lebih banyak tanpa scroll dibanding sebelumnya; tidak ada teks terpotong.

### 6. Mono konsisten untuk SEMUA nilai data
- **File:** `src/ui/components.tsx`, `src/screens/ToolsScreen.tsx`
- **Masalah:** Sebagian nilai teknis belum mono → angka tidak tabular (UI-RESEARCH temuan #2).
- **Fix:**
  - `InstrumentHeader` statValue: sudah mono ✓ (pertahankan)
  - `ClientRow` clientEndpoint: sudah mono ✓ (pertahankan)
  - `ToolsScreen` historyTimestamp/historySummary: sudah mono ✓ (pertahankan)
  - `SpecSheet`: pastikan pemanggil memakai `isMono` untuk IP/port/latency/timestamp. Cek `ClientDetailScreen.tsx` & `ToolDetailScreen.tsx` — set `isMono: true` untuk baris bernilai teknis.
- **Kriteria selesai:** Semua IP/port/ms/timestamp di layar render dengan `DejaVu Sans Mono`.

## NICE-TO-HAVE (kerjakan bila tidak berisiko)

### 7. Tactile feedback di ChunkyButton
- **File:** `src/ui/components.tsx` (`ChunkyButton`)
- **Fix:** Varian solid: tambah `borderBottomWidth: 4`, `borderBottomColor: '#0847C2'` (accent gelap) agar terasa "chunky" mekanis. (Warna accent gelap boleh hardcode sekali sebagai derivasi, atau tambah `accentDark` ke theme — pilih tambah token.)
- **Kriteria selesai:** Tombol solid punya "kaki" 3D; tetap flat tanpa shadow.

### 8. Terminal empty state jujur
- **File:** `src/ui/components.tsx` (`TerminalView`)
- **Masalah:** Area log kosong = kotak hitam polos, terlihat rusak (antislop: "Placeholder Empty States").
- **Fix:** Jika `output` kosong, tampilkan satu baris placeholder: `>_` (termGreen) + teks dim "belum ada output — jalankan perintah". Ikuti pola: sebab + aksi.
- **Kriteria selesai:** SSH dibuka pertama kali → terlihat prompt, bukan void hitam.

## Larangan (dari task)
- Jangan ubah scope/fitur, navigasi, atau tambah/buang layar.
- Jangan ubah `android/`, `metro.config.js`, `babel.config.cjs`; tetap extensionless imports.
- Kredensial tetap Keychain/Keystore. Data client tetap direktori.
- Commit lokal tiap milestone. JANGAN push ke GitHub.
