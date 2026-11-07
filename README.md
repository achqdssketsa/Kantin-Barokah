# BAROKAH · Tutup Kasir (v2.0.0)

## Isi folder
```
kantin-app/
├── www/                    ← aplikasi (HTML, CSS, JS, logo, ikon, manifest)
├── assets/icon.png         ← ikon aplikasi 1024×1024 (dipakai saat build APK)
├── apps-script/Code.gs     ← upload foto ke Google Drive (Apps Script)
├── firestore.rules         ← aturan keamanan database
├── firebase.json
├── capacitor.config.json
└── package.json
```

## 1. Keamanan — WAJIB
- Cabut key file `...adminsdk...json` (Google Cloud → IAM & Admin → Service Accounts → Keys). File itu tidak dipakai aplikasi dan tidak boleh masuk APK.
- Batasi API key di Google Cloud → Credentials ke aplikasi Android (package `com.barokah.tutupkasir`) dan domain Vercel Anda.

## 2. Firebase
1. Authentication → aktifkan **Email/Password**.
2. Authentication → Settings → **Authorized domains**: tambahkan domain Vercel Anda.
3. Firestore Database → buat database.
4. Deploy aturan: `firebase deploy --only firestore:rules`.

Storage Firebase tidak dipakai.

## 3. Google Apps Script (upload foto)
Tidak ada perubahan kode dibanding versi sebelumnya. Jika belum, tempel `apps-script/Code.gs`, jalankan `authorizeScopes`, lalu **Deploy → Manage deployments → New version**. Akses: **Anyone**, Execute as: **Me**.

## 4. Akun owner (3 owner)
1. Authentication → Add user: email `username@kantin.app` (atau email Anda sendiri). Salin **User UID**.
2. Firestore → koleksi `users` → Document ID = UID, field: `username` (string), `name` (string), `role` = `owner`, `photoUrl` = kosong.
3. Ulangi untuk owner kedua dan ketiga.
4. Login sebagai owner → **Pengaturan → Kelola pengguna** untuk menambah sekitar 7 kasir dengan role `kasir`.

## 5. Produk
Login sebagai owner → menu **Produk** → **+ Produk**. Isi nama, kategori, harga jual, dan HPP (modal per porsi). HPP hanya terlihat oleh owner.

## 6. Build APK
```
npm install
npx cap add android        # sekali saja
npm run icons              # membuat semua ukuran ikon Android dari assets/icon.png
npm run sync
npm run open               # Android Studio → Build → Build APK(s)
```
Setiap mengubah `www/`, jalankan `npm run sync` lalu build ulang.

## 7. Alur kerja harian
- **Kasir** (sekali sehari): isi modal awal, penjualan tunai & QRIS, jumlah produk terjual, pengeluaran (tandai apakah dibayar dari laci), hitung uang fisik, checklist, foto nota → kirim. Kasir tidak melihat saldo yang seharusnya, sehingga tidak bisa menyesuaikan angka.
- **Owner**: Beranda menampilkan omset, HPP, laba bersih, selisih kas, dan kolom **Perlu diperiksa**. Catat pengambilan uang owner di Beranda → Pengambilan owner agar selisih kas tetap akurat.
- Satu laporan per hari. Owner bisa mengedit laporan (modal, penjualan, produk, pengeluaran, uang fisik, catatan) lewat detail laporan → **Edit laporan**. Jika laporan salah total, owner bisa menghapusnya lalu kasir mengirim ulang.

## 8. Catatan
- Laporan lama (sebelum v2) tetap tampil. Untuk laporan lama, HPP dan kas dihitung dengan perkiraan.
- Lupa password: owner mereset dari Firebase Console.
- Backup: Pengaturan → Backup data (JSON). Simpan rutin ke Drive atau WhatsApp.

---

# Pembaruan v2.1

## A. Perbaiki izin Apps Script (upload foto gagal)
Penyebab: proyek Apps Script belum mendeklarasikan izin `script.external_request` dan Drive. File `apps-script/appsscript.json` berisi deklarasi itu.

1. Buka project Apps Script (script.google.com), isi `Code.gs` tetap seperti sebelumnya.
2. Klik ikon **Project Settings** (roda gigi di kiri) → centang **Show "appsscript.json" manifest file in editor**.
3. Buka file `appsscript.json` yang muncul di editor, hapus isinya, lalu tempel isi `apps-script/appsscript.json`. Simpan.
4. Pilih fungsi **authorizeScopes** → **Run**. Setujui semua izin (Drive dan akses eksternal). Jika muncul "Google belum memverifikasi aplikasi", pilih **Advanced → Go to ... (unsafe)**. Ini aman karena script milik Anda sendiri.
5. **Deploy → Manage deployments → Edit → Version: New version → Deploy.** URL tetap sama.
6. Tes: buka URL `/exec` di browser (harus `"version":2`), lalu di aplikasi: Pengaturan → Tentang → **Tes koneksi Drive**.

Catatan: URL library (`/macros/library/...`) **tidak dipakai** aplikasi. Yang dipakai hanya URL Aplikasi web (`/macros/s/.../exec`).

## B. Batasi kunci admin & API key (keamanan)
1. Hapus key service account:
   - Google Cloud Console → IAM & Admin → Service Accounts → `firebase-adminsdk-fbsvc@kantin-barokah-7870a.iam.gserviceaccount.com` → tab **Keys**.
   - Hapus key dengan ID **`c85d6eb642a4b53e46667634a8830e2fa137e0ef`**. Hapus juga file JSON-nya dari komputer.
2. Batasi API key browser Firebase:
   - Google Cloud Console → APIs & Services → Credentials → pilih key bernama **Browser key (auto created by Firebase)** atau key yang berawalan `AIzaSyBn7...`.
   - **Application restrictions** → pilih **Websites** → tambahkan:
     - `https://kantinbarokah.vercel.app/*`
     - `https://localhost/*` (diperlukan agar APK Android tetap bisa login)
   - **API restrictions** → pilih **Restrict key** → centang: Identity Toolkit API, Cloud Firestore API, Token Service API (dan Cloud Firestore API untuk REST). Simpan.
   - Setelah itu tes login di web dan APK. Jika ada yang gagal, tambahkan API yang diblokir dari pesan error di Console.

## C. Alur stok (baru)
- Owner mengisi setiap produk: **harga jual, HPP per unit, dan stok awal** (hitung fisik).
- Kasir setiap hari: isi **Masuk** (barang baru dibeli, jika ada) dan **Sisa** (hasil hitung fisik). Kasir tidak melihat omset yang seharusnya.
- Sistem: **terjual = awal + masuk − sisa**. Lalu:
  - **Omset seharusnya** = terjual × harga jual
  - **Selisih omset** = omset tercatat − omset seharusnya. Nilai negatif berarti ada potensi bocor.
  - **HPP terjual** = terjual × HPP
- **Belanja stok** (bahan atau barang dagang) dicatat sebagai pengeluaran jenis "Belanja stok". Ini bukan biaya, karena nilainya sudah masuk stok dan dihitung saat terjual. Jadi tidak terhitung dua kali.
- **Biaya operasional** (gas, listrik, dll.) dihitung sebagai biaya.
- **Laba bersih** = omset tercatat − HPP terjual − biaya operasional.
- **Selisih kas laci** = uang fisik − seharusnya. Seharusnya = modal + tunai − pengeluaran dari laci − pengambilan owner.
- Owner bisa mengedit laporan (termasuk stok sisa). Jika laporan itu laporan terbaru, stok produk ikut diperbarui.
