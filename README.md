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
