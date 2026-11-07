/**
 * Kantin Barokah – Upload foto nota ke Google Drive
 *
 * Deploy: Deploy → Manage deployments → Edit → Version: New version → Deploy
 *   Execute as : Me
 *   Who has access : Anyone
 *
 * Hanya pengguna yang login di aplikasi Kantin (token Firebase valid dan
 * terdaftar di koleksi "users") yang boleh mengunggah.
 */

const FIREBASE_API_KEY = 'AIzaSyBn7vcKmacOkQGAO8W2WzIyJ331XqJccAg';
const FIREBASE_PROJECT_ID = 'kantin-barokah-7870a';
const DRIVE_FOLDER_NAME = 'Kantin Barokah - Bukti Nota';
const MAX_BASE64_LENGTH = 6 * 1024 * 1024; // ±4,5 MB foto

// Cek cepat bahwa URL aktif
function doGet() {
  return jsonOut_({ ok: true, version: 2, service: 'Kantin Barokah Drive Upload' });
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!body.idToken) throw new Error('Token tidak ada');
    if (!body.data) throw new Error('Data foto kosong');
    if (body.data.length > MAX_BASE64_LENGTH) throw new Error('Ukuran foto terlalu besar');

    verifyKantinUser_(body.idToken);

    const bytes = Utilities.base64Decode(body.data);
    const name = String(body.fileName || 'nota.jpg').replace(/[^A-Za-z0-9._-]/g, '_');
    const blob = Utilities.newBlob(bytes, 'image/jpeg', name);

    const folder = getOrCreateFolder_(DRIVE_FOLDER_NAME);
    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return jsonOut_({
      ok: true,
      fileId: file.getId(),
      url: 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1200'
    });
  } catch (err) {
    return jsonOut_({ ok: false, error: err.message });
  }
}

/** Memastikan token valid dan user terdaftar. Mengembalikan UID. */
function verifyKantinUser_(idToken) {
  // 1. Validasi token ke Firebase Auth
  const lookup = UrlFetchApp.fetch(
    'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' + FIREBASE_API_KEY,
    {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ idToken: idToken }),
      muteHttpExceptions: true
    }
  );
  if (lookup.getResponseCode() !== 200) {
    throw new Error('Sesi login tidak valid, silakan login ulang');
  }
  const uid = JSON.parse(lookup.getContentText()).users[0].localId;

  // 2. Pastikan akun terdaftar di Firestore (dibaca dengan token user itu sendiri)
  const docUrl = 'https://firestore.googleapis.com/v1/projects/' + FIREBASE_PROJECT_ID +
                 '/databases/(default)/documents/users/' + uid;
  const doc = UrlFetchApp.fetch(docUrl, {
    headers: { Authorization: 'Bearer ' + idToken },
    muteHttpExceptions: true
  });
  if (doc.getResponseCode() !== 200) {
    throw new Error('Akun tidak terdaftar di sistem Kantin');
  }
  return uid;
}

function getOrCreateFolder_(name) {
  const it = DriveApp.getFoldersByName(name);
  return it.hasNext() ? it.next() : DriveApp.createFolder(name);
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Jalankan SEKALI dari editor (pilih fungsi ini → Run) untuk memberi izin Drive & akses internet. */
function authorizeScopes() {
  DriveApp.getRootFolder();
  UrlFetchApp.fetch('https://www.google.com');
  Logger.log('Izin sudah diberikan.');
}
