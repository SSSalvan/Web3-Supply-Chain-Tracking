// ── DATA STORE ──
let products = JSON.parse(localStorage.getItem('sb2_products') || '[]');

function save() {
  localStorage.setItem('sb2_products', JSON.stringify(products));
}

// ── NAVIGATION ──
function switchNav(btn, panel) {
  document.querySelectorAll('.nav-link').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const tabs = document.querySelectorAll('.section-tab');
  const idx  = ['create', 'update', 'track', 'list'].indexOf(panel);
  showTab(panel, tabs[idx]);
}

function showTab(name, btn) {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + name).classList.add('active');
  if (btn) {
    document.querySelectorAll('.section-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
  }
  if (name === 'list') renderTable();
  updateAll();
}

// ── TOAST ──
function toast(msg, type = 'ok') {
  const d = document.createElement('div');
  d.className = 'toast' + (type === 'err' ? ' error' : '');
  d.innerHTML = (type === 'err' ? '❌' : '✅') + ' ' + msg;
  document.getElementById('toast-wrap').appendChild(d);
  setTimeout(() => d.remove(), 3500);
}

// ── BADGE ──
function badge(s) {
  const m = {
    'Dalam Transit': 'transit',
    'Di Gudang':     'warehouse',
    'Terkirim':      'delivered',
    'Menunggu':      'pending'
  };
  return `<span class="badge ${m[s] || 'pending'}"><span class="badge-dot"></span>${s}</span>`;
}

// ── STATS & LIVE FEED ──
function updateAll() {
  const t   = products.length;
  const tr  = products.filter(p => p.status === 'Dalam Transit').length;
  const w   = products.filter(p => p.status === 'Di Gudang').length;
  const d   = products.filter(p => p.status === 'Terkirim').length;
  const pen = products.filter(p => p.status === 'Menunggu').length;

  [
    ['h-total', t], ['h-transit', tr], ['h-delivered', d], ['h-warehouse', w],
    ['s-total', t], ['s-transit', tr], ['s-warehouse', w], ['s-delivered', d], ['s-pending', pen]
  ].forEach(([id, v]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v;
  });

  const feed = document.getElementById('live-feed');
  if (!products.length) {
    feed.innerHTML = '<div style="text-align:center;padding:20px;color:var(--gray-400);font-size:12px;">Belum ada aktivitas.</div>';
    return;
  }
  const dotMap = { 'Dalam Transit': 'yellow', 'Terkirim': 'green', 'Di Gudang': 'blue', 'Menunggu': 'gray' };
  feed.innerHTML = [...products].reverse().slice(0, 5).map(p => `
    <div class="live-item">
      <div class="live-dot ${dotMap[p.status] || 'gray'}"></div>
      <div>
        <div class="live-name">${p.name}</div>
        <div class="live-meta">${p.status} · ${p.destination}</div>
      </div>
    </div>
  `).join('');
}

// ══════════════════════════════════════════
// ── CREATE PRODUCT ──
// ══════════════════════════════════════════
function createProduct() {
  const id       = document.getElementById('c-id').value.trim();
  const name     = document.getElementById('c-name').value.trim();
  const loc      = document.getElementById('c-loc').value.trim();
  const dest     = document.getElementById('c-dest').value.trim();
  const qty      = document.getElementById('c-qty').value.trim();
  const company  = document.getElementById('c-company').value.trim();
  const notes    = document.getElementById('c-notes').value.trim();

  if (!id || !name || !loc || !dest || !qty || !company) {
    toast('Semua kolom wajib (bertanda *) harus diisi.', 'err');
    return;
  }
  if (isNaN(qty) || Number(qty) <= 0) {
    toast('Jumlah produk harus berupa angka positif.', 'err');
    return;
  }
  if (products.find(p => p.id.toLowerCase() === id.toLowerCase())) {
    toast(`ID "${id}" sudah terdaftar.`, 'err');
    return;
  }

  const now = new Date().toISOString();
  products.push({
    id, name,
    location:    loc,
    destination: dest,
    quantity:    Number(qty),
    company,
    notes,
    status:      'Dalam Transit',
    createdAt:   now,
    updatedAt:   now,
    history: [{
      time:     now,
      location: loc,
      status:   'Dalam Transit',
      desc:     `Produk didaftarkan — ${qty} unit dikirim ke ${dest} (${company})`
    }]
  });

  save();
  updateAll();
  resetCreate();
  toast(`Produk "${name}" berhasil didaftarkan!`);
}

