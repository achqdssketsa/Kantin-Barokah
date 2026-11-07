// ============================================================
// BAROKAH · Tutup Kasir · app.js (v2.0.0)
// ============================================================
const firebaseConfig = {
  apiKey: "AIzaSyBn7vcKmacOkQGAO8W2WzIyJ331XqJccAg",
  authDomain: "kantin-barokah-7870a.firebaseapp.com",
  projectId: "kantin-barokah-7870a",
  storageBucket: "kantin-barokah-7870a.firebasestorage.app",
  messagingSenderId: "726876414448",
  appId: "1:726876414448:web:2e889fb5db4dda03f5bd35",
  measurementId: "G-T0PVFR937M"
};
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

const APP_VERSION = '2.1.0';
const DRIVE_UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbyunLWcCJpVO1sgJmWoY3tiHvkIEf8SbUUN1Uby3PGmtN4R0MGmjHlOaQ-1bLjRD4Y/exec';
const PHOTO_SIDE = 1024, AVATAR_SIDE = 512, PHOTO_QUALITY = 0.7;
const C = { closings: 'daily_closings', users: 'users', products: 'products', costs: 'product_costs', withdrawals: 'owner_withdrawals' };
const PALETTE = ['#1d4d2c', '#c9963e', '#4f8a63', '#e3c57a', '#8c5a2b', '#2f6b4f', '#b9a27a'];
const GREEN = '#1d4d2c', GOLD = '#c9963e';

// ============================================================
// IKON (outline, gaya elegan)
// ============================================================
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20c0-3-1.8-5.4-4.5-6.2"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="M11 12l9-9M17 6l3 3M15 8l2 2"/>',
  eye: '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v12H4z"/><circle cx="12" cy="13" r="3.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  chev: '<path d="M9 6l6 6-6 6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
  logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  tag: '<path d="M3 12V3h9l9 9-9 9z"/><circle cx="8" cy="8" r="1.5"/>',
  wallet: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M16 15h2"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>'
};
const ic = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
function hydrate(root = document) {
  root.querySelectorAll('[data-i]').forEach((el) => { if (!el.innerHTML.trim()) el.innerHTML = ic(el.dataset.i); });
}

// ============================================================
// HELPER
// ============================================================
const $ = (id) => document.getElementById(id);
const num = (v) => Number(v) || 0;
const rp = (n) => 'Rp ' + Math.round(num(n)).toLocaleString('id-ID');
const signedRp = (n) => (n > 0 ? '+' : n < 0 ? '−' : '') + rp(Math.abs(n));
const toISODate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayStr = () => toISODate(new Date());
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtSize = (b) => b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.round(b / 1024) + ' KB';
const fmtDate = (s) => new Date(s + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
const usernameToEmail = (u) => { const v = u.trim().toLowerCase(); return v.includes('@') ? v : `${v}@kantin.app`; };
const isNative = () => !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());
const avatarHtml = (u) => u.photoUrl
  ? `<img src="${esc(u.photoUrl)}" alt="">`
  : `<span>${esc((u.name || u.username || '?').charAt(0).toUpperCase())}</span>`;

// ============================================================
// STATE
// ============================================================
let profile = null;
let products = [];          // { id, name, category, price, active }
let costs = {};             // productId -> hpp (hanya owner)
let allClosings = [];       // laporan tutup kasir
let withdrawals = [];       // pengambilan owner
let allUsers = [];
let pendingPhotos = [];     // { blob, url }
let pendingAvatar = null;   // blob
let unsubs = [];
const charts = {};

// ============================================================
// EFEK GESTUR: riak saat disentuh + getaran ringan
// ============================================================
document.addEventListener('pointerdown', (e) => {
  const t = e.target.closest('button, .tap');
  // Menu bawah & pengaturan memakai gestur ikon membesar, bukan riak
  if (!t || t.disabled || t.classList.contains('nav-btn') || t.classList.contains('menu-item')) return;
  const r = t.getBoundingClientRect();
  const size = Math.max(r.width, r.height);
  const span = document.createElement('span');
  span.className = 'ripple';
  span.style.width = span.style.height = size + 'px';
  span.style.left = (e.clientX - r.left - size / 2) + 'px';
  span.style.top = (e.clientY - r.top - size / 2) + 'px';
  t.appendChild(span);
  setTimeout(() => span.remove(), 650);
  if (navigator.vibrate) navigator.vibrate(8);
}, { passive: true });

// ============================================================
// TOAST, SHEET, VIEWER
// ============================================================
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2600);
}
function openSheet(html, mount) {
  $('sheetBody').innerHTML = html;
  hydrate($('sheetBody'));
  $('sheet').classList.add('open');
  if (mount) mount();
}
function closeSheet() { $('sheet').classList.remove('open'); }
$('sheet').addEventListener('click', (e) => {
  if (e.target.id === 'sheet' || e.target.closest('[data-close]')) closeSheet();
});
$('sheetBody').addEventListener('click', (e) => {
  const im = e.target.closest('.photo-mini');
  if (im) return openViewer(im.dataset.url);
  const ed = e.target.closest('[data-edit]');
  if (ed) return openEditClosing(ed.dataset.edit);
  const del = e.target.closest('[data-del]');
  if (del) deleteClosing(del.dataset.del);
});
function openViewer(url) { $('viewerImg').src = url; $('viewer').classList.add('show'); }
$('viewer').addEventListener('click', () => $('viewer').classList.remove('show'));

// ============================================================
// KOMPRESI & UPLOAD (Google Drive via Apps Script)
// ============================================================
function compressImage(file, side) {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: PHOTO_QUALITY, maxWidth: side, maxHeight: side, mimeType: 'image/jpeg',
      success: resolve, error: reject
    });
  });
}
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('Gagal membaca foto'));
    reader.readAsDataURL(blob);
  });
}
async function uploadToDrive(blob, fileName) {
  const idToken = await auth.currentUser.getIdToken();
  const data = await blobToBase64(blob);
  let res;
  try {
    res = await fetch(DRIVE_UPLOAD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // hindari preflight CORS
      body: JSON.stringify({ idToken, fileName, mimeType: 'image/jpeg', data })
    });
  } catch (err) {
    throw new Error('Tidak bisa terhubung ke server Drive. Periksa koneksi internet.');
  }
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); }
  catch (err) {
    throw new Error(`Server Drive membalas halaman, bukan data (HTTP ${res.status}). Pastikan deployment "Anyone" dan kode Apps Script terbaru.`);
  }
  if (!json.ok) throw new Error(json.error || `Upload ditolak server (HTTP ${res.status}).`);
  return json; // { fileId, url }
}

// ============================================================
// LOGIN & SESI
// ============================================================
const AUTH_ERRORS = {
  'auth/user-not-found': 'Username atau password salah.',
  'auth/wrong-password': 'Username atau password salah.',
  'auth/invalid-credential': 'Username atau password salah.',
  'auth/invalid-email': 'Format username tidak valid.',
  'auth/too-many-requests': 'Terlalu banyak percobaan. Coba lagi beberapa menit.',
  'auth/network-request-failed': 'Tidak ada koneksi internet.'
};

$('formLogin').addEventListener('submit', async (e) => {
  e.preventDefault();
  $('loginError').textContent = '';
  const btn = $('btnLogin');
  btn.disabled = true; btn.textContent = 'Memproses...';
  try {
    await auth.signInWithEmailAndPassword(usernameToEmail($('loginUsername').value), $('loginPassword').value);
  } catch (err) {
    $('loginError').textContent = AUTH_ERRORS[err.code] || 'Gagal login: ' + err.message;
  } finally {
    btn.disabled = false; btn.textContent = 'Masuk';
  }
});
$('togglePw').addEventListener('click', () => {
  const pw = $('loginPassword');
  pw.type = pw.type === 'password' ? 'text' : 'password';
});
$('btnForgot').addEventListener('click', () => toast('Silakan hubungi Owner untuk reset password.'));

