// ════════════════════════════════════════════════════════════
//  app.js — integrasi blockchain + role-based pages
//  ganti contract address di bawah ke contract role-based yang baru
// ════════════════════════════════════════════════════════════

// ── CONTRACT CONFIG ──────────────────────────────────────────
const CONTRACT_ADDRESS = "0x6Aab135dC8e3720B2F1A720094cD2a3AA7763ef7";

const ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "_id",          "type": "string"  },
      { "internalType": "string", "name": "_name",        "type": "string"  },
      { "internalType": "string", "name": "_location",    "type": "string"  },
      { "internalType": "string", "name": "_destination", "type": "string"  },
      { "internalType": "uint256","name": "_quantity",    "type": "uint256" },
      { "internalType": "string", "name": "_company",     "type": "string"  },
      { "internalType": "string", "name": "_notes",       "type": "string"  }
    ],
    "name": "createProduct", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_id",          "type": "string" },
      { "internalType": "string", "name": "_newLocation", "type": "string" },
      { "internalType": "string", "name": "_newStatus",   "type": "string" }
    ],
    "name": "updateProduct", "outputs": [], "stateMutability": "nonpayable", "type": "function"
  },
  {
    "inputs":  [{ "internalType": "string", "name": "_id", "type": "string" }],
    "name": "getProduct",
    "outputs": [
      { "internalType": "string",  "name": "id",          "type": "string"  },
      { "internalType": "string",  "name": "name",        "type": "string"  },
      { "internalType": "string",  "name": "location",    "type": "string"  },
      { "internalType": "string",  "name": "destination", "type": "string"  },
      { "internalType": "uint256", "name": "quantity",    "type": "uint256" },
      { "internalType": "string",  "name": "company",     "type": "string"  },
      { "internalType": "string",  "name": "notes",       "type": "string"  },
      { "internalType": "string",  "name": "status",      "type": "string"  },
      { "internalType": "uint256", "name": "createdAt",   "type": "uint256" },
      { "internalType": "uint256", "name": "updatedAt",   "type": "uint256" }
    ],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs":  [{ "internalType": "string", "name": "_id", "type": "string" }],
    "name": "getProductHistoryCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs":  [
      { "internalType": "string",  "name": "_id",    "type": "string"  },
      { "internalType": "uint256", "name": "_index", "type": "uint256" }
    ],
    "name": "getProductHistoryItem",
    "outputs": [
      { "internalType": "uint256", "name": "time",     "type": "uint256" },
      { "internalType": "string",  "name": "location", "type": "string"  },
      { "internalType": "string",  "name": "status",   "type": "string"  },
      { "internalType": "string",  "name": "desc",     "type": "string"  }
    ],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs":  [],
    "name": "getAllProductIds",
    "outputs": [{ "internalType": "string[]", "name": "", "type": "string[]" }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs":  [],
    "name": "getProductCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs":  [{ "internalType": "string", "name": "_id", "type": "string" }],
    "name": "productExists",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view", "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "userRoles",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getMyRole",
    "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
    "name": "getRoleName",
    "outputs": [{ "internalType": "string", "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_user", "type": "address" },
      { "internalType": "uint8", "name": "_role", "type": "uint8" }
    ],
    "name": "setUserRole",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

const ROLE = {
  NONE: 0,
  ADMIN: 1,
  MANUFACTURER: 2,
  DISTRIBUTOR: 3
};

const ROLE_ACCESS = {
  none: ["track", "list"],
  admin: ["create", "update", "track", "list", "roles"],
  manufacturer: ["create", "track", "list"],
  distributor: ["update", "track", "list"]
};

const STATUS_OPTIONS = {
  admin: [
    "Menunggu",
    "Di Gudang",
    "Siap Diambil",
    "Diambil Distributor",
    "Dalam Transit",
    "Terkirim"
  ],
  manufacturer: [
    "Menunggu",
    "Di Gudang",
    "Siap Diambil"
  ],
  distributor: [
    "Diambil Distributor",
    "Dalam Transit",
    "Terkirim"
  ],
  none: []
};

const STATUS_META = {
  "Menunggu": { icon: "⏳", badge: "pending", progress: 0, dot: "gray" },
  "Di Gudang": { icon: "🏭", badge: "warehouse", progress: 20, dot: "blue" },
  "Siap Diambil": { icon: "📦", badge: "warehouse", progress: 40, dot: "blue" },
  "Diambil Distributor": { icon: "🚚", badge: "transit", progress: 60, dot: "yellow" },
  "Dalam Transit": { icon: "🚛", badge: "transit", progress: 80, dot: "yellow" },
  "Terkirim": { icon: "✅", badge: "delivered", progress: 100, dot: "green" }
};

// ── STATE ─────────────────────────────────────────────────────
let provider, signer, contract;
let products = [];
let isConnected = false;
let currentAccount = "";
let currentRoleValue = ROLE.NONE;
let currentRoleName = "none";
let _updateTarget = null;
let _trackAnimInterval = null;

// ── INIT ──────────────────────────────────────────────────────
window.addEventListener('load', async () => {
  injectConnectBanner();
  applyRoleUI();
  renderStatusOptions();
  if (window.ethereum) {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    if (accounts.length > 0) await connectWallet(true);
    window.ethereum.on('accountsChanged', () => location.reload());
    window.ethereum.on('chainChanged',    () => location.reload());
  }
});

// ── CONNECT BANNER ────────────────────────────────────────────
function injectConnectBanner() {
  const bar = document.createElement('div');
  bar.id = 'chain-bar';
  bar.style.cssText = `
    background:#1b2e4b; color:#fff; padding:10px 24px;
    display:flex; align-items:center; justify-content:space-between;
    font-size:13px; font-family:'Plus Jakarta Sans',sans-serif;
    border-bottom:2px solid #2a4a72;
  `;
  bar.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
      <span id="chain-dot" style="width:8px;height:8px;border-radius:50%;background:#ef4444;display:inline-block;"></span>
      <span id="chain-status">wallet belum terhubung — hubungkan metamask untuk membaca role</span>
    </div>
    <button id="chain-btn" onclick="connectWallet(false)"
      style="background:#C8F012;color:#0a1628;border:none;padding:6px 16px;border-radius:6px;
             font-weight:700;font-size:12px;cursor:pointer;font-family:inherit;">
      Hubungkan MetaMask
    </button>
  `;
  document.body.insertBefore(bar, document.body.firstChild);
}

// ── CONNECT WALLET ───────────────────────────────────────────
async function connectWallet(silent = false) {
  if (!window.ethereum) {
    if (!silent) toast('MetaMask tidak ditemukan. Silakan install MetaMask.', 'err');
    return;
  }

  try {
    if (!silent) await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.BrowserProvider(window.ethereum);
    signer   = await provider.getSigner();
    contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

    currentAccount = await signer.getAddress();
    const network = await provider.getNetwork();
    const chainId = network.chainId;

    if (chainId !== 11155111n) {
      toast('⚠️ kamu tidak berada di Sepolia, ganti network ke Sepolia', 'err');
    }

    isConnected = true;
    await loadUserRole();
    document.getElementById('chain-dot').style.background = '#22c55e';
    document.getElementById('chain-btn').style.display = 'none';
    renderConnectionStatus();
    applyRoleUI();
    renderStatusOptions();
    renderRolePageSummary();

    if (!silent) toast('wallet berhasil terhubung');
    await loadAllFromChain();
  } catch (e) {
    console.error('connectWallet error:', e);
    if (!silent) toast('Gagal connect: ' + (e.reason || e.message || e), 'err');
  }
}

async function loadUserRole() {
  if (!contract || !currentAccount) {
    currentRoleValue = ROLE.NONE;
    currentRoleName = 'none';
    return;
  }

  try {
    const rawRole = await contract.userRoles(currentAccount);
    currentRoleValue = Number(rawRole);
    currentRoleName = roleValueToName(currentRoleValue);
  } catch (e) {
    console.error('loadUserRole error:', e);
    currentRoleValue = ROLE.NONE;
    currentRoleName = 'none';
    toast('Role wallet tidak dapat dibaca, cek contract address dan ABI', 'err');
  }
}

function renderConnectionStatus() {
  const label = roleNameToLabel(currentRoleName);
  const shortAddr = currentAccount ? `${currentAccount.slice(0, 6)}…${currentAccount.slice(-4)}` : '—';
  document.getElementById('chain-status').textContent =
    `✓ terhubung: ${shortAddr} · role: ${label} · Sepolia Testnet · ${CONTRACT_ADDRESS.slice(0, 10)}…`;
}

// ── ROLE UI ──────────────────────────────────────────────────
function roleValueToName(value) {
  switch (Number(value)) {
    case ROLE.ADMIN: return 'admin';
    case ROLE.MANUFACTURER: return 'manufacturer';
    case ROLE.DISTRIBUTOR: return 'distributor';
    default: return 'none';
  }
}

function roleNameToLabel(name) {
  return {
    admin: 'admin',
    manufacturer: 'manufacturer',
    distributor: 'distributor',
    none: 'none'
  }[name] || 'none';
}

function getAllowedPanels() {
  return ROLE_ACCESS[currentRoleName] || ROLE_ACCESS.none;
}

function canAccessPanel(panelName) {
  return getAllowedPanels().includes(panelName);
}

function applyRoleUI() {
  const allowed = new Set(getAllowedPanels());

  document.querySelectorAll('.nav-link[data-panel]').forEach(btn => {
    btn.style.display = allowed.has(btn.dataset.panel) ? '' : 'none';
  });

  document.querySelectorAll('.section-tab[data-panel]').forEach(btn => {
    btn.style.display = allowed.has(btn.dataset.panel) ? '' : 'none';
  });

  document.querySelectorAll('.panel').forEach(panel => {
    const panelName = panel.id.replace('panel-', '');
    panel.style.display = allowed.has(panelName) ? '' : 'none';
    if (!allowed.has(panelName)) panel.classList.remove('active');
  });

  const listCreateBtn = document.getElementById('list-create-btn');
  if (listCreateBtn) listCreateBtn.style.display = canAccessPanel('create') ? '' : 'none';

  const desired = getDefaultPanelForRole();
  const activePanel = document.querySelector('.panel.active');
  if (!activePanel || activePanel.style.display === 'none') {
    activatePanel(desired, false);
  } else {
    updateActiveNavAndTab(activePanel.id.replace('panel-', ''));
  }

  renderRolePageSummary();
}

function getDefaultPanelForRole() {
  if (currentRoleName === 'admin' || currentRoleName === 'manufacturer') return 'create';
  if (currentRoleName === 'distributor') return 'update';
  return 'track';
}

function activatePanel(name, showToastIfBlocked = true) {
  if (!canAccessPanel(name)) {
    if (showToastIfBlocked) toast('Halaman ini tidak tersedia untuk role wallet kamu', 'err');
    return;
  }

  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('panel-' + name);
  if (panel) panel.classList.add('active');

  updateActiveNavAndTab(name);

  if (name === 'list') renderTable();
  if (name === 'roles') renderRolePageSummary();
  updateAll();
}

function updateActiveNavAndTab(name) {
  document.querySelectorAll('.nav-link[data-panel]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.panel === name);
  });
  document.querySelectorAll('.section-tab[data-panel]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.panel === name);
  });
}

function switchNav(_btn, panel) {
  activatePanel(panel);
}

function showTab(name, _btn) {
  activatePanel(name);
}

function renderRolePageSummary() {
  const el = document.getElementById('role-page-summary');
  if (!el) return;

  const walletText = currentAccount || 'wallet belum terhubung';
  const roleText = roleNameToLabel(currentRoleName);
  const allowedText = getAllowedPanels().map(panelToLabel).join(', ');

  el.innerHTML = `
    <div class="ci-item"><div class="ci-label">wallet aktif</div><div class="ci-val" style="word-break:break-all">${walletText}</div></div>
    <div class="ci-item"><div class="ci-label">role aktif</div><div class="ci-val">${roleText}</div></div>
    <div class="ci-item"><div class="ci-label">halaman yang bisa diakses</div><div class="ci-val">${allowedText}</div></div>
  `;
}

function panelToLabel(panel) {
  return {
    create: 'buat produk',
    update: 'perbarui produk',
    track: 'lacak produk',
    list: 'semua produk',
    roles: 'atur role'
  }[panel] || panel;
}

function ensureRole(requiredPanels, message) {
  const allowed = Array.isArray(requiredPanels) ? requiredPanels : [requiredPanels];
  const ok = allowed.some(panel => canAccessPanel(panel));
  if (!ok) toast(message, 'err');
  return ok;
}

// ── ROLE MANAGEMENT ──────────────────────────────────────────
async function checkWalletRole() {
  if (!isConnected || !contract) {
    toast('Hubungkan MetaMask terlebih dahulu.', 'err');
    return;
  }

  const wallet = document.getElementById('role-wallet').value.trim();
  if (!ethers.isAddress(wallet)) {
    toast('Alamat wallet tidak valid.', 'err');
    return;
  }

  try {
    const roleValue = Number(await contract.userRoles(wallet));
    const roleName = roleNameToLabel(roleValueToName(roleValue));
    const result = document.getElementById('role-result');
    result.style.display = 'block';
    result.innerHTML = `
      <div class="ci-item"><div class="ci-label">wallet</div><div class="ci-val" style="word-break:break-all">${wallet}</div></div>
      <div class="ci-item"><div class="ci-label">role</div><div class="ci-val">${roleName}</div></div>
    `;
  } catch (e) {
    toast('Gagal membaca role wallet: ' + (e.reason || e.message || e), 'err');
  }
}

async function setRoleFromUI() {
  if (!isConnected) {
    toast('Hubungkan MetaMask terlebih dahulu.', 'err');
    return;
  }
  if (currentRoleName !== 'admin') {
    toast('Hanya admin yang bisa mengatur role.', 'err');
    return;
  }

  const wallet = document.getElementById('role-wallet').value.trim();
  const roleValue = Number(document.getElementById('role-select').value);

  if (!ethers.isAddress(wallet)) {
    toast('Alamat wallet tidak valid.', 'err');
    return;
  }

  const btn = document.querySelector('#panel-roles .btn-primary');
  try {
    btn.disabled = true;
    btn.textContent = '⏳ Menunggu konfirmasi MetaMask…';
    toast('Konfirmasi transaksi di MetaMask…');

    const tx = await contract.setUserRole(wallet, roleValue);
    btn.textContent = '⛏️ Mining transaksi…';
    toast('Transaksi terkirim, menunggu konfirmasi blockchain…');
    await tx.wait();

    toast(`Role wallet berhasil diperbarui menjadi ${roleNameToLabel(roleValueToName(roleValue))}`);
    await checkWalletRole();

    if (wallet.toLowerCase() === currentAccount.toLowerCase()) {
      await loadUserRole();
      renderConnectionStatus();
      applyRoleUI();
      renderStatusOptions();
    }
  } catch (e) {
    toast('Gagal: ' + (e.reason || e.message || e), 'err');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Simpan Role';
  }
}

// ── LOAD ALL PRODUCTS FROM BLOCKCHAIN ───────────────────────
async function loadAllFromChain() {
  if (!isConnected || !contract) return;
  try {
    const ids = await contract.getAllProductIds();
    products = [];
    for (const id of ids) {
      const p = await fetchProduct(id);
      if (p) products.push(p);
    }
    updateAll();
    renderTable();
  } catch (e) {
    console.error('loadAllFromChain error:', e);
    toast('Gagal memuat data dari blockchain.', 'err');
  }
}

// ── FETCH SINGLE PRODUCT FROM CHAIN ─────────────────────────
async function fetchProduct(id) {
  try {
    const r = await contract.getProduct(id);
    const histCount = Number(await contract.getProductHistoryCount(id));
    const history = [];
    for (let i = 0; i < histCount; i++) {
      const h = await contract.getProductHistoryItem(id, i);
      history.push({
        time: new Date(Number(h.time) * 1000).toISOString(),
        location: h.location,
        status: mapStatus(h.status),
        desc: h.desc
      });
    }
    return {
      id: r.id,
      name: r.name,
      location: r.location,
      destination: r.destination,
      quantity: Number(r.quantity),
      company: r.company,
      notes: r.notes,
      status: mapStatus(r.status),
      createdAt: new Date(Number(r.createdAt) * 1000).toISOString(),
      updatedAt: new Date(Number(r.updatedAt) * 1000).toISOString(),
      history
    };
  } catch (e) {
    console.error('fetchProduct error:', id, e);
    return null;
  }
}

function mapStatus(s) {
  const m = {
    'Created': 'Menunggu',
    'Menunggu': 'Menunggu',
    'Di Gudang': 'Di Gudang',
    'Ready for Pickup': 'Siap Diambil',
    'Siap Diambil': 'Siap Diambil',
    'Picked Up by Distributor': 'Diambil Distributor',
    'Diambil Distributor': 'Diambil Distributor',
    'Dalam Transit': 'Dalam Transit',
    'In Transit': 'Dalam Transit',
    'Terkirim': 'Terkirim',
    'Delivered': 'Terkirim'
  };
  return m[s] || s;
}

// ── TOAST ────────────────────────────────────────────────────
function toast(msg, type = 'ok') {
  const d = document.createElement('div');
  d.className = 'toast' + (type === 'err' ? ' error' : '');
  d.innerHTML = (type === 'err' ? '❌' : '✅') + ' ' + msg;
  document.getElementById('toast-wrap').appendChild(d);
  setTimeout(() => d.remove(), 4000);
}

// ── BADGE ────────────────────────────────────────────────────
function badge(status) {
  const meta = STATUS_META[status] || STATUS_META['Menunggu'];
  return `<span class="badge ${meta.badge}"><span class="badge-dot"></span>${meta.icon} ${status}</span>`;
}

function getStatusOptionsForCurrentRole() {
  return STATUS_OPTIONS[currentRoleName] || STATUS_OPTIONS.none;
}

function renderStatusOptions(selectedValue = '') {
  const select = document.getElementById('u-status');
  if (!select) return;

  const options = getStatusOptionsForCurrentRole();
  select.innerHTML = `<option value="">— Pilih Status Baru —</option>` + options.map(status => {
    const meta = STATUS_META[status] || { icon: '•' };
    return `<option value="${status}">${meta.icon} ${status}</option>`;
  }).join('');

  select.disabled = options.length === 0;
  if (selectedValue && options.includes(selectedValue)) select.value = selectedValue;
}

// ── STATS & LIVE FEED ────────────────────────────────────────
function updateAll() {
  const total = products.length;
  const transit = products.filter(p => ['Diambil Distributor', 'Dalam Transit'].includes(p.status)).length;
  const warehouse = products.filter(p => ['Di Gudang', 'Siap Diambil'].includes(p.status)).length;
  const delivered = products.filter(p => p.status === 'Terkirim').length;
  const pending = products.filter(p => p.status === 'Menunggu').length;

  [
    ['h-total', total], ['h-transit', transit], ['h-delivered', delivered], ['h-warehouse', warehouse],
    ['s-total', total], ['s-transit', transit], ['s-warehouse', warehouse], ['s-delivered', delivered], ['s-pending', pending]
  ].forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });

  const feed = document.getElementById('live-feed');
  if (!products.length) {
    feed.innerHTML = '<div style="text-align:center;padding:20px;color:var(--gray-400);font-size:12px;">Belum ada aktivitas.</div>';
    return;
  }

  feed.innerHTML = [...products].reverse().slice(0, 5).map(p => {
    const meta = STATUS_META[p.status] || STATUS_META['Menunggu'];
    return `
      <div class="live-item">
        <div class="live-dot ${meta.dot}"></div>
        <div>
          <div class="live-name">${p.name}</div>
          <div class="live-meta">${p.status} · ${p.destination}</div>
        </div>
      </div>
    `;
  }).join('');
}

// ── CREATE PRODUCT ───────────────────────────────────────────
async function createProduct() {
  if (!isConnected) { toast('Hubungkan MetaMask terlebih dahulu.', 'err'); return; }
  if (!ensureRole('create', 'Role wallet kamu tidak bisa membuat produk')) return;

  const id = document.getElementById('c-id').value.trim();
  const name = document.getElementById('c-name').value.trim();
  const loc = document.getElementById('c-loc').value.trim();
  const dest = document.getElementById('c-dest').value.trim();
  const qty = document.getElementById('c-qty').value.trim();
  const company = document.getElementById('c-company').value.trim();
  const notes = document.getElementById('c-notes').value.trim();

  if (!id || !name || !loc || !dest || !qty || !company) {
    toast('Semua kolom wajib harus diisi.', 'err');
    return;
  }
  if (isNaN(qty) || Number(qty) <= 0) {
    toast('Jumlah produk harus berupa angka positif.', 'err');
    return;
  }

  const btn = document.querySelector('#panel-create .btn-primary');
  try {
    btn.disabled = true;
    btn.textContent = '⏳ Menunggu konfirmasi MetaMask…';
    toast('Konfirmasi transaksi di MetaMask…');

    const tx = await contract.createProduct(id, name, loc, dest, BigInt(qty), company, notes || '');
    btn.textContent = '⛏️ Mining transaksi…';
    toast('Transaksi terkirim, menunggu konfirmasi blockchain…');
    await tx.wait();

    toast(`Produk "${name}" berhasil didaftarkan ke blockchain`);
    resetCreate();
    await loadAllFromChain();
  } catch (e) {
    toast('Gagal: ' + (e.reason || e.message || e), 'err');
  } finally {
    btn.disabled = false;
    btn.textContent = '📦 Daftarkan Produk';
  }
}

function resetCreate() {
  ['c-id', 'c-name', 'c-loc', 'c-dest', 'c-qty', 'c-company', 'c-notes']
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
}

// ── UPDATE PRODUCT ───────────────────────────────────────────
function onUpdateInput() {
  const q = document.getElementById('u-id').value.trim().toLowerCase();
  const box = document.getElementById('u-search-results');
  if (!q) {
    box.innerHTML = '';
    box.style.display = 'none';
    hideUpdateForm();
    return;
  }

  const matches = products.filter(p =>
    p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
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
  document.getElementById('u-id').value = `${p.id} — ${p.name}`;
  document.getElementById('u-search-results').style.display = 'none';
  showUpdateForm(p);
}

function showUpdateForm(p) {
  document.getElementById('u-empty').style.display = 'none';
  document.getElementById('u-form').style.display = 'block';
  document.getElementById('u-cur-info').innerHTML = `
    <div class="ci-item"><div class="ci-label">Nama Produk</div><div class="ci-val">${p.name}</div></div>
    <div class="ci-item"><div class="ci-label">Lokasi Saat Ini</div><div class="ci-val">${p.location}</div></div>
    <div class="ci-item"><div class="ci-label">Tujuan</div><div class="ci-val">${p.destination}</div></div>
    <div class="ci-item"><div class="ci-label">Perusahaan</div><div class="ci-val">${p.company}</div></div>
    <div class="ci-item"><div class="ci-label">Status</div><div class="ci-val">${p.status}</div></div>
  `;
  document.getElementById('u-loc').value = '';
  renderStatusOptions();
  document.getElementById('u-status').value = '';
}

function hideUpdateForm() {
  _updateTarget = null;
  document.getElementById('u-form').style.display = 'none';
  document.getElementById('u-empty').style.display = 'block';
}

async function doUpdate() {
  if (!isConnected) { toast('Hubungkan MetaMask terlebih dahulu.', 'err'); return; }
  if (!ensureRole('update', 'Role wallet kamu tidak bisa memperbarui produk')) return;

  const p = _updateTarget;
  const newLoc = document.getElementById('u-loc').value.trim();
  const newSt = document.getElementById('u-status').value;

  if (!p) { toast('Pilih produk terlebih dahulu.', 'err'); return; }
  if (!newLoc && !newSt) { toast('Masukkan lokasi baru atau status baru.', 'err'); return; }

  const finalLoc = newLoc || p.location;
  const finalStatus = newSt || p.status;

  const btn = document.querySelector('#panel-update .btn-primary');
  try {
    btn.disabled = true;
    btn.textContent = '⏳ Menunggu konfirmasi MetaMask…';
    toast('Konfirmasi transaksi di MetaMask…');

    const tx = await contract.updateProduct(p.id, finalLoc, finalStatus);
    btn.textContent = '⛏️ Mining transaksi…';
    toast('Transaksi terkirim, menunggu konfirmasi blockchain…');
    await tx.wait();

    toast(`Produk "${p.name}" berhasil diperbarui di blockchain`);
    await loadAllFromChain();

    const updated = products.find(x => x.id === p.id);
    if (updated) {
      _updateTarget = updated;
      showUpdateForm(updated);
    }
  } catch (e) {
    toast('Gagal: ' + (e.reason || e.message || e), 'err');
  } finally {
    btn.disabled = false;
    btn.textContent = '✏️ Simpan Perubahan';
  }
}

// ── TRACK PRODUCT ────────────────────────────────────────────
function onTrackInput() {
  const q = document.getElementById('t-id').value.trim().toLowerCase();
  const box = document.getElementById('t-search-results');
  if (!q) { box.innerHTML = ''; box.style.display = 'none'; return; }

  const matches = products.filter(p =>
    p.id.toLowerCase().includes(q) || p.name.toLowerCase().includes(q)
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

async function doTrack() {
  const raw = document.getElementById('t-id').value.trim();
  document.getElementById('t-search-results').style.display = 'none';

  let p = products.find(x =>
    x.id.toLowerCase() === raw.toLowerCase() ||
    x.name.toLowerCase().includes(raw.toLowerCase()) ||
    raw.includes(x.id)
  );

  if (!p && isConnected && raw) {
    try {
      p = await fetchProduct(raw.trim());
      if (p) products.push(p);
    } catch (_) {}
  }

  if (!p) {
    toast('Produk tidak ditemukan.', 'err');
    document.getElementById('t-empty').style.display = 'block';
    document.getElementById('t-result').style.display = 'none';
    return;
  }

  renderTrack(p);
}

function renderTrack(p) {
  document.getElementById('t-empty').style.display = 'none';
  document.getElementById('t-result').style.display = 'block';

  document.getElementById('t-info').innerHTML = [
    ['ID Produk', `<span style="font-family:monospace;color:var(--teal-dark);font-weight:700">${p.id}</span>`],
    ['Nama Produk', p.name],
    ['Jumlah', `${p.quantity} unit`],
    ['Lokasi Saat Ini', p.location],
    ['Tujuan Pengiriman', p.destination],
    ['Perusahaan Penerima', p.company],
    ['Status', badge(p.status)],
    ['Catatan', p.notes || '—'],
    ['Didaftarkan', fmt(p.createdAt)],
    ['Terakhir Diperbarui', fmt(p.updatedAt)]
  ].map(([k, v]) => `
    <div class="info-row">
      <span class="info-key">${k}</span>
      <span class="info-val">${v}</span>
    </div>
  `).join('');

  document.getElementById('t-timeline').innerHTML = [...p.history].reverse().map((h, i) => `
    <li class="tl-item">
      <div class="tl-dot ${i === 0 ? 'current' : ''}"></div>
      <div class="tl-time">${fmt(h.time)}</div>
      <div class="tl-label">${h.status} · ${h.location}</div>
      <div class="tl-desc">${h.desc}</div>
    </li>
  `).join('');

  renderMap(p);
}

// ── ANIMATED MAP ─────────────────────────────────────────────
function renderMap(p) {
  const progress = (STATUS_META[p.status] || STATUS_META['Menunggu']).progress;
  document.getElementById('map-origin-label').textContent = shorten(p.location);
  document.getElementById('map-dest-label').textContent = shorten(p.destination);
  document.getElementById('map-company-label').textContent = shorten(p.company);
  startTruckAnimation(progress, p.status);
}

function shorten(str) {
  return str && str.length > 22 ? str.substring(0, 20) + '…' : (str || '');
}

function startTruckAnimation(targetPct, status) {
  if (_trackAnimInterval) {
    clearInterval(_trackAnimInterval);
    _trackAnimInterval = null;
  }

  const pathEl = document.getElementById('truck-road-path');
  const truckEl = document.getElementById('truck-icon-group');
  if (!pathEl || !truckEl) return;

  const totalLen = pathEl.getTotalLength();
  const endLen = (targetPct / 100) * totalLen;

  if (status === 'Terkirim') {
    const pt = pathEl.getPointAtLength(totalLen);
    truckEl.setAttribute('transform', `translate(${pt.x - 18}, ${pt.y - 18})`);
    document.getElementById('map-truck-icon').textContent = '✅';
    return;
  }

  document.getElementById('map-truck-icon').textContent = '';
  let current = 0;
  const startPt = pathEl.getPointAtLength(0);
  truckEl.setAttribute('transform', `translate(${startPt.x - 18}, ${startPt.y - 18})`);

  if (targetPct <= 5) {
    const pt = pathEl.getPointAtLength(endLen);
    truckEl.setAttribute('transform', `translate(${pt.x - 18}, ${pt.y - 18})`);
    return;
  }

  _trackAnimInterval = setInterval(() => {
    current += (endLen - current) * 0.035 + 0.8;
    if (current >= endLen) {
      current = endLen;
      clearInterval(_trackAnimInterval);
      _trackAnimInterval = null;
    }

    const pt = pathEl.getPointAtLength(current);
    const ptAhead = pathEl.getPointAtLength(Math.min(current + 4, totalLen));
    const angle = Math.atan2(ptAhead.y - pt.y, ptAhead.x - pt.x) * (180 / Math.PI);
    const wobble = Math.sin(current * 0.15) * 1.5;

    truckEl.setAttribute('transform',
      `translate(${pt.x - 18}, ${pt.y - 18 + wobble}) rotate(${angle}, 18, 18)`);
  }, 28);
}

// ── RENDER TABLE ─────────────────────────────────────────────
function renderTable() {
  const q = (document.getElementById('list-search')?.value || '').toLowerCase();
  const filtered = products.filter(p =>
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
  if (!filtered.length) {
    tbody.innerHTML = `
      <tr><td colspan="7">
        <div class="empty-state">
          <div class="empty-icon">📦</div>
          <div class="empty-title">${isConnected ? 'Belum Ada Produk' : 'Wallet Belum Terhubung'}</div>
          <div class="empty-sub">${isConnected ? 'Belum ada data produk di contract ini' : 'Hubungkan MetaMask untuk melihat data blockchain'}</div>
        </div>
      </td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(p => `
    <tr>
      <td class="td-id">${p.id}</td>
      <td class="td-name">${p.name}</td>
      <td>${p.quantity} unit</td>
      <td>${p.destination}</td>
      <td>${p.company}</td>
      <td>${badge(p.status)}</td>
      <td>
        <button class="btn btn-secondary" style="padding:5px 12px;font-size:12px" onclick="quickTrack('${p.id}')">🔍 Lacak</button>
      </td>
    </tr>
  `).join('');
}

function quickTrack(id) {
  const p = products.find(x => x.id === id);
  if (!p) return;
  document.getElementById('t-id').value = `${p.id} — ${p.name}`;
  activatePanel('track');
  renderTrack(p);
}

function quickSearch() {
  const q = document.getElementById('nav-search-box').value.trim();
  if (!q) return;
  document.getElementById('list-search').value = q;
  activatePanel('list');
  renderTable();
}

// Close dropdowns when clicking outside
document.addEventListener('click', e => {
  if (!e.target.closest('.search-wrap-rel')) {
    document.querySelectorAll('.search-results').forEach(el => el.style.display = 'none');
  }
});

// ── HELPERS ──────────────────────────────────────────────────
function fmt(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) +
         ' ' + d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

// ── INIT RENDER ──────────────────────────────────────────────
updateAll();
renderTable();
renderRolePageSummary();