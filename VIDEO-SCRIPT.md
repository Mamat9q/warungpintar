# VIDEO SCRIPT — Demo WarungPintar (2 menit 20 detik)

File jadi: `demo-video.mp4` — 1280x720, H.264, 140 detik, tanpa suara.
Video ini dibuat dari tangkapan layar aplikasi asli dengan teks penjelasan di
setiap adegan. Voice-over belum direkam — Boss (atau agen) bisa merekam sulih
suara berbahasa Indonesia mengikuti naskah di bawah dan menempelkannya ke video
dengan ffmpeg bila diinginkan. Tanpa voice-over pun video sudah lengkap karena
setiap adegan membawa teks.

## Naskah per adegan

### 0:00 – 0:08 — Kartu judul
**Teks layar:** "WarungPintar — Asisten AI untuk Warung dan UMKM Indonesia"
**Narasi:** "WarungPintar — asisten AI berbahasa Indonesia untuk pemilik warung
dan UMKM."

### 0:08 – 0:33 — Dasbor
**Teks layar:** "Dasbor: omzet, laba, dan stok menipis dalam satu layar"
**Narasi:** "Begitu dibuka, pemilik warung langsung melihat omzet hari ini,
perkiraan laba, produk terlaris minggu ini, dan produk apa yang stoknya menipis.
Semua angka dihitung dari penjualan yang dicatat di aplikasi — bukan angka karangan."

### 0:33 – 1:03 — Tanya AI
**Teks layar:** "Tanya AI: jawab dalam Bahasa Indonesia, pakai data warung Anda"
**Narasi:** "Ini intinya. Pemilik warung bertanya dengan Bahasa Indonesia
sehari-hari — 'Berapa harga jual kopi yang pas?' — dan AI menjawab memakai data
warung itu sendiri: modalnya, harga jualnya sekarang, dan marginnya. AI memakai
model gratis OpenRouter, dan kalau belum ada kunci API, aplikasi memakai Mode Demo
yang ditandai jelas sebagai jawaban contoh."

### 1:03 – 1:28 — Kalkulator Harga Jual
**Teks layar:** "Kalkulator harga jual: HPP plus margin jadi harga yang pas"
**Narasi:** "Tidak yakin menentukan harga? Masukkan modal dan margin yang
diinginkan — aplikasi menghitung harga jual, laba per unit, dan membandingkannya
dengan harga pasar di sekitar. Harga hasil hitungan bisa langsung disimpan sebagai
produk baru di stok."

### 1:28 – 1:48 — Penjualan
**Teks layar:** "Catat penjualan: omzet dan laba langsung terhitung"
**Narasi:** "Setiap penjualan dicatat dalam hitungan detik. Omzet dan laba tujuh
hari langsung terhitung, dan stok produk otomatis berkurang."

### 1:48 – 2:08 — Stok
**Teks layar:** "Stok: peringatan otomatis sebelum barang habis"
**Narasi:** "Di tab stok, pemilik warung melihat nilai persediaan, margin tiap
produk, dan peringatan otomatis untuk produk yang harus segera dikulak — sebelum
pelanggan kecewa karena barang habis."

### 2:08 – 2:20 — Kartu penutup
**Teks layar:** "Gratis, tanpa instalasi"
**Narasi:** "WarungPintar — gratis, tanpa instalasi, tanpa akun. Dibangun untuk
SLAY HACKS 2026."

## Cara membuat ulang video

```bash
bash /tmp/make-video.sh   # skrip di VM; membaca screenshots/ dan menulis demo-video.mp4
```

## Cara menambah voice-over (opsional)

1. Rekam narasi di atas (HP juga cukup), simpan sebagai `narasi.mp3`.
2. Gabungkan:
   `ffmpeg -i demo-video.mp4 -i narasi.mp3 -c:v copy -c:a aac -shortest demo-video-vo.mp4`
3. Unggah versi dengan voice-over ke YouTube (Unlisted) untuk Devpost.