function resetCreate() {
  ['c-id', 'c-name', 'c-loc', 'c-dest', 'c-qty', 'c-company', 'c-notes']
    .forEach(i => document.getElementById(i).value = '');
}

// ══════════════════════════════════════════
// ── UPDATE PRODUCT  (fuzzy / case-insensitive search)
// ══════════════════════════════════════════
let _updateTarget = null;   // holds the matched product

function onUpdateInput() {
  const q   = document.getElementById('u-id').value.trim().toLowerCase();
  const box = document.getElementById('u-search-results');

  if (!q) { box.innerHTML = ''; box.style.display = 'none'; hideUpdateForm(); return; }

  const matches = products.filter(p =>
    p.id.toLowerCase().includes(q) ||
    p.name.toLowerCase().includes(q)
  );

  if (!matches.length) {
    box.innerHTML = `<div style="padding:12px 14px;font-size:13px;color:var(--gray-400);">Tidak ada hasil untuk "<strong>${q}</strong>"</div>`;
    box.style.display = 'block';
    hideUpdateForm();
    return;
  }

  box.style.display = 'block';
  box.innerHTML = matches.map(p => `
    <div class="search-result-item" onclick="selectUpdateProduct('${p.id}')">
      <div>
        <div class="sri-id">${p.id}</div>
        <div class="sri-name">${p.name}</div>
        <div class="sri-loc">${p.status} · ${p.destination}</div>
      </div>
    </div>
  `).join('');
}

function selectUpdateProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  _updateTarget = p;

  // close dropdown, fill input label
  document.getElementById('u-id').value = `${p.id} — ${p.name}`;
  document.getElementById('u-search-results').style.display = 'none';

  showUpdateForm(p);
}

function showUpdateForm(p) {
  document.getElementById('u-empty').style.display = 'none';
  document.getElementById('u-form').style.display  = 'block';
  document.getElementById('u-cur-info').innerHTML  = `
    <div class="ci-item">
      <div class="ci-label">Nama Produk</div>
      <div class="ci-val">${p.name}</div>
    </div>
    <div class="ci-item">
      <div class="ci-label">Lokasi Asal</div>
      <div class="ci-val">${p.location}</div>
    </div>
    <div class="ci-item">
      <div class="ci-label">Tujuan</div>
      <div class="ci-val">${p.destination}</div>
    </div>
    <div class="ci-item">
      <div class="ci-label">Perusahaan</div>
      <div class="ci-val">${p.company}</div>
    </div>
    <div class="ci-item">
      <div class="ci-label">Status</div>
      <div class="ci-val">${p.status}</div>
    </div>
  `;
  document.getElementById('u-loc').value    = '';
  document.getElementById('u-status').value = '';
}

function hideUpdateForm() {
  _updateTarget = null;
  document.getElementById('u-form').style.display  = 'none';
  document.getElementById('u-empty').style.display = 'block';
}

function doUpdate() {
  const p      = _updateTarget;
  const newLoc = document.getElementById('u-loc').value.trim();
  const newSt  = document.getElementById('u-status').value;

  if (!p)                  { toast('Pilih produk terlebih dahulu.', 'err'); return; }
  if (!newLoc && !newSt)   { toast('Masukkan lokasi baru atau status baru.', 'err'); return; }

  const now  = new Date().toISOString();
  const desc = [];
  if (newLoc) { desc.push(`Lokasi → ${newLoc}`); p.location = newLoc; }
  if (newSt)  { desc.push(`Status → ${newSt}`);  p.status   = newSt; }
  p.updatedAt = now;
  p.history.push({ time: now, location: p.location, status: p.status, desc: desc.join(' · ') });

  save();
  updateAll();
  showUpdateForm(p);
  toast(`Produk "${p.name}" berhasil diperbarui!`);
}

// ══════════════════════════════════════════
// ── TRACK PRODUCT  (with animated map)
// ══════════════════════════════════════════
let _trackAnimInterval = null;
let _truckProgress     = 0;

