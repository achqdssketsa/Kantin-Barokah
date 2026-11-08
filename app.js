// ============================================================
// KANTIN BAROKAH · Tutup Kasir · app.js (v4.0.0)
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
const TS = () => firebase.firestore.FieldValue.serverTimestamp();

const APP_VERSION = '4.0.0';
const C = {
  closings: 'daily_closings', users: 'users', withdrawals: 'owner_withdrawals',
  opname: 'opname', kas: 'kas', settings: 'settings', products: 'products', audit: 'audit'
};

// Penyimpanan foto: 'drive' (Google Drive lewat Apps Script) atau 'firestore'
const PHOTO_STORAGE = 'drive';
const DRIVE_UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbyunLWcCJpVO1sgJmWoY3tiHvkIEf8SbUUN1Uby3PGmtN4R0MGmjHlOaQ-1bLjRD4Y/exec';
const PHOTO_SIDE = 800, PHOTO_QUALITY = 0.6;
const AVATAR_SIDE = 512, AVATAR_QUALITY = 0.7;
const MAX_B64 = 900000;

// Toleransi selisih: nilai yang lebih besar antara Rp10.000 atau 1% omset
const TOL_ABS = 10000, TOL_REL = 0.01;
const MODAL_DEFAULT = 100000;   // modal kasir tetap, bisa diubah owner

const GREEN = '#1d4d2c', GOLD = '#c9963e';
const PALETTE = ['#1d4d2c', '#c9963e', '#4f8a63', '#e3c57a', '#8c5a2b', '#2f6b4f'];

// ============================================================
// IKON
// ============================================================
const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  receipt: '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2z"/><path d="M9 8h6M9 12h6"/>',
  box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  scale: '<path d="M12 3v18M5 7h14"/><path d="M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z"/><path d="M8 21h8"/>',
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
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  log: '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>'
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
const fmtShort = (s) => new Date(s + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
const usernameToEmail = (u) => { const v = u.trim().toLowerCase(); return v.includes('@') ? v : `${v}@kantin.app`; };
const sortAsc = (list) => [...list].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
const sumBy = (arr, fn) => arr.reduce((s, x) => s + fn(x), 0);
const photoSrc = (b64) => 'data:image/jpeg;base64,' + b64;
const avatarHtml = (u) => u.photoData
  ? `<img src="${photoSrc(u.photoData)}" alt="">`
  : `<span>${esc((u.name || u.username || '?').charAt(0).toUpperCase())}</span>`;
const setText = (id, t) => { $(id).textContent = t; };

// ============================================================
// KARTU NOTIFIKASI
// ============================================================
function dialog({ tone = 'info', title, message, okText = 'Oke', cancelText = null }) {
  return new Promise((resolve) => {
    const wrap = document.createElement('div');
    wrap.className = 'dlg-wrap';
    const icon = tone === 'danger' ? 'alert' : tone === 'success' ? 'check' : 'info';
    wrap.innerHTML = `
      <div class="dlg dlg-${tone}" role="dialog" aria-modal="true">
        <div class="dlg-ic">${ic(icon)}</div>
        <h4 class="dlg-title">${esc(title)}</h4>
        <p class="dlg-msg">${esc(message)}</p>
        <div class="dlg-actions">
          ${cancelText ? `<button type="button" class="dlg-ghost" data-r="0">${esc(cancelText)}</button>` : ''}
          <button type="button" class="dlg-ok" data-r="1">${esc(okText)}</button>
        </div>
      </div>`;
    wrap.addEventListener('click', (e) => {
      const b = e.target.closest('[data-r]');
      if (!b) return;
      wrap.classList.remove('show');
      setTimeout(() => wrap.remove(), 260);
      resolve(b.dataset.r === '1');
    });
    document.body.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add('show'));
  });
}
const notify = (message, title = 'Pemberitahuan', tone = 'info') => dialog({ tone, title, message });
const success = (message, title = 'Berhasil') => dialog({ tone: 'success', title, message });
const fail = (message, title = 'Ada kendala') => dialog({ tone: 'danger', title, message });
const ask = (message, title = 'Konfirmasi', tone = 'info', okText = 'Ya') =>
  dialog({ tone, title, message, okText, cancelText: 'Batal' });

function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}

// ============================================================
// GESTUR
// ============================================================
document.addEventListener('pointerdown', (e) => {
  const t = e.target.closest('button, .tap');
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
// SHEET & PENAMPIL FOTO
// ============================================================
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
});
function openViewer(url) { $('viewerImg').src = url; $('viewer').classList.add('show'); }
$('viewer').addEventListener('click', () => $('viewer').classList.remove('show'));

// ============================================================
// FOTO
// ============================================================
function compressImage(file, side, quality) {
  return new Promise((resolve, reject) => {
    new Compressor(file, { quality, maxWidth: side, maxHeight: side, mimeType: 'image/jpeg', success: resolve, error: reject });
  });
}
function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1]);
    r.onerror = () => reject(new Error('Gagal membaca foto'));
    r.readAsDataURL(blob);
  });
}
async function preparePhoto(file, side, quality) {
  let blob = await compressImage(file, side, quality);
  let b64 = await blobToBase64(blob);
  if (b64.length > MAX_B64) {
    blob = await compressImage(file, Math.round(side * 0.75), 0.5);
    b64 = await blobToBase64(blob);
  }
  if (b64.length > MAX_B64) throw new Error('Foto tetap terlalu besar setelah dikompres.');
  return { blob, b64 };
}
async function uploadToDrive(b64, fileName) {
  const idToken = await auth.currentUser.getIdToken();
  let res;
  try {
    res = await fetch(DRIVE_UPLOAD_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ idToken, fileName, mimeType: 'image/jpeg', data: b64 })
    });
  } catch (err) {
    throw new Error('Tidak bisa terhubung ke Google Drive. Periksa koneksi internet.');
  }
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); }
  catch (err) { throw new Error(`Server Drive membalas halaman, bukan data (HTTP ${res.status}).`); }
  if (!json.ok) throw new Error(json.error || `Upload ditolak server (HTTP ${res.status}).`);
  return json;
}

