# 🏗️ Sivilize Hub Pro
> **Platform Teknik Sipil Tercanggih untuk Perhitungan RAB, Manajemen Proyek, dan Analisa AHSP Berbasis AI.**

Sivilize Hub Pro adalah solusi digital revolusioner yang dirancang khusus untuk memodernisasi industri konstruksi di Indonesia. Aplikasi ini mengotomatiskan proses kalkulasi Rencana Anggaran Biaya (RAB) dan mengintegrasikan manajemen proyek secara komprehensif. Dengan berpedoman pada standar **AHSP (Analisa Harga Satuan Pekerjaan) / SNI**, Sivilize Hub Pro memastikan setiap perhitungan tidak hanya cepat, tetapi juga akurat, profesional, dan siap dipertanggungjawabkan.

Aplikasi ini merupakan bagian integral dari **Ekosistem PT Sivilize Corp Indonesia** yang berfokus pada digitalisasi infrastruktur dan manajemen sipil nasional.

---

## 🔑 1. Panduan Pendaftaran & Otentikasi Akun

Sivilize Hub Pro mengadopsi standar keamanan tingkat tinggi menggunakan otentikasi tanpa password konvensional, melainkan dengan **Gmail OTP (One-Time Password)** untuk meminimalisir risiko peretasan data anggaran proyek Anda.

### A. Cara Melakukan Pendaftaran (Register)
1. Buka aplikasi, klik tombol **Dapatkan Akses** atau **Mulai Sekarang** di Landing Page.
2. Pada form Auth, pilih tab **Daftar**.
3. Isi nama lengkap Anda, alamat Gmail aktif, dan pilih Peran/Role Anda (misal: Kontraktor, Konsultan, Developer, Estimator).
4. Tekan **Kirim OTP**. Kode OTP 6-digit rahasia akan dikirimkan otomatis ke inbox Gmail Anda.
5. Masukkan 6-digit kode OTP tersebut pada kolom verifikasi aplikasi untuk mengaktifkan akun Anda.

### B. Cara Melakukan Login
1. Buka form login, masukkan alamat Gmail terdaftar Anda, lalu klik **Minta Kode OTP**.
2. Buka inbox Gmail Anda, salin kode OTP 6-digit terbaru yang dikirim oleh sistem Sivilize.
3. Masukkan kode tersebut ke dalam aplikasi, lalu tekan **Verifikasi & Masuk**.
4. Centang opsi **Ingat Saya (Remember Me)** jika Anda ingin login otomatis pada perangkat ini di kemudian hari tanpa harus meminta kode OTP berulang kali (selama masa berlaku token aktif).

---

## 🧭 2. Penjelasan Menu & Navigasi (Sidebar / Navbar)

Setelah berhasil masuk ke dashboard utama, Anda akan disajikan dengan menu sidebar navigasi yang merepresentasikan modul fungsionalitas utama aplikasi:

