// ============================================================
// KANTIN BAROKAH · Tutup Kasir · app.js (v3.0.0)
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

const APP_VERSION = '3.0.0';
const C = { closings: 'daily_closings', users: 'users', withdrawals: 'owner_withdrawals', opname: 'opname', kas: 'kas' };
const PHOTO_SIDE = 800, PHOTO_QUALITY = 0.6;
const AVATAR_SIDE = 512, AVATAR_QUALITY = 0.7;
const MAX_B64 = 900000;          // batas aman satu dokumen Firestore (1 MB)
// Tempat penyimpanan foto nota:
//   'drive'     → Google Drive lewat Apps Script (folder "Kantin Barokah - Bukti Nota")
//   'firestore' → langsung di database (tanpa Drive)
const PHOTO_STORAGE = 'drive';
const DRIVE_UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbyunLWcCJpVO1sgJmWoY3tiHvkIEf8SbUUN1Uby3PGmtN4R0MGmjHlOaQ-1bLjRD4Y/exec';
const TOL_ABS = 10000, TOL_REL = 0.01;   // toleransi selisih opname (rasio harga tidak pernah persis)
const GREEN = '#1d4d2c', GOLD = '#c9963e';
const PALETTE = ['#1d4d2c', '#c9963e', '#4f8a63', '#e3c57a', '#8c5a2b'];

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
const fmtShort = (s) => new Date(s + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
const usernameToEmail = (u) => { const v = u.trim().toLowerCase(); return v.includes('@') ? v : `${v}@kantin.app`; };
const sortAsc = (list) => [...list].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
const photoSrc = (b64) => 'data:image/jpeg;base64,' + b64;
const avatarHtml = (u) => u.photoData
  ? `<img src="${photoSrc(u.photoData)}" alt="">`
  : `<span>${esc((u.name || u.username || '?').charAt(0).toUpperCase())}</span>`;
const setText = (id, t) => { $(id).textContent = t; };

// ============================================================
// KARTU NOTIFIKASI (pengganti alert & confirm)
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
// GESTUR: riak untuk tombol biasa, ikon membesar untuk menu
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
  const del = e.target.closest('[data-del]');
  if (del) return deleteClosing(del.dataset.del);
  const dw = e.target.closest('[data-del-op]');
  if (dw) return deleteOpname(dw.dataset.delOp);
});
function openViewer(url) { $('viewerImg').src = url; $('viewer').classList.add('show'); }
$('viewer').addEventListener('click', () => $('viewer').classList.remove('show'));

// ============================================================
// FOTO: kompres di HP, simpan sebagai base64 di Firestore
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
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // hindari preflight CORS
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

// ============================================================
// LISTENER FIRESTORE
// ============================================================
let unsubs = [];
let allClosings = [], withdrawals = [], opnames = [], allUsers = [];
let kasSaldo = null;            // saldo laci terakhir (info untuk kasir)
let days = [], periods = [];    // hasil perhitungan (owner)

function startListeners() {
  stopListeners();
  unsubs.push(db.collection(C.kas).doc('saldo').onSnapshot((s) => {
    kasSaldo = s.exists ? s.data() : null;
    renderSaldoInfo();
  }, (err) => console.error('kas', err)));

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
}

function stopListeners() {
  unsubs.forEach((u) => u());
  unsubs = [];
  allClosings = []; withdrawals = []; opnames = []; allUsers = []; kasSaldo = null;
  days = []; periods = [];
}

function refreshOwner() {
  if (profile?.role !== 'owner') return;
  recompute();
  renderDashboard();
  renderOpnameTab();
}

// ============================================================
// PERHITUNGAN
// ============================================================
// Setiap hari: kas laci harus = saldo awal (uang fisik kemarin) + tunai − keluar dari laci − ambil dari laci
// Saldo awal selalu diambil dari laporan sebelumnya, bukan dari isian kasir → tidak bisa dimanipulasi.
function recompute() {
  const wdLac = {};
  withdrawals.forEach((w) => {
    if (w.fromDrawer === false) return;
    wdLac[w.date] = (wdLac[w.date] || 0) + (w.type === 'setor' ? -num(w.amount) : num(w.amount));
  });

  days = [];
  let prevActual = null;
  sortAsc(allClosings).forEach((c) => {
    const opexTotal = num(c.opexTotal ?? c.totalOpex);
    const opexBiaya = c.opexBiaya != null ? num(c.opexBiaya) : opexTotal;
    const opexStok = num(c.opexStok);
    const opexDrawer = c.opexDrawer != null ? num(c.opexDrawer) : opexTotal;
    const cash = num(c.cashRevenue), qris = num(c.qrisRevenue);
    const gross = num(c.grossRevenue) || cash + qris;
    const startLaci = prevActual ?? num(c.startingCash);
    const ambilLaci = wdLac[c.date] || 0;
    const expected = startLaci + cash - opexDrawer - ambilLaci;
    const actual = num(c.actualCash);
    days.push({ c, gross, cash, qris, opexBiaya, opexStok, opexTotal, opexDrawer, startLaci, ambilLaci, expected, actual, diff: actual - expected });
    prevActual = actual;
  });

  periods = buildPeriods();
}