// ============================================================
// LOG AKTIVITAS (audit): hanya bisa ditambah, tidak bisa diubah/dihapus
// ============================================================
async function logAudit(action, target, summary) {
  try {
    await db.collection(C.audit).add({
      action, target, summary,
      byUid: profile.uid, by: profile.name, at: TS()
    });
  } catch (err) { console.error('audit', err); }
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
$('btnForgot').addEventListener('click', () => toast('Hubungi Owner untuk reset password.'));

let profile = null;
auth.onAuthStateChanged(async (user) => {
  if (!user) return showLogin();
  try {
    const snap = await db.collection(C.users).doc(user.uid).get();
    if (!snap.exists) {
      await fail('Akun ini belum terdaftar di sistem. Hubungi Owner.', 'Akun belum terdaftar');
      return auth.signOut();
    }
    const d = snap.data();
    if (d.role === 'nonaktif') {
      await fail('Akun Anda sudah dinonaktifkan. Hubungi Owner.', 'Akun nonaktif');
      return auth.signOut();
    }
    profile = { uid: user.uid, username: d.username, name: d.name || d.username, role: d.role, photoData: d.photoData || '' };
    showApp();
  } catch (err) {
    await fail('Gagal memuat profil: ' + err.message);
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
  if (!owner && name !== 'kasir' && name !== 'settings') name = 'kasir';
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.id === 'tab-' + name));
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
document.querySelectorAll('.nav-btn').forEach((b) => b.addEventListener('click', () => showTab(b.dataset.tab)));
$('btnProfile').addEventListener('click', () => showTab('settings'));

document.querySelectorAll('.seg-btn').forEach((b) => b.addEventListener('click', () => {
  document.querySelectorAll('.seg-btn').forEach((x) => x.classList.toggle('active', x === b));
  document.querySelectorAll('.seg-pane').forEach((p) => p.classList.toggle('active', p.id === 'seg-' + b.dataset.seg));
}));

// ============================================================
// LISTENER FIRESTORE
// ============================================================
let unsubs = [];
let allClosings = [], withdrawals = [], opnames = [], allUsers = [], products = [], auditLogs = [];
let kasSaldo = null;
let modalKasir = MODAL_DEFAULT;
let days = [], periods = [];

function startListeners() {
  stopListeners();
  unsubs.push(db.collection(C.kas).doc('saldo').onSnapshot((s) => {
    kasSaldo = s.exists ? s.data() : null;
    renderSaldoInfo();
  }));
  unsubs.push(db.collection(C.settings).doc('kas').onSnapshot((s) => {
    modalKasir = s.exists && s.data().modalKasir != null ? num(s.data().modalKasir) : MODAL_DEFAULT;
    if (profile) renderSettings();
  }));
  unsubs.push(db.collection(C.products).orderBy('name').onSnapshot((s) => {
    products = s.docs.map((d) => ({ id: d.id, ...d.data() }));
    refreshProducts();
  }, (err) => console.error('products', err)));

  if (profile.role !== 'owner') return;
  unsubs.push(db.collection(C.closings).orderBy('date', 'desc').limit(1000).onSnapshot((s) => {
    allClosings = s.docs.map((d) => ({ id: d.id, ...d.data() }));
    refreshOwner();
  }, (err) => fail('Gagal memuat laporan: ' + err.message)));
  unsubs.push(db.collection(C.withdrawals).orderBy('date', 'desc').onSnapshot((s) => {
    withdrawals = s.docs.map((d) => ({ id: d.id, ...d.data() }));
    refreshOwner();
  }));
  unsubs.push(db.collection(C.opname).orderBy('date', 'desc').onSnapshot((s) => {
    opnames = s.docs.map((d) => ({ id: d.id, ...d.data() }));
    refreshOwner();
  }));
  unsubs.push(db.collection(C.users).orderBy('username').onSnapshot((s) => {
    allUsers = s.docs.map((d) => ({ id: d.id, ...d.data() }));
    renderUsersList();
  }));
  unsubs.push(db.collection(C.audit).orderBy('at', 'desc').limit(200).onSnapshot((s) => {
    auditLogs = s.docs.map((d) => ({ id: d.id, ...d.data() }));
  }));
}

function stopListeners() {
  unsubs.forEach((u) => u());
  unsubs = [];
  allClosings = []; withdrawals = []; opnames = []; allUsers = []; products = []; auditLogs = [];
  kasSaldo = null; days = []; periods = [];
}

function refreshOwner() {
  if (profile?.role !== 'owner') return;
  recompute();
  renderDashboard();
  renderOpnameTab();
}
function refreshProducts() {
  renderProductPicker();
  if (profile?.role === 'owner') renderProductsTab();
}

// ============================================================
// PERHITUNGAN (fungsi murni: bisa diuji tanpa database)
// ============================================================
const pocketOf = (o) => o.pocket || (o.fromDrawer === false ? 'luar' : 'laci');

// Hitungan harian per kantong. Saldo awal = uang fisik hari sebelumnya.
function computeDays(closings, withdrawalsList) {
  const wd = {};
  withdrawalsList.forEach((w) => {
    const sign = w.type === 'setor' ? -1 : 1;
    wd[w.date] = wd[w.date] || { laci: 0 };
    wd[w.date].laci += sign * num(w.amount);      // pengambilan owner selalu dari laci
  });

  const out = [];
  let prev = null;
  sortAsc(closings).forEach((c) => {
    const legacy = c.actualLaci === undefined;
    const w = wd[c.date] || { laci: 0 };
    const cash = num(c.cashRevenue), qris = num(c.qrisRevenue);
    const gross = num(c.grossRevenue) || cash + qris;
    const opex = c.opex || [];
    const opexLaci = sumBy(opex.filter((o) => pocketOf(o) === 'laci'), (o) => num(o.amount));
    const opexKasir = sumBy(opex.filter((o) => pocketOf(o) === 'kasir'), (o) => num(o.amount));
    const opexBiaya = c.opexBiaya != null ? num(c.opexBiaya) : sumBy(opex.filter((o) => o.kind !== 'stok'), (o) => num(o.amount));
    const opexStok = c.opexStok != null ? num(c.opexStok) : sumBy(opex.filter((o) => o.kind === 'stok'), (o) => num(o.amount));

    const startLaci = prev?.laci ?? num(c.startLaci ?? c.startingCash);
    const startKasir = prev?.kasir ?? num(c.startKasir);
    const ambil = num(c.ambilLaci);

    // Kasir seharusnya sebelum setoran (dari data tercatat)
    const kasirSebelum = startKasir + ambil + cash - opexKasir;
    // Setoran otomatis ke laci = kasir seharusnya − modal tetap
    const modal = num(c.modalKasir ?? MODAL_DEFAULT);
    const setor = legacy ? 0 : (c.setorKasir != null ? num(c.setorKasir) : kasirSebelum - modal);

    const physLaci = legacy ? num(c.actualCash) : num(c.actualLaci);   // dihitung setelah setoran masuk
    const physKasirBefore = legacy ? null : num(c.actualKasir);        // dihitung sebelum setoran

    const laciExp = legacy
      ? startLaci + cash - opexLaci - w.laci
      : startLaci - ambil + setor - opexLaci - w.laci;
    const diffKasir = legacy ? 0 : physKasirBefore - kasirSebelum;
    const kasirAfter = legacy ? null : physKasirBefore - setor;        // saldo kasir yang dibawa ke besok

    out.push({
      c, legacy, gross, cash, qris, opexBiaya, opexStok, opexLaci, opexKasir,
      opexTotal: opexBiaya + opexStok, startLaci, startKasir, ambil, setor,
      laciExp, kasirExp: kasirSebelum, physLaci, physKasir: physKasirBefore, kasirAfter,
      diffLaci: physLaci - laciExp, diffKasir, modal
    });
    prev = { laci: physLaci, kasir: kasirAfter };
  });
  return out;
}


// Rekonsiliasi antara dua opname berurutan (A → B), per produk
function computePeriods(opnameList, dayList, withdrawalsList) {
  const ops = sortAsc(opnameList);
  const out = [];
  const lineMap = (op) => Object.fromEntries((op.lines || []).map((l) => [l.id, l]));
  const W = (op) => num(op.hppValue) + num(op.bank) + num(op.cashLaci) + num(op.cashKasir);

  for (let i = 1; i < ops.length; i++) {
    const A = ops[i - 1], B = ops[i];
    const inP = dayList.filter((d) => d.c.date > A.date && d.c.date <= B.date);
    const gross = sumBy(inP, (d) => d.gross);
    const biaya = sumBy(inP, (d) => d.opexBiaya);
    const ambil = withdrawalsList
      .filter((w) => w.date > A.date && w.date <= B.date)
      .reduce((s, w) => s + (w.type === 'setor' ? -num(w.amount) : num(w.amount)), 0);

    // Barang masuk per produk dari belanja kasir
    const purch = {};
    let purchAmt = 0;
    inP.forEach((d) => (d.c.opex || []).forEach((o) => {
      if (o.kind !== 'stok' || !o.productId) return;
      purch[o.productId] = (purch[o.productId] || 0) + num(o.qty);
      purchAmt += num(o.amount);
    }));

    const aMap = lineMap(A), bMap = lineMap(B);
    const ids = new Set([...Object.keys(aMap), ...Object.keys(bMap), ...Object.keys(purch)]);
    let hppSold = 0, omsetSeh = 0, purchHpp = 0, neg = false;
    const perProduct = [];

    ids.forEach((id) => {
      const ln = bMap[id] || aMap[id] || { name: '(produk)', price: 0, hpp: 0 };
      const awal = num(aMap[id]?.qty), masuk = num(purch[id]), akhir = num(bMap[id]?.qty);
      const terjual = awal + masuk - akhir;
      if (terjual < 0) neg = true;
      const hpp = num(ln.hpp), price = num(ln.price);
      const rev = terjual * price, hs = terjual * hpp;
      hppSold += hs; omsetSeh += rev;
      purchHpp += masuk * hpp;
      perProduct.push({ id, name: ln.name, awal, masuk, akhir, terjual, price, hpp, rev, hs });
    });

    const premium = purchAmt - purchHpp;            // harga bayar belanja − nilai HPP barang yang masuk
    const laba = gross - hppSold - biaya - premium;
    const selOmset = gross - omsetSeh;
    const selKek = (W(B) - W(A)) - (laba - ambil);

    const tol = Math.max(TOL_ABS, TOL_REL * Math.abs(gross));
    const ok = Math.abs(selOmset) <= tol && Math.abs(selKek) <= tol && !neg;
    out.push({
      A, B, gross, biaya, ambil, purchAmt, premium, hppSold, omsetSeh, selOmset, laba, selKek,
      wA: W(A), wB: W(B), dW: W(B) - W(A), neg, ok, perProduct, nDays: inP.length
    });
  }
  return out;
}

function latestWealth() {
  const last = sortAsc(opnames).slice(-1)[0];
  if (!last) return null;
  const total = num(last.hppValue) + num(last.bank) + num(last.cashLaci) + num(last.cashKasir);
  return { op: last, total };
}

function recompute() {
  days = computeDays(allClosings, withdrawals);
  periods = computePeriods(opnames, days, withdrawals);
}

function buildBuckets(from, to) {
  const s = new Date(from + 'T00:00:00');
  const e = new Date(to + 'T00:00:00');
  const n = Math.round((e - s) / 86400000) + 1;
  const b = [];
  if (n <= 31) {
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      const key = toISODate(d);
      b.push({ label: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }), match: (x) => x === key });
    }
  } else {
    for (let d = new Date(s.getFullYear(), s.getMonth(), 1); d <= e; d.setMonth(d.getMonth() + 1)) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      b.push({ label: d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' }), match: (x) => x.startsWith(key) });
    }
  }
  return b;
}

function getRange() {
  let from = $('dashFrom').value || todayStr();
  let to = $('dashTo').value || todayStr();
  if (from > to) [from, to] = [to, from];
  return { from, to };
}
const inRange = (list, from, to) => list.filter((x) => x.date >= from && x.date <= to);

// ============================================================
// PRODUK
// ============================================================
function renderProductPicker() { /* dipakai di baris belanja */ refreshProductSelects(); }

function productOptions(selected = '') {
  const active = products.filter((p) => p.active !== false);
  const opts = active.map((p) =>
    `<option value="${p.id}" ${p.id === selected ? 'selected' : ''}>${esc(p.name)}${p.needsPrice ? ' (belum ada harga)' : ''}</option>`).join('');
  return `<option value="">Pilih produk...</option>${opts}<option value="__new__">+ Produk baru</option>`;
}

function refreshProductSelects() {
  document.querySelectorAll('.opex-product').forEach((sel) => {
    const cur = sel.value;
    sel.innerHTML = productOptions(cur);
  });
}

