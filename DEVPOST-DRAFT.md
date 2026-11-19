# DEVPOST DRAFT — SLAY HACKS 2026

> Draf ini SIAP disalin ke formulir Devpost. JANGAN submit dari sini — submit hanya
> lewat akun Devpost Boss (lihat SUBMIT-CHECKLIST.md). Repo GitHub masih menunggu
> dibuat (langkah 1 di checklist); ganti `<REPO-URL>` di bawah setelah repo jadi.

## Project Title

**WarungPintar — Asisten AI untuk Warung & UMKM Indonesia**

## Tagline

Asisten AI berbahasa Indonesia yang membantu pemilik warung menentukan harga jual,
mencatat penjualan, dan menjaga stok — gratis, tanpa instalasi.

## Inspiration

Di Indonesia ada lebih dari 60 juta UMKM, dan jutaan di antaranya adalah warung
kelontong — toko kecil yang jadi tulang punggung ekonomi lingkungan. Pemilik warung
menentukan harga jual dari kebiasaan dan perkiraan, bukan dari hitungan. Akibatnya
banyak yang menjual terlalu murah (untung tipis) atau terlalu mahal (pelanggan pindah),
tidak tahu produk mana yang benar-benar menguntungkan, dan sering kehabisan stok
produk laris tanpa sadar. Sementara itu, alat bisnis yang ada kebanyakan berbahasa
Inggris, berbayar, dan terlalu rumit untuk pemilik warung yang sehari-harinya
berjualan, bukan duduk di depan komputer. WarungPintar lahir dari masalah itu:
sebuah asisten yang bisa ditanya dengan Bahasa Indonesia sehari-hari, gratis,
dan langsung bisa dipakai dari HP.

## What it does

WarungPintar adalah aplikasi web untuk pemilik warung dan UMKM dengan lima bagian:

- **Tanya AI** — Asisten percakapan berbahasa Indonesia. Pemilik warung bertanya
  seperti berbicara dengan tetangga: "Berapa harga jual kopi yang pas?" atau "Stok
  apa yang harus saya kulak besok?" Jawabannya memakai data warung itu sendiri.
- **Kalkulator Harga Jual** — Masukkan modal (HPP) dan margin yang diinginkan,
  langsung dapat harga jual, laba per unit, saran pembulatan harga, dan perbandingan
  dengan harga pasar sekitar.
- **Penjualan** — Catat penjualan harian; omzet dan laba 7 hari langsung terhitung,
  lengkap dengan riwayat transaksi.
- **Stok** — Daftar produk dengan margin masing-masing dan peringatan otomatis saat
  stok menipis atau habis.
- **Dasbor** — Omzet hari ini, laba, produk terlaris minggu ini, grafik omzet 7 hari,
  dan saran harian.

Semua data tersimpan di peramban pengguna sendiri — tidak ada akun, tidak ada server,
tidak ada biaya.

## How we built it

- **Frontend:** HTML, CSS, dan JavaScript murni — tanpa framework, tanpa build step,
  tanpa dependensi — supaya aplikasi ringan dan bisa dibuka dari HP mana pun, bahkan
  lewat file statis.
- **AI:** OpenRouter API dengan model gratis (tanpa biaya), dicoba berurutan:
  `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free`, lalu
  `google/gemma-4-26b-a4b-it:free`, lalu `liquid/lfm-3-1.7b:free`. Setiap prompt
  sistem disertai konteks nyata warung pengguna (daftar produk, harga, stok,
  penjualan 7 hari) sehingga jawaban AI spesifik dan bisa langsung dipakai.
- **Mode Demo yang jujur:** Tanpa kunci API, aplikasi tetap berfungsi penuh dengan
  jawaban contoh untuk pertanyaan umum — dan setiap jawaban contoh ditandai jelas
  "MODE DEMO" supaya tidak ada yang tertipu mengira itu jawaban live.
- **Data:** localStorage di peramban; ekspor JSON satu klik.
- **Pengujian:** 14/14 skenario end-to-end lolos di Chromium headless (Playwright):
  dasbor, chat demo, kalkulator, tambah penjualan, tambah stok, alur
  hitung-ke-stok, penyimpanan setelah reload, routing hash, dan nol error console.

## Challenges we ran into

- **Model gratis yang berubah-ubah:** Dua model gratis yang pertama dicoba ternyata
  sudah tidak tersedia gratis lagi saat diuji langsung. Solusinya: mengambil daftar
  model gratis terbaru dari API OpenRouter, menguji satu per satu, dan membangun
  rantai fallback tiga model supaya satu model yang sedang limit tidak mematikan
  fitur AI.
- **Rate limit pool bersama:** Model gratis berbagi kuota dengan semua pengguna
  OpenRouter, sehingga kadang menjawab 429. Solusinya: fallback otomatis antar
  model, lalu ke Mode Demo dengan penjelasan yang jujur, bukan jawaban palsu.
- **Membuat AI berguna tanpa data besar:** Pemilik warung tidak punya riwayat
  penjualan digital. Solusinya: konteks prompt dibangun dari data yang dicatat
  di aplikasi itu sendiri, dan data contoh warung disertakan supaya fitur langsung
  bisa dicoba dari detik pertama.

## Accomplishments that we're proud of

- Aplikasi lengkap dan teruji end-to-end (14/14 tes lolos) dalam satu sesi build.
- AI yang benar-benar memakai data warung pengguna, bukan jawaban generik.
- Mode Demo yang transparan: fitur tetap bisa dicoba tanpa kunci, tanpa
  menyembunyikan bahwa itu jawaban contoh.
- Nol biaya untuk pengguna akhir: tanpa akun, tanpa server, tanpa langganan.

## What we learned

- Model AI gratis bisa diandalkan untuk produk nyata asalkan ada fallback berlapis
  dan kegagalan ditangani dengan jujur.
- Untuk pengguna non-teknis, yang terpenting bukan kecanggihan model, tapi jawaban
  yang memakai angka mereka sendiri — "kopi Anda" lebih berguna daripada "kopi
  pada umumnya".
- Transparansi soal keterbatasan (Mode Demo, rate limit) justru membangun
  kepercayaan, bukan menguranginya.

## What's next for WarungPintar

- Pengingat kulakan berbasis pola penjualan (produk apa yang habis hari apa).
- Saran paket hemat otomatis dari produk yang sering dibeli bersamaan.
- Mode suara: tanya lewat suara untuk pemilik warung yang lebih nyaman berbicara
  daripada mengetik.
- Ekspor laporan bulanan (PDF) untuk keperluan pencatatan dan pengajuan modal usaha.

## Links (isi saat submit)

- **Demo langsung:** jalankan `python3 -m http.server` di folder repo, atau buka
  `app/index.html` (bisa juga di-deploy gratis ke GitHub Pages dari repo ini).
- **Kode sumber:** https://github.com/Mamat9q/warungpintar
- **Video demo:** `demo-video.mp4` di repo (2 menit 20 detik) — unggah ke YouTube
  sebagai "Unlisted" lalu tempel tautannya di Devpost.

## Team

- **Mat Lail Fajri** (solo) — Indonesia, GitHub: Mamat9q

## Catatan kejujuran untuk juri

- AI memakai model gratis OpenRouter. Tanpa kunci API gratis, jawaban chat berasal
  dari contoh yang disiapkan (Mode Demo) dan selalu ditandai jelas sebagai contoh.
- Semua angka di data contoh adalah data fiktif untuk demonstrasi; pengguna
  memasukkan data warung mereka sendiri saat memakai aplikasi.
