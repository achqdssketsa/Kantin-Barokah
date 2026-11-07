// ============================================================
// KONFIGURASI FIREBASE
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

const COL_CLOSINGS = 'daily_closings';
const COL_USERS = 'users';
const IMAGE_MAX_SIDE = 1024;   // px
const IMAGE_QUALITY = 0.7;     // 0..1
const DRIVE_UPLOAD_URL = 'https://script.google.com/macros/s/AKfycbyunLWcCJpVO1sgJmWoY3tiHvkIEf8SbUUN1Uby3PGmtN4R0MGmjHlOaQ-1bLjRD4Y/exec';

// ============================================================
// HELPER
// ============================================================
const $ = (id) => document.getElementById(id);
const num = (v) => Number(v) || 0;
const rp = (n) => 'Rp ' + Math.round(num(n)).toLocaleString('id-ID');
const toISODate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const todayStr = () => toISODate(new Date());
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const fmtSize = (b) => b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.round(b / 1024) + ' KB';
// Terima username (akan ditambah @kantin.app) atau email lengkap (dipakai apa adanya)
const usernameToEmail = (u) => {
  const v = u.trim().toLowerCase();
  return v.includes('@') ? v : `${v}@kantin.app`;
};
const lastDates = (end, n) => {
  const base = new Date(end + 'T00:00:00');
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() - (n - 1 - i));
    return toISODate(d);
  });
};
const isNative = () => !!(window.Capacitor && Capacitor.isNativePlatform && Capacitor.isNativePlatform());

// ============================================================
// STATE
// ============================================================
let profile = null;          // { uid, username, name, role }
let allClosings = [];
let allUsers = [];
let pendingImages = [];      // Blob hasil kompresi
let unsubClosings = null;
let unsubUsers = null;
let secondaryAuth = null;
const charts = {};

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
  btn.disabled = true;
  btn.textContent = 'Memproses...';
  try {
    await auth.signInWithEmailAndPassword(
      usernameToEmail($('loginUsername').value),
      $('loginPassword').value
    );
  } catch (err) {
    $('loginError').textContent = AUTH_ERRORS[err.code] || 'Gagal login: ' + err.message;
  } finally {
    btn.disabled = false;
    btn.textContent = 'Login';
  }
});

$('togglePw').addEventListener('click', () => {
  const pw = $('loginPassword');
  pw.type = pw.type === 'password' ? 'text' : 'password';
});

$('btnForgot').addEventListener('click', () => {
  alert('Lupa password? Silakan hubungi Owner untuk mereset password akun Anda.');
});

$('btnLogout').addEventListener('click', () => {
  if (confirm('Keluar dari aplikasi?')) auth.signOut();
});

auth.onAuthStateChanged(async (user) => {
  if (!user) return showLogin();
  try {
    const snap = await db.collection(COL_USERS).doc(user.uid).get();
    if (!snap.exists) {
      alert('Akun ini belum terdaftar di sistem. Hubungi Owner.');
      return auth.signOut();
    }
    const d = snap.data();
    profile = { uid: user.uid, username: d.username, name: d.name || d.username, role: d.role };
    showApp();
  } catch (err) {
    alert('Gagal memuat profil: ' + err.message);
    auth.signOut();
  }
});

function showLogin() {
  profile = null;
  stopOwnerListeners();
  $('viewApp').classList.add('hidden');
  $('viewLogin').classList.remove('hidden');
  $('formLogin').reset();
}

function showApp() {
  $('viewLogin').classList.add('hidden');
  $('viewApp').classList.remove('hidden');
  const isOwner = profile.role === 'owner';
  document.body.classList.toggle('is-owner', isOwner);
  $('greetName').textContent = profile.name;
  if (isOwner) startOwnerListeners();
  showTab(isOwner ? 'dashboard' : 'kasir');
}

function showTab(name) {
  if (name !== 'kasir' && profile?.role !== 'owner') name = 'kasir';
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.id === `tab-${name}`));
  document.querySelectorAll('.nav-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === name));
  $('pageTitle').textContent = { dashboard: 'Dashboard', kasir: 'Tutup Kasir', users: 'Pengguna' }[name];
  window.scrollTo(0, 0);
}
document.querySelectorAll('.nav-btn').forEach((b) =>
  b.addEventListener('click', () => showTab(b.dataset.tab)));