// Rekonsiliasi antara dua opname berurutan (A → B)
function buildPeriods() {
  const ops = sortAsc(opnames);
  const out = [];
  for (let i = 1; i < ops.length; i++) {
    const A = ops[i - 1], B = ops[i];
    const inP = days.filter((d) => d.c.date > A.date && d.c.date <= B.date);
    const sum = (fn) => inP.reduce((s, d) => s + fn(d), 0);
    const gross = sum((d) => d.gross);
    const biaya = sum((d) => d.opexBiaya);
    const beli = sum((d) => d.opexStok);
    const ambil = withdrawals
      .filter((w) => w.date > A.date && w.date <= B.date)
      .reduce((s, w) => s + (w.type === 'setor' ? -num(w.amount) : num(w.amount)), 0);

    // HPP barang terjual = stok awal + belanja stok − stok akhir (semua dalam nilai HPP)
    const hppSold = num(A.hppValue) + beli - num(B.hppValue);
    // Rasio harga jual / HPP dari opname akhir (atau opname awal jika akhir tidak lengkap)
    const ratio = num(B.hppValue) > 0 && num(B.jualValue) > 0
      ? num(B.jualValue) / num(B.hppValue)
      : (num(A.hppValue) > 0 && num(A.jualValue) > 0 ? num(A.jualValue) / num(A.hppValue) : 1);
    const omsetSeh = hppSold * ratio;
    const selOmset = gross - omsetSeh;

    const laba = gross - hppSold - biaya;
    // Kekayaan = stok (HPP) + saldo bank + uang laci
    const wA = num(A.hppValue) + num(A.bank) + lociAt(A.date);
    const wB = num(B.hppValue) + num(B.bank) + lociAt(B.date);
    const selKek = (wB - wA) - (laba - ambil);

    const tol = Math.max(TOL_ABS, TOL_REL * Math.abs(gross));
    const ok = Math.abs(selOmset) <= tol && Math.abs(selKek) <= tol;
    out.push({ A, B, gross, biaya, beli, ambil, hppSold, ratio, omsetSeh, selOmset, laba, selKek, ok, nDays: inP.length });
  }
  return out;
}

function lociAt(date) {
  let v = 0;
  for (const d of days) { if (d.c.date <= date) v = d.actual; else break; }
  return v;
}

