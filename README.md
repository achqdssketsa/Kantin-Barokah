# Kantin Barokah – Aplikasi Tutup Kasir (Android APK)

Arsitektur:
- **Firestore** → data laporan, akun, dan role pengguna
- **Firebase Auth** → login username & password
- **Google Drive** → penyimpanan foto nota, lewat **Google Apps Script** (URL `/exec` Anda)

## Struktur Proyek
```
kantin-app/
├── www/                    ← tampilan & logika aplikasi
│   ├── index.html
│   ├── style.css
│   └── app.js
├── apps-script/
│   └── Code.gs             ← kode untuk Google Apps Script (upload ke Drive)
├── capacitor.config.json
├── package.json
├── firebase.json
└── firestore.rules
```

## 1. Keamanan — WAJIB
File `kantin-barokah-7870a-firebase-adminsdk-...json` berisi **kunci admin** dan sudah pernah dibagikan.
- Jangan pernah memasukkannya ke aplikasi, APK, atau Apps Script.
- **Cabut key tersebut**: Google Cloud Console → IAM & Admin → Service Accounts → `firebase-adminsdk-fbsvc@...` → Keys → hapus key yang cocok dengan file itu. Lalu hapus file dari komputer.

## 2. Setup Firebase (sekali saja)
1. **Authentication** → Sign-in method → aktifkan **Email/Password**.
2. **Firestore Database** → Create database.
3. Deploy aturan Firestore:
   ```
   npm i -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules
   ```

Storage Firebase **tidak lagi dipakai**; tidak perlu diaktifkan.

## 3. Pasang Google Apps Script
1. Buka project Apps Script yang sudah Anda deploy (`script.google.com`).
2. Hapus isi file `Code.gs` yang lama, lalu tempel isi `apps-script/Code.gs` dari proyek ini. Simpan.
3. Pilih fungsi **`authorizeScopes`** di dropdown atas → klik **Run**. Setujui izin (Drive dan akses internet). Ini hanya sekali.
4. **Deploy → Manage deployments → ikon pensil → Version: New version → Deploy.**
   URL `/exec` tetap sama, jadi `DRIVE_UPLOAD_URL` di `app.js` tidak perlu diubah.
5. Pastikan **Execute as: Me** dan **Who has access: Anyone**.
6. Tes: buka URL `/exec` di browser. Harus muncul `{"ok":true,...}`.

Apps Script memeriksa token login setiap upload, jadi hanya akun Kantin yang bisa mengunggah meski URL-nya bersifat publik.

Foto disimpan di folder Drive **"Kantin Barokah - Bukti Nota"** dan bisa dilihat siapa pun yang memiliki link-nya (diperlukan agar foto tampil di dashboard).

## 4. Membuat Akun Owner Pertama
1. Firebase Console → Authentication → Users → **Add user**: email `qoddas@kantin.app`, password pilihan Anda. Salin **User UID**.
2. Firestore → koleksi `users` → **Add document**, Document ID = User UID, field:
   | Field | Type | Value |
   |---|---|---|
   | username | string | qoddas |
   | name | string | Qoddas |
   | role | string | owner |

Akun lain dibuat dari menu **Pengguna** di dalam aplikasi. Username login adalah bagian sebelum `@kantin.app`.

## 5. Build APK
Prasyarat: **Node.js LTS** dan **Android Studio**.
```
cd kantin-app
npm install
npx cap add android     # sekali saja
npm run sync            # setiap kali www/ berubah
npm run open            # buka di Android Studio
```
Di Android Studio: **Build → Build APK(s)**.
Hasil debug: `android/app/build/outputs/apk/debug/app-debug.apk`.

## 6. Catatan Teknis
- Foto dikompres di HP (compressorjs, maks 1024 px, JPEG 70%) sebelum diunggah.
- Upload memakai `Content-Type: text/plain` agar tidak diblokir CORS. Ini alasan kode di `app.js` sudah diatur demikian, jangan diubah ke `application/json`.
- Foto di dashboard diambil dari link thumbnail Drive. Jika foto tidak tampil, pastikan file di folder Drive berstatus "Anyone with the link".
- Batas wajar: Apps Script membatasi kuota harian (sekitar 20.000 panggilan UrlFetch dan 100 MB Drive per hari untuk akun gratis). Untuk ratusan upload per hari, ini masih aman.
- Lupa password: reset dilakukan oleh owner dari Firebase Console.
