# Rework UI NetKit ke Material Design 3 (M3)

Referensi: https://m3.material.io/
Target Rework: NetKit v8 React Native (Paper MD3 + Navigation)

---

## 1. Arsitektur Token & Tema M3 (`src/ui/md3theme.ts`)
- **Color Roles**: Implementasi skema warna M3 penuh (Light & Dark).
  - Primary, Secondary, Tertiary, Surface, Surface Container (Lowest -> Highest), Outline, Error.
  - Sesuai standar M3 baseline (`#6750A4`) atau utility network blue palette (`#006495`).
- **Surface Elevation**: Menghapus hardcoded shadow/elevation; gunakan tonal color elevation (`surfaceContainer`, `surfaceContainerLow`, `surfaceContainerHigh`).
- **Typography Scale**: Display, Headline, Title, Body, Label (Large, Medium, Small).
- **Shape Scale**: None (0), XS (4), S (8), M (12), L (16), XL (28), Full (9999).

---

## 2. Shell Aplikasi & Navigasi (`App.tsx`)
- **M3 Navigation Bar (Bottom Navigation)**:
  - Tinggi 80dp, warna latar `surfaceContainer`.
  - Active indicator bentuk pill kapsul (`secondaryContainer`) mengelilingi ikon aktif (`onSecondaryContainer`).
  - Label `labelMedium` di bawah ikon.
- **M3 Floating Action Button (FAB)**:
  - Container color `primaryContainer`, ikon `onPrimaryContainer`.
  - Corner radius 16dp (M3 shape standard), bukan lingkaran penuh v2.
  - Safe area margin di atas bottom navigation bar.

---

## 3. Direktori Klien & Detail (`KlienScreenMD3`, `ClientDetailScreenMD3`, `ClientFormScreenMD3`)
- **KlienScreenMD3**:
  - M3 SearchBar bentuk pill (radius 28dp, tinggi 56dp, `surfaceContainerHigh`).
  - M3 Filter Chips: chip filter `Semua`, `Lokal`, `Publik` dengan visual checkmark aktif.
  - Client List Cards: M3 OutlinedCard dengan Monogram/Avatar BPR di kiri (`primaryContainer`), trailing status badge/chip.
  - M3 Empty State: ilustrasi/ikon besar dengan teks pendukung `bodyMedium`.
- **ClientDetailScreenMD3**:
  - M3 Outlined Cards mengelompokkan spesifikasi (Gateway, VPN, Port, Catatan).
  - Quick action bar dengan M3 Assist Chips (Salin, Cek Koneksi, Bagikan).
- **ClientFormScreenMD3**:
  - M3 Outlined TextInput dengan floating label & helper text.
  - M3 SegmentedButtons dengan corner radius M3.

---

## 4. Tools Diagnostik & Sesi Remote (`ToolsScreenMD3`, `ToolRunnerScreenMD3`, `SshScreenMD3`, `SftpScreenMD3`)
- **ToolsScreenMD3**:
  - Grid kartu instrumen menggunakan M3 Elevated Card dengan icon container `secondaryContainer`.
  - Riwayat run dalam M3 Surface Card dengan divider tonal.
- **ToolRunnerScreenMD3**:
  - M3 Progress Indicator (determinate / indeterminate).
  - Output box berlatar `surfaceContainerHighest` dengan font monospace & copy chip.
  - Action button: M3 Filled Button ("Jalankan") & M3 Assist Chips ("WhatsApp", "Telegram").
- **SshScreenMD3 & SftpScreenMD3**:
  - Daftar sesi dengan M3 Outlined Card, leading server icon, trailing action menu.

---

## 5. Pembagian Delegasi Agent
1. **Agent 1 (Token & Navigation)**:
   - File: `src/ui/md3theme.ts`, `App.tsx`.
   - Tugas: Sempurnakan token M3 Light/Dark dan perbarui Bottom Tab Bar ke M3 Navigation Bar pill indicator + M3 FAB.
2. **Agent 2 (Client Module)**:
   - File: `src/screens/KlienScreenMD3.tsx`, `src/screens/ClientDetailScreenMD3.tsx`, `src/screens/ClientFormScreenMD3.tsx`.
   - Tugas: Rework direktori klien ke M3 SearchBar pill, M3 Filter Chips, M3 Outlined Cards dengan avatar monogram.
3. **Agent 3 (Tools & Remote Module)**:
   - File: `src/screens/ToolsScreenMD3.tsx`, `src/screens/ToolRunnerScreenMD3.tsx`, `src/screens/SshScreenMD3.tsx`, `src/screens/SftpScreenMD3.tsx`.
   - Tugas: Rework kartu diagnostik M3 elevated, runner output view M3 surface container, dan sesi remote card.