function latestWealth() {
  const last = sortAsc(opnames).slice(-1)[0];
  if (!last) return null;
  const lastDay = days.slice(-1)[0];
  return { op: last, laci: lastDay ? lastDay.actual : 0,
    total: num(last.hppValue) + num(last.bank) + (lastDay ? lastDay.actual : 0) };
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
// FORM TUTUP KASIR (kasir)
// ============================================================
function renderSaldoInfo() {
  const hasPrev = !!kasSaldo;
  $('saldoInfo').classList.toggle('hidden', !hasPrev);
  $('startWrap').classList.toggle('hidden', hasPrev);
  if (hasPrev) setText('saldoAwalTxt', rp(kasSaldo.actualCash));
}

function opexEditHtml(desc = '', amount = '', drawer = true, kind = 'biaya') {
  return `<div class="opex-row">
    <div class="opex-top">
      <input type="text" class="opex-desc" placeholder="Nama (mis. Gas 3kg, Es batu)" value="${esc(desc)}">
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

$('opexList').addEventListener('click', (e) => {
  const b = e.target.closest('.icon-btn');
  if (b) b.closest('.opex-row').remove();
});
$('btnAddOpex').addEventListener('click', () => {
  $('opexList').insertAdjacentHTML('beforeend', opexEditHtml());
});

$('proofInput').addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  e.target.value = '';
  for (const f of files) {
    try {
      const { blob, b64 } = await preparePhoto(f, PHOTO_SIDE, PHOTO_QUALITY);
      pendingPhotos.push({ blob, b64, url: URL.createObjectURL(blob), orig: f.size });
    } catch (err) {
      await fail(err.message, 'Foto gagal diproses');
    }
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
    $('photoHint').textContent = 'Foto nota atau bukti belanja. Otomatis dikompres sebelum disimpan.';
  } else {
    const before = pendingPhotos.reduce((s, p) => s + p.orig, 0);
    const after = pendingPhotos.reduce((s, p) => s + p.blob.size, 0);
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

function readClosingForm() {
  const opex = [];
  document.querySelectorAll('#opexList .opex-row').forEach((r) => {
    const desc = r.querySelector('.opex-desc').value.trim();
    const amount = num(r.querySelector('.opex-amount').value);
    const fromDrawer = r.querySelector('.opex-drawer').checked;
    const kind = r.querySelector('.opex-kind').value;
    if (desc || amount) opex.push({ desc, amount, fromDrawer, kind });
  });
  const cashRevenue = num($('cashRevenue').value);
  const qrisRevenue = num($('qrisRevenue').value);
  const sumIf = (fn) => opex.filter(fn).reduce((s, o) => s + o.amount, 0);
  const startingCash = kasSaldo ? num(kasSaldo.actualCash) : num($('startingCash').value);
  return {
    date: todayStr(),
    startingCash,
    cashRevenue, qrisRevenue,
    grossRevenue: cashRevenue + qrisRevenue,
    opex,
    opexTotal: sumIf(() => true),
    opexDrawer: sumIf((o) => o.fromDrawer),
    opexBiaya: sumIf((o) => o.kind !== 'stok'),
    opexStok: sumIf((o) => o.kind === 'stok'),
    actualCash: num($('actualCash').value),
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
  if (!$('cashRevenue').value || !$('qrisRevenue').value) return fail('Isi penjualan tunai dan QRIS (boleh 0).', 'Lengkapi data');
  if (!$('actualCash').value) return fail('Hitung uang fisik di laci terlebih dahulu.', 'Lengkapi data');
  if (!kasSaldo && !$('startingCash').value) return fail('Ini laporan pertama, isi saldo awal laci.', 'Lengkapi data');
  if (!$('chkCounted').checked || !$('chkPhotos').checked) return fail('Lengkapi checklist akhir hari.', 'Lengkapi data');
  if (!pendingPhotos.length && !(await ask('Belum ada foto nota. Tetap kirim laporan?', 'Tanpa foto'))) return;

  const data = readClosingForm();
  const ref = db.collection(C.closings).doc(data.date);
  let saved = false;
  setBusy(true, 'Menyimpan laporan...');
  try {
    // 1) Foto ke Drive dulu (jika mode drive). Jika gagal, laporan belum tersimpan dan bisa dikirim ulang.
    let photoUrls = [];
    if (PHOTO_STORAGE === 'drive') {
      for (let i = 0; i < pendingPhotos.length; i++) {
        setBusy(true, `Mengunggah foto ${i + 1}/${pendingPhotos.length}...`);
        const r = await uploadToDrive(pendingPhotos[i].b64, `${profile.uid}_${data.date}_${Date.now()}_${i}.jpg`);
        photoUrls.push(r.url);
      }
    }

    // 2) Laporan dan saldo laci disimpan bersamaan (atomik)
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
    batch.set(db.collection(C.kas).doc('saldo'), { actualCash: data.actualCash, date: data.date, by: profile.name });
    await batch.commit();
    saved = true;

    // 3) Mode firestore: foto disimpan di subkoleksi laporan
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
  const sumD = (fn) => dayR.reduce((s, d) => s + fn(d), 0);
  const sumP = (fn) => perR.reduce((s, p) => s + fn(p), 0);

  const gross = sumD((d) => d.gross);
  setText('sumTotal', rp(gross));
  setText('sumCash', rp(sumD((d) => d.cash)));
  setText('sumQris', rp(sumD((d) => d.qris)));

  setText('cardBiaya', rp(sumD((d) => d.opexBiaya)));
  setText('cardStokBeli', rp(sumD((d) => d.opexStok)));
  setText('cardAmbil', rp(wdR.reduce((s, w) => s + (w.type === 'setor' ? -num(w.amount) : num(w.amount)), 0)));

  const kas = sumD((d) => d.diff);
  setText('cardKas', signedRp(kas));
  $('cardKas').parentElement.classList.toggle('alert', kas !== 0);

  setText('cardOmsetSeh', rp(sumP((p) => p.omsetSeh)));
  const selO = sumP((p) => p.selOmset);
  setText('cardSelOmset', signedRp(selO));
  $('cardSelOmset').parentElement.classList.toggle('alert', perR.some((p) => !p.ok));

  const selK = sumP((p) => p.selKek);
  setText('cardSelKek', signedRp(selK));
  $('cardSelKek').parentElement.classList.toggle('alert', perR.some((p) => !p.ok));

  const w = latestWealth();
  setText('cardKekayaan', w ? rp(w.total) : 'Belum ada opname');

  renderAlerts(dayR, perR);
  renderPayment(gross, sumD((d) => d.cash), sumD((d) => d.qris));
  renderTrend(dayR, from, to);
  renderRecon(perR);
  renderWithdrawals(wdR);
  renderClosingList(dayR);
}

function renderAlerts(dayR, perR) {
  const items = [];
  dayR.filter((d) => d.diff !== 0).forEach((d) => items.push(`
    <div class="alert-item tap" data-id="${d.c.id}">
      <span class="alert-ic">${ic('alert')}</span>
      <div><strong>${fmtDate(d.c.date)} · ${esc(d.c.kasirName || '-')}</strong>
        <small>${d.diff < 0 ? `Kas laci kurang ${rp(-d.diff)}` : `Kas laci lebih ${rp(d.diff)}`}</small></div>
      <span class="chev">${ic('chev')}</span>
    </div>`));
  perR.filter((p) => !p.ok).forEach((p) => items.push(`
    <div class="alert-item tap" data-op="${p.B.id}">
      <span class="alert-ic">${ic('alert')}</span>
      <div><strong>Opname ${fmtShort(p.A.date)} – ${fmtShort(p.B.date)}</strong>
        <small>Selisih omset ${signedRp(p.selOmset)} · selisih kekayaan ${signedRp(p.selKek)}</small></div>
      <span class="chev">${ic('chev')}</span>
    </div>`));
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
  const sumB = (b, fn) => dayR.filter((d) => b.match(d.c.date)).reduce((s, d) => s + fn(d), 0);
  charts.trend?.destroy();
  charts.trend = new Chart($('chartTrend'), {
    type: 'bar',
    data: {
      labels: buckets.map((b) => b.label),
      datasets: [
        { label: 'Omset tercatat', data: buckets.map((b) => sumB(b, (d) => d.gross)), backgroundColor: GREEN, borderRadius: 4 },
        { label: 'Pengeluaran', data: buckets.map((b) => sumB(b, (d) => d.opexTotal)), backgroundColor: GOLD, borderRadius: 4 }
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
        <small>${fmtDate(w.date)} · ${w.fromDrawer === false ? 'bukan dari laci' : 'dari laci'} · ${esc(w.note || 'Tanpa catatan')}</small>
      </div>
      <button class="rc-del" data-del-w="${w.id}" aria-label="Hapus">${ic('trash')}</button>
    </div>`).join('') : `<p class="muted center pad-y">Belum ada pencatatan pada periode ini</p>`;
}
$('withdrawList').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-del-w]');
  if (!b) return;
  if (!(await ask('Hapus catatan ini? Perhitungan kas akan berubah.', 'Hapus catatan', 'danger', 'Hapus'))) return;
  try { await db.collection(C.withdrawals).doc(b.dataset.delW).delete(); toast('Catatan dihapus'); }
  catch (err) { fail(err.message); }
});

