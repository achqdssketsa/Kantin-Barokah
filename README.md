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


---

# Pembaruan v3.0 (ringkas + opname)

## Penyimpanan foto
Foto nota dan foto profil sekarang disimpan di **Firestore** (terkompres, sekitar 50–100 KB per foto). Tidak perlu Google Drive, Apps Script, atau Firebase Storage. Folder `apps-script/` tidak lagi dipakai.

## Alur harian (kasir)
Cukup isi: penjualan tunai, QRIS, belanja (jika ada), uang fisik di laci, checklist, dan foto. Saldo awal laci diambil otomatis dari uang fisik laporan terakhir.

## Opname (owner, sekitar seminggu sekali)
Hitung total nilai stok dua cara (nilai HPP dan nilai harga jual) dan saldo bank. Tidak perlu per produk. Aplikasi menghitung:
- **Selisih omset:** omset tercatat dibandingkan dengan omset seharusnya dari stok (HPP terjual x rasio harga jual/HPP). Angka negatif berarti ada barang keluar yang uangnya tidak tercatat.
- **Selisih kekayaan:** perubahan (stok HPP + bank + laci) dibandingkan dengan laba periode dikurangi pengambilan owner. Selisih yang tidak nol berarti ada uang yang masuk atau keluar tanpa catatan.

## Deploy
1. Ganti isi `www/` dan `firestore.rules`.
2. `firebase deploy --only firestore:rules`.
3. Upload ke GitHub; Vercel deploy otomatis.
4. Buat APK ulang: `npm run sync` lalu `npm run open`.

## Data lama
Laporan v1 dan v2 tetap tampil. Untuk laporan lama, saldo awal laci memakai nilai yang tersimpan, dan perhitungan stok tidak tersedia.

---

# Pembaruan v4.0 (dua kantong, produk, opname rinci, log aktivitas)

## Cara mulai
1. Deploy aturan: `firebase deploy --only firestore:rules`.
2. Upload `www/` ke GitHub, lalu buat APK ulang (`npm run sync`).
3. Login owner → menu **Stok → Produk** → tambahkan semua produk dengan harga jual dan HPP.
4. Menu **Stok → Opname** → **Opname** pertama: hitung jumlah setiap produk, lalu isi uang di laci, di kasir, dan saldo bank.
5. Mulai hari berikutnya kasir mengisi **Tutup Kasir** seperti biasa.

## Alur harian (kasir)
- Penjualan tunai dan QRIS.
- **Pindah uang**: laci → kasir (modal kasir), dan kasir → laci (setoran hasil penjualan).
- **Belanja**: pilih jenis Belanja barang (pilih produk dan jumlah) atau Biaya (gas, es, dll.). Pilih dari mana uangnya.
- Hitung uang di laci dan di kasir secara terpisah, checklist, foto, catatan.
- Kasir boleh menambah produk baru. Produk itu ditandai "belum ada harga" sampai owner mengisi harga dan HPP.

## Opname (owner, disarankan seminggu sekali, tanpa pemberitahuan sebelumnya)
Hitung jumlah setiap produk, uang di laci, uang di kasir, dan saldo bank. Opname tidak bisa diubah atau dihapus.

Aplikasi menghitung per produk: terjual = awal + masuk − akhir, lalu dibandingkan dengan omset tercatat. Hasilnya:
- **Selisih omset**: omset tercatat dibanding omset seharusnya dari stok.
- **Selisih kekayaan**: perubahan kekayaan toko (stok HPP + bank + laci + kasir) dibanding laba periode dikurangi pengambilan owner.

## Audit
- **Log aktivitas** (Pengaturan → Log aktivitas) mencatat perubahan produk dan harga, opname, pengambilan dan setoran owner, role, dan edit laporan (dengan nilai lama, nilai baru, dan alasan).
- Laporan tidak bisa dihapus. Hanya bisa diedit oleh owner, dengan alasan wajib.
- Opname dan log tidak bisa diubah atau dihapus dari aplikasi maupun dari aturan Firestore.

## Catatan
- Opname dari versi sebelumnya (v3) tidak dipakai untuk perhitungan per produk. Mulailah dengan opname rinci pertama.
- Daftar produk di database bisa dibaca oleh semua akun yang login, termasuk HPP. Tampilan aplikasi kasir tidak menampilkan HPP, tetapi data tetap bisa dibaca lewat alat pengembang. Jika ingin HPP benar-benar tersembunyi dari kasir, kami bisa memindahkannya ke koleksi khusus owner.

---

# Pembaruan v4.1: modal kasir tetap dan setoran otomatis

- **Modal kasir tetap** (default Rp100.000) diatur owner di **Pengaturan → Modal kasir tetap**. Perubahan berlaku mulai laporan berikutnya.
- **Setoran ke laci dihitung otomatis** = saldo kasir seharusnya − modal tetap. Dihitung dari data yang tercatat, sehingga kasir tidak melihat atau mengubah angka setorannya.
- **Saldo awal besok:** laci = uang fisik laci hari ini; kasir = uang fisik kasir sebelum setoran − setoran.
- Kasir hanya mengisi penjualan, belanja, uang fisik laci (setelah setoran masuk), uang fisik kasir (sebelum setoran), dan "Laci → kasir" bila kasir kekurangan uang.
- Pengambilan owner selalu dicatat dari **laci**.
- Selisih kasir hari itu tetap ditampilkan. Karena saldo besok dihitung dari fisik kasir, kekurangan tidak berulang setiap hari.