1. **📊 Dashboard**: Halaman rangkuman utama yang menyajikan statistik proyek aktif, ringkasan jumlah RAB, grafik status pengerjaan mingguan, progres keuangan aktual, notifikasi sistem, serta pintasan cepat untuk membuat estimasi baru.
2. **🧮 Kalkulator RAB**: Jantung dari aplikasi. Modul interaktif untuk menyusun kategori pekerjaan sipil (Persiapan, Struktur, Finishing, dll.), menginput volume pekerjaan, memilih rumus AHSP, serta menghitung subtotal secara real-time.
3. **📈 Analisis Struktur**: Fitur kalkulator teknik sipil tambahan untuk menganalisis pembebanan struktur bangunan ringan (beton/baja/kayu) guna membantu perencanaan dimensi elemen sebelum dihitung biayanya.
4. **🗄️ AHSP Database**: Modul database regional yang memuat standar Analisa Harga Satuan Pekerjaan (AHSP) dari 514 kota dan kabupaten di Indonesia (sesuai regulasi Kementerian PUPR / SNI). Di sini Anda juga bisa menambah atau mengubah harga material dasar, sewa alat, dan tarif upah pekerja lokal.
5. **📖 Buku Harian (Daily Log)**: Buku jurnal digital untuk mencatat laporan harian langsung dari lokasi konstruksi (kondisi cuaca harian, jumlah pekerja yang hadir, kedatangan bahan bangunan, hambatan teknis di lapangan, serta lampiran foto dokumentasi fisik proyek).
6. **⚙️ Manajemen Proyek**: Pusat konfigurasi proyek untuk mengatur nama pemilik (owner), alamat lokasi, masa kontrak kerja, tim pelaksana, serta manajemen unggah berkas kontrak/gambar cetak kerja.
7. **💰 Lap. Keuangan (Financial)**: Dashboard pelacakan anggaran (*Budget vs Actual cost tracking*). Digunakan untuk mencatat pengeluaran riil di lapangan (beli material/upah) dan membandingkannya dengan RAB awal agar margin keuntungan proyek tetap aman terkendali.
8. **📉 Kurva S (S-Curve)**: Modul penjadwalan dan pemantauan waktu kerja. Menghasilkan grafik Kurva S secara otomatis untuk membandingkan target rencana waktu proyek versus realisasi perkembangan fisik di lapangan (mendeteksi keterlambatan proyek).
9. **👥 Upah Tukang (Labor)**: Sistem penggajian (*payroll*) pekerja konstruksi. Mengatur rekap jam kerja harian, upah lembur, dan pembayaran mingguan untuk mandor, tukang batu, tukang kayu, hingga asisten tukang.
10. **🛡️ Control Panel (Admin)**: Khusus akun ber-role Admin. Berfungsi untuk mengelola daftar akun anggota tim, mengkonfigurasi hak akses, serta mengawasi **Log Audit** (catatan riwayat log aktivitas pengguna demi keamanan data perusahaan).
11. **🔔 Pusat Notifikasi**: Menampilkan pemberitahuan real-time mengenai pengingat batas waktu proyek, log harian yang belum diisi, pengeluaran keuangan yang melebihi batas anggaran, atau update status dari anggota tim.

---

## 🚀 3. Panduan Alur Kerja Penggunaan Aplikasi (Step-by-Step)

Untuk menghasilkan output dokumen estimasi hingga laporan manajemen proyek secara komprehensif, ikuti alur kerja standar berikut:

### Langkah 1: Inisialisasi Proyek Baru
* Buka menu **Dashboard**, lalu klik tombol **Buat Proyek Baru** (atau masuk ke menu **Manajemen Proyek**).
* Masukkan nama proyek, nama klien, tanggal mulai, estimasi durasi (minggu), dan lokasi proyek (pilih dari 514 kota/kabupaten se-Indonesia).

### Langkah 2: Sesuaikan Database Harga Satuan Regional (HSPK)
* Masuk ke menu **AHSP Database**.
* Pilih kota/kabupaten proyek Anda. Sistem akan memuat default harga pasar lokal untuk bahan (seperti semen, pasir, besi) dan upah (tukang, mandor).
* Lakukan penyesuaian harga dasar jika Anda mendapatkan harga pemasok yang lebih murah atau ada kesepakatan upah borongan tertentu.

### Langkah 3: Susun Rencana Anggaran Biaya (RAB)
* Buka menu **Kalkulator RAB** dan pilih proyek Anda.
* Tambahkan kategori pekerjaan (misal: *Pekerjaan Pondasi*).
* Klik tombol **Tambah Item Pekerjaan**, cari template analisis AHSP yang relevan dari database (misal: *Pemasangan Pondasi Batu Kali 1:4*).
* Masukkan volume pengerjaan fisik di lapangan (misal: `12` m³). Sistem akan menghitung secara otomatis total biaya bahan, tenaga, dan alat.

### Langkah 4: Tentukan Pajak & Margin Keuntungan
* Di bagian bawah kalkulator RAB, atur parameter finansial proyek:
  * **PPN** (misal: 11%)
  * **Overhead & Keuntungan** (misal: 10% - 15%)
  * **Contingency / Biaya Tak Terduga** (opsional)
* Sistem akan mengalkulasi total penawaran harga akhir (*Grand Total*).

### Langkah 5: Ekspor Dokumen Siap Tender
* Buka tab cetak laporan, klik **Ekspor Excel** untuk mengunduh dokumen RAB 3-sheet rapi (Rekapitulasi, Rincian Anggaran, dan Rincian AHSP koefisien bahan/upah) untuk diserahkan ke klien/panitia tender.
* Klik **Ekspor PDF** untuk membuat berkas presentasi resmi lengkap dengan kop surat perusahaan Sivilize.