auth.onAuthStateChanged(async (user) => {
  if (!user) return showLogin();
  try {
    const snap = await db.collection(C.users).doc(user.uid).get();
    if (!snap.exists) {
      alert('Akun ini belum terdaftar di sistem. Hubungi Owner.');
      return auth.signOut();
    }
    const d = snap.data();
    if (d.role === 'nonaktif') {
      alert('Akun Anda sudah dinonaktifkan. Hubungi Owner.');
      return auth.signOut();
    }
    profile = { uid: user.uid, username: d.username, name: d.name || d.username, role: d.role, photoUrl: d.photoUrl || '' };
    showApp();
  } catch (err) {
    alert('Gagal memuat profil: ' + err.message);
    auth.signOut();
  }
});

function showLogin() {
  profile = null;
  stopListeners();
  $('viewApp').classList.add('hidden');
  $('viewLogin').classList.remove('hidden');
  $('formLogin').reset();
}

function showApp() {
  $('viewLogin').classList.add('hidden');
  $('viewApp').classList.remove('hidden');
  const owner = profile.role === 'owner';
  document.body.classList.toggle('is-owner', owner);
  paintHeader();
  renderSettings();
  $('kasirDate').textContent = fmtDate(todayStr());
  startListeners();
  showTab(owner ? 'dashboard' : 'kasir');
}

function paintHeader() {
  $('btnProfile').innerHTML = avatarHtml(profile);
  $('hdrRole').textContent = profile.role === 'owner' ? 'Owner' : 'Kasir';
}

function showTab(name) {
  const owner = profile?.role === 'owner';
  if (!owner && (name === 'dashboard' || name === 'products')) name = 'kasir';
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.id === 'tab-' + name));
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
document.querySelectorAll('.nav-btn').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));
$('btnProfile').addEventListener('click', () => showTab('settings'));

// ============================================================
// LISTENER FIRESTORE
// ============================================================
function startListeners() {
  stopListeners();
  unsubs.push(db.collection(C.products).orderBy('name').onSnapshot((s) => {
    products = s.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderProductPicker();
    refreshOwner();
  }, (err) => console.error('products', err)));

  if (profile.role !== 'owner') return;

  unsubs.push(db.collection(C.costs).onSnapshot((s) => {
    costs = {};
    s.forEach((d) => { costs[d.id] = num(d.data().hpp); });
    refreshOwner();
  }));
  unsubs.push(db.collection(C.closings).orderBy('date', 'desc').limit(1000).onSnapshot((s) => {
    allClosings = s.docs.map((d) => ({ id: d.id, ...d.data() }));
    refreshOwner();
  }, (err) => alert('Gagal memuat laporan: ' + err.message)));
  unsubs.push(db.collection(C.withdrawals).orderBy('date', 'desc').onSnapshot((s) => {
    withdrawals = s.docs.map((d) => ({ id: d.id, ...d.data() }));
    refreshOwner();
  }));
  unsubs.push(db.collection(C.users).orderBy('username').onSnapshot((s) => {
    allUsers = s.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderUsersList();
  }));
}

function stopListeners() {
  unsubs.forEach((u) => u());
  unsubs = [];
  allClosings = []; withdrawals = []; allUsers = []; costs = {}; products = [];
}

function refreshOwner() {
  if (profile?.role === 'owner') { renderDashboard(); renderProductsTab(); }
}

// ============================================================
// PERHITUNGAN (kas, HPP, laba)
// ============================================================
function withdrawalsByDate() {
  const m = {};
  withdrawals.forEach((w) => { m[w.date] = (m[w.date] || 0) + num(w.amount); });
  return m;
}

// Kas seharusnya = modal + tunai − pengeluaran dari laci − pengambilan owner
// HPP = qty × HPP produk; Laba bersih = omset − HPP − pengeluaran toko
function calcClosing(c, wdMap) {
  const items = c.items || [];
  const stockBased = items.some((i) => i.akhir !== undefined);
  let soldRev = 0, soldHpp = 0, negative = false;
  const detail = items.map((i) => {
    // Stok terjual = stok awal + barang masuk − sisa hitung fisik
    const terjual = stockBased ? num(i.awal) + num(i.masuk) - num(i.akhir) : num(i.qty);
    if (terjual < 0) negative = true;
    const rev = terjual * num(i.price);
    const hpp = terjual * num(costs[i.id]);
    soldRev += rev;
    soldHpp += hpp;
    return { ...i, terjual, rev, hpp };
  });
  const opexTotal = num(c.opexTotal ?? c.totalOpex);
  const opexBiaya = c.opexBiaya != null ? num(c.opexBiaya) : opexTotal; // data lama dianggap biaya
  const opexDrawer = c.opexDrawer != null ? num(c.opexDrawer) : opexTotal;
  const gross = num(c.grossRevenue) || num(c.cashRevenue) + num(c.qrisRevenue);
  const expected = num(c.startingCash) + num(c.cashRevenue) - opexDrawer - (wdMap[c.date] || 0);
  const diff = num(c.actualCash) - expected;
  const omsetDiff = stockBased ? gross - soldRev : 0;   // + lebih, − kurang (potensi bocor)
  const net = gross - soldHpp - opexBiaya;               // belanja stok bukan biaya (sudah jadi stok)
  return {
    gross, expected, diff, hpp: soldHpp, soldRev, omsetDiff, negative, net,
    opexTotal, opexBiaya, opexStok: opexTotal - opexBiaya, detail, stockBased
  };
}


// Bucket grafik: per hari (≤ 31 hari) atau per bulan
function buildBuckets(from, to) {
  const s = new Date(from + 'T00:00:00');
  const e = new Date(to + 'T00:00:00');
  const days = Math.round((e - s) / 86400000) + 1;
  const buckets = [];
  if (days <= 31) {
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      const key = toISODate(d);
      buckets.push({ label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), match: (c) => c.date === key });
    }
  } else {
    for (let d = new Date(s.getFullYear(), s.getMonth(), 1); d <= e; d.setMonth(d.getMonth() + 1)) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets.push({ label: d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }), match: (c) => c.date.startsWith(key) });
    }
  }
  return buckets;
}

function getRange() {
  let from = $('dashFrom').value || todayStr();
  let to = $('dashTo').value || todayStr();
  if (from > to) [from, to] = [to, from];
  return { from, to };
}
const inRange = (list, from, to) => list.filter((x) => x.date >= from && x.date <= to);

// ============================================================
// FORM TUTUP KASIR (kasir)
// ============================================================
function collectStock() {
  const m = {};
  document.querySelectorAll('.stock-row').forEach((r) => {
    m[r.dataset.id] = {
      masuk: r.querySelector('.sr-masuk').value,
      sisa: r.querySelector('.sr-sisa').value
    };
  });
  return m;
}

function renderProductPicker() {
  const el = $('productPicker');
  if (!el) return;
  const keep = collectStock();
  const active = products.filter((p) => p.active !== false);
  if (!active.length) {
    el.innerHTML = `<p class="hint center">Belum ada produk. Owner perlu menambahkannya di menu Produk.</p>`;
    return;
  }
  el.innerHTML = `<div class="stock-head"><span>Produk</span><span class="c">Awal</span><span class="c">Masuk</span><span class="c">Sisa</span></div>`
    + active.map((p) => `
      <div class="stock-row" data-id="${p.id}">
        <div class="sr-name"><strong>${esc(p.name)}</strong><small>${esc(p.category || '')}</small></div>
        <span class="sr-awal">${num(p.stock)}</span>
        <input type="number" class="sr-masuk" inputmode="numeric" min="0" placeholder="0">
        <input type="number" class="sr-sisa" inputmode="numeric" min="0" placeholder="0">
      </div>`).join('');
  // Pertahankan isian yang sudah diketik saat data produk berubah
  el.querySelectorAll('.stock-row').forEach((r) => {
    const k = keep[r.dataset.id];
    if (!k) return;
    r.querySelector('.sr-masuk').value = k.masuk;
    r.querySelector('.sr-sisa').value = k.sisa;
  });
}

