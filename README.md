# WarungPintar — Asisten AI untuk Warung & UMKM Indonesia

WarungPintar membantu pemilik warung dan UMKM di Indonesia menentukan harga jual,
mencatat penjualan, dan menjaga stok — cukup bertanya dalam Bahasa Indonesia.

Dibangun untuk **SLAY HACKS 2026** (hackathon AI global, 7 Nov – 7 Des 2026).

## Fitur

- **💬 Tanya AI** — Asisten percakapan berbahasa Indonesia yang menjawab soal harga jual,
  stok dan kulakan, cara menaikkan omzet, sampai ide jualan. Jawaban memakai data warung
  Anda sendiri (produk, stok, dan penjualan 7 hari terakhir).
- **🧮 Kalkulator Harga Jual** — Masukkan modal (HPP) dan margin yang diinginkan,
  langsung dapat harga jual, laba per unit, dan saran harga psikologis (pembulatan
  500/1.000) plus perbandingan dengan harga pasar sekitar.
- **🧾 Penjualan** — Catat penjualan harian, lihat omzet dan laba 7 hari, dan riwayat
  30 transaksi terakhir.
- **📦 Stok** — Daftar produk dengan harga jual, HPP, margin, dan peringatan otomatis
  saat stok menipis atau habis.
- **📊 Dasbor** — Omzet hari ini, perkiraan laba, produk terlaris minggu ini, grafik
  omzet 7 hari, dan saran harian.
- **⬇ Unduh Data** — Semua data bisa diunduh sebagai JSON kapan saja.

## Cara menjalankan

Tidak perlu instalasi dan tidak perlu build. Cukup:

```bash
python3 -m http.server 8000
```

Lalu buka <http://localhost:8000> di peramban. Atau buka file `app/index.html`
langsung — aplikasi berjalan penuh dari file statis.

## AI: model gratis OpenRouter + Mode Demo

Asisten AI memanggil OpenRouter dengan model gratis (tanpa biaya), dicoba berurutan:

1. `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`
2. `google/gemma-4-26b-a4b-it:free`
3. `liquid/lfm-3-1.7b:free`

Daftar ini diverifikasi langsung ke `https://openrouter.ai/api/v1/models` pada
20 Nov 2026. Untuk jawaban live:

1. Buat kunci API gratis di <https://openrouter.ai/keys> (akun gratis, tanpa kartu).
2. Tempel kunci di **Tanya AI → Pengaturan AI → Simpan Kunci**.
3. Kunci hanya tersimpan di peramban Anda (localStorage) dan hanya dikirim ke
   `openrouter.ai` — tidak pernah ke server lain.

**Tanpa kunci, aplikasi berjalan dalam Mode Demo**: jawaban diambil dari contoh
yang sudah disiapkan untuk pertanyaan umum seputar warung, dan setiap jawaban
demo ditandai jelas dengan label "MODE DEMO". Semua fitur lain (kalkulator,
penjualan, stok, dasbor) berfungsi penuh tanpa kunci.

## Privasi

- Semua data warung (produk, penjualan, stok) tersimpan di peramban Anda sendiri
  (localStorage). Tidak ada server, tidak ada akun, tidak ada pelacakan.
- Kunci API OpenRouter, bila diisi, hanya tersimpan lokal dan hanya dipakai untuk
  memanggil OpenRouter.

## Teknologi

- HTML + CSS + JavaScript murni (tanpa framework, tanpa build step, tanpa dependensi).
- Data: localStorage. AI: OpenRouter API (model gratis).
- Pengujian: 14/14 skenario end-to-end lolos di Chromium headless (Playwright) —
  lihat `STATUS.md`.

## Struktur

```
app/
  index.html   # seluruh tampilan (5 tab: Dasbor, Tanya AI, Harga Jual, Penjualan, Stok)
  styles.css   # gaya, responsif untuk HP dan desktop
  app.js       # logika: data, dasbor, chat AI, kalkulator, penjualan, stok
screenshots/   # tangkapan layar tiap tab
demo-video.mp4 # video demo 2 menit 20 detik
```

## Data contoh

Saat pertama dibuka, aplikasi memuat data contoh warung "Bu Sari" (7 produk,
penjualan 7 hari) supaya semua fitur langsung bisa dicoba. Data contoh bisa
dihapus kapan saja lewat tombol **Reset Data Contoh**, dan data Anda sendiri
tetap tersimpan di peramban.

## Lisensi

MIT — bebas dipakai dan dikembangkan untuk warung dan UMKM mana pun.