### Langkah 6: Kelola Progres Pelaksanaan (Kurva S & Daily Log)
* Saat konstruksi dimulai, masuk ke menu **Kurva S** untuk membagi persentase bobot setiap pekerjaan ke dalam target mingguan.
* Setiap sore, mintalah pengawas/mandor untuk mengisi **Buku Harian** mengenai cuaca, jumlah pekerja aktif, dan log kemajuan fisik.
* Sistem akan memperbarui grafik Kurva S secara real-time untuk memperlihatkan apakah proyek berjalan lebih cepat (*ahead of schedule*) atau terlambat (*behind schedule*).

### Langkah 7: Kontrol Keuangan & Pembayaran Gaji
* Masuk ke menu **Lap. Keuangan** setiap kali ada kuitansi pembelian material datang atau pembayaran mingguan pekerja.
* Catat pengeluaran riil tersebut di sistem untuk memantau grafik perbandingan pengeluaran aktual versus anggaran rencana.
* Gunakan menu **Upah Tukang** untuk merekap jam kerja pekerja lapangan dan mencetak laporan tanda terima upah mingguan.

---

## 🎯 Target Pengguna

Aplikasi ini didesain secara khusus untuk berbagai profesional di ekosistem konstruksi:
1. **Kontraktor & Pemborong**: Menyusun penawaran harga (*bidding*) dengan cepat, mengatur anggaran, dan memantau pengeluaran biaya (*cost-tracking*) agar proyek tetap profit.
2. **Konsultan Perencana & Pengawas**: Membuat dokumen RAB dan *Bill of Quantities* (BoQ) yang profesional, rapi, dan sesuai dengan standar dinas PUPR.
3. **Developer Properti**: Mengestimasi biaya pembangunan perumahan atau klaster secara presisi sebelum eksekusi lapangan.
4. **Mahasiswa Teknik Sipil & Arsitektur**: Sebagai alat bantu belajar untuk memahami struktur penyusunan RAB dan AHSP di dunia kerja nyata.
5. **Estimator Independen**: Bekerja lepas untuk menyusun RAB klien dengan waktu pengerjaan yang jauh lebih singkat.

---

## ✨ Fitur Unggulan Secara Detail

### 1. 🧮 Kalkulator RAB Super Pintar
Sivilize Hub Pro mengubah cara kuno menghitung RAB menggunakan spreadsheet manual menjadi sistem cerdas yang terintegrasi:
- **Kategori Terstruktur**: Memisahkan pekerjaan menjadi kategori besar seperti Pekerjaan Persiapan, Tanah & Pondasi, Struktur, Dinding & Plesteran, Atap & Plafon, Lantai & Keramik, Instalasi Listrik, Sanitasi, hingga Finishing.
- **Perhitungan Otomatis**: Masukkan volume pekerjaan, dan sistem akan langsung mengalikan dengan Harga Satuan Pekerjaan (HSP), lalu menyusun Subtotal dan Grand Total secara real-time.
- **Kustomisasi Finansial**: Atur besaran PPN, persentase Keuntungan (Profit), Overhead, dan Biaya Tak Terduga (Contingency) sesuai kesepakatan kontrak.
- **Tingkat Komponen Dalam Negeri (TKDN)**: Kalkulasi persentase penggunaan material lokal untuk proyek-proyek pemerintah (BUMN/PUPR).

### 2. 🗄️ Database AHSP & HSPK Terpadu
Tidak perlu lagi membuka buku tebal AHSP/SNI setiap kali ingin menghitung harga satuan:
- **Master Data Lengkap**: Tersedia ratusan template AHSP untuk berbagai jenis pekerjaan (Galian, Beton, Pasangan Bata, Plesteran, Atap, Baja, dll) berdasarkan standar PUPR terbaru.
- **Update Harga Wilayah**: Harga material (Semen, Besi, Pasir) dan Upah Pekerja (Tukang, Mandor) dapat disesuaikan dengan standar HSPK kabupaten/kota masing-masing di seluruh Indonesia.
- **Custom AHSP Editor**: Buat analisis harga satuan Anda sendiri secara fleksibel jika pekerjaan tersebut bersifat spesifik atau tidak tercantum di standar SNI.

### 3. 📤 Ekspor Laporan Standar Industri (PDF & Excel)
Hasil akhir dari sebuah RAB adalah dokumen presentasi. Sivilize Hub Pro menghasilkan dokumen siap cetak standar tender:
- **Ekspor Excel (Format PU / B2G)**: 
  - *Rekapitulasi*: Rangkuman total biaya per kategori pekerjaan.
  - *Rincian RAB*: Rincian volume, satuan, harga satuan, dan total biaya.
  - *Breakdown AHSP*: Analisa detail koefisien bahan, alat, dan upah tenaga kerja untuk setiap item pekerjaan.