$('opexList').addEventListener('click', (e) => {
  const b = e.target.closest('.icon-btn');
  if (b) b.closest('.opex-row').remove();
});
function addOpexRow() {
  $('opexList').insertAdjacentHTML('beforeend', opexEditHtml());
}
$('btnAddOpex').addEventListener('click', () => addOpexRow());


$('proofInput').addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  e.target.value = '';
  for (const f of files) {
    try {
      const blob = await compressImage(f, PHOTO_SIDE);
      pendingPhotos.push({ blob, url: URL.createObjectURL(blob), orig: f.size });
    } catch (err) {
      console.error(err);
      toast('Ada foto yang gagal diproses');
    }
  }
  renderPhotos();
});

function renderPhotos() {
  const tiles = pendingPhotos.map((p, i) => `
    <div class="thumb-card">
      <img src="${p.url}" alt="Foto ${i + 1}">
      <span class="size">${fmtSize(p.blob.size)}</span>
      <button type="button" class="thumb-x" data-i="${i}" aria-label="Hapus foto">${ic('x')}</button>
    </div>`).join('');
  const add = `<label class="thumb-add" for="proofInput">
      <span class="ta-ic">${ic('camera')}</span>
      <small>${pendingPhotos.length ? 'Tambah foto' : 'Ambil / pilih foto'}</small>
    </label>`;
  $('photoGrid').innerHTML = tiles + add;

  if (!pendingPhotos.length) {
    $('photoHint').textContent = 'Foto nota atau bukti belanja. Otomatis dikompres sebelum dikirim.';
  } else {
    const before = pendingPhotos.reduce((s, p) => s + p.orig, 0);
    const after = pendingPhotos.reduce((s, p) => s + p.blob.size, 0);
    $('photoHint').textContent = `${pendingPhotos.length} foto · ${fmtSize(before)} → ${fmtSize(after)} setelah dikompres`;
  }
}

$('photoGrid').addEventListener('click', (e) => {
  const b = e.target.closest('.thumb-x');
  if (!b) return;
  pendingPhotos.splice(Number(b.dataset.i), 1);
  renderPhotos();
});

function readClosingForm() {
  const opex = [];
  document.querySelectorAll('#opexList .opex-row').forEach((r) => {
    const desc = r.querySelector('.opex-desc').value.trim();
    const amount = num(r.querySelector('.opex-amount').value);
    const fromDrawer = r.querySelector('.opex-drawer').checked;
    const kind = r.querySelector('.opex-kind').value;
    if (desc || amount) opex.push({ desc, amount, fromDrawer, kind });
  });

  const items = [];
  let missing = 0;
  document.querySelectorAll('.stock-row').forEach((r) => {
    const p = products.find((x) => x.id === r.dataset.id);
    if (!p) return;
    const sisaRaw = r.querySelector('.sr-sisa').value;
    if (sisaRaw === '') missing++;
    items.push({
      id: p.id,
      name: p.name,
      price: num(p.price),
      awal: num(p.stock),
      masuk: num(r.querySelector('.sr-masuk').value),
      akhir: num(sisaRaw)
    });
  });

  const cashRevenue = num($('cashRevenue').value);
  const qrisRevenue = num($('qrisRevenue').value);
  const sumIf = (fn) => opex.filter(fn).reduce((s, o) => s + o.amount, 0);
  return {
    date: todayStr(),
    startingCash: num($('startingCash').value),
    cashRevenue, qrisRevenue,
    grossRevenue: cashRevenue + qrisRevenue,
    items, missing,
    opex,
    opexTotal: sumIf(() => true),
    opexDrawer: sumIf((o) => o.fromDrawer),
    opexBiaya: sumIf((o) => o.kind !== 'stok'),
    opexStok: sumIf((o) => o.kind === 'stok'),
    actualCash: num($('actualCash').value),
    checklist: {
      counted: $('chkCounted').checked,
      photos: $('chkPhotos').checked,
      stock: $('chkStock').checked
    },
    notes: $('notes').value.trim()
  };
}


function setBusy(on, text = 'Kirim tutup kasir') {
  const b = $('btnSubmit');
  b.disabled = on;
  b.textContent = text;
}

function resetClosingForm() {
  $('formClosing').reset();
  $('opexList').innerHTML = '';
  pendingPhotos.forEach((p) => URL.revokeObjectURL(p.url));
  pendingPhotos = [];
  renderPhotos();
  renderProductPicker();
}