// ============================================================
// LISTENER DATA (KHUSUS OWNER)
// ============================================================
function startOwnerListeners() {
  stopOwnerListeners();
  unsubClosings = db.collection(COL_CLOSINGS).orderBy('date', 'desc').limit(500)
    .onSnapshot((snap) => {
      allClosings = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      renderDashboard();
    }, (err) => alert('Gagal memuat laporan: ' + err.message));

  unsubUsers = db.collection(COL_USERS).orderBy('username')
    .onSnapshot((snap) => {
      allUsers = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
      renderUsers();
    }, (err) => console.error(err));
}

function stopOwnerListeners() {
  if (unsubClosings) unsubClosings();
  if (unsubUsers) unsubUsers();
  unsubClosings = null;
  unsubUsers = null;
  allClosings = [];
  allUsers = [];
}

// ============================================================
// FORM TUTUP KASIR
// ============================================================
const CHECKLIST_IDS = { counted: 'chkCounted', photos: 'chkPhotos', stock: 'chkStock' };

function readForm() {
  const opexItems = [];
  document.querySelectorAll('.opex-row').forEach((row) => {
    const desc = row.querySelector('.opex-desc').value.trim();
    const amount = num(row.querySelector('.opex-amount').value);
    if (desc || amount) opexItems.push({ desc, amount });
  });

  const startingCash = num($('startingCash').value);
  const cashRevenue = num($('cashRevenue').value);
  const qrisRevenue = num($('qrisRevenue').value);
  const priveAmount = num($('priveAmount').value);
  const totalOpex = opexItems.reduce((s, i) => s + i.amount, 0);
  const expectedCash = startingCash + cashRevenue - totalOpex - priveAmount;

  const checklist = {};
  for (const [key, id] of Object.entries(CHECKLIST_IDS)) checklist[key] = $(id).checked;

  return {
    date: $('closingDate').value,
    startingCash,
    cashRevenue,
    qrisRevenue,
    transactionCount: num($('transactionCount').value),
    priveAmount,
    totalOpex,
    opexItems,
    expectedCash,
    actualRaw: $('actualCash').value,
    actualCash: num($('actualCash').value),
    checklist,
    notes: $('notes').value.trim()
  };
}

function updateCalc() {
  const f = readForm();
  $('txtExpectedCash').textContent = rp(f.expectedCash);

  const box = $('statusKasBox');
  const txt = $('txtStatusKas');
  box.className = 'status-box';

  if (!f.actualRaw) {
    txt.textContent = '-';
    return;
  }
  const diff = f.actualCash - f.expectedCash;
  if (diff === 0) {
    txt.textContent = 'PAS (uang di laci sesuai)';
    box.classList.add('st-ok');
  } else if (diff < 0) {
    txt.textContent = `KURANG ${rp(-diff)}`;
    box.classList.add('st-minus');
  } else {
    txt.textContent = `LEBIH ${rp(diff)}`;
    box.classList.add('st-plus');
  }
}

$('formClosing').addEventListener('input', updateCalc);
$('formClosing').addEventListener('change', updateCalc);

$('btnAddOpex').addEventListener('click', () => {
  const row = document.createElement('div');
  row.className = 'opex-row';
  row.innerHTML = `
    <input type="text" class="opex-desc" placeholder="Nama barang (mis. Gas 3kg)">
    <input type="number" class="opex-amount" placeholder="Rp" min="0" inputmode="numeric">
    <button type="button" class="btn-remove" aria-label="Hapus">✕</button>`;
  row.querySelector('.btn-remove').addEventListener('click', () => {
    row.remove();
    updateCalc();
  });
  $('opexList').appendChild(row);
});

// ============================================================
// KOMPRESI FOTO (compressorjs)
// ============================================================
function compressImage(file) {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: IMAGE_QUALITY,
      maxWidth: IMAGE_MAX_SIDE,
      maxHeight: IMAGE_MAX_SIDE,
      mimeType: 'image/jpeg',
      success: resolve,
      error: reject
    });
  });
}

$('proofImages').addEventListener('change', async (e) => {
  const files = Array.from(e.target.files);
  const grid = $('imagePreviewContainer');
  grid.innerHTML = '';
  pendingImages = [];

  for (let i = 0; i < files.length; i++) {
    $('imageInfo').textContent = `Mengompres foto ${i + 1}/${files.length}...`;
    try {
      const blob = await compressImage(files[i]);
      pendingImages.push(blob);

      const item = document.createElement('div');
      item.className = 'preview-item';
      item.innerHTML = `
        <img src="${URL.createObjectURL(blob)}" alt="Foto ${i + 1}">
        <small>${fmtSize(files[i].size)} → ${fmtSize(blob.size)}</small>`;
      grid.appendChild(item);
    } catch (err) {
      console.error('Kompres gagal:', err);
    }
  }
  $('imageInfo').textContent = pendingImages.length
    ? `${pendingImages.length} foto siap diunggah.` : '';
});

