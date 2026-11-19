/* WarungPintar — Asisten AI untuk Warung & UMKM Indonesia.
   Semua data tersimpan lokal di peramban (localStorage). Tidak ada server,
   tidak ada pelacakan. AI memakai OpenRouter model gratis; tanpa kunci API,
   aplikasi berjalan dalam Mode Demo yang ditandai jelas. */
(function () {
  'use strict';

  var LS_KEY = 'warungpintar_v1';
  var LS_API_KEY = 'warungpintar_openrouter_key';

  /* Model gratis OpenRouter, dicoba berurutan sampai ada yang menjawab.
     Daftar ini diverifikasi langsung ke https://openrouter.ai/api/v1/models
     pada 20 Nov 2026 — model :free yang masih tersedia saat itu. */
  var FREE_MODELS = [
    'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
    'google/gemma-4-26b-a4b-it:free',
    'liquid/lfm-3-1.7b:free'
  ];

  /* ---------- util ---------- */
  function rp(n) { return 'Rp' + Math.round(n).toLocaleString('id-ID'); }
  function todayISO(d) {
    d = d || new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }
  function fmtDate(iso) {
    var p = iso.split('-');
    var names = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return parseInt(p[2], 10) + ' ' + names[parseInt(p[1], 10) - 1] + ' ' + p[0];
  }
  function el(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  /* ---------- data contoh (seed) ---------- */
  function seedState() {
    var t = new Date();
    function daysAgo(n) { var d = new Date(t); d.setDate(d.getDate() - n); return todayISO(d); }
    var products = [
      { id: 'p1', name: 'Kopi Tubruk', price: 5000, hpp: 2500, stock: 42, min: 10 },
      { id: 'p2', name: 'Indomie Goreng', price: 12000, hpp: 8000, stock: 18, min: 10 },
      { id: 'p3', name: 'Teh Manis Panas', price: 4000, hpp: 1500, stock: 30, min: 10 },
      { id: 'p4', name: 'Gula Pasir 1kg', price: 17500, hpp: 15500, stock: 6, min: 8 },
      { id: 'p5', name: 'Aqua 600ml', price: 5000, hpp: 3500, stock: 24, min: 12 },
      { id: 'p6', name: 'Rokok (per bungkus)', price: 28000, hpp: 24500, stock: 9, min: 10 },
      { id: 'p7', name: 'Gorengan (per pcs)', price: 2000, hpp: 800, stock: 0, min: 20 }
    ];
    var sales = [];
    var plan = [
      ['p1', 14], ['p2', 5], ['p3', 11], ['p5', 8], ['p1', 9], ['p4', 2],
      ['p1', 12], ['p2', 4], ['p3', 9], ['p5', 6], ['p6', 2],
      ['p1', 15], ['p3', 10], ['p2', 6], ['p5', 7], ['p7', 20],
      ['p1', 11], ['p2', 3], ['p3', 8], ['p5', 5],
      ['p1', 13], ['p3', 12], ['p2', 5], ['p5', 9], ['p6', 1],
      ['p1', 16], ['p2', 7], ['p3', 10], ['p5', 8], ['p4', 3],
      ['p1', 10], ['p3', 7], ['p2', 4], ['p5', 6]
    ];
    var idx = 0;
    for (var d = 6; d >= 0; d--) {
      var count = d === 0 ? 4 : 5;
      for (var i = 0; i < count && idx < plan.length; i++, idx++) {
        var pr = products.filter(function (p) { return p.id === plan[idx][0]; })[0];
        sales.push({ id: 's' + idx, productId: pr.id, qty: plan[idx][1], price: pr.price, hpp: pr.hpp, date: daysAgo(d) });
      }
    }
    return { owner: 'Bu Sari', products: products, sales: sales, seededAt: todayISO() };
  }

  function loadState() {
    try {
      var raw = localStorage.getItem(LS_KEY);
      if (raw) { var s = JSON.parse(raw); if (s && s.products && s.sales) return s; }
    } catch (e) { /* localStorage tidak tersedia: pakai data di memori */ }
    return seedState();
  }
  var state = loadState();
  function saveState() {
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { /* abaikan */ }
  }
  function productById(id) {
    return state.products.filter(function (p) { return p.id === id; })[0];
  }

  /* ---------- tab ---------- */
  var TABS = ['dashboard', 'chat', 'kalkulator', 'penjualan', 'stok'];
  function showTab(name) {
    if (TABS.indexOf(name) < 0) name = 'dashboard';
    document.querySelectorAll('.tab').forEach(function (b) { b.classList.toggle('active', b.dataset.tab === name); });
    document.querySelectorAll('.panel').forEach(function (p) { p.classList.toggle('active', p.id === 'tab-' + name); });
    if (history.replaceState) history.replaceState(null, '', '#' + name);
    if (name === 'dashboard') renderDashboard();
    if (name === 'penjualan') renderSales();
    if (name === 'stok') renderStock();
  }
  document.querySelectorAll('.tab').forEach(function (b) {
    b.addEventListener('click', function () { showTab(b.dataset.tab); });
  });
  document.querySelectorAll('[data-goto]').forEach(function (b) {
    b.addEventListener('click', function () { showTab(b.dataset.goto); });
  });

  /* ---------- dasbor ---------- */
  function salesOn(date) { return state.sales.filter(function (s) { return s.date === date; }); }
  function renderDashboard() {
    var today = todayISO();
    var tSales = salesOn(today);
    var omzet = tSales.reduce(function (a, s) { return a + s.qty * s.price; }, 0);
    var laba = tSales.reduce(function (a, s) { return a + s.qty * (s.price - s.hpp); }, 0);
    var terjual = tSales.reduce(function (a, s) { return a + s.qty; }, 0);
    var low = state.products.filter(function (p) { return p.stock <= p.min; });
    el('stat-omzet').textContent = rp(omzet);
    el('stat-omzet-sub').textContent = tSales.length + ' transaksi';
    el('stat-laba').textContent = rp(laba);
    el('stat-laba-sub').textContent = 'margin rata-rata ' + (omzet ? Math.round(laba / omzet * 100) : 0) + '%';
    el('stat-terjual').textContent = terjual;
    el('stat-stok').textContent = low.length;
    el('stat-stok-sub').textContent = low.length ? 'produk perlu kulakan' : 'semua stok aman';
    el('owner-name').textContent = state.owner;
    el('today-label').textContent = 'Hari ini: ' + fmtDate(today);

    // Grafik 7 hari
    var chart = el('chart');
    chart.innerHTML = '';
    var totals = [];
    for (var d = 6; d >= 0; d--) {
      var dt = new Date(); dt.setDate(dt.getDate() - d);
      var iso = todayISO(dt);
      var sum = salesOn(iso).reduce(function (a, s) { return a + s.qty * s.price; }, 0);
      totals.push({ label: ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'][dt.getDay()], value: sum, date: iso });
    }
    var max = Math.max.apply(null, totals.map(function (t) { return t.value; }).concat([1]));
    totals.forEach(function (t) {
      var wrap = document.createElement('div');
      wrap.className = 'bar-wrap';
      var val = document.createElement('span');
      val.className = 'bar-value';
      val.textContent = t.value >= 1000 ? Math.round(t.value / 1000) + 'rb' : t.value;
      var bar = document.createElement('div');
      bar.className = 'bar';
      bar.style.height = Math.max(4, Math.round(t.value / max * 100)) + '%';
      bar.title = fmtDate(t.date) + ': ' + rp(t.value);
      var lab = document.createElement('span');
      lab.className = 'bar-label';
      lab.textContent = t.label;
      wrap.appendChild(val); wrap.appendChild(bar); wrap.appendChild(lab);
      chart.appendChild(wrap);
    });
    var total7 = totals.reduce(function (a, t) { return a + t.value; }, 0);
    el('chart-note').textContent = 'Total omzet 7 hari: ' + rp(total7) + '. Hari tersibuk: ' + fmtDate(totals.reduce(function (a, b) { return b.value > a.value ? b : a; }).date) + '.';

    // Saran hari ini
    var tips = [];
    if (low.length) tips.push('⚠️ Stok menipis: ' + low.map(function (p) { return p.name + ' (' + p.stock + ' tersisa)'; }).join(', ') + '. Segera kulakan sebelum kehabisan.');
    var best = topProducts(7)[0];
    if (best) tips.push('🏆 Produk terlaris minggu ini: ' + best.name + ' (' + best.qty + ' terjual). Pastikan stoknya selalu tersedia.');
    var marginBest = state.products.slice().sort(function (a, b) { return (b.price - b.hpp) / b.price - (a.price - a.hpp) / a.price; })[0];
    if (marginBest) tips.push('💰 Margin tertinggi Anda: ' + marginBest.name + ' (' + Math.round((marginBest.price - marginBest.hpp) / marginBest.price * 100) + '%). Coba tawarkan ke pelanggan yang beli produk lain.');
    tips.push('📣 Coba paket hemat: kopi + gorengan Rp6.000 — pelanggan suka paket, Anda tetap untung.');
    el('daily-tips').innerHTML = tips.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');

    // Produk terlaris
    var tbody = document.querySelector('#top-products tbody');
    tbody.innerHTML = topProducts(7).slice(0, 5).map(function (r) {
      return '<tr><td>' + esc(r.name) + '</td><td>' + r.qty + '</td><td>' + rp(r.omzet) + '</td><td>' + rp(r.laba) + '</td></tr>';
    }).join('') || '<tr><td colspan="4" class="muted">Belum ada penjualan tercatat.</td></tr>';
  }
  function topProducts(days) {
    var since = new Date(); since.setDate(since.getDate() - (days - 1));
    var sinceISO = todayISO(since);
    var agg = {};
    state.sales.filter(function (s) { return s.date >= sinceISO; }).forEach(function (s) {
      var p = productById(s.productId);
      var name = p ? p.name : 'Produk dihapus';
      agg[s.productId] = agg[s.productId] || { name: name, qty: 0, omzet: 0, laba: 0 };
      agg[s.productId].qty += s.qty;
      agg[s.productId].omzet += s.qty * s.price;
      agg[s.productId].laba += s.qty * (s.price - s.hpp);
    });
    return Object.keys(agg).map(function (k) { return agg[k]; }).sort(function (a, b) { return b.qty - a.qty; });
  }

  /* ---------- chat AI ---------- */
  var chatLog = el('chat-log');
  function addMsg(text, who, demo) {
    var div = document.createElement('div');
    div.className = 'msg ' + who + (demo ? ' demo' : '');
    var tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = who === 'user' ? 'ANDA' : (demo ? 'WARUNGPINTAR · MODE DEMO' : 'WARUNGPINTAR · AI');
    div.appendChild(tag);
    div.appendChild(document.createTextNode(text));
    chatLog.appendChild(div);
    chatLog.scrollTop = chatLog.scrollHeight;
    return div;
  }
  function setBadge(live) {
    var b = el('ai-mode-badge');
    if (live) { b.textContent = 'AI Live — model gratis OpenRouter'; b.className = 'badge badge-live'; }
    else { b.textContent = 'Mode Demo — jawaban contoh'; b.className = 'badge badge-demo'; }
  }
  function getApiKey() { try { return localStorage.getItem(LS_API_KEY) || ''; } catch (e) { return ''; } }

  function contextSummary() {
    var low = state.products.filter(function (p) { return p.stock <= p.min; }).map(function (p) { return p.name + ' stok ' + p.stock; }).join(', ') || 'tidak ada';
    var best = topProducts(7)[0];
    var today = salesOn(todayISO());
    var omzet = today.reduce(function (a, s) { return a + s.qty * s.price; }, 0);
    var daftar = state.products.map(function (p) { return p.name + ' (jual Rp' + p.price.toLocaleString('id-ID') + ', modal Rp' + p.hpp.toLocaleString('id-ID') + ', stok ' + p.stock + ')'; }).join('; ');
    return 'Konteks warung: pemilik ' + state.owner + ', omzet hari ini Rp' + omzet.toLocaleString('id-ID') +
      '. Produk: ' + daftar + '. Stok menipis: ' + low +
      '. Produk terlaris minggu ini: ' + (best ? best.name + ' (' + best.qty + ' terjual)' : 'belum ada') + '.';
  }

  /* Jawaban contoh untuk Mode Demo — ditandai jelas sebagai contoh. */
  function demoAnswer(q) {
    var s = q.toLowerCase();
    var low = state.products.filter(function (p) { return p.stock <= p.min; });
    if (/harga|jual|kopi|mahal|murah/.test(s)) {
      return 'Untuk Kopi Tubruk: modal Anda Rp2.500 per gelas, harga jual sekarang Rp5.000 — margin 50%, sudah bagus. Kalau warung sebelah jual Rp4.000, jangan ikut turun: tawarkan paket kopi + gorengan Rp6.000, pelanggan merasa hemat dan margin Anda tetap aman. Coba hitung di tab "Harga Jual" untuk produk lain.';
    }
    if (/stok|kulak|beli|habis/.test(s)) {
      if (!low.length) return 'Stok Anda saat ini aman semua. Produk yang paling cepat habis biasanya Kopi Tubruk dan Teh Manis — cek lagi besok pagi sebelum buka.';
      return 'Yang harus dikulak besok: ' + low.map(function (p) { return p.name + ' (tersisa ' + p.stock + ')'; }).join(', ') + '. Prioritaskan yang marginnya besar dan cepat laku, yaitu Gorengan dan Gula Pasir. Beli secukupnya untuk 3–4 hari supaya modal tidak menumpuk di stok.';
    }
    if (/omzet|untung|laba|naik|ramai/.test(s)) {
      return 'Tiga cara paling cepat menaikkan omzet warung: (1) Paket hemat — gabungkan produk laris, misal kopi + gorengan Rp6.000. (2) Jam sibuk — pastikan stok penuh pukul 06.00–09.00 dan 16.00–20.00. (3) Tawarkan produk margin tinggi ke setiap pembeli, misal "Teh manisnya sekalian, Bu?" Satu tawaran itu bisa menambah Rp4.000 per pelanggan.';
    }
    if (/ide|jualan|akhir pekan|weekend|promo|baru/.test(s)) {
      return 'Ide untuk akhir pekan: (1) Es teh + gorengan paket Rp7.000 untuk anak-anak yang main di sekitar. (2) "Beli 5 gratis 1" untuk gorengan — pelanggan datang berkelompok. (3) Jual pulsa dan token listrik: modal kecil, laku setiap hari. (4) Terima titipan kue tetangga dengan komisi 10–20%.';
    }
    if (/modal|uang|hemat|irit/.test(s)) {
      return 'Aturan modal warung yang aman: pisahkan uang belanja dan uang pribadi — pakai dua dompet atau dua amplop. Sisihkan 10% dari omzet harian untuk kulakan besok, dan catat setiap penjualan di tab "Penjualan" supaya Anda tahu produk mana yang benar-benar menguntungkan.';
    }
    return 'Sebagai asisten warung, saya bisa membantu soal harga jual, stok dan kulakan, cara menaikkan omzet, sampai ide jualan baru. Contoh pertanyaan: "Berapa harga jual kopi yang pas?" atau "Stok apa yang harus saya kulak besok?" Silakan tanya yang spesifik tentang warung Anda.';
  }

  function callOpenRouter(question, onDone) {
    var key = getApiKey();
    var models = [];
    var sel = el('model-select').value;
    models.push(sel);
    FREE_MODELS.forEach(function (m) { if (models.indexOf(m) < 0) models.push(m); });
    var attempt = 0;
    function tryNext() {
      if (attempt >= models.length) { onDone(null); return; }
      var model = models[attempt++];
      fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + key },
        body: JSON.stringify({
          model: model,
          messages: [
            { role: 'system', content: 'Kamu adalah WarungPintar, asisten AI untuk pemilik warung dan UMKM di Indonesia. Jawab dalam Bahasa Indonesia yang sederhana, ramah, dan praktis. Beri saran konkret dengan angka rupiah bila relevan. Maksimal 150 kata. ' + contextSummary() },
            { role: 'user', content: question }
          ],
          max_tokens: 400
        })
      }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .then(function (data) {
          var text = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
          if (text) onDone(text.trim());
          else tryNext();
        })
        .catch(function () { tryNext(); });
    }
    tryNext();
  }

  function askAI(question) {
    addMsg(question, 'user', false);
    var typing = addMsg('Sedang berpikir...', 'ai', !getApiKey());
    if (!getApiKey()) {
      setTimeout(function () {
        typing.remove();
        addMsg(demoAnswer(question) + '\n\n— Ini jawaban contoh (Mode Demo). Tempel kunci API OpenRouter gratis di Pengaturan AI untuk jawaban live dari model AI.', 'ai', true);
      }, 700);
      return;
    }
    callOpenRouter(question, function (answer) {
      typing.remove();
      if (answer) { setBadge(true); addMsg(answer, 'ai', false); }
      else {
        setBadge(false);
        addMsg(demoAnswer(question) + '\n\n— AI live tidak bisa dihubungi saat ini (kunci salah, kuota gratis habis, atau jaringan bermasalah). Ini jawaban contoh (Mode Demo) supaya Anda tetap bisa lanjut.', 'ai', true);
      }
    });
  }

  el('chat-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var q = el('chat-input').value.trim();
    if (!q) return;
    el('chat-input').value = '';
    askAI(q);
  });
  document.querySelectorAll('#quick-questions button').forEach(function (b) {
    b.addEventListener('click', function () { askAI(b.textContent); });
  });
  el('btn-save-key').addEventListener('click', function () {
    var k = el('api-key').value.trim();
    if (!k) { el('key-status').textContent = 'Tempel dulu kunci API Anda.'; return; }
    try { localStorage.setItem(LS_API_KEY, k); } catch (e) {}
    el('key-status').textContent = 'Kunci tersimpan di peramban ini.';
    el('api-key').value = '';
    setBadge(true);
  });
  el('btn-clear-key').addEventListener('click', function () {
    try { localStorage.removeItem(LS_API_KEY); } catch (e) {}
    el('key-status').textContent = 'Kunci dihapus. Kembali ke Mode Demo.';
    setBadge(false);
  });
  el('btn-test-ai').addEventListener('click', function () {
    if (!getApiKey()) { el('key-status').textContent = 'Simpan kunci dulu, baru tes.'; return; }
    el('key-status').textContent = 'Menguji koneksi...';
    callOpenRouter('Jawab singkat: apa kabar?', function (answer) {
      el('key-status').textContent = answer ? 'Koneksi AI berhasil! Model menjawab.' : 'Gagal — periksa kunci atau coba lagi nanti.';
      setBadge(!!answer);
    });
  });

  /* ---------- kalkulator ---------- */
  function calcPrice(hpp, biaya, marginPct) {
    var modal = hpp + biaya;
    var harga = modal * (1 + marginPct / 100);
    return { modal: modal, harga: harga, laba: harga - modal };
  }
  function roundNice(n) {
    if (n < 1000) return Math.ceil(n / 100) * 100;
    if (n < 10000) return Math.ceil(n / 500) * 500;
    return Math.ceil(n / 1000) * 1000;
  }
  function runCalc() {
    var nama = el('calc-nama').value.trim() || 'Produk';
    var hpp = parseFloat(el('calc-hpp').value) || 0;
    var biaya = parseFloat(el('calc-biaya').value) || 0;
    var margin = parseFloat(el('calc-margin').value) || 0;
    var pasar = parseFloat(el('calc-pasar').value) || 0;
    el('calc-margin-label').textContent = margin + '%';
    var r = calcPrice(hpp, biaya, margin);
    var nice = roundNice(r.harga);
    var verdict = '';
    if (pasar > 0) {
      if (nice > pasar * 1.2) verdict = '⚠️ Harga ini ' + Math.round(nice / pasar * 100 - 100) + '% di atas harga pasar (' + rp(pasar) + '). Pelanggan bisa pindah ke warung sebelah — pertimbangkan turunkan margin atau jual paket.';
      else if (nice < pasar * 0.8) verdict = '💡 Harga ini di bawah harga pasar (' + rp(pasar) + '). Anda bisa menaikkan sedikit dan tetap kompetitif.';
      else verdict = '✅ Harga ini bersaing dengan harga pasar (' + rp(pasar) + ').';
    }
    el('calc-result').innerHTML =
      '<div class="row-line"><span>Modal total per unit</span><strong>' + rp(r.modal) + '</strong></div>' +
      '<div class="row-line"><span>Harga jual (margin ' + margin + '%)</span><strong>' + rp(r.harga) + '</strong></div>' +
      '<div class="row-line"><span>Harga jual dibulatkan</span><span class="big">' + rp(nice) + '</span></div>' +
      '<div class="row-line"><span>Laba per unit</span><strong>' + rp(nice - r.modal) + ' (' + Math.round((nice - r.modal) / nice * 100) + '%)</strong></div>' +
      '<div class="row-line"><span>Terjual 10 unit / hari</span><strong>' + rp((nice - r.modal) * 10) + ' laba/hari</strong></div>' +
      '<p class="muted">' + esc(verdict) + '</p>';
    el('calc-tips').innerHTML =
      '<li>Harga berakhiran 500 atau 000 lebih mudah diingat dan lebih cepat saat kembalian — contoh: ' + rp(nice) + '.</li>' +
      '<li>Jual ' + esc(nama) + ' 10 unit sehari di harga ini = laba sekitar ' + rp((nice - r.modal) * 30) + ' per bulan.</li>' +
      '<li>Kalau laku keras, naikkan harga Rp500 dulu — jangan langsung Rp2.000.</li>';
    el('calc-result').dataset.lastNama = nama;
    el('calc-result').dataset.lastHarga = nice;
    el('calc-result').dataset.lastHpp = hpp + biaya;
  }
  el('calc-margin').addEventListener('input', runCalc);
  el('btn-hitung').addEventListener('click', runCalc);
  el('btn-pakai-harga').addEventListener('click', function () {
    runCalc();
    var ds = el('calc-result').dataset;
    if (!ds.lastHarga) return;
    el('stock-nama').value = ds.lastNama;
    el('stock-harga').value = ds.lastHarga;
    el('stock-hpp').value = ds.lastHpp;
    el('stock-qty').value = 10;
    showTab('stok');
    el('stock-nama').focus();
  });

  /* ---------- penjualan ---------- */
  function fillProductSelect() {
    var sel = el('sale-produk');
    sel.innerHTML = state.products.map(function (p) {
      return '<option value="' + p.id + '">' + esc(p.name) + ' — ' + rp(p.price) + '</option>';
    }).join('');
  }
  function renderSales() {
    fillProductSelect();
    var today = todayISO();
    var tSales = salesOn(today);
    el('sum-count').textContent = state.sales.length;
    var since = new Date(); since.setDate(since.getDate() - 6);
    var s7 = state.sales.filter(function (s) { return s.date >= todayISO(since); });
    el('sum-7d').textContent = rp(s7.reduce(function (a, s) { return a + s.qty * s.price; }, 0));
    el('sum-laba-7d').textContent = rp(s7.reduce(function (a, s) { return a + s.qty * (s.price - s.hpp); }, 0));
    var tb = document.querySelector('#sales-today tbody');
    tb.innerHTML = tSales.map(function (s) {
      var p = productById(s.productId);
      return '<tr><td>' + esc(p ? p.name : '?') + '</td><td>' + s.qty + '</td><td>' + rp(s.qty * s.price) + '</td><td><button class="btn btn-danger" data-del-sale="' + s.id + '" type="button">Hapus</button></td></tr>';
    }).join('') || '<tr><td colspan="4" class="muted">Belum ada penjualan hari ini.</td></tr>';
    var hb = document.querySelector('#sales-history tbody');
    hb.innerHTML = state.sales.slice().sort(function (a, b) { return b.date.localeCompare(a.date); }).slice(0, 30).map(function (s) {
      var p = productById(s.productId);
      return '<tr><td>' + fmtDate(s.date) + '</td><td>' + esc(p ? p.name : '?') + '</td><td>' + s.qty + '</td><td>' + rp(s.price) + '</td><td>' + rp(s.qty * s.price) + '</td><td>' + rp(s.qty * (s.price - s.hpp)) + '</td><td><button class="btn btn-danger" data-del-sale="' + s.id + '" type="button">Hapus</button></td></tr>';
    }).join('');
    document.querySelectorAll('[data-del-sale]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.sales = state.sales.filter(function (s) { return s.id !== b.dataset.delSale; });
        saveState(); renderSales(); renderDashboard();
      });
    });
  }
  el('sale-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var pid = el('sale-produk').value;
    var p = productById(pid);
    if (!p) return;
    var qty = parseInt(el('sale-qty').value, 10) || 0;
    if (qty <= 0) return;
    var date = el('sale-tanggal').value || todayISO();
    state.sales.push({ id: 's' + Date.now(), productId: pid, qty: qty, price: p.price, hpp: p.hpp, date: date });
    p.stock = Math.max(0, p.stock - qty);
    saveState(); renderSales(); renderDashboard();
    el('sale-qty').value = 1;
  });

  /* ---------- stok ---------- */
  function renderStock() {
    var value = state.products.reduce(function (a, p) { return a + p.stock * p.price; }, 0);
    var cost = state.products.reduce(function (a, p) { return a + p.stock * p.hpp; }, 0);
    var low = state.products.filter(function (p) { return p.stock <= p.min; });
    el('stock-value').textContent = rp(value);
    el('stock-cost').textContent = rp(cost);
    el('stock-low-count').textContent = low.length;
    el('stock-alerts').innerHTML = low.length
      ? low.map(function (p) { return '<li>⚠️ <strong>' + esc(p.name) + '</strong> — tersisa ' + p.stock + ' (batas aman ' + p.min + '). Segera kulakan.</li>'; }).join('')
      : '<li>✅ Semua stok masih di atas batas aman.</li>';
    var tb = document.querySelector('#stock-table tbody');
    tb.innerHTML = state.products.map(function (p) {
      var margin = p.price ? Math.round((p.price - p.hpp) / p.price * 100) : 0;
      var status = p.stock === 0
        ? '<span class="pill pill-bad">Habis</span>'
        : (p.stock <= p.min ? '<span class="pill pill-warn">Menipis</span>' : '<span class="pill pill-ok">Aman</span>');
      return '<tr><td>' + esc(p.name) + '</td><td>' + rp(p.price) + '</td><td>' + rp(p.hpp) + '</td><td>' + margin + '%</td><td>' + p.stock + '</td><td>' + status + '</td>' +
        '<td><button class="btn btn-ghost btn-sm" data-add-stock="' + p.id + '" type="button">+10</button> <button class="btn btn-danger" data-del-prod="' + p.id + '" type="button">Hapus</button></td></tr>';
    }).join('');
    document.querySelectorAll('[data-add-stock]').forEach(function (b) {
      b.addEventListener('click', function () {
        var p = productById(b.dataset.addStock);
        if (p) { p.stock += 10; saveState(); renderStock(); renderDashboard(); }
      });
    });
    document.querySelectorAll('[data-del-prod]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.products = state.products.filter(function (p) { return p.id !== b.dataset.delProd; });
        saveState(); renderStock(); renderDashboard(); fillProductSelect();
      });
    });
  }
  el('stock-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var nama = el('stock-nama').value.trim();
    var harga = parseFloat(el('stock-harga').value) || 0;
    var hpp = parseFloat(el('stock-hpp').value) || 0;
    var qty = parseInt(el('stock-qty').value, 10) || 0;
    var min = parseInt(el('stock-min').value, 10) || 0;
    if (!nama) return;
    var existing = state.products.filter(function (p) { return p.name.toLowerCase() === nama.toLowerCase(); })[0];
    if (existing) { existing.price = harga; existing.hpp = hpp; existing.stock = qty; existing.min = min; }
    else state.products.push({ id: 'p' + Date.now(), name: nama, price: harga, hpp: hpp, stock: qty, min: min });
    saveState(); renderStock(); renderDashboard(); fillProductSelect();
    el('stock-form').reset();
    el('stock-min').value = 5;
  });

  /* ---------- ekspor & reset ---------- */
  el('btn-export').addEventListener('click', function () {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'warungpintar-data-' + todayISO() + '.json';
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
  el('btn-reset').addEventListener('click', function () {
    if (!confirm('Kembalikan semua data ke contoh awal? Penjualan dan stok yang Anda catat akan hilang.')) return;
    state = seedState();
    saveState();
    renderDashboard(); renderSales(); renderStock(); fillProductSelect();
  });

  /* ---------- init ---------- */
  el('sale-tanggal').value = todayISO();
  if (getApiKey()) setBadge(true);
  addMsg('Halo! Saya WarungPintar, asisten warung Anda. Tanya soal harga jual, stok, atau ide menaikkan omzet — saya jawab dalam Bahasa Indonesia.\n\nContoh: "Berapa harga jual kopi yang pas?"', 'ai', !getApiKey());
  renderDashboard();
  renderSales();
  renderStock();
  fillProductSelect();
  runCalc();
  var hash = (location.hash || '').replace('#', '');
  showTab(TABS.indexOf(hash) >= 0 ? hash : 'dashboard');
})();