function openNewProductSheet(onCreated) {
  openSheet(`
    <h3 class="sheet-title">Produk baru</h3>
    <p class="hint">Harga jual dan HPP diisi owner. Produk ini ditandai "belum ada harga" sampai owner melengkapinya.</p>
    <div class="field"><label for="npName">Nama produk</label><input type="text" id="npName" placeholder="mis. Es teh manis"></div>
    <div class="field"><label for="npCat">Kategori</label><input type="text" id="npCat" placeholder="mis. Minuman"></div>
    <button class="btn-primary" id="npSave">${ic('check')}Simpan produk</button>
    <button class="btn-ghost" data-close>Batal</button>
  `, () => {
    $('npSave').onclick = async () => {
      const name = $('npName').value.trim();
      if (!name) return toast('Isi nama produk');
      try {
        const ref = await db.collection(C.products).add({
          name, category: $('npCat').value.trim() || 'Umum',
          price: 0, hpp: 0, active: true, needsPrice: true,
          createdBy: profile.name, createdAt: TS()
        });
        await logAudit('produk_dibuat', name, 'Produk baru dari kasir, menunggu harga owner');
        closeSheet();
        if (onCreated) onCreated(ref.id);
      } catch (err) { fail(err.message); }
    };
  });
}

function renderProductsTab() {
  const el = $('productList');
  if (!products.length) {
    el.innerHTML = `<div class="empty">${ic('box')}<p>Belum ada produk. Tambahkan produk pertama.</p></div>`;
    return;
  }
  el.innerHTML = products.map((p) => {
    const margin = p.price ? Math.round(((num(p.price) - num(p.hpp)) / num(p.price)) * 100) : 0;
    const flag = p.needsPrice ? `<span class="chip warn">Belum ada harga</span>` : `<span class="chip ${margin >= 0 ? 'ok' : 'no'}">Margin ${margin}%</span>`;
    return `<div class="prod-card tap ${p.active === false ? 'off' : ''}" data-id="${p.id}">
      <div class="prod-ic">${ic('tag')}</div>
      <div class="prod-main"><strong>${esc(p.name)}</strong><small>${esc(p.category || 'Umum')} · HPP ${rp(p.hpp)}</small></div>
      <div class="prod-price"><strong>${rp(p.price)}</strong>${flag}</div>
    </div>`;
  }).join('');
}
$('productList').addEventListener('click', (e) => {
  const c = e.target.closest('.prod-card');
  if (c) openProductSheet(c.dataset.id);
});
$('btnAddProduct').addEventListener('click', () => openProductSheet(null));

function openProductSheet(id) {
  const p = id ? products.find((x) => x.id === id) : null;
  openSheet(`
    <h3 class="sheet-title">${p ? 'Edit produk' : 'Produk baru'}</h3>
    <div class="field"><label for="pName">Nama produk</label><input type="text" id="pName" value="${esc(p?.name || '')}"></div>
    <div class="field"><label for="pCat">Kategori</label><input type="text" id="pCat" value="${esc(p?.category || '')}"></div>
    <div class="row2">
      <div class="field"><label for="pPrice">Harga jual</label><div class="money"><span>Rp</span><input type="number" id="pPrice" inputmode="numeric" min="0" value="${p ? num(p.price) : ''}"></div></div>
      <div class="field"><label for="pHpp">HPP per unit</label><div class="money"><span>Rp</span><input type="number" id="pHpp" inputmode="numeric" min="0" value="${p ? num(p.hpp) : ''}"></div></div>
    </div>
    <p class="hint" id="pMargin"></p>
    <button class="btn-primary" id="pSave">${ic('check')}Simpan</button>
    ${p ? `<button class="btn-ghost" id="pToggle">${p.active === false ? 'Aktifkan produk' : 'Nonaktifkan produk'}</button>` : ''}
    <button class="btn-ghost" data-close>Batal</button>
  `, () => {
    const prev = () => {
      const price = num($('pPrice').value), hpp = num($('pHpp').value);
      $('pMargin').textContent = price ? `Margin ${Math.round(((price - hpp) / price) * 100)}% · laba per unit ${rp(price - hpp)}` : '';
    };
    ['pPrice', 'pHpp'].forEach((x) => $(x).addEventListener('input', prev));
    prev();
    $('pSave').onclick = async () => {
      const name = $('pName').value.trim();
      if (!name) return toast('Nama produk wajib diisi');
      const price = num($('pPrice').value), hpp = num($('pHpp').value);
      if (price && hpp > price) return fail('HPP lebih besar dari harga jual. Periksa angka.', 'Periksa angka');
      try {
        const data = { name, category: $('pCat').value.trim() || 'Umum', price, hpp, needsPrice: !(price && hpp) };
        if (p) {
          await db.collection(C.products).doc(p.id).update(data);
          await logAudit('produk_diubah', name, `harga ${rp(p.price)} → ${rp(price)}, HPP ${rp(p.hpp)} → ${rp(hpp)}`);
        } else {
          data.active = true;
          data.createdBy = profile.name; data.createdAt = TS();
          await db.collection(C.products).add(data);
          await logAudit('produk_dibuat', name, `harga ${rp(price)}, HPP ${rp(hpp)}`);
        }
        closeSheet();
        toast('Produk tersimpan');
      } catch (err) { fail(err.message); }
    };
    if (p) $('pToggle').onclick = async () => {
      const act = p.active === false;
      await db.collection(C.products).doc(p.id).update({ active: act });
      await logAudit(act ? 'produk_diaktifkan' : 'produk_dinonaktifkan', p.name, '');
      closeSheet();
      toast(act ? 'Produk diaktifkan' : 'Produk dinonaktifkan');
    };
  });
}

// ============================================================
// FORM TUTUP KASIR
// ============================================================
function renderSaldoInfo() {
  const hasFull = !!kasSaldo && kasSaldo.kasir !== undefined;
  $('saldoInfo').classList.toggle('hidden', !hasFull);
  $('startWrap').classList.toggle('hidden', hasFull);
  if (hasFull) {
    setText('saldoLaciTxt', rp(kasSaldo.laci));
    setText('saldoKasirTxt', rp(kasSaldo.kasir));
  }
}

function opexRowHtml() {
  return `<div class="opex-row">
    <div class="opex-top">
      <select class="opex-kind">
        <option value="biaya">Biaya</option>
        <option value="stok">Belanja barang</option>
      </select>
      <button type="button" class="icon-btn" aria-label="Hapus">${ic('x')}</button>
    </div>
    <div class="ox-biaya"><input type="text" class="opex-desc" placeholder="Keterangan (mis. Es kristal 3x)"></div>
    <div class="ox-stok hidden">
      <select class="opex-product">${productOptions()}</select>
      <input type="number" class="opex-qty" inputmode="numeric" min="1" placeholder="Jumlah">
    </div>
    <div class="opex-meta">
      <div class="money mini"><span>Rp</span><input type="number" class="opex-amount" inputmode="numeric" min="0" placeholder="Harga bayar"></div>
      <select class="opex-pocket"><option value="laci">Dari laci</option><option value="kasir">Dari kasir</option></select>
    </div>
  </div>`;
}

function syncOpexRow(row) {
  const stok = row.querySelector('.opex-kind').value === 'stok';
  row.querySelector('.ox-biaya').classList.toggle('hidden', stok);
  row.querySelector('.ox-stok').classList.toggle('hidden', !stok);
}

$('opexList').addEventListener('change', (e) => {
  const row = e.target.closest('.opex-row');
  if (!row) return;
  if (e.target.classList.contains('opex-kind')) syncOpexRow(row);
  if (e.target.classList.contains('opex-product') && e.target.value === '__new__') {
    e.target.value = '';
    openNewProductSheet((newId) => {
      refreshProductSelects();
      row.querySelector('.opex-product').value = newId;
    });
  }
});
$('opexList').addEventListener('click', (e) => {
  const b = e.target.closest('.icon-btn');
  if (b) b.closest('.opex-row').remove();
});
$('btnAddOpex').addEventListener('click', () => {
  $('opexList').insertAdjacentHTML('beforeend', opexRowHtml());
});

$('proofInput').addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  e.target.value = '';
  for (const f of files) {
    try {
      const { blob, b64 } = await preparePhoto(f, PHOTO_SIDE, PHOTO_QUALITY);
      pendingPhotos.push({ blob, b64, url: URL.createObjectURL(blob), orig: f.size });
    } catch (err) { await fail(err.message, 'Foto gagal diproses'); }
  }
  renderPhotos();
});
let pendingPhotos = [];

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
    const before = sumBy(pendingPhotos, (p) => p.orig), after = sumBy(pendingPhotos, (p) => p.blob.size);
    $('photoHint').textContent = `${pendingPhotos.length} foto · ${fmtSize(before)} → ${fmtSize(after)} setelah dikompres`;
  }
}
$('photoGrid').addEventListener('click', (e) => {
  const b = e.target.closest('.thumb-x');
  if (!b) return;
  const p = pendingPhotos[Number(b.dataset.i)];
  if (p) URL.revokeObjectURL(p.url);
  pendingPhotos.splice(Number(b.dataset.i), 1);
  renderPhotos();
});