// ============================================================
// UPLOAD FOTO KE GOOGLE DRIVE (via Google Apps Script)
// ============================================================
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
  const res = await fetch(DRIVE_UPLOAD_URL, {
    method: 'POST',
    // text/plain agar tidak memicu preflight CORS (Apps Script tidak mendukungnya)
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ idToken, fileName, mimeType: 'image/jpeg', data })
  });
  if (!res.ok) throw new Error(`Server Drive error (${res.status})`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || 'Upload ke Drive gagal');
  return json; // { fileId, url }
}

// ============================================================
// SIMPAN LAPORAN
// ============================================================
function setSubmitting(on, text = 'Simpan & Kirim Laporan') {
  const b = $('btnSubmit');
  b.disabled = on;
  b.textContent = text;
}

function resetClosingForm() {
  $('formClosing').reset();
  $('closingDate').value = todayStr();
  $('opexList').innerHTML = '';
  $('imagePreviewContainer').innerHTML = '';
  $('imageInfo').textContent = '';
  pendingImages = [];
  updateCalc();
}

$('formClosing').addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = readForm();

  if (!f.actualRaw) return alert('Isi hitungan fisik uang di laci.');
  if (!Object.values(f.checklist).every(Boolean)) return alert('Lengkapi semua checklist akhir hari.');
  if (!pendingImages.length && !confirm('Belum ada foto nota. Tetap kirim laporan?')) return;

  setSubmitting(true, 'Menyimpan...');
  try {
    const proofImages = [];
    const proofFileIds = [];
    for (let i = 0; i < pendingImages.length; i++) {
      setSubmitting(true, `Mengunggah foto ${i + 1}/${pendingImages.length}...`);
      const res = await uploadToDrive(pendingImages[i], `${profile.uid}_${f.date}_${Date.now()}_${i}.jpg`);
      proofImages.push(res.url);
      proofFileIds.push(res.fileId);
    }

    setSubmitting(true, 'Menyimpan laporan...');
    const grossRevenue = f.cashRevenue + f.qrisRevenue;

    await db.collection(COL_CLOSINGS).add({
      date: f.date,
      kasirName: profile.name,
      submittedBy: profile.uid,
      startingCash: f.startingCash,
      cashRevenue: f.cashRevenue,
      qrisRevenue: f.qrisRevenue,
      transactionCount: f.transactionCount,
      grossRevenue,
      totalOpex: f.totalOpex,
      opexDetails: f.opexItems,
      priveAmount: f.priveAmount,
      expectedCash: f.expectedCash,
      actualCash: f.actualCash,
      discrepancy: f.actualCash - f.expectedCash,
      netProfit: grossRevenue - f.totalOpex,
      checklist: f.checklist,
      notes: f.notes,
      proofImages,
      proofFileIds,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    alert('Berhasil! Laporan tutup kasir sudah dikirim.');
    resetClosingForm();
  } catch (err) {
    console.error(err);
    alert('Gagal menyimpan: ' + err.message);
  } finally {
    setSubmitting(false);
  }
});

// ============================================================
// DASHBOARD OWNER
// ============================================================
function renderDashboard() {
  const date = $('dashDate').value || todayStr();
  const day = allClosings.filter((c) => c.date === date);
  const sum = (key, list = day) => list.reduce((s, c) => s + num(c[key]), 0);

  const gross = sum('grossRevenue');
  const cash = sum('cashRevenue');
  const qris = sum('qrisRevenue');

  $('sumTotal').textContent = rp(gross);
  $('sumCash').textContent = rp(cash);
  $('sumQris').textContent = rp(qris);

  $('cardTodaySales').textContent = rp(gross);
  $('cardTransactions').textContent = sum('transactionCount').toLocaleString('id-ID');
  $('cardOpening').textContent = rp(sum('startingCash'));
  $('cardClosingCash').textContent = rp(sum('actualCash'));
  $('cardDiscrepancy').textContent = rp(sum('discrepancy'));
  $('cardExpenditure').textContent = rp(sum('totalOpex'));
  $('cardPrive').textContent = rp(sum('priveAmount'));
  $('cardNet').textContent = rp(sum('netProfit'));

  renderPaymentTable(gross, cash, qris);
  renderChecklistTable(day);
  renderCharts(date);
  renderHistory();
}

