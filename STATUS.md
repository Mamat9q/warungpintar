# STATUS — WarungPintar / SLAY HACKS 2026

**Terakhir diperbarui:** 20 Nov 2026 ~01:10 WIB
**Hackathon:** SLAY HACKS 2026 — https://slayy-hacks.devpost.com/
**Deadline:** 7 Des 2026 17:00 ET (= 8 Des 2026 05:00 WIB)
**Hadiah:** $5.000 total (Grand $2.000, Runner-Up $1.200, 3rd $800, Best Beginner $500)

## Konsep

**WarungPintar** — asisten AI berbahasa Indonesia untuk pemilik warung & UMKM:
Tanya AI (chat), Kalkulator Harga Jual, Catatan Penjualan, Manajemen Stok, Dasbor.
Gratis, tanpa instalasi, data tersimpan lokal di peramban. Build baru (bukan port
dari proyek hackathon lain).

## Yang sudah selesai

- [x] Aplikasi lengkap di `app/` (index.html, styles.css, app.js) — 5 tab, tanpa
      framework/build step, jalan dari file statis atau `python3 -m http.server`.
- [x] AI live terverifikasi: OpenRouter model gratis
      `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` menjawab 200 OK
      (diuji 20 Nov 2026 ~00:58 WIB). Rantai fallback 3 model gratis di app.js.
      Model `meta-llama/llama-3.3-70b-instruct:free`,
      `thinkingmachines/inkling-2-small:free`, dan
      `deepseek/deepseek-chat-v3.1:free` SUDAH TIDAK tersedia gratis — jangan pakai.
      `google/gemma-4-26b-a4b-it:free` dan `inclusionai/ling-3.2-flash:free`
      kadang 429 (rate limit pool bersama) — ditangani fallback otomatis.
- [x] Mode Demo jujur: tanpa kunci API, jawaban contoh ditandai "MODE DEMO".
- [x] 5 screenshot di `screenshots/` (dashboard, chat-ai, kalkulator, penjualan, stok).
- [x] Video demo `demo-video.mp4` — 1280x720 H.264, 140 detik (2m 20s), 1,2 MB,
      dibuat ffmpeg dari screenshot asli + kartu judul/penutup. Satu frame
      tengah (t=45s) diperiksa visual: OK.
- [x] `README.md`, `DEVPOST-DRAFT.md` (siap salin ke Devpost),
      `SUBMIT-CHECKLIST.md` (langkah submit untuk Boss),
      `VIDEO-SCRIPT.md` (naskah + cara tambah voice-over).
- [x] Server lokal masih jalan di VM: http://127.0.0.1:8931/ (python http.server,
      untuk pengujian; matikan bila tidak perlu).

## Hasil pengujian (Playwright + Chromium headless, /tmp/wp-test.py)

**14/14 lolos** (20 Nov 2026 ~00:59 WIB; 12/14 dulu, lalu 2 diperbaiki: favicon
404 diatasi dengan favicon data-URI, dan routing hash diuji dengan muat baru):

1. Dasbor: omzet hari ini terisi (Rp156.000 data contoh) — PASS
2. Dasbor: 7 bar grafik omzet — PASS
3. Dasbor: produk terlaris tampil (Kopi Tubruk) — PASS
4. Chat demo menjawab soal harga kopi + label MODE DEMO — PASS
5. Badge Mode Demo tampil — PASS
6. Kalkulator: HPP 3000 + margin 100% → Rp6.000 — PASS
7. Penjualan: +2 Kopi Tubruk menaikkan omzet Rp10.000 — PASS
8. Stok kopi berkurang otomatis setelah penjualan — PASS (implisit tes 7)
9. Produk baru muncul di tabel stok — PASS
10. Alur hitung → simpan ke stok (nama terisi, pindah tab) — PASS
11. Tombol unduh data ada — PASS
12. Data tersimpan setelah reload (localStorage) — PASS
13. Routing hash #chat — PASS
14. Nol error console JS — PASS

## BLOKIR — Repo GitHub belum bisa dibuat dari VM

- `create_repository` via konektor GitHub GAGAL: `403 Resource not accessible by
  integration` — GitHub App tidak punya izin membuat repo (hanya bisa menulis
  ke repo yang sudah dipilih dalam instalasi).
- `gh` CLI tidak login; TIDAK dibuat login baru (dilarang memakai PAT/token
  di luar alur konektor).
- **Yang dibutuhkan:** Boss (atau agen browser) membuat repo kosong di
  https://github.com/new — nama `warungpintar`, Public, tanpa README awal
  (2 menit). Setelah repo ada, agen push semua file lewat konektor
  (`push_files`) dan mengisi URL final di DEVPOST-DRAFT.md.
- Semua file sudah siap di `~/workspace/slay-hacks-2026/` dan tinggal push.

## Yang masih harus dilakukan Boss (setelah repo jadi)

1. Buat repo `warungpintar` (lihat atas) → beri tahu agen untuk push.
2. Aktifkan GitHub Pages (Settings → Pages) untuk tautan demo.
3. Unggah `demo-video.mp4` ke YouTube (Unlisted).
4. Isi + submit formulir Devpost sebelum 8 Des 2026 05:00 WIB
   (langkah lengkap di SUBMIT-CHECKLIST.md).