function onTrackInput() {
  const q   = document.getElementById('t-id').value.trim().toLowerCase();
  const box = document.getElementById('t-search-results');
  if (!q) { box.innerHTML = ''; box.style.display = 'none'; return; }

  const matches = products.filter(p =>
    p.id.toLowerCase().includes(q) ||
    p.name.toLowerCase().includes(q)
  );

  if (!matches.length) {
    box.style.display = 'block';
    box.innerHTML = `<div style="padding:12px 14px;font-size:13px;color:var(--gray-400);">Tidak ditemukan untuk "<strong>${q}</strong>"</div>`;
    return;
  }
  box.style.display = 'block';
  box.innerHTML = matches.map(p => `
    <div class="search-result-item" onclick="selectTrackProduct('${p.id}')">
      <div>
        <div class="sri-id">${p.id}</div>
        <div class="sri-name">${p.name}</div>
        <div class="sri-loc">${p.status} · ${p.destination}</div>
      </div>
    </div>
  `).join('');
}

function selectTrackProduct(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  document.getElementById('t-id').value = `${p.id} — ${p.name}`;
  document.getElementById('t-search-results').style.display = 'none';
  renderTrack(p);
}

function doTrack() {
  const raw = document.getElementById('t-id').value.trim().toLowerCase();
  document.getElementById('t-search-results').style.display = 'none';

  const p = products.find(x =>
    x.id.toLowerCase().includes(raw) || x.name.toLowerCase().includes(raw)
  );

  if (!p) {
    toast(`Produk tidak ditemukan.`, 'err');
    document.getElementById('t-empty').style.display  = 'block';
    document.getElementById('t-result').style.display = 'none';
    return;
  }
  renderTrack(p);
}

function renderTrack(p) {
  document.getElementById('t-empty').style.display  = 'none';
  document.getElementById('t-result').style.display = 'block';

  // Info rows
  document.getElementById('t-info').innerHTML = [
    ['ID Produk',           `<span style="font-family:monospace;color:var(--teal-dark);font-weight:700">${p.id}</span>`],
    ['Nama Produk',         p.name],
    ['Jumlah',              `${p.quantity} unit`],
    ['Lokasi Asal',         p.location],
    ['Tujuan Pengiriman',   p.destination],
    ['Perusahaan Penerima', p.company],
    ['Status',              badge(p.status)],
    ['Catatan',             p.notes || '—'],
    ['Didaftarkan',         fmt(p.createdAt)],
    ['Terakhir Diperbarui', fmt(p.updatedAt)]
  ].map(([k, v]) => `
    <div class="info-row">
      <span class="info-key">${k}</span>
      <span class="info-val">${v}</span>
    </div>
  `).join('');

  // Timeline
  document.getElementById('t-timeline').innerHTML = [...p.history].reverse().map((h, i) => `
    <li class="tl-item">
      <div class="tl-dot ${i === 0 ? 'current' : ''}"></div>
      <div class="tl-time">${fmt(h.time)}</div>
      <div class="tl-label">${h.status} · ${h.location}</div>
      <div class="tl-desc">${h.desc}</div>
    </li>
  `).join('');

  // Map
  renderMap(p);
}

// ── ANIMATED MAP ──
function renderMap(p) {
  // Progress strictly by status
  const progressByStatus = {
    'Menunggu':      0,
    'Di Gudang':     5,
    'Dalam Transit': 55,   // midway on the road
    'Terkirim':      100
  };
  const progress = progressByStatus[p.status] ?? 40;

  document.getElementById('map-origin-label').textContent  = shorten(p.location);
  document.getElementById('map-dest-label').textContent    = shorten(p.destination);
  document.getElementById('map-company-label').textContent = shorten(p.company);
  document.getElementById('map-progress-pct').textContent  = `${progress}%`;
  document.getElementById('map-progress-fill').style.width = `${progress}%`;

  startTruckAnimation(progress, p.status);
}

function shorten(str) {
  return str && str.length > 22 ? str.substring(0, 20) + '…' : (str || '');
}