$('btnAddWithdraw').addEventListener('click', () => {
  openSheet(`
    <h3 class="sheet-title">Pengambilan / setoran owner</h3>
    <p class="hint">Dicatat agar selisih kas tidak dianggap kebocoran. Setoran modal dicatat sebagai "Setor".</p>
    <div class="row2">
      <div class="field"><label for="wdType">Jenis</label>
        <select id="wdType"><option value="ambil">Ambil</option><option value="setor">Setor</option></select></div>
      <div class="field"><label for="wdDate">Tanggal</label><input type="date" id="wdDate" value="${todayStr()}"></div>
    </div>
    <div class="field"><label for="wdAmount">Jumlah</label><div class="money"><span>Rp</span><input type="number" id="wdAmount" inputmode="numeric" min="1"></div></div>
    <label class="switch-row sheet-switch"><input type="checkbox" id="wdLaci" checked><span class="switch"></span>Diambil dari uang laci</label>
    <div class="field"><label for="wdNote">Catatan</label><input type="text" id="wdNote" placeholder="mis. setoran ke bank"></div>
    <button class="btn-primary" id="wdSave">${ic('check')}Simpan</button>
  `, () => {
    $('wdSave').onclick = async () => {
      const amount = num($('wdAmount').value);
      if (amount <= 0) return toast('Isi jumlah');
      try {
        await db.collection(C.withdrawals).add({
          type: $('wdType').value, date: $('wdDate').value, amount,
          fromDrawer: $('wdLaci').checked, note: $('wdNote').value.trim(),
          by: profile.name, createdAt: TS()
        });
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
    const st = d.diff === 0 ? `<span class="chip ok">Pas</span>`
      : d.diff < 0 ? `<span class="chip no">Kurang ${rp(-d.diff)}</span>`
      : `<span class="chip warn">Lebih ${rp(d.diff)}</span>`;
    return `<div class="closing-card tap" data-id="${d.c.id}">
      <div>
        <div class="cc-head"><strong>${fmtDate(d.c.date)}</strong>${st}</div>
        <small>${esc(d.c.kasirName || '-')} · Omset ${rp(d.gross)} · Pengeluaran ${rp(d.opexTotal)}</small>
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
    <div class="line"><span>${esc(o.desc || '-')}<small>${o.kind === 'stok' ? 'belanja stok' : 'biaya'} · ${o.fromDrawer ? 'dari laci' : 'bukan dari laci'}</small></span><b>${rp(o.amount)}</b></div>`).join('')
    || `<p class="muted">Tidak ada pengeluaran</p>`;
  const ck = c.checklist || {};
  const chk = [['counted', 'Uang dihitung'], ['photos', 'Nota difoto']]
    .map(([key, label]) => `<span class="chip ${ck[key] ? 'ok' : 'no'}">${label}</span>`).join(' ');
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

    <h4 class="sub-hd">Kas laci</h4>
    <div class="sum-block">
      <div class="line"><span>Saldo awal (uang fisik kemarin)</span><b>${rp(d.startLaci)}</b></div>
      <div class="line"><span>+ Tunai</span><b>${rp(d.cash)}</b></div>
      <div class="line"><span>− Pengeluaran dari laci</span><b>${rp(d.opexDrawer)}</b></div>
      <div class="line"><span>− Ambil owner dari laci</span><b>${rp(d.ambilLaci)}</b></div>
      <div class="line"><span>Seharusnya di laci</span><b>${rp(d.expected)}</b></div>
      <div class="line"><span>Uang fisik</span><b>${rp(c.actualCash)}</b></div>
      <div class="line total"><span>Selisih kas</span><b class="${d.diff === 0 ? 'ok' : d.diff < 0 ? 'no' : 'warn'}">${signedRp(d.diff)}</b></div>
    </div>

    <h4 class="sub-hd">Belanja & biaya</h4>
    <div class="sum-block">
      <div class="line"><span>Belanja stok</span><b>${rp(d.opexStok)}</b></div>
      <div class="line"><span>Biaya operasional</span><b>${rp(d.opexBiaya)}</b></div>
      ${opexHtml}
    </div>

    <h4 class="sub-hd">Checklist</h4>
    <p>${chk}</p>

    ${c.notes ? `<h4 class="sub-hd">Catatan kasir</h4><p class="hint">${esc(c.notes)}</p>` : ''}

    <h4 class="sub-hd">Foto nota</h4>
    <div class="photo-row" id="detailPhotos">${legacy || '<p class="muted">Memuat foto...</p>'}</div>

    <button class="btn-outline" data-edit="${c.id}">${ic('edit')}Edit laporan</button>
    <button class="btn-danger" data-del="${c.id}">${ic('trash')}Hapus laporan</button>
    <button class="btn-ghost" data-close>Tutup</button>
  `, () => {
    db.collection(C.closings).doc(c.id).collection('photos').get().then((snap) => {
      const html = snap.docs.map((p) => `<img class="photo-mini" src="${photoSrc(p.data().data)}" data-url="${photoSrc(p.data().data)}" alt="Nota">`).join('');
      const box = $('detailPhotos');
      if (box) box.innerHTML = (legacy + html) || '<p class="muted">Tidak ada foto</p>';
    }).catch(() => {
      const box = $('detailPhotos');
      if (box) box.innerHTML = legacy || '<p class="muted">Foto tidak bisa dimuat</p>';
    });
  });
}

function openEditClosing(id) {
  const d = days.find((x) => x.c.id === id);
  if (!d) return;
  const c = d.c;
  openSheet(`
    <h3 class="sheet-title">Edit laporan</h3>
    <p class="hint">${fmtDate(c.date)} · ${esc(c.kasirName || '-')}</p>

    <div class="row2">
      <div class="field"><label for="eCash">Tunai</label>
        <div class="money"><span>Rp</span><input type="number" id="eCash" inputmode="numeric" value="${num(c.cashRevenue)}"></div></div>
      <div class="field"><label for="eQris">QRIS</label>
        <div class="money"><span>Rp</span><input type="number" id="eQris" inputmode="numeric" value="${num(c.qrisRevenue)}"></div></div>
    </div>
    <div class="field"><label for="eActual">Uang fisik di laci</label>
      <div class="money"><span>Rp</span><input type="number" id="eActual" inputmode="numeric" value="${num(c.actualCash)}"></div></div>

    <h4 class="sub-hd">Belanja & biaya</h4>
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
    $('eAddOpex').addEventListener('click', () => $('eOpex').insertAdjacentHTML('beforeend', opexEditHtml()));

    $('eSave').onclick = async () => {
      const cashRevenue = num($('eCash').value), qrisRevenue = num($('eQris').value);
      const opex = [...document.querySelectorAll('#eOpex .opex-row')].map((r) => ({
        desc: r.querySelector('.opex-desc').value.trim(),
        amount: num(r.querySelector('.opex-amount').value),
        fromDrawer: r.querySelector('.opex-drawer').checked,
        kind: r.querySelector('.opex-kind').value
      })).filter((o) => o.desc || o.amount);
      const sumIf = (fn) => opex.filter(fn).reduce((s, o) => s + o.amount, 0);
      try {
        await db.collection(C.closings).doc(c.id).update({
          cashRevenue, qrisRevenue, grossRevenue: cashRevenue + qrisRevenue,
          actualCash: num($('eActual').value),
          opex,
          opexTotal: sumIf(() => true),
          opexDrawer: sumIf((o) => o.fromDrawer),
          opexBiaya: sumIf((o) => o.kind !== 'stok'),
          opexStok: sumIf((o) => o.kind === 'stok'),
          notes: $('eNotes').value.trim(),
          editedBy: profile.name,
          editedAt: TS()
        });
        closeSheet();
        toast('Laporan diperbarui');
      } catch (err) { fail(err.message); }
    };
  });
}

async function deleteClosing(id) {
  if (!(await ask('Hapus laporan ini beserta fotonya? Kasir bisa mengirim ulang untuk tanggal tersebut.', 'Hapus laporan', 'danger', 'Hapus'))) return;
  try {
    const ref = db.collection(C.closings).doc(id);
    const photos = await ref.collection('photos').get();
    const batch = db.batch();
    photos.docs.forEach((p) => batch.delete(p.ref));
    batch.delete(ref);
    await batch.commit();
    closeSheet();
    toast('Laporan dihapus');
  } catch (err) { fail(err.message); }
}

// ============================================================
// OPNAME (owner)
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
        <div><span>Bank</span><b>${rp(w.op.bank)}</b></div>
        <div><span>Laci</span><b>${rp(w.laci)}</b></div>
      </div>
    </section>
    <button class="btn-primary" id="btnAddOpname2">${ic('scale')}Lakukan opname sekarang</button>`
    : `<div class="empty">${ic('scale')}<p>Belum ada opname. Lakukan opname pertama untuk mulai menghitung rekonsiliasi.</p>
       <button class="btn-primary" id="btnAddOpname2">${ic('scale')}Opname pertama</button></div>`;
  $('btnAddOpname2').onclick = openOpnameSheet;

  const ops = sortAsc(opnames).reverse();
  $('opnameList').innerHTML = ops.length ? ops.map((o) => {
    const p = periods.find((x) => x.B.id === o.id);
    const st = !p ? `<span class="chip">Opname awal</span>` : p.ok ? `<span class="chip ok">Sesuai</span>` : `<span class="chip no">Cek</span>`;
    return `<div class="closing-card tap" data-op="${o.id}">
      <div>
        <div class="cc-head"><strong>${fmtDate(o.date)}</strong>${st}</div>
        <small>Stok HPP ${rp(o.hppValue)} · Jual ${rp(o.jualValue)} · Bank ${rp(o.bank)}</small>
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
  openSheet(`
    <h3 class="sheet-title">Opname stok</h3>
    <p class="hint">Hitung total nilai stok di toko, bukan per produk. Dua angka cukup: nilai pakai HPP dan nilai pakai harga jual.</p>
    <div class="field"><label for="opDate">Tanggal</label><input type="date" id="opDate" value="${todayStr()}"></div>
    <div class="field"><label for="opHpp">Nilai stok dengan HPP</label>
      <div class="money"><span>Rp</span><input type="number" id="opHpp" inputmode="numeric" min="0"></div></div>
    <div class="field"><label for="opJual">Nilai stok dengan harga jual</label>
      <div class="money"><span>Rp</span><input type="number" id="opJual" inputmode="numeric" min="0"></div></div>
    <div class="field"><label for="opBank">Saldo bank / tabungan toko</label>
      <div class="money"><span>Rp</span><input type="number" id="opBank" inputmode="numeric" min="0"></div></div>
    <p class="hint" id="opPreview"></p>
    <div class="field"><label for="opNote">Catatan</label><input type="text" id="opNote" placeholder="mis. opname mingguan"></div>
    <button class="btn-primary" id="opSave">${ic('check')}Simpan opname</button>
  `, () => {
    const preview = () => {
      const h = num($('opHpp').value), j = num($('opJual').value);
      $('opPreview').textContent = h && j
        ? `Rasio harga jual / HPP ${(j / h).toFixed(2)}× · margin rata-rata ${Math.round((1 - h / j) * 100)}%`
        : '';
    };
    ['opHpp', 'opJual'].forEach((x) => $(x).addEventListener('input', preview));
    $('opSave').onclick = async () => {
      const hpp = num($('opHpp').value), jual = num($('opJual').value);
      if (!hpp || !jual) return toast('Isi nilai stok dengan HPP dan harga jual');
      if (jual < hpp) return fail('Nilai dengan harga jual tidak boleh lebih kecil dari nilai HPP.', 'Periksa angka');
      try {
        await db.collection(C.opname).add({
          date: $('opDate').value, hppValue: hpp, jualValue: jual,
          bank: num($('opBank').value), note: $('opNote').value.trim(),
          by: profile.name, createdAt: TS()
        });
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
  const body = p ? `
    <h4 class="sub-hd">Periode ${fmtShort(p.A.date)} – ${fmtShort(p.B.date)} (${p.nDays} laporan)</h4>
    <div class="sum-block">
      <div class="line"><span>Omset tercatat</span><b>${rp(p.gross)}</b></div>
      <div class="line"><span>HPP barang terjual (stok awal + belanja − stok akhir)</span><b>${rp(p.hppSold)}</b></div>
      <div class="line"><span>Rasio harga jual / HPP</span><b>${p.ratio.toFixed(2)}×</b></div>
      <div class="line total"><span>Omset seharusnya dari stok</span><b>${rp(p.omsetSeh)}</b></div>
      <div class="line total"><span>Selisih omset</span><b class="${p.selOmset < 0 ? 'no' : 'ok'}">${signedRp(p.selOmset)}</b></div>
    </div>
    <h4 class="sub-hd">Cek kekayaan</h4>
    <div class="sum-block">
      <div class="line"><span>Biaya operasional</span><b>${rp(p.biaya)}</b></div>
      <div class="line"><span>Laba bersih periode</span><b>${rp(p.laba)}</b></div>
      <div class="line"><span>Ambil owner (bersih)</span><b>${rp(p.ambil)}</b></div>
      <div class="line total"><span>Selisih kekayaan</span><b class="${p.selKek < 0 ? 'no' : 'ok'}">${signedRp(p.selKek)}</b></div>
    </div>
    <p class="hint">${p.ok ? 'Selisih berada dalam batas wajar.' : 'Selisih di atas batas wajar. Periksa laporan harian dan belanja pada periode ini.'}</p>`
    : `<p class="hint">Opname awal. Perhitungan periode dimulai pada opname berikutnya.</p>`;

  openSheet(`
    <h3 class="sheet-title">Opname ${fmtDate(o.date)}</h3>
    <p class="hint">Dicatat oleh ${esc(o.by || '-')}${o.note ? ` · ${esc(o.note)}` : ''}</p>
    <div class="sum-block">
      <div class="line"><span>Nilai stok dengan HPP</span><b>${rp(o.hppValue)}</b></div>
      <div class="line"><span>Nilai stok dengan harga jual</span><b>${rp(o.jualValue)}</b></div>
      <div class="line"><span>Saldo bank / tabungan</span><b>${rp(o.bank)}</b></div>
    </div>
    ${body}
    <button class="btn-danger" data-del-op="${o.id}">${ic('trash')}Hapus opname</button>
    <button class="btn-ghost" data-close>Tutup</button>
  `);
}

async function deleteOpname(id) {
  if (!(await ask('Hapus opname ini? Rekonsiliasi periode terkait akan berubah.', 'Hapus opname', 'danger', 'Hapus'))) return;
  try { await db.collection(C.opname).doc(id).delete(); closeSheet(); toast('Opname dihapus'); }
  catch (err) { fail(err.message); }
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
    exportXlsx: exportWorkbook,
    backup: backupAll,
    about: openAbout,
    logout: async () => { if (await ask('Keluar dari aplikasi?', 'Keluar', 'info', 'Keluar')) auth.signOut(); }
  };
  try { await actions[b.dataset.act](); }
  catch (err) { fail(err.message); }
});

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
  } catch (err) {
    fail(err.message);
  } finally {
    btn.disabled = false; btn.innerHTML = `${ic('check')}Simpan perubahan`;
  }
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
  try { await db.collection(C.users).doc(e.target.dataset.uid).update({ role: e.target.value }); toast('Role diperbarui'); }
  catch (err) { fail(err.message); }
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
        success(`Akun @${username} sudah dibuat.`, 'Berhasil');
        openUsersSheet();
      } catch (err) {
        fail(err.code === 'auth/email-already-in-use' ? 'Username sudah dipakai.' : err.message, 'Gagal membuat akun');
      } finally {
        btn.disabled = false;
      }
    };
  });
}