- **Ekspor PDF Profesional**: Dokumen PDF cantik yang dilengkapi Kop Surat Perusahaan, informasi proyek, nomor dokumen, dan kolom tanda tangan (Dibuat, Diperiksa, Disetujui).

### 4. 📊 Manajemen Proyek & Kurva S
Pantau progres dari awal hingga akhir tanpa memerlukan aplikasi pihak ketiga:
- **Project Dashboard**: Lihat ringkasan proyek yang sedang berjalan (*Ongoing*), draf (*Draft*), atau yang sudah selesai (*Completed*).
- **Kurva S (S-Curve) Otomatis**: Masukkan bobot waktu pengerjaan dan catat progres mingguan untuk menggambar grafik Kurva S secara instan untuk membandingkan Rencana vs Realisasi di lapangan.
- **Log Buku Harian Proyek**: Catat laporan cuaca, jumlah tenaga kerja, material masuk, dan kendala harian langsung dari lapangan menggunakan perangkat mobile/tablet.

### 5. 💰 Laporan Keuangan & Manajemen Upah
Mencegah proyek dari risiko kerugian akibat pembengkakan biaya (*over-budget*):
- **Budget vs Actual**: Catat setiap pengeluaran material dan upah yang terjadi di lapangan, lalu bandingkan dengan RAB awal.
- **Laba/Rugi Real-Time**: Ketahui secara presisi berapa sisa budget (margin) yang Anda miliki saat ini.
- **Manajemen Upah Tukang**: Generate sistem payroll/upah mingguan untuk mandor, tukang, dan pekerja kasar, lalu ekspor langsung ke Excel.

---

## 🌟 Apa yang Membedakan Sivilize Hub Pro dari Aplikasi Lain?

Sivilize Hub Pro dirancang tidak hanya untuk bersaing, tetapi mendefinisikan ulang standar produktivitas kontraktor. Berikut adalah keunggulan utama yang membedakannya dari spreadsheet excel konvensional maupun aplikasi/web sejenis:

### 1. Sinkronisasi Offline & Online yang Mulus
Sebagian besar website RAB hanya bisa diakses saat terkoneksi internet. Sivilize Hub Pro menggunakan teknologi penyimpanan lokal canggih. Anda bisa membuat RAB, mencatat log proyek, dan melacak keuangan langsung di lokasi proyek terpencil yang **tidak ada sinyal internet (offline)**. Data Anda akan disimpan aman di browser dan otomatis tersinkronisasi ke server cloud saat Anda kembali mendapatkan koneksi internet.

### 2. Database Regional 514 Kota & Kabupaten
Di aplikasi lain, Anda harus memasukkan harga bahan dan upah pekerja satu per satu dari nol. Sivilize Hub Pro memiliki basis data regional terintegrasi untuk seluruh 514 kota/kabupaten di Indonesia. Cukup pilih lokasi proyek Anda, dan sistem akan langsung memuat standar harga bahan/upah lokal yang relevan, memotong waktu estimasi Anda hingga 80%.

### 3. All-in-One Project Control Center
Banyak kontraktor harus mengelola 4-5 file excel terpisah untuk RAB, jadwal proyek, kurva S, log harian, dan keuangan upah tukang. Sivilize Hub Pro mengintegrasikan kelima fungsi krusial tersebut ke dalam satu dashboard tunggal. Data RAB Anda langsung terhubung dengan grafik Kurva S, laporan harian mandor, dan pelacakan anggaran aktual secara otomatis.

### 4. Ekspor Excel 3-Sheet Siap Tender
Umumnya aplikasi RAB hanya mengekspor data mentah dalam bentuk file `.csv` atau tabel sederhana yang berantakan. Ekspor Excel Sivilize Hub Pro menghasilkan workbook profesional berisi 3 sheet terformat rapi (Rekapitulasi, Rincian RAB, dan Analisa AHSP) lengkap dengan rumus perhitungan yang siap diserahkan untuk proses tender proyek pemerintah maupun swasta.

### 5. Proteksi Keamanan Berlapis & Akses OTP
Kami mengamankan data rahasia penawaran proyek Anda secara ketat. Pintu masuk aplikasi dilindungi otentikasi JWT dan login OTP via email (tanpa password konvensional yang mudah diretas). Dilengkapi sistem anti-spam, rate limiter, sanitasi input XSS, dan firewall lokal guna menjamin informasi Rencana Anggaran Biaya proyek Anda tidak akan jatuh ke tangan kompetitor.