function startTruckAnimation(targetPct, status) {
  if (_trackAnimInterval) { clearInterval(_trackAnimInterval); _trackAnimInterval = null; }

  const pathEl  = document.getElementById('truck-road-path');
  const truckEl = document.getElementById('truck-icon-group');
  if (!pathEl || !truckEl) return;

  const totalLen = pathEl.getTotalLength();
  const endLen   = (targetPct / 100) * totalLen;

  // For "Terkirim": snap truck straight to destination, no animation
  if (status === 'Terkirim') {
    const pt = pathEl.getPointAtLength(totalLen);
    truckEl.setAttribute('transform', `translate(${pt.x - 18}, ${pt.y - 18})`);
    // Show checkmark overlay
    document.getElementById('map-truck-icon').textContent = '✅';
    return;
  }

  document.getElementById('map-truck-icon').textContent = '🚛';

  // Start from origin (len=0) and animate toward endLen
  let current = 0;

  // Place truck at origin first
  const startPt = pathEl.getPointAtLength(0);
  truckEl.setAttribute('transform', `translate(${startPt.x - 18}, ${startPt.y - 18})`);

  // If status is 'Menunggu' or 'Di Gudang', park truck near origin, no movement
  if (targetPct <= 5) {
    const pt = pathEl.getPointAtLength(endLen);
    truckEl.setAttribute('transform', `translate(${pt.x - 18}, ${pt.y - 18})`);
    return;
  }

  // Animate truck from 0 → endLen along the path
  _trackAnimInterval = setInterval(() => {
    // Ease toward target
    current += (endLen - current) * 0.035 + 0.8;

    if (current >= endLen) {
      current = endLen;
      clearInterval(_trackAnimInterval);
      _trackAnimInterval = null;
    }

    const pt     = pathEl.getPointAtLength(current);
    // Calculate heading angle from the path tangent for correct truck direction
    const ptAhead = pathEl.getPointAtLength(Math.min(current + 4, totalLen));
    const angle   = Math.atan2(ptAhead.y - pt.y, ptAhead.x - pt.x) * (180 / Math.PI);

    // Wobble: gentle vertical oscillation for road feel
    const wobble = Math.sin(current * 0.15) * 1.5;

    truckEl.setAttribute(
      'transform',
      `translate(${pt.x - 18}, ${pt.y - 18 + wobble}) rotate(${angle}, 18, 18)`
    );
  }, 28);
}

// ── RENDER TABLE ──
function renderTable() {
  const q = (document.getElementById('list-search')?.value || '').toLowerCase();
  const f = products.filter(p =>
    !q ||
    p.id.toLowerCase().includes(q) ||
    p.name.toLowerCase().includes(q) ||
    p.location.toLowerCase().includes(q) ||
    p.destination.toLowerCase().includes(q) ||
    p.company.toLowerCase().includes(q) ||
    p.status.toLowerCase().includes(q)
  );

  const sub = document.getElementById('list-sub');
  if (sub) sub.textContent = `${products.length} produk dalam sistem`;

  const tbody = document.getElementById('table-body');
  if (!f.length) {
    tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <div class="empty-title">Belum Ada Produk</div>
          <div class="empty-sub">Daftarkan produk pertama Anda</div>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = f.map(p => `
    <tr>
      <td class="td-id">${p.id}</td>
      <td class="td-name">${p.name}</td>
      <td>${p.quantity} unit</td>
      <td>${p.destination}</td>
      <td>${p.company}</td>
      <td>${badge(p.status)}</td>
      <td>
        <button class="btn btn-secondary" style="padding:5px 12px;font-size:12px"
          onclick="quickTrack('${p.id}')">🔍 Lacak</button>
      </td>
    </tr>
  `).join('');
}

function quickTrack(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  document.getElementById('t-id').value = `${p.id} — ${p.name}`;
  showTab('track', document.querySelectorAll('.section-tab')[2]);
  document.querySelectorAll('.nav-link').forEach((b, i) => b.classList.toggle('active', i === 2));
  renderTrack(p);
}

function quickSearch() {
  const q = document.getElementById('nav-search-box').value.trim();
  if (!q) return;
  document.getElementById('list-search').value = q;
  showTab('list', document.querySelectorAll('.section-tab')[3]);
  document.querySelectorAll('.nav-link').forEach((b, i) => b.classList.toggle('active', i === 3));
  renderTable();
}

// Close dropdowns when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrap-rel')) {
    document.querySelectorAll('.search-results').forEach(el => el.style.display = 'none');
  }
});

// ── HELPERS ──
function fmt(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) +
         ' ' +
         d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// ── INIT ──
updateAll();
renderTable();