function renderPaymentTable(gross, cash, qris) {
  const pct = (v) => gross ? ((v / gross) * 100).toFixed(1) + '%' : '0%';
  $('payTable').innerHTML = `
    <tr><td>Tunai (Cash)</td><td class="r">${rp(cash)}</td><td class="r">${pct(cash)}</td></tr>
    <tr><td>QRIS / Transfer</td><td class="r">${rp(qris)}</td><td class="r">${pct(qris)}</td></tr>
    <tr class="total"><td>Total</td><td class="r">${rp(gross)}</td><td class="r">${gross ? '100%' : '0%'}</td></tr>`;
}

function renderChecklistTable(day) {
  const body = $('checklistTable');
  if (!day.length) {
    body.innerHTML = `<tr><td colspan="4" class="center muted">Belum ada laporan pada tanggal ini</td></tr>`;
    return;
  }
  const badge = (ok) => ok ? '<span class="ok">✔</span>' : '<span class="no">✖</span>';
  body.innerHTML = day.map((c) => {
    const ck = c.checklist || {};
    return `<tr>
      <td>${esc(c.kasirName || '-')}</td>
      <td class="c">${badge(ck.counted)}</td>
      <td class="c">${badge(ck.photos)}</td>
      <td class="c">${badge(ck.stock)}</td>
    </tr>`;
  }).join('');
}

function renderCharts(endDate) {
  if (typeof Chart === 'undefined') return;
  const GREEN = '#1d4d2c', GOLD = '#c9963e';
  const labels = lastDates(endDate, 7);
  const sumOn = (date, key) => allClosings
    .filter((c) => c.date === date)
    .reduce((s, c) => s + num(c[key]), 0);

  const cashSeries = labels.map((d) => sumOn(d, 'cashRevenue'));
  const qrisSeries = labels.map((d) => sumOn(d, 'qrisRevenue'));
  const dayLabels = labels.map((d) =>
    new Date(d + 'T00:00:00').toLocaleDateString('id-ID', { weekday: 'short' }));

  charts.trend?.destroy();
  charts.trend = new Chart($('chartTrend'), {
    type: 'bar',
    data: {
      labels: dayLabels,
      datasets: [
        { label: 'Tunai', data: cashSeries, backgroundColor: GREEN, borderRadius: 4 },
        { label: 'QRIS', data: qrisSeries, backgroundColor: GOLD, borderRadius: 4 }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom' } },
      scales: { y: { beginAtZero: true, ticks: { callback: (v) => Number(v).toLocaleString('id-ID') } } }
    }
  });

  const totalCash = cashSeries.reduce((a, b) => a + b, 0);
  const totalQris = qrisSeries.reduce((a, b) => a + b, 0);
  charts.dist?.destroy();
  charts.dist = new Chart($('chartDist'), {
    type: 'doughnut',
    data: {
      labels: ['Tunai', 'QRIS / Transfer'],
      datasets: [{ data: [totalCash, totalQris], backgroundColor: [GREEN, GOLD], borderWidth: 0 }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'right' } }
    }
  });
}

function renderHistory() {
  const tbody = $('closingTableBody');
  if (!allClosings.length) {
    tbody.innerHTML = `<tr><td colspan="10" class="center muted">Belum ada data</td></tr>`;
    return;
  }
  tbody.innerHTML = allClosings.map((c) => {
    const d = num(c.discrepancy);
    const status = d === 0 ? '<span class="ok">PAS</span>'
      : d < 0 ? `<span class="no">Kurang ${rp(-d)}</span>`
      : `<span class="warn">Lebih ${rp(d)}</span>`;
    const imgs = (c.proofImages || [])
      .map((u) => `<img src="${esc(u)}" class="thumb" data-url="${esc(u)}" alt="Nota">`).join('') || '-';
    return `<tr>
      <td><strong>${esc(c.date)}</strong></td>
      <td>${esc(c.kasirName || '-')}</td>
      <td class="r">${rp(c.cashRevenue)}</td>
      <td class="r">${rp(c.qrisRevenue)}</td>
      <td class="r"><strong>${rp(c.grossRevenue)}</strong></td>
      <td class="r">${rp(c.totalOpex)}</td>
      <td class="r ok">${rp(c.netProfit)}</td>
      <td>${status}</td>
      <td>${imgs}</td>
      <td>${esc(c.notes || '-')}</td>
    </tr>`;
  }).join('');
}

$('dashDate').addEventListener('change', renderDashboard);
$('closingTableBody').addEventListener('click', (e) => {
  if (e.target.classList.contains('thumb')) openModal(e.target.dataset.url);
});

// ============================================================
// MODAL FOTO
// ============================================================
function openModal(url) {
  $('imgFull').src = url;
  $('imageModal').classList.add('show');
}
function closeModal() {
  $('imageModal').classList.remove('show');
}
$('imageModal').addEventListener('click', closeModal);