// Membaca dan memvalidasi baris belanja
function readOpexRows() {
  const rows = [];
  let error = '';
  document.querySelectorAll('#opexList .opex-row').forEach((r) => {
    const kind = r.querySelector('.opex-kind').value;
    const amount = num(r.querySelector('.opex-amount').value);
    const pocket = r.querySelector('.opex-pocket').value;
    if (kind === 'stok') {
      const pid = r.querySelector('.opex-product').value;
      const qty = num(r.querySelector('.opex-qty').value);
      if (!pid || qty <= 0) error = error || 'Belanja barang harus memilih produk dan jumlahnya.';
      const p = products.find((x) => x.id === pid);
      rows.push({ kind, pocket, amount, productId: pid, qty, desc: p ? p.name : '' });
    } else {
      const desc = r.querySelector('.opex-desc').value.trim();
      if (!desc && !amount) return;
      rows.push({ kind, pocket, amount, desc });
    }
  });
  return { rows, error };
}

function readClosingForm() {
  const { rows } = readOpexRows();
  const cashRevenue = num($('cashRevenue').value), qrisRevenue = num($('qrisRevenue').value);
  const ambilLaci = num($('ambilLaci').value);
  const k = kasSaldo && kasSaldo.kasir !== undefined;
  const startLaci = k ? num(kasSaldo.laci) : num($('startLaci').value);
  const startKasir = k ? num(kasSaldo.kasir) : num($('startKasir').value);
  const opexKasir = sumBy(rows.filter((o) => o.pocket === 'kasir'), (o) => o.amount);
  const kasirSebelum = startKasir + ambilLaci + cashRevenue - opexKasir;
  const setorKasir = kasirSebelum - modalKasir;      // otomatis, tidak ditampilkan ke kasir
  return {
    date: todayStr(),
    startLaci, startKasir,
    cashRevenue, qrisRevenue, grossRevenue: cashRevenue + qrisRevenue,
    ambilLaci,
    setorKasir, kasirSebelum, modalKasir,
    opex: rows,
    opexBiaya: sumBy(rows.filter((o) => o.kind !== 'stok'), (o) => o.amount),
    opexStok: sumBy(rows.filter((o) => o.kind === 'stok'), (o) => o.amount),
    actualLaci: num($('actualLaci').value),
    actualKasir: num($('actualKasir').value),
    checklist: { counted: $('chkCounted').checked, photos: $('chkPhotos').checked },
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
  renderSaldoInfo();
}

$('formClosing').addEventListener('submit', async (e) => {
  e.preventDefault();
  const { error } = readOpexRows();
  if (error) return fail(error, 'Lengkapi belanja');
  const hasFull = kasSaldo && kasSaldo.kasir !== undefined;
  if (!hasFull && (!$('startLaci').value || !$('startKasir').value)) return fail('Isi saldo awal laci dan kasir untuk laporan pertama.', 'Lengkapi data');
  if (!$('cashRevenue').value || !$('qrisRevenue').value) return fail('Isi penjualan tunai dan QRIS (boleh 0).', 'Lengkapi data');
  if (!$('actualLaci').value || !$('actualKasir').value) return fail('Hitung uang di laci dan di kasir.', 'Lengkapi data');
  if (!$('chkCounted').checked || !$('chkPhotos').checked) return fail('Lengkapi checklist akhir hari.', 'Lengkapi data');
  if (!pendingPhotos.length && !(await ask('Belum ada foto nota. Tetap kirim laporan?', 'Tanpa foto'))) return;

  const data = readClosingForm();
  const ref = db.collection(C.closings).doc(data.date);
  let saved = false;
  setBusy(true, 'Menyimpan laporan...');
  try {
    let photoUrls = [];
    if (PHOTO_STORAGE === 'drive') {
      for (let i = 0; i < pendingPhotos.length; i++) {
        setBusy(true, `Mengunggah foto ${i + 1}/${pendingPhotos.length}...`);
        const r = await uploadToDrive(pendingPhotos[i].b64, `${profile.uid}_${data.date}_${Date.now()}_${i}.jpg`);
        photoUrls.push(r.url);
      }
    }

    setBusy(true, 'Menyimpan laporan...');
    const batch = db.batch();
    batch.set(ref, {
      ...data,
      kasirName: profile.name,
      submittedBy: profile.uid,
      photoCount: pendingPhotos.length,
      proofImages: photoUrls,
      createdAt: TS()
    });
    batch.set(db.collection(C.kas).doc('saldo'), {
      laci: data.actualLaci, kasir: data.actualKasir - data.setorKasir, date: data.date, by: profile.name
    });
    await batch.commit();
    saved = true;

    if (PHOTO_STORAGE === 'firestore') {
      for (let i = 0; i < pendingPhotos.length; i++) {
        setBusy(true, `Mengunggah foto ${i + 1}/${pendingPhotos.length}...`);
        await ref.collection('photos').add({ data: pendingPhotos[i].b64, createdAt: TS() });
      }
    }
    resetClosingForm();
    await success('Laporan tutup kasir hari ini sudah tersimpan.', 'Terkirim');
  } catch (err) {
    console.error(err);
    if (!saved && err.code === 'permission-denied') {
      await fail('Laporan untuk hari ini sudah pernah dikirim. Hubungi Owner jika perlu koreksi.', 'Sudah terkirim');
    } else if (saved) {
      resetClosingForm();
      await fail(`Laporan tersimpan, tetapi sebagian foto gagal: ${err.message}`, 'Sebagian tersimpan');
    } else {
      await fail(err.message, 'Gagal menyimpan');
    }
  } finally {
    setBusy(false);
  }
});

// ============================================================
// BERANDA (owner)
// ============================================================
function renderDashboard() {
  if (profile?.role !== 'owner') return;
  const { from, to } = getRange();
  const dayR = days.filter((d) => d.c.date >= from && d.c.date <= to);
  const perR = periods.filter((p) => p.B.date >= from && p.B.date <= to);
  const wdR = inRange(withdrawals, from, to);
  const sD = (fn) => sumBy(dayR, fn);
  const sP = (fn) => sumBy(perR, fn);

  const gross = sD((d) => d.gross);
  setText('sumTotal', rp(gross));
  setText('sumCash', rp(sD((d) => d.cash)));
  setText('sumQris', rp(sD((d) => d.qris)));

  setText('cardOmsetSeh', rp(sP((p) => p.omsetSeh)));
  setText('cardSelOmset', signedRp(sP((p) => p.selOmset)));
  $('cardSelOmset').parentElement.classList.toggle('alert', perR.some((p) => !p.ok));
  const kl = sD((d) => d.diffLaci), kk = sD((d) => d.diffKasir);
  setText('cardKasLaci', signedRp(kl));
  $('cardKasLaci').parentElement.classList.toggle('alert', kl !== 0);
  setText('cardKasKasir', signedRp(kk));
  $('cardKasKasir').parentElement.classList.toggle('alert', kk !== 0);
  setText('cardSelKek', signedRp(sP((p) => p.selKek)));
  $('cardSelKek').parentElement.classList.toggle('alert', perR.some((p) => !p.ok));
  setText('cardBiaya', rp(sD((d) => d.opexBiaya)));
  setText('cardLaba', rp(sP((p) => p.laba)));
  const w = latestWealth();
  setText('cardKekayaan', w ? rp(w.total) : 'Belum ada opname');

  renderAlerts(dayR, perR);
  renderPayment(gross, sD((d) => d.cash), sD((d) => d.qris));
  renderTrend(dayR, from, to);
  renderRecon(perR);
  renderWithdrawals(wdR);
  renderClosingList(dayR);
}

function renderAlerts(dayR, perR) {
  const items = [];
  dayR.filter((d) => d.diffLaci !== 0 || d.diffKasir !== 0).forEach((d) => {
    const parts = [];
    if (d.diffLaci) parts.push(`Laci ${signedRp(d.diffLaci)}`);
    if (d.diffKasir) parts.push(`Kasir ${signedRp(d.diffKasir)}`);
    items.push(`<div class="alert-item tap" data-id="${d.c.id}">
      <span class="alert-ic">${ic('alert')}</span>
      <div><strong>${fmtDate(d.c.date)} · ${esc(d.c.kasirName || '-')}</strong><small>${parts.join(' · ')}</small></div>
      <span class="chev">${ic('chev')}</span></div>`);
  });
  perR.filter((p) => !p.ok).forEach((p) => items.push(`
    <div class="alert-item tap" data-op="${p.B.id}">
      <span class="alert-ic">${ic('alert')}</span>
      <div><strong>Opname ${fmtShort(p.A.date)} – ${fmtShort(p.B.date)}</strong>
        <small>${p.neg ? 'Ada produk dengan stok lebih banyak dari yang tersedia · ' : ''}Omset ${signedRp(p.selOmset)} · kekayaan ${signedRp(p.selKek)}</small></div>
      <span class="chev">${ic('chev')}</span></div>`));
  $('alertList').innerHTML = items.length ? items.join('')
    : `<div class="ok-banner">${ic('check')}Semua laporan dalam periode ini sudah sesuai</div>`;
}
$('alertList').addEventListener('click', (e) => {
  const a = e.target.closest('[data-id]');
  if (a) return openClosingDetail(a.dataset.id);
  const o = e.target.closest('[data-op]');
  if (o) openOpnameDetail(o.dataset.op);
});

function renderPayment(gross, cash, qris) {
  const pct = (v) => gross ? ((v / gross) * 100).toFixed(1) + '%' : '0%';
  $('payTable').innerHTML = `
    <tr><td>Tunai</td><td class="r">${rp(cash)}</td><td class="r">${pct(cash)}</td></tr>
    <tr><td>QRIS / Transfer</td><td class="r">${rp(qris)}</td><td class="r">${pct(qris)}</td></tr>
    <tr class="total"><td>Total</td><td class="r">${rp(gross)}</td><td class="r">${gross ? '100%' : '0%'}</td></tr>`;
  if (typeof Chart === 'undefined') return;
  charts.dist?.destroy();
  charts.dist = new Chart($('chartDist'), {
    type: 'doughnut',
    data: {
      labels: ['Tunai', 'QRIS / Transfer'],
      datasets: [{ data: gross ? [cash, qris] : [1, 0], backgroundColor: gross ? [GREEN, GOLD] : ['#e7dbb8', '#e7dbb8'], borderWidth: 0 }]
    },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
  });
}
const charts = {};

function renderTrend(dayR, from, to) {
  if (typeof Chart === 'undefined') return;
  const buckets = buildBuckets(from, to);
  const sB = (b, fn) => sumBy(dayR.filter((d) => b.match(d.c.date)), fn);
  charts.trend?.destroy();
  charts.trend = new Chart($('chartTrend'), {
    type: 'bar',
    data: {
      labels: buckets.map((b) => b.label),
      datasets: [
        { label: 'Omset tercatat', data: buckets.map((b) => sB(b, (d) => d.gross)), backgroundColor: GREEN, borderRadius: 4 },
        { label: 'Pengeluaran', data: buckets.map((b) => sB(b, (d) => d.opexTotal)), backgroundColor: GOLD, borderRadius: 4 }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { ticks: { callback: (v) => Number(v).toLocaleString('id-ID') } } }
    }
  });
}

function renderRecon(perR) {
  $('reconTable').innerHTML = perR.length ? perR.map((p) => `
    <tr class="tap-row" data-op="${p.B.id}">
      <td>${fmtShort(p.A.date)} → ${fmtShort(p.B.date)}</td>
      <td class="r">${rp(p.gross)}</td>
      <td class="r">${rp(p.omsetSeh)}</td>
      <td class="r ${p.selOmset < 0 ? 'no' : 'ok'}">${signedRp(p.selOmset)}</td>
      <td class="r ${p.selKek < 0 ? 'no' : 'ok'}">${signedRp(p.selKek)}</td>
      <td class="c">${p.ok ? '<span class="chip ok">Sesuai</span>' : '<span class="chip no">Cek</span>'}</td>
    </tr>`).join('')
    : `<tr><td colspan="6" class="muted center">Belum ada dua opname dalam periode ini</td></tr>`;
}
$('reconTable').addEventListener('click', (e) => {
  const r = e.target.closest('[data-op]');
  if (r) openOpnameDetail(r.dataset.op);
});

function renderWithdrawals(wd) {
  $('withdrawList').innerHTML = wd.length ? wd.map((w) => `
    <div class="row-card">
      <span class="rc-ic">${ic('wallet')}</span>
      <div class="rc-main">
        <strong>${w.type === 'setor' ? 'Setor' : 'Ambil'} ${rp(w.amount)}</strong>
        <small>${fmtDate(w.date)} · dari ${w.pocket === 'kasir' ? 'kasir' : 'laci'} · ${esc(w.note || 'Tanpa catatan')}</small>
      </div>
    </div>`).join('') : `<p class="muted center pad-y">Belum ada pencatatan pada periode ini</p>`;
}

$('btnAddWithdraw').addEventListener('click', () => {
  openSheet(`
    <h3 class="sheet-title">Ambil &amp; setor owner</h3>
    <p class="hint">Dicatat supaya tidak dianggap kebocoran. Pencatatan tidak bisa dihapus, hanya ditambah.</p>
    <div class="row2">
      <div class="field"><label for="wdType">Jenis</label>
        <select id="wdType"><option value="ambil">Ambil</option><option value="setor">Setor</option></select></div>
    </div>
    <div class="row2">
      <div class="field"><label for="wdDate">Tanggal</label><input type="date" id="wdDate" value="${todayStr()}"></div>
      <div class="field"><label for="wdAmount">Jumlah</label><div class="money"><span>Rp</span><input type="number" id="wdAmount" inputmode="numeric" min="1"></div></div>
    </div>
    <div class="field"><label for="wdNote">Catatan</label><input type="text" id="wdNote" placeholder="mis. setoran ke bank"></div>
    <button class="btn-primary" id="wdSave">${ic('check')}Simpan</button>
  `, () => {
    $('wdSave').onclick = async () => {
      const amount = num($('wdAmount').value);
      if (amount <= 0) return toast('Isi jumlah');
      try {
        const data = {
          type: $('wdType').value, pocket: 'laci', date: $('wdDate').value, amount,
          note: $('wdNote').value.trim(), by: profile.name, createdAt: TS()
        };
        await db.collection(C.withdrawals).add(data);
        await logAudit('ambil_setor', `${data.type} ${rp(amount)} dari ${data.pocket}`, data.note || '');
        closeSheet();
        toast('Tersimpan');
      } catch (err) { fail(err.message); }
    };
  });
});

function renderClosingList(dayR) {
  const el = $('closingList');
  if (!dayR.length) { el.innerHTML = `<p class="muted center pad-y">Belum ada laporan pada periode ini</p>`; return; }
  el.innerHTML = dayR.map((d) => {
    const bad = d.diffLaci !== 0 || d.diffKasir !== 0;
    const st = bad ? `<span class="chip no">Cek kas</span>` : `<span class="chip ok">Pas</span>`;
    return `<div class="closing-card tap" data-id="${d.c.id}">
      <div>
        <div class="cc-head"><strong>${fmtDate(d.c.date)}</strong>${st}</div>
        <small>${esc(d.c.kasirName || '-')} · Omset ${rp(d.gross)} · Biaya ${rp(d.opexBiaya)} · Belanja ${rp(d.opexStok)}</small>
      </div>
      <span class="chev">${ic('chev')}</span>
    </div>`;
  }).join('');
}
$('closingList').addEventListener('click', (e) => {
  const c = e.target.closest('[data-id]');
  if (c) openClosingDetail(c.dataset.id);
});

// ============================================================
// DETAIL LAPORAN HARIAN
// ============================================================
function openClosingDetail(id) {
  const d = days.find((x) => x.c.id === id);
  if (!d) return;
  const c = d.c;
  const opexHtml = (c.opex || []).map((o) => `
    <div class="line"><span>${esc(o.desc || '-')}<small>${o.kind === 'stok' ? `belanja barang${o.qty ? ` · ${o.qty} unit` : ''}` : 'biaya'} · dari ${pocketOf(o) === 'kasir' ? 'kasir' : 'laci'}</small></span><b>${rp(o.amount)}</b></div>`).join('')
    || `<p class="muted">Tidak ada pengeluaran</p>`;
  const legacy = (c.proofImages || []).map((u) => `<img class="photo-mini" src="${esc(u)}" data-url="${esc(u)}" alt="Nota">`).join('');

  openSheet(`
    <h3 class="sheet-title">${fmtDate(c.date)}</h3>
    <p class="hint">Kasir: ${esc(c.kasirName || '-')}${c.editedBy ? ` · diedit oleh ${esc(c.editedBy)}` : ''}</p>

    <h4 class="sub-hd">Omset</h4>
    <div class="sum-block">
      <div class="line"><span>Tunai</span><b>${rp(d.cash)}</b></div>
      <div class="line"><span>QRIS</span><b>${rp(d.qris)}</b></div>
      <div class="line total"><span>Omset tercatat</span><b>${rp(d.gross)}</b></div>
    </div>

    ${d.legacy ? '' : `
    <h4 class="sub-hd">Kantong laci</h4>
    <div class="sum-block">
      <div class="line"><span>Saldo awal laci</span><b>${rp(d.startLaci)}</b></div>
      <div class="line"><span>− Ke kasir</span><b>${rp(d.ambil)}</b></div>
      <div class="line"><span>+ Setoran dari kasir (otomatis)</span><b>${rp(d.setor)}</b></div>
      <div class="line"><span>− Biaya &amp; belanja dari laci</span><b>${rp(d.opexLaci)}</b></div>
      <div class="line"><span>Seharusnya di laci</span><b>${rp(d.laciExp)}</b></div>
      <div class="line"><span>Uang fisik di laci</span><b>${rp(d.physLaci)}</b></div>
      <div class="line total"><span>Selisih laci</span><b class="${d.diffLaci === 0 ? 'ok' : d.diffLaci < 0 ? 'no' : 'warn'}">${signedRp(d.diffLaci)}</b></div>
    </div>

    <h4 class="sub-hd">Kantong kasir</h4>
    <div class="sum-block">
      <div class="line"><span>Saldo awal kasir</span><b>${rp(d.startKasir)}</b></div>
      <div class="line"><span>+ Dari laci</span><b>${rp(d.ambil)}</b></div>
      <div class="line"><span>+ Tunai hari ini</span><b>${rp(d.cash)}</b></div>
      <div class="line"><span>− Biaya &amp; belanja dari kasir</span><b>${rp(d.opexKasir)}</b></div>
      <div class="line"><span>Seharusnya di kasir (sebelum setoran)</span><b>${rp(d.kasirExp)}</b></div>
      <div class="line"><span>Uang fisik di kasir (sebelum setoran)</span><b>${rp(d.physKasir)}</b></div>
      <div class="line"><span>Setoran ke laci (otomatis)</span><b>${rp(d.setor)}</b></div>
      <div class="line"><span>Modal kasir yang dibawa besok</span><b>${rp(d.kasirAfter)}</b></div>
      <div class="line total"><span>Selisih kasir</span><b class="${d.diffKasir === 0 ? 'ok' : d.diffKasir < 0 ? 'no' : 'warn'}">${signedRp(d.diffKasir)}</b></div>
    </div>`}

    <h4 class="sub-hd">Belanja &amp; biaya</h4>
    <div class="sum-block">
      <div class="line"><span>Belanja barang (masuk stok)</span><b>${rp(d.opexStok)}</b></div>
      <div class="line"><span>Biaya operasional</span><b>${rp(d.opexBiaya)}</b></div>
      ${opexHtml}
    </div>

    ${c.notes ? `<h4 class="sub-hd">Catatan kasir</h4><p class="hint">${esc(c.notes)}</p>` : ''}

    <h4 class="sub-hd">Foto nota</h4>
    <div class="photo-row" id="detailPhotos">${legacy || '<p class="muted">Memuat foto...</p>'}</div>

    <button class="btn-outline" data-edit="${c.id}">${ic('edit')}Edit laporan (dicatat)</button>
    <button class="btn-ghost" data-close>Tutup</button>
  `, () => {
    db.collection(C.closings).doc(c.id).collection('photos').get().then((snap) => {
      const html = snap.docs.map((p) => `<img class="photo-mini" src="${photoSrc(p.data().data)}" data-url="${photoSrc(p.data().data)}" alt="Nota">`).join('');
      const box = $('detailPhotos');
      if (box) box.innerHTML = (legacy + html) || '<p class="muted">Tidak ada foto</p>';
    }).catch(() => {
      const box = $('detailPhotos');
      if (box && !legacy) box.innerHTML = '<p class="muted">Foto tersimpan di Drive (lihat folder Kantin Barokah - Bukti Nota)</p>';
    });
  });
}

// Edit: hanya angka hitungan dan catatan. Alasan wajib. Perubahan dicatat dengan nilai sebelum dan sesudah.
function openEditClosing(id) {
  const d = days.find((x) => x.c.id === id);
  if (!d) return;
  const c = d.c;
  openSheet(`
    <h3 class="sheet-title">Edit laporan</h3>
    <p class="hint">Setiap perubahan dicatat di log aktivitas beserta nilai lama dan barunya. Alasan wajib diisi.</p>
    <div class="row2">
      <div class="field"><label for="eCash">Tunai</label><div class="money"><span>Rp</span><input type="number" id="eCash" inputmode="numeric" value="${num(c.cashRevenue)}"></div></div>
      <div class="field"><label for="eQris">QRIS</label><div class="money"><span>Rp</span><input type="number" id="eQris" inputmode="numeric" value="${num(c.qrisRevenue)}"></div></div>
    </div>
    <div class="row2">
      <div class="field"><label for="eLaci">Uang fisik laci</label><div class="money"><span>Rp</span><input type="number" id="eLaci" inputmode="numeric" value="${num(c.actualLaci ?? c.actualCash)}"></div></div>
      <div class="field"><label for="eKasir">Uang fisik kasir</label><div class="money"><span>Rp</span><input type="number" id="eKasir" inputmode="numeric" value="${num(c.actualKasir)}"></div></div>
    </div>
    <div class="row2">
      <div class="field"><label for="eAmbil">Laci → kasir</label><div class="money"><span>Rp</span><input type="number" id="eAmbil" inputmode="numeric" value="${num(c.ambilLaci)}"></div></div>
    </div>
    <p class="hint">Setoran ke laci dihitung ulang otomatis dari penjualan dan belanja.</p>
    <div class="field"><label for="eNotes">Catatan</label><textarea id="eNotes" rows="2">${esc(c.notes || '')}</textarea></div>
    <div class="field"><label for="eReason">Alasan perubahan (wajib)</label><input type="text" id="eReason" placeholder="mis. salah input tunai, sudah dicek ulang"></div>
    <button class="btn-primary" id="eSave">${ic('check')}Simpan perubahan</button>
    <button class="btn-ghost" data-close>Batal</button>
  `, () => {
    $('eSave').onclick = async () => {
      const reason = $('eReason').value.trim();
      if (!reason) return toast('Isi alasan perubahan');
      const next = {
        cashRevenue: num($('eCash').value), qrisRevenue: num($('eQris').value),
        actualLaci: num($('eLaci').value), actualKasir: num($('eKasir').value),
        ambilLaci: num($('eAmbil').value),
        notes: $('eNotes').value.trim()
      };
      next.grossRevenue = next.cashRevenue + next.qrisRevenue;
      const kasirSebelum = num(c.startKasir) + next.ambilLaci + next.cashRevenue
        - sumBy((c.opex || []).filter((o) => pocketOf(o) === 'kasir'), (o) => num(o.amount));
      next.setorKasir = kasirSebelum - num(c.modalKasir ?? MODAL_DEFAULT);
      const before = {
        cashRevenue: num(c.cashRevenue), qrisRevenue: num(c.qrisRevenue),
        actualLaci: num(c.actualLaci ?? c.actualCash), actualKasir: num(c.actualKasir),
        ambilLaci: num(c.ambilLaci)
      };
      const changes = Object.keys(before)
        .filter((k) => before[k] !== next[k])
        .map((k) => `${k} ${before[k]} → ${next[k]}`).join('; ');
      if (!changes && next.notes === (c.notes || '')) return toast('Tidak ada perubahan');
      try {
        const batch = db.batch();
        batch.update(db.collection(C.closings).doc(c.id), { ...next, editedBy: profile.name, editedAt: TS() });
        const latest = allClosings.reduce((m, x) => (x.date > m ? x.date : m), '');
        if (c.date === latest) {
          batch.set(db.collection(C.kas).doc('saldo'), {
            laci: next.actualLaci, kasir: next.actualKasir - next.setorKasir, date: c.date, by: profile.name
          });
        }
        await batch.commit();
        await logAudit('laporan_diedit', c.date, `${changes || 'catatan'} · alasan: ${reason}`);
        closeSheet();
        toast('Laporan diperbarui dan dicatat');
      } catch (err) { fail(err.message); }
    };
  });
}

// ============================================================
// OPNAME (rinci per produk)
// ============================================================
function renderOpnameTab() {
  if (profile?.role !== 'owner') return;
  const w = latestWealth();
  $('opnameLatest').innerHTML = w ? `
    <section class="hero small-hero">
      <p class="hero-lbl">Kekayaan toko · opname ${fmtDate(w.op.date)}</p>
      <p class="hero-val">${rp(w.total)}</p>
      <div class="hero-split">
        <div><span>Stok (HPP)</span><b>${rp(w.op.hppValue)}</b></div>
        <div><span>Laci + kasir</span><b>${rp(num(w.op.cashLaci) + num(w.op.cashKasir))}</b></div>
        <div><span>Bank</span><b>${rp(w.op.bank)}</b></div>
      </div>
    </section>`
    : `<div class="empty">${ic('scale')}<p>Belum ada opname. Lakukan opname pertama untuk memulai rekonsiliasi.</p></div>`;

  const ops = sortAsc(opnames).reverse();
  $('opnameList').innerHTML = ops.length ? ops.map((o) => {
    const p = periods.find((x) => x.B.id === o.id);
    const st = !p ? `<span class="chip">Opname awal</span>` : p.ok ? `<span class="chip ok">Sesuai</span>` : `<span class="chip no">Cek</span>`;
    return `<div class="closing-card tap" data-op="${o.id}">
      <div>
        <div class="cc-head"><strong>${fmtDate(o.date)}</strong>${st}</div>
        <small>${(o.lines || []).length} produk · Stok HPP ${rp(o.hppValue)} · Jual ${rp(o.jualValue)}</small>
      </div>
      <span class="chev">${ic('chev')}</span>
    </div>`;
  }).join('') : '';
}
$('opnameList').addEventListener('click', (e) => {
  const o = e.target.closest('[data-op]');
  if (o) openOpnameDetail(o.dataset.op);
});
$('btnAddOpname').addEventListener('click', openOpnameSheet);

function openOpnameSheet() {
  const active = products.filter((p) => p.active !== false);
  if (!active.length) return fail('Belum ada produk. Tambahkan produk dulu di menu Produk.', 'Belum ada produk');
  const lastOp = sortAsc(opnames).slice(-1)[0];
  const lastQty = (id) => (lastOp?.lines || []).find((l) => l.id === id)?.qty ?? '';
  openSheet(`
    <h3 class="sheet-title">Opname stok</h3>
    <p class="hint">Hitung jumlah setiap produk di toko, lalu isi uang di laci, di kasir, dan saldo bank.</p>
    <div class="field"><label for="opDate">Tanggal</label><input type="date" id="opDate" value="${todayStr()}"></div>
    <div class="stock-head"><span>Produk</span><span class="c">Qty</span><span class="c">Nilai HPP</span></div>
    <div id="opLines">${active.map((p) => `
      <div class="stock-row" data-id="${p.id}" data-hpp="${num(p.hpp)}" data-price="${num(p.price)}" data-name="${esc(p.name)}">
        <div class="sr-name"><strong>${esc(p.name)}</strong><small>${p.needsPrice ? 'belum ada harga' : `jual ${rp(p.price)}`}</small></div>
        <input type="number" class="sr-qty" inputmode="numeric" min="0" placeholder="0" value="${lastQty(p.id)}">
        <span class="sr-val">${rp(0)}</span>
      </div>`).join('')}</div>
    <div class="sum-block">
      <div class="line"><span>Nilai stok dengan HPP</span><b id="opHppTot">Rp 0</b></div>
      <div class="line"><span>Nilai stok dengan harga jual</span><b id="opJualTot">Rp 0</b></div>
    </div>
    <div class="row2" style="margin-top:12px">
      <div class="field"><label for="opLaci">Uang di laci</label><div class="money"><span>Rp</span><input type="number" id="opLaci" inputmode="numeric" min="0"></div></div>
      <div class="field"><label for="opKasir">Uang di kasir</label><div class="money"><span>Rp</span><input type="number" id="opKasir" inputmode="numeric" min="0"></div></div>
    </div>
    <div class="field"><label for="opBank">Saldo bank / tabungan</label><div class="money"><span>Rp</span><input type="number" id="opBank" inputmode="numeric" min="0"></div></div>
    <div class="field"><label for="opNote">Catatan</label><input type="text" id="opNote" placeholder="mis. opname mingguan"></div>
    <button class="btn-primary" id="opSave">${ic('check')}Simpan opname</button>
    <button class="btn-ghost" data-close>Batal</button>
  `, () => {
    const recalc = () => {
      let hpp = 0, jual = 0;
      document.querySelectorAll('#opLines .stock-row').forEach((r) => {
        const q = num(r.querySelector('.sr-qty').value);
        const vh = q * num(r.dataset.hpp), vj = q * num(r.dataset.price);
        r.querySelector('.sr-val').textContent = rp(vh);
        hpp += vh; jual += vj;
      });
      setText('opHppTot', rp(hpp));
      setText('opJualTot', rp(jual));
    };
    $('opLines').addEventListener('input', recalc);
    recalc();

    $('opSave').onclick = async () => {
      const lines = [];
      let hpp = 0, jual = 0;
      document.querySelectorAll('#opLines .stock-row').forEach((r) => {
        const qty = num(r.querySelector('.sr-qty').value);
        const price = num(r.dataset.price), hppU = num(r.dataset.hpp);
        lines.push({ id: r.dataset.id, name: r.dataset.name, qty, price, hpp: hppU });
        hpp += qty * hppU; jual += qty * price;
      });
      if (!$('opLaci').value || !$('opKasir').value) return toast('Isi uang di laci dan di kasir');
      if (lines.some((l) => l.qty > 0 && (!l.price || !l.hpp))) {
        return fail('Ada produk yang belum punya harga jual atau HPP. Lengkapi dulu di menu Produk.', 'Produk belum lengkap');
      }
      try {
        const data = {
          date: $('opDate').value, lines,
          hppValue: hpp, jualValue: jual,
          cashLaci: num($('opLaci').value), cashKasir: num($('opKasir').value),
          bank: num($('opBank').value), note: $('opNote').value.trim(),
          by: profile.name, byUid: profile.uid, createdAt: TS()
        };
        await db.collection(C.opname).add(data);
        await logAudit('opname_dibuat', data.date, `stok HPP ${rp(hpp)}, jual ${rp(jual)}, laci ${rp(data.cashLaci)}, kasir ${rp(data.cashKasir)}, bank ${rp(data.bank)}`);
        closeSheet();
        toast('Opname disimpan');
      } catch (err) { fail(err.message); }
    };
  });
}

function openOpnameDetail(id) {
  const o = opnames.find((x) => x.id === id);
  if (!o) return;
  const p = periods.find((x) => x.B.id === id);
  const lines = (o.lines || []).map((l) => `
    <tr><td>${esc(l.name)}</td><td class="c">${num(l.qty)}</td><td class="r">${rp(num(l.qty) * num(l.hpp))}</td><td class="r">${rp(num(l.qty) * num(l.price))}</td></tr>`).join('')
    || `<tr><td colspan="4" class="muted center">Opname lama tanpa rincian produk</td></tr>`;

  const body = p ? `
    <h4 class="sub-hd">Per produk ${fmtShort(p.A.date)} – ${fmtShort(p.B.date)}</h4>
    <div class="table-wrap sheet-tbl"><table class="tbl">
      <thead><tr><th>Produk</th><th class="c">Awal</th><th class="c">Masuk</th><th class="c">Akhir</th><th class="c">Terjual</th><th class="r">Omset</th></tr></thead>
      <tbody>${p.perProduct.map((d) => `<tr>
        <td>${esc(d.name)}</td><td class="c">${d.awal}</td><td class="c">${d.masuk}</td><td class="c">${d.akhir}</td>
        <td class="c ${d.terjual < 0 ? 'no' : ''}"><b>${d.terjual}</b></td><td class="r">${rp(d.rev)}</td></tr>`).join('')}</tbody>
    </table></div>
    <h4 class="sub-hd">Omset</h4>
    <div class="sum-block">
      <div class="line"><span>Omset tercatat</span><b>${rp(p.gross)}</b></div>
      <div class="line"><span>Omset seharusnya dari stok</span><b>${rp(p.omsetSeh)}</b></div>
      <div class="line total"><span>Selisih omset</span><b class="${p.selOmset < 0 ? 'no' : 'ok'}">${signedRp(p.selOmset)}</b></div>
    </div>
    <h4 class="sub-hd">Laba &amp; kekayaan</h4>
    <div class="sum-block">
      <div class="line"><span>HPP barang terjual</span><b>${rp(p.hppSold)}</b></div>
      <div class="line"><span>Biaya operasional</span><b>${rp(p.biaya)}</b></div>
      <div class="line"><span>Selisih harga beli vs HPP</span><b>${rp(p.premium)}</b></div>
      <div class="line"><span>Laba periode</span><b>${rp(p.laba)}</b></div>
      <div class="line"><span>Kekayaan awal → akhir</span><b>${rp(p.wA)} → ${rp(p.wB)}</b></div>
      <div class="line"><span>Ambil owner (bersih)</span><b>${rp(p.ambil)}</b></div>
      <div class="line total"><span>Selisih kekayaan</span><b class="${p.selKek < 0 ? 'no' : 'ok'}">${signedRp(p.selKek)}</b></div>
    </div>
    <p class="hint">${p.ok ? 'Semua selisih berada dalam batas wajar.' : p.neg ? 'Ada produk dengan stok lebih banyak dari yang tersedia. Periksa belanja dan jumlah opname.' : 'Selisih di atas batas wajar. Periksa laporan harian pada periode ini.'}</p>`
    : `<p class="hint">Opname awal. Perhitungan periode dimulai pada opname berikutnya.</p>`;

  openSheet(`
    <h3 class="sheet-title">Opname ${fmtDate(o.date)}</h3>
    <p class="hint">Dicatat oleh ${esc(o.by || '-')}${o.note ? ` · ${esc(o.note)}` : ''}. Opname tidak dapat diubah atau dihapus.</p>
    <div class="table-wrap sheet-tbl"><table class="tbl">
      <thead><tr><th>Produk</th><th class="c">Qty</th><th class="r">Nilai HPP</th><th class="r">Nilai jual</th></tr></thead>
      <tbody>${lines}</tbody>
    </table></div>
    <div class="sum-block" style="margin-top:12px">
      <div class="line"><span>Total stok HPP</span><b>${rp(o.hppValue)}</b></div>
      <div class="line"><span>Total stok harga jual</span><b>${rp(o.jualValue)}</b></div>
      <div class="line"><span>Uang di laci</span><b>${rp(o.cashLaci)}</b></div>
      <div class="line"><span>Uang di kasir</span><b>${rp(o.cashKasir)}</b></div>
      <div class="line"><span>Saldo bank</span><b>${rp(o.bank)}</b></div>
    </div>
    ${body}
    <button class="btn-ghost" data-close>Tutup</button>
  `);
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
    ['modal', 'wallet', 'Modal kasir tetap', `Saat ini Rp ${Math.round(modalKasir).toLocaleString('id-ID')}`, true],
    ['users', 'users', 'Kelola pengguna', 'Tambah akun & atur role', true],
    ['log', 'log', 'Log aktivitas', 'Riwayat perubahan (hanya dibaca)', true],
    ['exportXlsx', 'chart', 'Export laporan (Excel)', 'Sesuai periode di Beranda', true],
    ['backup', 'download', 'Backup data (JSON)', 'Salin semua data ke file', true],
    ['about', 'info', 'Tentang aplikasi', 'Versi dan cara kerja', false],
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
    modal: openModalSheet,
    log: openAuditSheet,
    exportXlsx: exportWorkbook,
    backup: backupAll,
    about: openAbout,
    logout: async () => { if (await ask('Keluar dari aplikasi?', 'Keluar', 'info', 'Keluar')) auth.signOut(); }
  };
  try { await actions[b.dataset.act](); }
  catch (err) { fail(err.message); }
});