$('formClosing').addEventListener('submit', async (e) => {
  e.preventDefault();
  const raw = readClosingForm();
  if (!$('startingCash').value) return toast('Isi modal awal di laci');
  if (!$('cashRevenue').value || !$('qrisRevenue').value) return toast('Isi penjualan tunai dan QRIS (boleh 0)');
  if (!$('actualCash').value) return toast('Hitung uang fisik di laci');
  if (!raw.items.length) return toast('Belum ada produk. Owner perlu menambahkannya di menu Produk.');
  if (raw.missing) return toast(`Isi stok sisa untuk ${raw.missing} produk`);
  if (!Object.values(raw.checklist).every(Boolean)) return toast('Lengkapi checklist akhir hari');
  if (!pendingPhotos.length && !confirm('Belum ada foto nota. Tetap kirim?')) return;

  const { missing, ...data } = raw;
  setBusy(true, 'Mengunggah...');
  try {
    const proofImages = [];
    const proofFileIds = [];
    for (let i = 0; i < pendingPhotos.length; i++) {
      setBusy(true, `Mengunggah foto ${i + 1}/${pendingPhotos.length}...`);
      const r = await uploadToDrive(pendingPhotos[i].blob, `${profile.uid}_${data.date}_${Date.now()}_${i}.jpg`);
      proofImages.push(r.url);
      proofFileIds.push(r.fileId);
    }
    setBusy(true, 'Menyimpan laporan...');

    // Satu batch: simpan laporan + perbarui stok produk ke sisa hitung fisik.
    // Jika laporan hari ini sudah ada, seluruh batch gagal (tidak ada stok yang berubah).
    const batch = db.batch();
    batch.set(db.collection(C.closings).doc(data.date), {
      ...data,
      kasirName: profile.name,
      submittedBy: profile.uid,
      proofImages,
      proofFileIds,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    data.items.forEach((i) => batch.update(db.collection(C.products).doc(i.id), { stock: i.akhir }));
    await batch.commit();

    resetClosingForm();
    openSheet(`
      <div class="empty" style="padding-top:18px">
        ${ic('check')}
        <h3 class="sheet-title">Laporan terkirim</h3>
        <p class="hint">Terima kasih. Laporan dan stok hari ini sudah tersimpan.</p>
      </div>
      <button class="btn-primary" data-close>Tutup</button>`);
  } catch (err) {
    console.error(err);
    if (err.code === 'permission-denied') {
      alert('Laporan untuk hari ini sudah pernah dikirim. Hubungi Owner jika perlu koreksi.');
    } else {
      alert('Gagal menyimpan: ' + err.message);
    }
  } finally {
    setBusy(false);
  }
});

// ============================================================
function renderProductsTab() {
  const el = $('productList');
  if (!el || profile?.role !== 'owner') return;
  if (!products.length) {
    el.innerHTML = `<div class="empty">${ic('box')}<p>Belum ada produk. Tambahkan produk pertama Anda.</p></div>`;
    return;
  }
  el.innerHTML = products.map((p) => {
    const hpp = num(costs[p.id]);
    const stock = num(p.stock);
    const margin = p.price ? Math.round(((num(p.price) - hpp) / num(p.price)) * 100) : 0;
    return `<div class="prod-card tap ${p.active === false ? 'off' : ''}" data-id="${p.id}">
      <div class="prod-ic">${ic('tag')}</div>
      <div class="prod-main">
        <strong>${esc(p.name)}</strong>
        <small>${esc(p.category || 'Umum')} · HPP ${rp(hpp)} · Stok ${stock}</small>
        <small>Nilai stok ${rp(stock * hpp)}</small>
      </div>
      <div class="prod-price"><strong>${rp(p.price)}</strong><span class="chip ${margin >= 0 ? 'ok' : 'no'}">Margin ${margin}%</span></div>
    </div>`;
  }).join('');
}

$('productList').addEventListener('click', (e) => {
  const card = e.target.closest('.prod-card');
  if (card) openProductSheet(card.dataset.id);
});
$('btnAddProduct').addEventListener('click', () => openProductSheet(null));

function openProductSheet(id) {
  const p = id ? products.find((x) => x.id === id) : null;
  openSheet(`
    <h3 class="sheet-title">${p ? 'Edit produk' : 'Produk baru'}</h3>
    <div class="field"><label for="pName">Nama produk</label><input type="text" id="pName" value="${esc(p?.name || '')}" placeholder="mis. Nasi Goreng"></div>
    <div class="field"><label for="pCat">Kategori</label><input type="text" id="pCat" value="${esc(p?.category || '')}" placeholder="mis. Makanan"></div>
    <div class="row2">
      <div class="field"><label for="pPrice">Harga jual</label><input type="number" id="pPrice" inputmode="numeric" min="0" value="${p ? num(p.price) : ''}"></div>
      <div class="field"><label for="pHpp">HPP per unit</label><input type="number" id="pHpp" inputmode="numeric" min="0" value="${p ? num(costs[p.id]) : ''}"></div>
    </div>
    <div class="field"><label for="pStock">${p ? 'Stok sekarang (koreksi)' : 'Stok awal (hitung fisik)'}</label>
      <input type="number" id="pStock" inputmode="numeric" min="0" value="${p ? num(p.stock) : ''}"></div>
    <p class="hint" id="pMargin"></p>
    <button class="btn-primary" id="pSave">${ic('check')}Simpan</button>
    ${p ? `<button class="btn-ghost" id="pToggle">${p.active === false ? 'Aktifkan produk' : 'Nonaktifkan produk'}</button>` : ''}
  `, () => {
    const preview = () => {
      const price = num($('pPrice').value), hpp = num($('pHpp').value), stock = num($('pStock').value);
      $('pMargin').textContent = price
        ? `Laba per unit ${rp(price - hpp)} (margin ${Math.round(((price - hpp) / price) * 100)}%) · Nilai stok ${rp(stock * hpp)}`
        : '';
    };
    ['pPrice', 'pHpp', 'pStock'].forEach((x) => $(x).addEventListener('input', preview));
    preview();

    $('pSave').onclick = async () => {
      const name = $('pName').value.trim();
      if (!name) return toast('Nama produk wajib diisi');
      try {
        const ref = p ? db.collection(C.products).doc(p.id) : db.collection(C.products).doc();
        await ref.set({
          name,
          category: $('pCat').value.trim() || 'Umum',
          price: num($('pPrice').value),
          stock: num($('pStock').value),
          active: p ? p.active !== false : true
        }, { merge: true });
        await db.collection(C.costs).doc(ref.id).set({ hpp: num($('pHpp').value) });
        closeSheet();
        toast('Produk tersimpan');
      } catch (err) { alert('Gagal menyimpan: ' + err.message); }
    };
    if (p) $('pToggle').onclick = async () => {
      await db.collection(C.products).doc(p.id).update({ active: p.active === false });
      closeSheet();
      toast(p.active === false ? 'Produk diaktifkan' : 'Produk dinonaktifkan');
    };
  });
}


// ============================================================
// BERANDA (owner)
// ============================================================
const setText = (id, t) => { $(id).textContent = t; };

function renderDashboard() {
  if (profile?.role !== 'owner') return;
  const { from, to } = getRange();
  const list = inRange(allClosings, from, to);
  const wd = inRange(withdrawals, from, to);
  const wdMap = withdrawalsByDate();
  const rows = list.map((c) => ({ c, k: calcClosing(c, wdMap) }));
  const T = (fn) => rows.reduce((s, r) => s + fn(r), 0);

  const gross = T((r) => r.k.gross);
  const cash = T((r) => num(r.c.cashRevenue));
  const qris = T((r) => num(r.c.qrisRevenue));
  const omsetDiff = T((r) => r.k.omsetDiff);
  const diff = T((r) => r.k.diff);

  setText('sumTotal', rp(gross));
  setText('sumCash', rp(cash));
  setText('sumQris', rp(qris));
  setText('cardGross', rp(gross));
  setText('cardExpected', rp(T((r) => r.k.soldRev)));
  setText('cardLeak', signedRp(omsetDiff));
  $('cardLeak').parentElement.classList.toggle('alert', omsetDiff < 0);
  setText('cardHpp', rp(T((r) => r.k.hpp)));
  setText('cardOpex', rp(T((r) => r.k.opexBiaya)));
  setText('cardNet', rp(T((r) => r.k.net)));
  setText('cardDiff', signedRp(diff));
  $('cardDiff').className = 'stat-val ' + (diff < 0 ? 'neg' : diff > 0 ? 'pos' : '');
  setText('cardStock', rp(products
    .filter((p) => p.active !== false)
    .reduce((s, p) => s + num(p.stock) * num(costs[p.id]), 0)));

  renderAlerts(rows);
  renderPayment(gross, cash, qris);
  renderTopProducts(rows);
  renderTrend(rows, from, to);
  renderDistribution(rows);
  renderWithdrawals(wd);
  renderClosingList(rows);
}


function renderAlerts(rows) {
  const bad = rows.filter(({ k }) => k.diff !== 0 || k.omsetDiff !== 0 || k.negative);
  $('alertList').innerHTML = bad.length ? bad.map(({ c, k }) => {
    const parts = [];
    if (k.diff) parts.push(k.diff < 0 ? `Kas laci kurang ${rp(-k.diff)}` : `Kas laci lebih ${rp(k.diff)}`);
    if (k.omsetDiff) parts.push(k.omsetDiff < 0
      ? `Omset kurang ${rp(-k.omsetDiff)} dari stok terjual`
      : `Omset lebih ${rp(k.omsetDiff)} dari stok terjual`);
    if (k.negative) parts.push('Ada stok sisa melebihi stok yang tersedia');
    return `<div class="alert-item tap" data-id="${c.id}">
      <span class="alert-ic">${ic('alert')}</span>
      <div><strong>${fmtDate(c.date)} · ${esc(c.kasirName || '-')}</strong><small>${parts.join(' · ')}</small></div>
      <span class="chev">${ic('chev')}</span>
    </div>`;
  }).join('') : `<div class="ok-banner">${ic('check')}Semua laporan dalam periode ini sudah sesuai</div>`;
}


function renderPayment(gross, cash, qris) {
  const pct = (v) => gross ? ((v / gross) * 100).toFixed(1) + '%' : '0%';
  $('payTable').innerHTML = `
    <tr><td>Tunai</td><td class="r">${rp(cash)}</td><td class="r">${pct(cash)}</td></tr>
    <tr><td>QRIS / Transfer</td><td class="r">${rp(qris)}</td><td class="r">${pct(qris)}</td></tr>
    <tr class="total"><td>Total</td><td class="r">${rp(gross)}</td><td class="r">${gross ? '100%' : '0%'}</td></tr>`;
}

function renderTopProducts(rows) {
  const agg = {};
  rows.forEach(({ k }) => k.detail.forEach((d) => {
    const a = agg[d.id] || (agg[d.id] = { name: d.name, qty: 0, rev: 0, hpp: 0 });
    a.qty += d.terjual;
    a.rev += d.rev;
    a.hpp += d.hpp;
  }));
  const list = Object.values(agg).sort((a, b) => b.rev - a.rev).slice(0, 8);
  $('topProducts').innerHTML = list.length ? list.map((r) => `
    <tr><td>${esc(r.name)}</td><td class="c">${r.qty}</td><td class="r">${rp(r.rev)}</td>
    <td class="r ${r.rev - r.hpp < 0 ? 'no' : 'ok'}">${rp(r.rev - r.hpp)}</td></tr>`).join('')
    : `<tr><td colspan="4" class="muted center">Belum ada stok terjual pada periode ini</td></tr>`;
}


function renderTrend(rows, from, to) {
  if (typeof Chart === 'undefined') return;
  const buckets = buildBuckets(from, to);
  const sumB = (b, key) => rows.filter((r) => b.match(r.c)).reduce((s, r) => s + r.k[key], 0);
  charts.trend?.destroy();
  charts.trend = new Chart($('chartTrend'), {
    type: 'bar',
    data: {
      labels: buckets.map((b) => b.label),
      datasets: [
        { label: 'Omset', data: buckets.map((b) => sumB(b, 'gross')), backgroundColor: GREEN, borderRadius: 4 },
        { label: 'Laba bersih', data: buckets.map((b) => sumB(b, 'net')), backgroundColor: GOLD, borderRadius: 4 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { ticks: { callback: (v) => Number(v).toLocaleString('id-ID') } } }
    }
  });
}

function renderDistribution(rows) {
  if (typeof Chart === 'undefined') return;
  const catOf = Object.fromEntries(products.map((p) => [p.id, p.category || 'Umum']));
  const map = {};
  rows.forEach(({ k }) => k.detail.forEach((d) => {
    const cat = catOf[d.id] || 'Lainnya';
    map[cat] = (map[cat] || 0) + d.rev;
  }));
  const labels = Object.keys(map);
  charts.dist?.destroy();
  charts.dist = new Chart($('chartDist'), {
    type: 'doughnut',
    data: {
      labels: labels.length ? labels : ['Belum ada data'],
      datasets: [{
        data: labels.length ? labels.map((k) => map[k]) : [1],
        backgroundColor: labels.length ? PALETTE.slice(0, labels.length) : ['#e7dbb8'],
        borderWidth: 0
      }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
  });
}


function renderWithdrawals(wd) {
  $('withdrawList').innerHTML = wd.length ? wd.map((w) => `
    <div class="row-card">
      <span class="rc-ic">${ic('wallet')}</span>
      <div class="rc-main"><strong>${rp(w.amount)}</strong><small>${fmtDate(w.date)} · ${esc(w.note || 'Tanpa catatan')}</small></div>
      <button class="rc-del" data-del-w="${w.id}" aria-label="Hapus">${ic('trash')}</button>
    </div>`).join('') : `<p class="muted center pad-y">Belum ada pengambilan pada periode ini</p>`;
}
$('withdrawList').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-del-w]');
  if (!b || !confirm('Hapus catatan pengambilan ini?')) return;
  try { await db.collection(C.withdrawals).doc(b.dataset.delW).delete(); toast('Catatan dihapus'); }
  catch (err) { alert('Gagal hapus: ' + err.message); }
});

$('btnAddWithdraw').addEventListener('click', () => {
  openSheet(`
    <h3 class="sheet-title">Catat pengambilan owner</h3>
    <p class="hint">Pengambilan ini mengurangi uang yang seharusnya ada di laci pada tanggal tersebut, sehingga selisih kas tetap akurat.</p>
    <div class="field"><label for="wdDate">Tanggal</label><input type="date" id="wdDate" value="${todayStr()}"></div>
    <div class="field"><label for="wdAmount">Jumlah</label><div class="money"><span>Rp</span><input type="number" id="wdAmount" inputmode="numeric" min="1"></div></div>
    <div class="field"><label for="wdNote">Catatan</label><input type="text" id="wdNote" placeholder="mis. setoran ke bank"></div>
    <button class="btn-primary" id="wdSave">${ic('check')}Simpan</button>
  `, () => {
    $('wdSave').onclick = async () => {
      const amount = num($('wdAmount').value);
      if (amount <= 0) return toast('Isi jumlah pengambilan');
      try {
        await db.collection(C.withdrawals).add({
          date: $('wdDate').value, amount, note: $('wdNote').value.trim(),
          by: profile.name, createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        closeSheet();
        toast('Pengambilan dicatat');
      } catch (err) { alert('Gagal menyimpan: ' + err.message); }
    };
  });
});

function renderClosingList(rows) {
  const el = $('closingList');
  if (!rows.length) {
    el.innerHTML = `<p class="muted center pad-y">Belum ada laporan pada periode ini</p>`;
    return;
  }
  el.innerHTML = rows.map(({ c, k }) => {
    const st = k.diff === 0 ? `<span class="chip ok">Pas</span>`
      : k.diff < 0 ? `<span class="chip no">Kurang ${rp(-k.diff)}</span>`
      : `<span class="chip warn">Lebih ${rp(k.diff)}</span>`;
    return `<div class="closing-card tap" data-id="${c.id}">
      <div>
        <div class="cc-head"><strong>${fmtDate(c.date)}</strong>${st}</div>
        <small>${esc(c.kasirName || '-')} · Omset ${rp(k.gross)} · Laba ${rp(k.net)}</small>
      </div>
      <span class="chev">${ic('chev')}</span>
    </div>`;
  }).join('');
}

// Klik daftar laporan & peringatan → detail
['closingList', 'alertList'].forEach((id) => $(id).addEventListener('click', (e) => {
  const card = e.target.closest('[data-id]');
  if (card) openClosingDetail(card.dataset.id);
}));

function openClosingDetail(id) {
  const c = allClosings.find((x) => x.id === id);
  if (!c) return;
  const k = calcClosing(c, withdrawalsByDate());

  const prodRows = k.detail.length ? k.detail.map((d) => k.stockBased
    ? `<tr><td>${esc(d.name)}</td><td class="c">${num(d.awal)}</td><td class="c">${num(d.masuk)}</td>
        <td class="c">${num(d.akhir)}</td><td class="c"><b>${d.terjual}</b></td><td class="r">${rp(d.rev)}</td></tr>`
    : `<tr><td>${esc(d.name)}</td><td class="c" colspan="4">${num(d.qty)} terjual</td><td class="r">${rp(d.rev)}</td></tr>`
  ).join('') : `<tr><td colspan="6" class="muted center">Tidak ada produk dicatat</td></tr>`;

  const opexHtml = (c.opex || []).map((o) => `
    <div class="line"><span>${esc(o.desc || '-')}<small>${o.kind === 'stok' ? 'belanja stok' : 'biaya operasional'} · ${o.fromDrawer ? 'dari laci' : 'bukan dari laci'}</small></span><b>${rp(o.amount)}</b></div>`).join('')
    || `<p class="muted">Tidak ada pengeluaran</p>`;

  const ck = c.checklist || {};
  const chk = [['counted', 'Uang dihitung'], ['photos', 'Nota difoto'], ['stock', 'Stok dicek']]
    .map(([key, label]) => `<span class="chip ${ck[key] ? 'ok' : 'no'}">${label}</span>`).join(' ');
  const photos = (c.proofImages || []).map((u) =>
    `<img class="photo-mini" src="${esc(u)}" data-url="${esc(u)}" alt="Nota">`).join('')
    || `<p class="muted">Tidak ada foto</p>`;

  openSheet(`
    <h3 class="sheet-title">${fmtDate(c.date)}</h3>
    <p class="hint">Kasir: ${esc(c.kasirName || '-')}${c.editedBy ? ` · diedit oleh ${esc(c.editedBy)}` : ''}</p>

    <h4 class="sub-hd">Stok produk</h4>
    <div class="table-wrap sheet-tbl">
      <table class="tbl">
        <thead><tr><th>Produk</th><th class="c">Awal</th><th class="c">Masuk</th><th class="c">Sisa</th><th class="c">Terjual</th><th class="r">Omset</th></tr></thead>
        <tbody>${prodRows}</tbody>
      </table>
    </div>

    <h4 class="sub-hd">Omset</h4>
    <div class="sum-block">
      <div class="line"><span>Tunai</span><b>${rp(c.cashRevenue)}</b></div>
      <div class="line"><span>QRIS</span><b>${rp(c.qrisRevenue)}</b></div>
      <div class="line total"><span>Omset tercatat</span><b>${rp(k.gross)}</b></div>
      ${k.stockBased ? `<div class="line"><span>Omset seharusnya (dari stok)</span><b>${rp(k.soldRev)}</b></div>
      <div class="line total"><span>Selisih omset</span><b class="${k.omsetDiff === 0 ? 'ok' : 'no'}">${signedRp(k.omsetDiff)}</b></div>` : ''}
      <div class="line"><span>HPP terjual</span><b>${rp(k.hpp)}</b></div>
      <div class="line"><span>Biaya operasional</span><b>${rp(k.opexBiaya)}</b></div>
      <div class="line"><span>Belanja stok (sudah jadi stok)</span><b>${rp(k.opexStok)}</b></div>
      <div class="line total"><span>Laba bersih</span><b>${rp(k.net)}</b></div>
    </div>

    <h4 class="sub-hd">Kas laci</h4>
    <div class="sum-block">
      <div class="line"><span>Modal awal</span><b>${rp(c.startingCash)}</b></div>
      <div class="line"><span>Seharusnya di laci</span><b>${rp(k.expected)}</b></div>
      <div class="line"><span>Uang fisik</span><b>${rp(c.actualCash)}</b></div>
      <div class="line total"><span>Selisih kas</span><b class="${k.diff === 0 ? 'ok' : k.diff < 0 ? 'no' : 'warn'}">${signedRp(k.diff)}</b></div>
    </div>

    <h4 class="sub-hd">Pengeluaran</h4>
    <div class="sum-block">${opexHtml}</div>

    <h4 class="sub-hd">Checklist</h4>
    <p>${chk}</p>

    ${c.notes ? `<h4 class="sub-hd">Catatan kasir</h4><p class="hint">${esc(c.notes)}</p>` : ''}

    <h4 class="sub-hd">Foto nota</h4>
    <div class="photo-row">${photos}</div>

    <button class="btn-outline" data-edit="${c.id}">${ic('edit')}Edit laporan</button>
    <button class="btn-danger" data-del="${c.id}">${ic('trash')}Hapus laporan</button>
    <button class="btn-ghost" data-close>Tutup</button>
  `);
}


// ---- Edit laporan (owner) ----
function pickHtml(p, q) {
  return `<div class="pick ${q ? 'on' : ''}" data-id="${p.id}">
    <div class="pick-info"><strong>${esc(p.name)}</strong><small>${rp(p.price)}</small></div>
    <div class="stepper">
      <button type="button" class="step" data-step="-1" aria-label="Kurangi">${ic('minus')}</button>
      <span class="qty">${q}</span>
      <button type="button" class="step" data-step="1" aria-label="Tambah">${ic('plus')}</button>
    </div></div>`;
}

function opexEditHtml(desc = '', amount = '', drawer = true, kind = 'biaya') {
  return `<div class="opex-row">
    <div class="opex-top">
      <input type="text" class="opex-desc" placeholder="Nama belanja (mis. Gas 3kg)" value="${esc(desc)}">
      <input type="number" class="opex-amount" placeholder="Rp" min="0" inputmode="numeric" value="${amount}">
      <button type="button" class="icon-btn" aria-label="Hapus">${ic('x')}</button>
    </div>
    <div class="opex-meta">
      <select class="opex-kind">
        <option value="biaya" ${kind !== 'stok' ? 'selected' : ''}>Biaya operasional</option>
        <option value="stok" ${kind === 'stok' ? 'selected' : ''}>Belanja stok</option>
      </select>
      <label class="switch-row"><input type="checkbox" class="opex-drawer" ${drawer ? 'checked' : ''}><span class="switch"></span>Dari laci</label>
    </div>
  </div>`;
}


function openEditClosing(id) {
  const c = allClosings.find((x) => x.id === id);
  if (!c) return;
  const stockBased = (c.items || []).some((i) => i.akhir !== undefined);
  const stockHtml = stockBased
    ? `<div class="stock-head"><span>Produk</span><span class="c">Awal</span><span class="c">Masuk</span><span class="c">Sisa</span></div>` +
      (c.items || []).map((i) => `
        <div class="stock-row" data-id="${i.id}">
          <div class="sr-name"><strong>${esc(i.name)}</strong><small>Harga ${rp(i.price)}</small></div>
          <span class="sr-awal">${num(i.awal)}</span>
          <input type="number" class="er-masuk" inputmode="numeric" min="0" value="${num(i.masuk)}">
          <input type="number" class="er-sisa" inputmode="numeric" min="0" value="${num(i.akhir)}">
        </div>`).join('')
    : `<p class="hint">Laporan ini dibuat dengan versi lama, jadi daftar produk tidak bisa diedit.</p>`;

  openSheet(`
    <h3 class="sheet-title">Edit laporan</h3>
    <p class="hint">${fmtDate(c.date)} · ${esc(c.kasirName || '-')}</p>

    <div class="field"><label for="eStart">Modal awal di laci</label>
      <div class="money"><span>Rp</span><input type="number" id="eStart" inputmode="numeric" value="${num(c.startingCash)}"></div></div>
    <div class="row2">
      <div class="field"><label for="eCash">Tunai</label>
        <div class="money"><span>Rp</span><input type="number" id="eCash" inputmode="numeric" value="${num(c.cashRevenue)}"></div></div>
      <div class="field"><label for="eQris">QRIS</label>
        <div class="money"><span>Rp</span><input type="number" id="eQris" inputmode="numeric" value="${num(c.qrisRevenue)}"></div></div>
    </div>
    <div class="field"><label for="eActual">Uang fisik di laci</label>
      <div class="money"><span>Rp</span><input type="number" id="eActual" inputmode="numeric" value="${num(c.actualCash)}"></div></div>

    <h4 class="sub-hd">Stok produk</h4>
    <div id="eStock">${stockHtml}</div>

    <h4 class="sub-hd">Pengeluaran</h4>
    <div id="eOpex">${(c.opex || []).map((o) => opexEditHtml(o.desc, o.amount, o.fromDrawer, o.kind)).join('')}</div>
    <button type="button" class="btn-outline" id="eAddOpex">${ic('plus')}Tambah belanja</button>

    <div class="field" style="margin-top:14px"><label for="eNotes">Catatan</label>
      <textarea id="eNotes" rows="2">${esc(c.notes || '')}</textarea></div>

    <button class="btn-primary" id="eSave">${ic('check')}Simpan perubahan</button>
    <button class="btn-ghost" data-close>Batal</button>
  `, () => {
    $('eOpex').addEventListener('click', (e) => {
      const b = e.target.closest('.icon-btn');
      if (b) b.closest('.opex-row').remove();
    });
    $('eAddOpex').addEventListener('click', () => {
      $('eOpex').insertAdjacentHTML('beforeend', opexEditHtml());
    });

    $('eSave').onclick = async () => {
      const cashRevenue = num($('eCash').value);
      const qrisRevenue = num($('eQris').value);
      const opex = [...document.querySelectorAll('#eOpex .opex-row')].map((r) => ({
        desc: r.querySelector('.opex-desc').value.trim(),
        amount: num(r.querySelector('.opex-amount').value),
        fromDrawer: r.querySelector('.opex-drawer').checked,
        kind: r.querySelector('.opex-kind').value
      })).filter((o) => o.desc || o.amount);
      const sumIf = (fn) => opex.filter(fn).reduce((s, o) => s + o.amount, 0);

      const items = stockBased
        ? (c.items || []).map((i) => {
            const row = document.querySelector(`#eStock .stock-row[data-id="${i.id}"]`);
            return {
              ...i,
              masuk: num(row.querySelector('.er-masuk').value),
              akhir: num(row.querySelector('.er-sisa').value)
            };
          })
        : (c.items || []);

      try {
        const batch = db.batch();
        batch.update(db.collection(C.closings).doc(c.id), {
          startingCash: num($('eStart').value),
          cashRevenue, qrisRevenue,
          grossRevenue: cashRevenue + qrisRevenue,
          items,
          opex,
          opexTotal: sumIf(() => true),
          opexDrawer: sumIf((o) => o.fromDrawer),
          opexBiaya: sumIf((o) => o.kind !== 'stok'),
          opexStok: sumIf((o) => o.kind === 'stok'),
          actualCash: num($('eActual').value),
          notes: $('eNotes').value.trim(),
          editedBy: profile.name,
          editedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        // Jika ini laporan terbaru, stok produk ikut disesuaikan
        const latest = allClosings.reduce((m, x) => (x.date > m ? x.date : m), '');
        if (stockBased && c.date === latest) {
          items.forEach((i) => batch.update(db.collection(C.products).doc(i.id), { stock: i.akhir }));
        }
        await batch.commit();
        closeSheet();
        toast('Laporan diperbarui');
      } catch (err) {
        alert('Gagal menyimpan: ' + err.message);
      }
    };
  });
}


async function deleteClosing(id) {
  if (!confirm('Hapus laporan ini? Kasir bisa mengirim ulang untuk tanggal tersebut setelah dihapus.')) return;
  try {
    await db.collection(C.closings).doc(id).delete();
    closeSheet();
    toast('Laporan dihapus');
  } catch (err) { alert('Gagal hapus: ' + err.message); }
}

// ============================================================
// PENGATURAN
// ============================================================
function renderSettings() {
  if (!profile) return;
  $('settingsProfile').innerHTML = `
    <div class="pc-avatar">${avatarHtml(profile)}</div>
    <div class="pc-main"><strong>${esc(profile.name)}</strong><small>@${esc(profile.username)}</small></div>
    <span class="role-pill">${profile.role === 'owner' ? 'Owner' : 'Kasir'}</span>`;

  const owner = profile.role === 'owner';
  const items = [
    ['editProfile', 'user', 'Edit profil', 'Nama dan foto akun', false],
    ['password', 'key', 'Ganti password', 'Ubah kata sandi akun', false],
    ['users', 'users', 'Kelola pengguna', 'Tambah akun & atur role', true],
    ['exportXlsx', 'chart', 'Export laporan (Excel)', 'Sesuai periode di Beranda', true],
    ['backup', 'download', 'Backup data (JSON)', 'Salin semua data ke file', true],
    ['about', 'info', 'Tentang & cek koneksi', 'Versi aplikasi dan tes Drive', false],
    ['logout', 'logout', 'Keluar', 'Akhiri sesi di perangkat ini', false, 'danger']
  ].filter((i) => !i[4] || owner);

  $('settingsMenu').innerHTML = items.map(([act, icon, title, sub, , cls]) => `
    <button class="menu-item ${cls || ''}" data-act="${act}">
      <span class="mi-ic">${ic(icon)}</span>
      <span class="mi-txt"><strong>${title}</strong><small>${sub}</small></span>
      <span class="mi-go">${ic('chev')}</span>
    </button>`).join('');
}

$('settingsMenu').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const actions = {
    editProfile: openEditProfile,
    password: openPasswordSheet,
    users: openUsersSheet,
    exportXlsx: exportWorkbook,
    backup: backupAll,
    about: openAbout,
    logout: () => { if (confirm('Keluar dari aplikasi?')) auth.signOut(); }
  };
  try { await actions[b.dataset.act](); }
  catch (err) { alert('Terjadi kesalahan: ' + err.message); }
});

// ---- Edit profil (nama + foto) ----
function openEditProfile() {
  pendingAvatar = null;
  openSheet(`
    <h3 class="sheet-title">Edit profil</h3>
    <label class="avatar-edit" for="avatarInput">
      <div class="avatar-xl" id="avatarPreview">${avatarHtml(profile)}<span class="avatar-cam">${ic('camera')}</span></div>
      <small>Ketuk untuk mengganti foto</small>
    </label>
    <input type="file" id="avatarInput" accept="image/*" class="hidden">
    <div class="field"><label for="pfName">Nama lengkap</label><input type="text" id="pfName" value="${esc(profile.name)}"></div>
    <button class="btn-primary" id="pfSave">${ic('check')}Simpan perubahan</button>
  `, () => {
    $('avatarInput').addEventListener('change', async (e) => {
      const f = e.target.files[0];
      if (!f) return;
      try {
        pendingAvatar = await compressImage(f, AVATAR_SIDE);
        $('avatarPreview').innerHTML = `<img src="${URL.createObjectURL(pendingAvatar)}" alt="">` + `<span class="avatar-cam">${ic('camera')}</span>`;
      } catch (err) { toast('Foto gagal diproses'); }
    });
    $('pfSave').onclick = saveProfile;
  });
}

async function saveProfile() {
  const name = $('pfName').value.trim();
  if (!name) return toast('Nama tidak boleh kosong');
  const btn = $('pfSave');
  btn.disabled = true; btn.textContent = 'Menyimpan...';
  try {
    const upd = { name };
    if (pendingAvatar) {
      const r = await uploadToDrive(pendingAvatar, `avatar_${profile.uid}_${Date.now()}.jpg`);
      upd.photoUrl = r.url;
    }
    await db.collection(C.users).doc(profile.uid).update(upd);
    profile = { ...profile, ...upd };
    paintHeader();
    renderSettings();
    closeSheet();
    toast('Profil diperbarui');
  } catch (err) {
    alert('Gagal menyimpan: ' + err.message);
  } finally {
    btn.disabled = false; btn.innerHTML = `${ic('check')}Simpan perubahan`;
  }
}

// ---- Ganti password ----
function openPasswordSheet() {
  openSheet(`
    <h3 class="sheet-title">Ganti password</h3>
    <div class="field"><label for="pwOld">Password lama</label><input type="password" id="pwOld" autocomplete="current-password"></div>
    <div class="field"><label for="pwNew">Password baru (min. 6)</label><input type="password" id="pwNew" autocomplete="new-password"></div>
    <div class="field"><label for="pwConfirm">Ulangi password baru</label><input type="password" id="pwConfirm" autocomplete="new-password"></div>
    <button class="btn-primary" id="pwSave">${ic('check')}Ganti password</button>
  `, () => {
    $('pwSave').onclick = async () => {
      const oldPw = $('pwOld').value, newPw = $('pwNew').value, conf = $('pwConfirm').value;
      if (newPw.length < 6) return toast('Password baru minimal 6 karakter');
      if (newPw !== conf) return toast('Konfirmasi password tidak sama');
      try {
        const u = auth.currentUser;
        await u.reauthenticateWithCredential(firebase.auth.EmailAuthProvider.credential(u.email, oldPw));
        await u.updatePassword(newPw);
        closeSheet();
        toast('Password berhasil diganti');
      } catch (err) {
        toast(['auth/wrong-password', 'auth/invalid-credential'].includes(err.code) ? 'Password lama salah' : 'Gagal: ' + err.message);
      }
    };
  });
}

// ---- Kelola pengguna (owner) ----
function openUsersSheet() {
  openSheet(`
    <h3 class="sheet-title">Kelola pengguna</h3>
    <p class="hint">Role: Kasir, Owner, atau Nonaktif (akun tidak bisa login).</p>
    <div id="usersSheetList" class="list"></div>
    <button class="btn-primary" id="uAdd">${ic('plus')}Tambah akun</button>
  `, () => {
    renderUsersList();
    $('uAdd').onclick = openAddUserSheet;
  });
}

function renderUsersList() {
  const el = $('usersSheetList');
  if (!el) return;
  el.innerHTML = allUsers.map((u) => {
    const self = u.id === profile.uid;
    return `<div class="row-card">
      <div class="avatar-sm">${avatarHtml(u)}</div>
      <div class="rc-main"><strong>${esc(u.name)}</strong><small>@${esc(u.username)}${self ? ' · Anda' : ''}</small></div>
      <select class="role-sel" data-uid="${u.id}" ${self ? 'disabled' : ''}>
        <option value="kasir" ${u.role === 'kasir' ? 'selected' : ''}>Kasir</option>
        <option value="owner" ${u.role === 'owner' ? 'selected' : ''}>Owner</option>
        <option value="nonaktif" ${u.role === 'nonaktif' ? 'selected' : ''}>Nonaktif</option>
      </select>
    </div>`;
  }).join('');
}
document.addEventListener('change', async (e) => {
  if (!e.target.classList.contains('role-sel')) return;
  try { await db.collection(C.users).doc(e.target.dataset.uid).update({ role: e.target.value }); toast('Role diperbarui'); }
  catch (err) { alert('Gagal mengubah role: ' + err.message); }
});

let secondaryAuth = null;
function getSecondaryAuth() {
  if (!secondaryAuth) {
    const app = firebase.apps.find((a) => a.name === 'secondary') || firebase.initializeApp(firebaseConfig, 'secondary');
    secondaryAuth = app.auth();
  }
  return secondaryAuth;
}

function openAddUserSheet() {
  openSheet(`
    <h3 class="sheet-title">Tambah akun</h3>
    <div class="field"><label for="nuName">Nama lengkap</label><input type="text" id="nuName"></div>
    <div class="field"><label for="nuUser">Username</label><input type="text" id="nuUser" placeholder="contoh: budi" autocapitalize="none"></div>
    <div class="field"><label for="nuPass">Password (min. 6)</label><input type="password" id="nuPass" autocomplete="new-password"></div>
    <div class="field"><label for="nuRole">Role</label>
      <select id="nuRole"><option value="kasir">Kasir</option><option value="owner">Owner</option></select>
    </div>
    <button class="btn-primary" id="nuSave">${ic('check')}Buat akun</button>
  `, () => {
    $('nuSave').onclick = async () => {
      const username = $('nuUser').value.trim().toLowerCase();
      const name = $('nuName').value.trim();
      const password = $('nuPass').value;
      const role = $('nuRole').value;
      if (!name) return toast('Isi nama lengkap');
      if (!/^[a-z0-9._]{3,20}$/.test(username)) return toast('Username 3–20 karakter: huruf kecil, angka, titik, atau _');
      if (password.length < 6) return toast('Password minimal 6 karakter');
      const btn = $('nuSave');
      btn.disabled = true;
      try {
        const sAuth = getSecondaryAuth();
        const cred = await sAuth.createUserWithEmailAndPassword(usernameToEmail(username), password);
        await db.collection(C.users).doc(cred.user.uid).set({
          username, name, role, photoUrl: '',
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await sAuth.signOut();
        toast(`Akun @${username} dibuat`);
        openUsersSheet();
      } catch (err) {
        alert('Gagal membuat akun: ' + (err.code === 'auth/email-already-in-use' ? 'Username sudah dipakai.' : err.message));
      } finally {
        btn.disabled = false;
      }
    };
  });
}

// ---- Export Excel (periode Beranda) ----
function saveFile(filename, base64, mime) {
  if (isNative()) {
    const P = Capacitor.Plugins;
    return P.Filesystem.writeFile({ path: filename, data: base64, directory: 'CACHE', recursive: true })
      .then(({ uri }) => P.Share.share({ title: filename, files: [uri], dialogTitle: 'Simpan / Bagikan' }));
  }
  const bin = atob(base64);
  const bytes = Uint8Array.from(bin, (ch) => ch.charCodeAt(0));
  const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1500);
  return Promise.resolve();
}

async function exportWorkbook() {
  if (!allClosings.length) return toast('Belum ada data laporan');
  const { from, to } = getRange();
  const list = inRange(allClosings, from, to);
  const wdMap = withdrawalsByDate();

  const laporan = list.map((c) => {
    const k = calcClosing(c, wdMap);
    return {
      'Tanggal': c.date, 'Kasir': c.kasirName,
      'Modal Awal': num(c.startingCash), 'Tunai': num(c.cashRevenue), 'QRIS': num(c.qrisRevenue),
      'Omset Tercatat': k.gross, 'Omset Seharusnya (stok)': k.soldRev, 'Selisih Omset': k.omsetDiff,
      'HPP Terjual': k.hpp, 'Biaya Operasional': k.opexBiaya, 'Belanja Stok': k.opexStok,
      'Laba Bersih': k.net, 'Seharusnya di Laci': k.expected, 'Uang Fisik': num(c.actualCash),
      'Selisih Kas': k.diff, 'Catatan': c.notes || ''
    };
  });
  const detail = [];
  list.forEach((c) => {
    const k = calcClosing(c, wdMap);
    k.detail.forEach((d) => detail.push({
      'Tanggal': c.date, 'Produk': d.name,
      'Awal': d.awal ?? '', 'Masuk': d.masuk ?? '', 'Sisa': d.akhir ?? '',
      'Terjual': d.terjual, 'Harga': num(d.price), 'Omset': d.rev, 'HPP': d.hpp
    }));
  });
  const produk = products.map((p) => ({
    'Produk': p.name, 'Kategori': p.category, 'Harga Jual': num(p.price),
    'HPP': num(costs[p.id]), 'Stok Sekarang': num(p.stock),
    'Nilai Stok (HPP)': num(p.stock) * num(costs[p.id]),
    'Status': p.active === false ? 'Nonaktif' : 'Aktif'
  }));
  const wdRows = inRange(withdrawals, from, to).map((w) => ({
    'Tanggal': w.date, 'Jumlah': num(w.amount), 'Catatan': w.note || '', 'Dicatat oleh': w.by || ''
  }));

  const sheet = (rows) => XLSX.utils.json_to_sheet(rows.length ? rows : [{ Keterangan: 'Tidak ada data' }]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet(laporan), 'Laporan');
  XLSX.utils.book_append_sheet(wb, sheet(detail), 'Detail Stok');
  XLSX.utils.book_append_sheet(wb, sheet(produk), 'Produk');
  XLSX.utils.book_append_sheet(wb, sheet(wdRows), 'Pengambilan Owner');
  const b64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
  await saveFile(`KantinBarokah_${from}_sd_${to}.xlsx`, b64,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  toast('File Excel siap');
}


// ---- Backup JSON (semua data) ----
async function backupAll() {
  const clean = (o) => JSON.parse(JSON.stringify(o, (k, v) =>
    (v && typeof v === 'object' && 'seconds' in v && 'nanoseconds' in v)
      ? new Date(v.seconds * 1000).toISOString() : v));
  const payload = clean({
    app: 'Barokah', version: APP_VERSION, exportedAt: new Date().toISOString(),
    products, productCosts: costs, closings: allClosings, withdrawals, users: allUsers
  });
  const json = JSON.stringify(payload, null, 2);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  await saveFile(`barokah_backup_${todayStr()}.json`, b64, 'application/json');
  toast('Backup dibuat');
}

// ---- Tentang & tes koneksi ----
function openAbout() {
  openSheet(`
    <div class="empty" style="padding-top:8px">
      <img src="logo.svg" alt="" style="width:76px;height:76px;border-radius:22px">
      <h3 class="sheet-title" style="margin-top:12px">BAROKAH</h3>
      <p class="hint">Tutup Kasir Harian · Versi ${APP_VERSION}</p>
    </div>
    <div class="sum-block">
      <div class="line"><span>Database</span><b>Firestore</b></div>
      <div class="line"><span>Foto nota</span><b>Google Drive</b></div>
      <div class="line"><span>Status Drive</span><b id="driveStatus">Belum dites</b></div>
    </div>
    <button class="btn-outline" id="btnTestDrive">Tes koneksi Drive</button>
    <button class="btn-ghost" data-close>Tutup</button>
  `, () => {
    $('btnTestDrive').onclick = async () => {
      $('driveStatus').textContent = 'Menguji...';
      try {
        const r = await fetch(DRIVE_UPLOAD_URL);
        const j = await r.json();
        $('driveStatus').textContent = j.ok ? `Terhubung (v${j.version})` : 'Respons tidak valid';
      } catch (err) {
        $('driveStatus').textContent = 'Gagal terhubung';
      }
    };
  });
}

// ============================================================
// INIT
// ============================================================
hydrate();
$('togglePw').innerHTML = ic('eye');
const now = new Date();
$('dashFrom').value = toISODate(new Date(now.getFullYear(), now.getMonth(), 1));
$('dashTo').value = todayStr();
$('dashFrom').addEventListener('change', renderDashboard);
$('dashTo').addEventListener('change', renderDashboard);
renderPhotos();