// ============================================================
// EXPORT EXCEL (browser: download, Android: share)
// ============================================================
async function saveWorkbook(wb, filename) {
  if (isNative()) {
    const P = Capacitor.Plugins;
    const b64 = XLSX.write(wb, { bookType: 'xlsx', type: 'base64' });
    const { uri } = await P.Filesystem.writeFile({
      path: filename, data: b64, directory: 'CACHE', recursive: true
    });
    await P.Share.share({ title: filename, files: [uri], dialogTitle: 'Simpan / Bagikan Laporan' });
  } else {
    XLSX.writeFile(wb, filename);
  }
}

$('btnExport').addEventListener('click', async () => {
  if (!allClosings.length) return alert('Belum ada data laporan untuk di-export!');
  const rows = allClosings.map((c) => ({
    'Tanggal': c.date,
    'Kasir': c.kasirName,
    'Modal Kas Awal': c.startingCash,
    'Uang Tunai (Cash)': c.cashRevenue,
    'Uang QRIS/Transfer': c.qrisRevenue,
    'Jumlah Transaksi': c.transactionCount,
    'Total Masuk': c.grossRevenue,
    'Total Pengeluaran Toko': c.totalOpex,
    'Ambil Uang Owner': c.priveAmount,
    'Keuntungan Bersih': c.netProfit,
    'Seharusnya di Laci': c.expectedCash,
    'Uang Fisik di Laci': c.actualCash,
    'Selisih Kas': c.discrepancy,
    'Catatan': c.notes
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Laporan Tutup Kasir');
  try {
    await saveWorkbook(wb, `Laporan_Kantin_${todayStr()}.xlsx`);
  } catch (err) {
    alert('Gagal export: ' + err.message);
  }
});

// ============================================================
// MANAJEMEN PENGGUNA (KHUSUS OWNER)
// ============================================================
function renderUsers() {
  $('userList').innerHTML = allUsers.map((u) => {
    const self = u.uid === profile.uid;
    return `<div class="user-row">
      <div class="user-info"><strong>${esc(u.name)}</strong><small>@${esc(u.username)}</small></div>
      <select class="role-select" data-uid="${esc(u.uid)}" ${self ? 'disabled' : ''}>
        <option value="kasir" ${u.role === 'kasir' ? 'selected' : ''}>Kasir</option>
        <option value="owner" ${u.role === 'owner' ? 'selected' : ''}>Owner</option>
      </select>
    </div>`;
  }).join('') || '<p class="muted">Belum ada pengguna.</p>';
}

$('userList').addEventListener('change', async (e) => {
  if (!e.target.classList.contains('role-select')) return;
  try {
    await db.collection(COL_USERS).doc(e.target.dataset.uid).update({ role: e.target.value });
  } catch (err) {
    alert('Gagal mengubah role: ' + err.message);
  }
});

// Auth kedua agar akun owner tidak ikut logout saat membuat akun baru
function getSecondaryAuth() {
  if (!secondaryAuth) {
    const app = firebase.apps.find((a) => a.name === 'secondary')
      || firebase.initializeApp(firebaseConfig, 'secondary');
    secondaryAuth = app.auth();
  }
  return secondaryAuth;
}

$('formAddUser').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = $('newUsername').value.trim().toLowerCase();
  const name = $('newName').value.trim();
  const password = $('newPassword').value;
  const role = $('newRole').value;

  if (!/^[a-z0-9._]{3,20}$/.test(username)) {
    return alert('Username 3-20 karakter: huruf kecil, angka, titik, atau underscore.');
  }
  if (password.length < 6) return alert('Password minimal 6 karakter.');

  const btn = $('btnAddUser');
  btn.disabled = true;
  btn.textContent = 'Membuat akun...';
  try {
    const sAuth = getSecondaryAuth();
    const cred = await sAuth.createUserWithEmailAndPassword(usernameToEmail(username), password);
    await db.collection(COL_USERS).doc(cred.user.uid).set({
      username, name, role,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    await sAuth.signOut();
    alert(`Akun @${username} berhasil dibuat.`);
    $('formAddUser').reset();
  } catch (err) {
    const msg = err.code === 'auth/email-already-in-use' ? 'Username sudah dipakai.' : err.message;
    alert('Gagal membuat akun: ' + msg);
  } finally {
    btn.disabled = false;
    btn.textContent = 'Buat Akun';
  }
});

// ============================================================
// INIT
// ============================================================
$('closingDate').value = todayStr();
$('dashDate').value = todayStr();
updateCalc();