function openModalSheet() {
  openSheet(`
    <h3 class="sheet-title">Modal kasir tetap</h3>
    <p class="hint">Jumlah uang yang selalu tinggal di kasir untuk besok. Sisanya otomatis disetor ke laci setiap tutup kasir. Perubahan berlaku mulai laporan berikutnya.</p>
    <div class="field"><label for="mdAmount">Modal kasir (Rp)</label><div class="money"><span>Rp</span><input type="number" id="mdAmount" inputmode="numeric" min="0" value="${modalKasir}"></div></div>
    <button class="btn-primary" id="mdSave">${ic('check')}Simpan modal</button>
    <button class="btn-ghost" data-close>Batal</button>
  `, () => {
    $('mdSave').onclick = async () => {
      const v = num($('mdAmount').value);
      if (v <= 0) return toast('Modal harus lebih dari 0');
      const old = modalKasir;
      try {
        await db.collection(C.settings).doc('kas').set({ modalKasir: v, by: profile.name, updatedAt: TS() }, { merge: true });
        await logAudit('modal_kasir_diubah', 'modal kasir', `${rp(old)} → ${rp(v)}`);
        closeSheet();
        toast('Modal kasir diperbarui');
      } catch (err) { fail(err.message); }
    };
  });
}

function openAuditSheet() {
  const rows = auditLogs.map((a) => {
    const t = a.at?.toDate ? a.at.toDate() : null;
    const when = t ? t.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';
    return `<div class="line"><span>${esc(a.action.replace(/_/g, ' '))} · ${esc(a.target || '')}<small>${esc(a.by || '')} · ${when}${a.summary ? ' · ' + esc(a.summary) : ''}</small></span></div>`;
  }).join('');
  openSheet(`
    <h3 class="sheet-title">Log aktivitas</h3>
    <p class="hint">Setiap perubahan produk, harga, opname, pengambilan, dan edit laporan tercatat di sini. Log tidak bisa diubah atau dihapus.</p>
    <div class="sum-block">${rows || '<p class="muted">Belum ada aktivitas.</p>'}</div>
    <button class="btn-ghost" data-close>Tutup</button>
  `);
}