// ---- Simpan file (browser: unduh, Android: bagikan) ----
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
    'Saldo Awal Laci': d.startLaci, 'Tunai': d.cash, 'QRIS': d.qris, 'Omset': d.gross,
    'Belanja Stok': d.opexStok, 'Biaya Operasional': d.opexBiaya, 'Ambil Owner dari Laci': d.ambilLaci,
    'Seharusnya di Laci': d.expected, 'Uang Fisik': d.actual, 'Selisih Kas': d.diff,
    'Catatan': d.c.notes || ''
  }));
  const rekon = perR.map((p) => ({
    'Periode': `${p.A.date} s/d ${p.B.date}`, 'Omset Tercatat': p.gross, 'HPP Terjual': p.hppSold,
    'Rasio Jual/HPP': Number(p.ratio.toFixed(2)), 'Omset Seharusnya': Math.round(p.omsetSeh),
    'Selisih Omset': Math.round(p.selOmset), 'Biaya Operasional': p.biaya, 'Laba Periode': Math.round(p.laba),
    'Ambil Owner': p.ambil, 'Selisih Kekayaan': Math.round(p.selKek), 'Status': p.ok ? 'Sesuai' : 'Cek'
  }));
  const ops = opnames.filter((o) => o.date >= from && o.date <= to).map((o) => ({
    'Tanggal': o.date, 'Nilai Stok HPP': o.hppValue, 'Nilai Stok Jual': o.jualValue,
    'Saldo Bank': o.bank, 'Catatan': o.note || '', 'Dicatat oleh': o.by || ''
  }));
  const wd = inRange(withdrawals, from, to).map((w) => ({
    'Tanggal': w.date, 'Jenis': w.type === 'setor' ? 'Setor' : 'Ambil', 'Jumlah': num(w.amount),
    'Dari Laci': w.fromDrawer === false ? 'Tidak' : 'Ya', 'Catatan': w.note || '', 'Dicatat oleh': w.by || ''
  }));

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheet(laporan), 'Laporan Harian');
  XLSX.utils.book_append_sheet(wb, sheet(rekon), 'Rekonsiliasi');
  XLSX.utils.book_append_sheet(wb, sheet(ops), 'Opname');
  XLSX.utils.book_append_sheet(wb, sheet(wd), 'Pengambilan Owner');
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
    closings: allClosings, withdrawals, opname: opnames, users: allUsers
  });
  const json = JSON.stringify(payload, null, 2);
  const b64 = btoa(unescape(encodeURIComponent(json)));
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
    <div class="sum-block">
      <div class="line"><span>Database</span><b>Firestore</b></div>
      <div class="line"><span>Foto nota</span><b>Firestore (terkompres)</b></div>
    </div>
    <h4 class="sub-hd">Cara kerja</h4>
    <p class="hint">Kasir mengisi tunai, QRIS, uang fisik, dan belanja setiap hari. Owner melakukan opname stok sekitar seminggu sekali dengan tiga angka. Aplikasi lalu menghitung apakah omset dan kekayaan toko sesuai.</p>
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
