# 🏗️ Sivilize Hub Pro
> **Platform Teknik Sipil Tercanggih untuk Perhitungan RAB, Manajemen Proyek, dan Analisis AHSP Berbasis AI.**

🔗 **Live Demo: [sivilize-hub-pro.vercel.app](https://sivilize-hub-pro.vercel.app)**

Sivilize Hub Pro adalah solusi digital revolusioner yang dirancang khusus untuk memodernisasi industri konstruksi di Indonesia. Aplikasi ini mengotomatiskan proses kalkulasi Rencana Anggaran Biaya (RAB) dan mengintegrasikan manajemen proyek secara komprehensif. Dengan berpedoman pada standar **AHSP (Analisa Harga Satuan Pekerjaan) / SNI**, Sivilize Hub Pro memastikan setiap perhitungan tidak hanya cepat, tetapi juga akurat, profesional, dan siap dipertanggungjawabkan.

---

## 🎯 Target Pengguna (Siapa yang Membutuhkan Sivilize Hub Pro?)

Aplikasi ini didesain secara khusus untuk berbagai profesional di ekosistem konstruksi:
1. **Kontraktor & Pemborong**: Menyusun penawaran harga (bidding) dengan cepat, mengatur anggaran, dan memantau biaya pengeluaran (cost-tracking) agar proyek tetap profit.
2. **Konsultan Perencana & Pengawas**: Membuat dokumen RAB dan Bill of Quantities (BoQ) yang profesional, rapi, dan sesuai dengan standar dinas PUPR.
3. **Developer Properti**: Mengestimasi biaya pembangunan perumahan atau klaster secara presisi sebelum eksekusi lapangan.
4. **Mahasiswa Teknik Sipil & Arsitektur**: Sebagai alat bantu belajar untuk memahami struktur penyusunan RAB dan AHSP di dunia kerja nyata.
5. **Estimator Independen**: Bekerja lepas untuk menyusun RAB klien dengan waktu pengerjaan yang jauh lebih singkat.

---

## ✨ Fitur Unggulan Secara Detail

### 1. 🧮 Kalkulator RAB (Rencana Anggaran Biaya) Super Pintar
Sivilize Hub Pro mengubah cara kuno menghitung RAB menggunakan spreadsheet manual menjadi sistem cerdas yang terintegrasi:
- **Kategori Terstruktur**: Pecah pekerjaan menjadi kategori besar seperti *Pekerjaan Persiapan*, *Pekerjaan Struktur*, *Pekerjaan Arsitektur*, *Pekerjaan Plumbing*, hingga *Finishing*.
- **Perhitungan Otomatis**: Masukkan volume pekerjaan, dan sistem akan langsung mengalikan dengan Harga Satuan Pekerjaan (HSP), lalu menyusun Subtotal dan Grand Total secara real-time.
- **Kustomisasi Pajak & Profit**: Atur besaran PPN (Pajak Pertambahan Nilai), persentase Keuntungan (Profit), Overhead, dan Biaya Tak Terduga (Contingency) sesuai kesepakatan kontrak.
- **Tingkat Komponen Dalam Negeri (TKDN)**: Kalkulasi persentase penggunaan material lokal untuk proyek-proyek pemerintah (BUMN/PUPR).

### 2. 🗄️ Database AHSP (Analisa Harga Satuan Pekerjaan) Terpadu
Tidak perlu lagi membuka buku tebal AHSP/SNI setiap kali ingin menghitung harga satuan:
- **Master Data Lengkap**: Tersedia ratusan template AHSP untuk berbagai jenis pekerjaan (Galian, Beton, Pasangan Bata, Plesteran, Atap, Baja, dll).
- **Update Harga Material per Wilayah**: Harga material (Semen, Besi, Pasir) dan Upah Pekerja (Tukang, Mandor) dapat disesuaikan dengan standar HSPK (Harga Satuan Pokok Kegiatan) kabupaten/kota masing-masing.
- **Custom AHSP Editor**: Buat analisis harga satuan Anda sendiri jika pekerjaan tersebut spesifik atau tidak ada di standar SNI.

### 3. 📤 Ekspor Dokumen Standar Industri (PDF & Excel)
Hasil akhir dari sebuah RAB adalah dokumen presentasi. Sivilize Hub Pro menghasilkan dokumen siap cetak standar tender:
- **Ekspor Excel (Format Standar PU / B2G)**: 
  - *Sheet 1*: Rekapitulasi Biaya (dengan Border profesional, angka Rp, dan cetak tebal untuk subtotal).
  - *Sheet 2*: Bill of Quantities (Daftar Kuantitas dan Harga).
  - *Sheet 3*: Breakdown Analisa Harga Satuan Pekerjaan.
  - *Sheet Tambahan*: Ekspor format BoQ Kosong untuk dibagikan ke vendor/subkon saat proses tender.
- **Ekspor PDF Profesional**: Cetak RAB menjadi dokumen PDF cantik yang dilengkapi Kop Surat Perusahaan, informasi proyek, nomor dokumen, dan kolom tanda tangan (Dibuat, Diperiksa, Disetujui).

### 4. 📊 Manajemen Proyek & Kurva S
Pantau progres dari awal hingga akhir tanpa perlu aplikasi pihak ketiga:
- **Project Dashboard**: Lihat ringkasan proyek yang sedang berjalan (Ongoing), draf (Draft), atau yang sudah selesai (Completed).
- **Kurva S (S-Curve) Otomatis**: Buat jadwal waktu (Time Schedule) bobot pekerjaan, dan sistem akan membuat grafik Kurva S secara otomatis untuk membandingkan Rencana vs Realisasi.
- **Log Buku Harian Proyek**: Catat laporan cuaca, jumlah tenaga kerja, material masuk, dan kendala harian langsung dari lapangan menggunakan perangkat mobile.

### 5. 💰 Modul Laporan Keuangan (Cost Tracking)
Mencegah proyek dari kerugian (over-budget):
- **Budget vs Actual**: Catat setiap pengeluaran material dan upah yang terjadi di lapangan, lalu bandingkan dengan RAB awal.
- **Laba/Rugi Real-Time**: Ketahui secara presisi berapa sisa budget (margin) yang Anda miliki saat ini.
- **Manajemen Upah Tukang**: Generate sistem payroll/upah mingguan untuk mandor, tukang, dan pekerja kasar, lalu ekspor langsung ke Excel.

### 6. 🤖 Sivilize AI Vision (Estimator Cerdas)
Fitur eksperimental yang mengadopsi kecerdasan buatan:
- Upload foto denah kasar atau sketsa bangunan.
- AI akan mencoba menganalisis dan memperkirakan volume pekerjaan serta memprediksi kebutuhan material utama.

### 7. 🛡️ Keamanan Data Tingkat Tinggi
Walaupun proyek ini berjalan di cloud, keamanan data tetap menjadi prioritas absolut:
- Autentikasi ketat menggunakan sistem One-Time Password (OTP) via Email.
- Sesi login dilindungi dengan JWT (JSON Web Token).
- Enkripsi password menggunakan Bcrypt (Salt factor 10).
- Proteksi Anti-Spam, Rate Limiting, XSS Protection, dan Custom Firewall untuk mencegah injeksi berbahaya.

---

## 🔄 Alur Kerja (Workflow) Sivilize Hub Pro

Bagaimana cara menggunakan aplikasi ini dari nol hingga menjadi dokumen RAB?

1. **Membuat Proyek Baru**
   Masuk ke menu Dashboard, klik "Buat Proyek". Masukkan nama klien, lokasi proyek, dan estimasi waktu.
2. **Mengatur Harga Dasar**
   Masuk ke menu Database Material, atur harga Semen, Besi, Pasir, dan upah pekerja sesuai dengan harga toko bangunan di kota Anda.
3. **Mulai Menyusun RAB**
   Buka kalkulator RAB. Pilih template pekerjaan (misal: "Pekerjaan Beton Bertulang"). Masukkan volume (misal: 15 m3). Sistem akan otomatis menghitung total harga berdasarkan AHSP.
4. **Atur PPN & Profit**
   Buka pengaturan finansial, tentukan apakah klien dikenakan PPN 11% atau tidak, dan berapa % profit yang ingin Anda ambil.
5. **Ekspor & Presentasi**
   Klik tombol "Ekspor/Cetak". Pilih Excel atau PDF. Dokumen langsung terunduh ke perangkat Anda dan siap dikirim via WhatsApp atau Email ke klien/owner.
6. **Mulai Pelaksanaan (Buku Harian)**
   Saat proyek berjalan, buka fitur "Daily Log" setiap sore untuk mencatat progres harian.

---

## ❓ FAQ (Pertanyaan yang Sering Diajukan)

**1. Apakah perhitungan Sivilize Hub Pro sudah sesuai SNI?**
Ya, koefisien material dan tenaga kerja yang digunakan sebagai *default* di dalam sistem mengacu pada standar Analisa Harga Satuan Pekerjaan (AHSP) dari regulasi pemerintah (PUPR/SNI).

**2. Apakah saya bisa mengubah harga materialnya sendiri?**
Tentu saja. Sivilize Hub Pro bersifat dinamis. Anda bisa menyesuaikan semua harga material dasar, upah, hingga koefisien jika dirasa standar SNI terlalu tinggi atau terlalu rendah untuk proyek Anda.

**3. Dokumen apa saja yang dihasilkan oleh sistem?**
Sistem menghasilkan Rekapitulasi RAB, Daftar Kuantitas dan Harga (BoQ), Breakdown Analisa Harga Satuan Pekerjaan (AHSP), Laporan Kurva S, hingga Rekap Gaji/Upah pekerja. 

**4. Apakah data proyek saya aman?**
Sangat aman. Setiap akun memiliki ruang kerjanya sendiri (terisolasi), diamankan dengan enkripsi, dan tidak bisa diakses oleh akun lain tanpa otorisasi.

---

## 👨‍💻 Tentang Pengembang

Sivilize Hub Pro dikembangkan sebagai bentuk dedikasi terhadap kemajuan teknologi konstruksi di Indonesia.
- **Author**: Muhamad Adrian
- **Email**: muhamadadrian210@gmail.com
- **WhatsApp**: 0813 3821 9957
- **Lokasi**: Kupang, Nusa Tenggara Timur, Indonesia

---

## 📄 Lisensi Penggunaan

**Hak Cipta Dilindungi (All Rights Reserved)**
Hak Cipta © 2026 Sivilize Hub Pro - Muhamad Adrian (Sivilize Corp).
Perangkat lunak ini adalah properti intelektual mutlak milik Sivilize Corp. Dilarang keras untuk menyalin, menduplikasi, merekayasa balik (reverse engineer), atau menjual ulang source code dan fitur aplikasi ini tanpa izin tertulis dari pihak Sivilize Corp. Pelanggaran terhadap lisensi ini akan ditindak tegas sesuai dengan hukum Hak Kekayaan Intelektual (HAKI) yang berlaku di Republik Indonesia.

> *"Membangun peradaban dimulai dari perhitungan yang presisi."* - **Sivilize Hub Pro**