let pendingAvatar = null;
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
        pendingAvatar = await preparePhoto(f, AVATAR_SIDE, AVATAR_QUALITY);
        $('avatarPreview').innerHTML = `<img src="${URL.createObjectURL(pendingAvatar.blob)}" alt="">` +
          `<span class="avatar-cam">${ic('camera')}</span>`;
      } catch (err) { fail(err.message, 'Foto gagal diproses'); }
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
    if (pendingAvatar) upd.photoData = pendingAvatar.b64;
    await db.collection(C.users).doc(profile.uid).update(upd);
    profile = { ...profile, ...upd };
    paintHeader();
    renderSettings();
    closeSheet();
    toast('Profil diperbarui');
  } catch (err) { fail(err.message); }
  finally { btn.disabled = false; btn.innerHTML = `${ic('check')}Simpan perubahan`; }
}

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
        success('Password Anda sudah diganti.', 'Berhasil');
      } catch (err) {
        fail(['auth/wrong-password', 'auth/invalid-credential'].includes(err.code) ? 'Password lama tidak sesuai.' : err.message, 'Gagal mengganti password');
      }
    };
  });
}

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
  const u = allUsers.find((x) => x.id === e.target.dataset.uid);
  try {
    await db.collection(C.users).doc(e.target.dataset.uid).update({ role: e.target.value });
    await logAudit('role_diubah', u?.username || '', `${u?.role} → ${e.target.value}`);
    toast('Role diperbarui');
  } catch (err) { fail(err.message); }
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
      <select id="nuRole"><option value="kasir">Kasir</option><option value="owner">Owner</option></select></div>
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
        await db.collection(C.users).doc(cred.user.uid).set({ username, name, role, photoData: '', createdAt: TS() });
        await sAuth.signOut();
        await logAudit('akun_dibuat', username, `role ${role}`);
        success(`Akun @${username} sudah dibuat.`, 'Berhasil');
        openUsersSheet();
      } catch (err) {
        fail(err.code === 'auth/email-already-in-use' ? 'Username sudah dipakai.' : err.message, 'Gagal membuat akun');
      } finally { btn.disabled = false; }
    };
  });
}

