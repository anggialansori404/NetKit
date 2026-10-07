# UI Research NetKit v7: Temuan "Kureng" & Analisis Desain

## Referensi: Gaya "Buku Log" (Fing dkk)
Aplikasi network toolkit yang solid (seperti Fing) terasa "padat dan jujur" karena:
1. **Data-first:** Tipografi monospaced yang rapi untuk IP, MAC, dan log.
2. **Kerapatan Tinggi:** Mengutamakan seberapa banyak baris data masuk layar tanpa terasa sumpek.
3. **Desain Utilitarian:** Bebas ornamen (shadow, gradien, border-radius berlebihan). Fungsi di atas gaya UI modern/generik.

## Temuan Prioritas (MUST-FIX)

### 1. Pelanggaran Palet & Gejala "AI Slop"
- **Lokasi:** `src/ui/components.tsx`
- **Masalah:** Beberapa komponen dasar masih terasa seperti UI library material/generik. Sering kali ada sisa-sisa rounded corner tebal, drop-shadow, atau abu-abu pudar di luar palet resmi (Paper `#F6F6F3`, Ink `#191C20`, Accent `#0B5FFF`).
- **Bukti:** DESIGN.md §6 melarang keras penggunaan gaya Material/Paper dan meminta visual tajam layaknya "buku log" atau kertas cetak. Mockup (01-06) sangat flat dengan outline tegas.
- **Saran:** Hapus semua shadow/elevation. Hapus border-radius berlebihan (buat kotak/tajam). Pastikan semua border, background, dan teks strict menggunakan warna dari `theme.ts`.

### 2. Tipografi & Ritme Tabel Data Lemah
- **Lokasi:** `src/ui/components.tsx` (`InstrumentHeader`, `ClientRow`, `LogBlock`)
- **Masalah:** Nilai statistik teknis (IP address, MAC address, port, ping ms) tidak konsisten menggunakan font mono. Akibatnya, angka tidak sejajar/rata secara vertikal (ritme rusak).
- **Bukti:** Di mockup `01-klien-light-v7.png`, barisan IP/MAC tersusun rapi layaknya tabel log, sangat mudah dipindai mata dengan cepat.
- **Saran:** Wajib gunakan `fontFamily: 'monospace'` (atau font mono platform) untuk semua value data numerik/jaringan. Tambahkan border bawah tipis (`1px solid ink`) pada baris list untuk pemisah tegas.

### 3. Spacing Terlalu Longgar (Kurang Padat)
- **Lokasi:** `src/screens/KlienScreen.tsx`, `src/screens/ToolsScreen.tsx`
- **Masalah:** Padding pada row dan card terlalu luas, meniru aplikasi e-commerce/sosmed. Layar menampung terlalu sedikit informasi.
- **Bukti:** Aplikasi semacam Fing dan Network Analyzer menuntut kepadatan instrumen (instrument header/list). Spacing longgar membuat user kehilangan konteks teknis karena terlalu banyak scroll.
- **Saran:** Pangkas `padding` vertikal pada `ClientRow`, `FileRow`, dan `SessionRow`. Perkecil ukuran font pada micro-label untuk memadatkan view.

## Temuan Tambahan (NICE-TO-HAVE)

### 1. Feedback Interaksi Kurang "Tactile"
- **Lokasi:** `src/ui/components.tsx` (`ChunkyButton`, `CenterFab`)
- **Masalah:** Tombol saklar/alat berat saat ditekan terasa biasa, kurang "clunky/chunky" sesuai spesifikasi nama.
- **Saran:** Terapkan border solid (misal `borderBottomWidth: 4`) yang bereaksi terhadap tap (border menipis atau translasi Y) agar terasa mekanis ala tombol hardware.

### 2. Terminal Empty State Polos
- **Lokasi:** `src/ui/components.tsx` (`TerminalView`), `src/screens/ToolRunnerScreen.tsx`
- **Masalah:** Area log hitam kosong terkesan seperti area rusak sebelum data log pertama kali masuk.
- **Saran:** Beri indikator placeholder monospaced (misal `>_` atau kursor statis blok putih/ink) untuk menegaskan fungsi terminal.