### 6. Dukungan Multiplatform (Web, Tablet & APK Mobile)
Berbeda dengan software desktop jadul yang hanya bisa dibuka di satu laptop kantor, Sivilize Hub Pro dioptimalkan menggunakan wrapper Capacitor. Anda dapat mengaksesnya lewat browser desktop, tablet saat rapat dengan klien, maupun mengunduh file APK khususnya untuk digunakan secara ergonomis di HP Android saat berada di lapangan proyek.

---

## 🔄 Alur Kerja Aplikasi (Workflow)

Bagaimana cara menggunakan Sivilize Hub Pro dari awal hingga menjadi dokumen RAB utuh?

1. **Membuat Proyek Baru**
   Masuk ke menu Dashboard, klik "Buat Proyek". Masukkan nama klien, lokasi proyek, dan estimasi waktu pengerjaan.
2. **Mengatur Harga Dasar**
   Masuk ke menu Database Material, atur harga Semen, Besi, Pasir, dan upah pekerja sesuai dengan harga pasar atau standar toko bangunan di wilayah Anda.
3. **Menyusun Item RAB**
   Buka kalkulator RAB. Pilih template pekerjaan (misal: "Pekerjaan Beton Bertulang"). Masukkan volume pekerjaan. Sistem akan otomatis menghitung total harga berdasarkan koefisien AHSP yang berlaku.
4. **Atur PPN & Margin Profit**
   Buka pengaturan finansial, tentukan persentase overhead, pajak PPN, profit bersih yang Anda targetkan, serta biaya tak terduga (contingency).
5. **Ekspor Laporan**
   Klik tombol "Ekspor/Cetak". Pilih Excel atau PDF. Dokumen langsung terunduh ke perangkat Anda dan siap dikirim via WhatsApp atau Email ke klien/owner.
6. **Pelaksanaan & Pemantauan Progres**
   Saat proyek berjalan, gunakan menu "Daily Log" untuk mencatat progres harian, mengunggah foto lapangan, serta mencatat pengeluaran keuangan aktual.

---

## ❓ FAQ (Pertanyaan yang Sering Diajukan)

**1. Apakah perhitungan Sivilize Hub Pro sudah sesuai SNI?**
Ya, koefisien material, alat, dan tenaga kerja yang digunakan sebagai *default* di dalam sistem mengacu pada standar Analisa Harga Satuan Pekerjaan (AHSP) dari regulasi pemerintah (Kementerian PUPR & SNI).

**2. Apakah saya bisa mengubah harga materialnya sendiri?**
Tentu saja. Sivilize Hub Pro bersifat dinamis. Anda bisa menyesuaikan semua harga material dasar, upah, hingga nilai koefisien jika dirasa standar SNI terlalu tinggi atau terlalu rendah untuk proyek Anda.

**3. Dokumen apa saja yang dihasilkan oleh sistem?**
Sistem menghasilkan Rekapitulasi RAB, Daftar Kuantitas dan Harga (BoQ), Breakdown Analisa Harga Satuan Pekerjaan (AHSP), Laporan Grafik Kurva S, hingga Rekap Gaji/Upah pekerja mingguan. 

**4. Apakah aplikasi ini dapat diakses tanpa internet?**
Ya. Sivilize Hub Pro menggunakan sinkronisasi penyimpanan lokal. Ketika koneksi internet terputus, Anda tetap dapat mengisi data proyek dan log harian. Data akan disinkronkan kembali ke database server secara otomatis saat Anda kembali online.

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
Hak Cipta © 2026 PT Sivilize Corp Indonesia - Muhamad Adrian.

Perangkat lunak ini adalah properti intelektual mutlak milik **PT Sivilize Corp Indonesia**. Dilarang keras untuk menyalin, menduplikasi, merekayasa balik (*reverse engineer*), mendistribusikan tanpa izin, atau menjual ulang source code dan fitur aplikasi ini tanpa izin tertulis dari pihak PT Sivilize Corp Indonesia. Pelanggaran terhadap lisensi ini akan ditindak tegas sesuai dengan hukum Hak Kekayaan Intelektual (HAKI) yang berlaku di Republik Indonesia.

> *"Membangun peradaban dimulai dari perhitungan yang presisi."* - **PT Sivilize Corp Indonesia**