// ---- Simpan file: browser unduh, Android bagikan ----
function saveFile(filename, base64, mime) {
  if (window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform()) {
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
  if (!days.length) return toast('Belum ada data laporan');
  const { from, to } = getRange();
  const dayR = days.filter((d) => d.c.date >= from && d.c.date <= to);
  const perR = periods.filter((p) => p.B.date >= from && p.B.date <= to);
  const sheet = (rows) => XLSX.utils.json_to_sheet(rows.length ? rows : [{ Keterangan: 'Tidak ada data' }]);

  const laporan = dayR.map((d) => ({
    'Tanggal': d.c.date, 'Kasir': d.c.kasirName,
    'Tunai': d.cash, 'QRIS': d.qris, 'Omset': d.gross,
    'Belanja Barang': d.opexStok, 'Biaya Operasional': d.opexBiaya,
    'Setoran Otomatis ke Laci': d.setor,
    'Laci: Seharusnya': d.laciExp, 'Laci: Fisik': d.physLaci, 'Selisih Laci': d.diffLaci,
    'Kasir: Seharusnya (sebelum setoran)': d.kasirExp, 'Kasir: Fisik (sebelum setoran)': d.physKasir ?? '', 'Selisih Kasir': d.diffKasir,
    'Catatan': d.c.notes || ''
  }));
  const rekon = perR.map((p) => ({
    'Periode': `${p.A.date} s/d ${p.B.date}`, 'Omset Tercatat': p.gross,
    'Omset Seharusnya': Math.round(p.omsetSeh), 'Selisih Omset': Math.round(p.selOmset),
    'HPP Terjual': Math.round(p.hppSold), 'Biaya': p.biaya, 'Selisih Harga Beli': Math.round(p.premium),
    'Laba': Math.round(p.laba), 'Ambil Owner': p.ambil, 'Selisih Kekayaan': Math.round(p.selKek),
    'Status': p.ok ? 'Sesuai' : 'Cek'
  }));
  const perProd = perR.flatMap((p) => p.perProduct.map((d) => ({
    'Periode': `${p.A.date} s/d ${p.B.date}`, 'Produk': d.name, 'Awal': d.awal, 'Masuk': d.masuk,
    'Akhir': d.akhir, 'Terjual': d.terjual, 'Harga Jual': d.price, 'HPP': d.hpp, 'Omset': Math.round(d.rev)
  })));
  const prodRows = products.map((p) => ({
    'Produk': p.name, 'Kategori': p.category, 'Harga Jual': num(p.price), 'HPP': num(p.hpp),
    'Status': p.active === false ? 'Nonaktif' : 'Aktif', 'Catatan': p.needsPrice ? 'Belum ada harga' : ''
  }));
  const opRows = opnames.filter((o) => o.date >= from && o.date <= to).map((o) => ({
    'Tanggal': o.date, 'Stok HPP': o.hppValue, 'Stok Jual': o.jualValue,
    'Laci': o.cashLaci, 'Kasir': o.cashKasir, 'Bank': o.bank, 'Dicatat oleh': o.by || ''
  }));
  const wd = inRange(withdrawals, from, to).map((w) => ({
    'Tanggal': w.date, 'Jenis': w.type === 'setor' ? 'Setor' : 'Ambil', 'Dari': w.pocket === 'kasir' ? 'Kasir' : 'Laci',
    'Jumlah': num(w.amount), 'Catatan': w.note || '', 'Dicatat oleh': w.by || ''
  }));
  const audit = auditLogs.map((a) => ({
    'Waktu': a.at?.toDate ? a.at.toDate().toLocaleString('id-ID') : '', 'Oleh': a.by, 'Aksi': a.action,
    'Target': a.target, 'Keterangan': a.summary || ''
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet(laporan), 'Laporan Harian');
  XLSX.utils.book_append_sheet(wb, sheet(rekon), 'Rekonsiliasi');
  XLSX.utils.book_append_sheet(wb, sheet(perProd), 'Detail Produk');
  XLSX.utils.book_append_sheet(wb, sheet(prodRows), 'Produk');
  XLSX.utils.book_append_sheet(wb, sheet(opRows), 'Opname');
  XLSX.utils.book_append_sheet(wb, sheet(wd), 'Ambil Setor');
  XLSX.utils.book_append_sheet(wb, sheet(audit), 'Log Aktivitas');
  const b64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
  await saveFile(`KantinBarokah_${from}_sd_${to}.xlsx`, b64,
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  toast('File Excel siap');
}

async function backupAll() {
  const clean = (o) => JSON.parse(JSON.stringify(o, (k, v) =>
    (v && typeof v === 'object' && 'seconds' in v && 'nanoseconds' in v)
      ? new Date(v.seconds * 1000).toISOString() : v));
  const payload = clean({
    app: 'Kantin Barokah', version: APP_VERSION, exportedAt: new Date().toISOString(),
    closings: allClosings, withdrawals, opname: opnames, products, users: allUsers, audit: auditLogs
  });
  const b64 = btoa(unescape(encodeURIComponent(JSON.stringify(payload, null, 2))));
  await saveFile(`kantin_backup_${todayStr()}.json`, b64, 'application/json');
  toast('Backup dibuat');
}

function openAbout() {
  openSheet(`
    <div class="empty" style="padding-top:8px">
      <img src="logo.svg" alt="" style="width:76px;height:76px;border-radius:22px">
      <h3 class="sheet-title" style="margin-top:12px">Kantin Barokah</h3>
      <p class="hint">Tutup Kasir Harian · Versi ${APP_VERSION}</p>
    </div>
    <h4 class="sub-hd">Cara kerja</h4>
    <p class="hint">Kasir mengisi penjualan, pindah uang antara laci dan kasir, belanja, dan uang fisik setiap hari. Owner melakukan opname per produk secara berkala. Aplikasi lalu membandingkan stok, omset, dan kekayaan toko, dan mencatat semua perubahan di log.</p>
    <button class="btn-ghost" data-close>Tutup</button>
  `);
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

// Ekspor untuk pengujian (tidak mengubah perilaku aplikasi)
if (typeof module !== 'undefined') module.exports = { computeDays, computePeriods, pocketOf };
