# RAB Grouping System - Quick Start Guide

## 🎯 Tujuan
Sistem RAB baru mengubah data pekerjaan dari **flat list** menjadi **structured grouped format** yang profesional dan siap presentasi klien.

---

## 📊 Struktur Sebelum vs Sesudah

### ❌ Sebelumnya (Flat List):
```
┌─────┬──────────────────┬────────┬──────┐
│ No  │ Pekerjaan        │ Volume │ Harga│
├─────┼──────────────────┼────────┼──────┤
│ 1   │ Galian Tanah     │ 16     │ ...  │
│ 2   │ Beton Pondasi    │ 8      │ ...  │
│ 3   │ Pasangan Batu    │ 250    │ ...  │
│ 4   │ Pengecatan       │ 300    │ ...  │
└─────┴──────────────────┴────────┴──────┘
```

### ✅ Sekarang (Grouped):
```
📦 PEKERJAAN STRUKTUR [Klik untuk expand]
   ├─ 1 │ Galian Tanah   │ 16  m3  │ Rp 1.5M
   ├─ 2 │ Beton Pondasi  │ 8   m3  │ Rp 8M
   └── SUBTOTAL: Rp 9.5M

📦 PEKERJAAN DINDING [Klik untuk expand]
   ├─ 3 │ Pasangan Batu  │ 250 m2  │ Rp 625K
   └── SUBTOTAL: Rp 625K

📦 PEKERJAAN FINISHING [Klik untuk expand]
   ├─ 4 │ Pengecatan     │ 300 m2  │ Rp 900K
   └── SUBTOTAL: Rp 900K

═══════════════════════════════════════════════
💰 TOTAL KESELURUHAN: Rp 11M
═══════════════════════════════════════════════
```

---

## 🔑 Fitur Utama

### 1. **Auto-Classification**
Sistem secara otomatis mengelompokkan pekerjaan berdasarkan nama:

| Kata Kunci | Kategori |
|---|---|
| Galian, Pondasi, Beton, Pembesian | 🏗️ Pekerjaan Struktur |
| Pasangan, Plesteran | 🧱 Pekerjaan Dinding |
| Keramik, Lantai, Ubin | 🪨 Pekerjaan Lantai |
| Pengecatan, Cat, Finishing | 🎨 Pekerjaan Finishing |
| Atap, Genteng, Roofing | 🏘️ Pekerjaan Atap |
| Persiapan, Survey, Mobilisasi | 📋 Pekerjaan Persiapan |
| Urugan, Timbunan, Tanah | 🚜 Pekerjaan Tanah |
| *Lainnya* | 📝 Lain-lain |

### 2. **Expandable Sections**
- Klik header kategori untuk buka/tutup
- Hemat space dengan collapse
- Cepat fokus ke kategori tertentu

### 3. **Inline Editing**
- Ubah volume = total otomatis update
- Perpustakaan perpustakaan perpustakaan perpustakaan perpustakaan perpustakaan perpustakaan perpustakaan

### 4. **Team Assignment**
- Alokasikan Tim kerja per item
- Lihat total keseluruhan

### 5. **Automatic Calculations**
- Subtotal per kategori = otomatis hitung
- Grand Total = sum of all subtotals
- Overhead, Profit, Tax = auto calculate

---

## 💾 Excel Export - Standar Profesional

Ketika export ke Excel, file akan berisi:

### **Sheet 1: RAB Profesional**
```
┌─────────────────────────────────────────────┐
│  RENCANA ANGGARAN BIAYA (RAB)              │
│  Nama Kegiatan: Rumah Tinggal Modern       │
│  Lokasi: Jakarta Selatan                   │
│  Tanggal: 2 April 2026                     │
├─────────────────────────────────────────────┤
│ No │ URAIAN PEKERJAAN │ VOL │ SAT │ HARGA │
├─────────────────────────────────────────────┤
│    │ PEKERJAAN STRUKTUR                   │
│  1 │ Galian Tanah         │ 16  │ m3  │ Rp  │
│  2 │ Beton Pondasi        │  8  │ m3  │ Rp  │
│    │ SUBTOTAL STRUKTUR    │             │Rp │
├─────────────────────────────────────────────┤
│    │ PEKERJAAN DINDING                   │
│  3 │ Pasangan Batu Bata   │250  │ m2  │ Rp  │
│    │ SUBTOTAL DINDING     │             │Rp │
├─────────────────────────────────────────────┤
│    │ TOTAL KESELURUHAN    │             │Rp │
└─────────────────────────────────────────────┘
```

### **Sheet 2: Ringkasan**
Quick summary dengan semua angka penting

### **Format Excel:**
✅ Color-coded headers & subtotals
✅ Currency format: Rp 1.234.567
✅ Borders & professional styling
✅ Auto-calculated totals
✅ Print-ready format

---

## 🚀 Cara Menggunakan

### Step 1: Generate RAB
```
1. Di dashboard, buka "RAB Calculator"
2. Masukkan data proyek
3. Klik "Generate RAB Otomatis" atau input manual
```

### Step 2: Lihat Grouped Display
```
1. Sistem auto-categorize items
2. Klik header kategori untuk expand/collapse
3. Item muncul dalam table per kategori
4. Subtotal otomatis calculate
```

### Step 3: Edit (Opsional)
```
1. Ubah volume → total update otomatis
2. Klik "Tim" untuk assign pekerja
3. Sistem calculate overhead & profit 
```

### Step 4: Export
```
1. Klik tombol "Excel"
   → File download dengan grouped structure
   
2. Atau klik "PDF"
   → PDF dengan format grouped
```

---

## 🎨 Kategori Otomatis

### Struktur (Bangunan Dasar)
```
Keywords: galian, pondasi, beton, pembesian, baja, kolom, balok, plat, struktur
Contoh: Galian Tanah, Beton Pondasi, Pembesian
```

### Dinding
```
Keywords: pasangan, bata, plesteran, dinding, mortar
Contoh: Pasangan Batu Bata, Plesteran Dinding
```

### Lantai
```
Keywords: keramik, granit, marmer, lantai, ubin
Contoh: Keramik Lantai, Granit Finishing
```

### Finishing
```
Keywords: pengecatan, cat, finishing, kaca, pintu, jendela, instalasi
Contoh: Pengecatan Dinding, Pintu Kayu
```

### Atap
```
Keywords: atap, genteng, roofing, talang
Contoh: Genteng Keramik, Talang Air
```

---

## 💡 Tips & Tricks

### ✅ Best Practices:

1. **Naming Convention**
   - Gunakan nama yang spesifik
   - Include jenis pekerjaan
   - Contoh BAIK: "Galian Tanah Pondasi"
   - Contoh BURUK: "Pekerjaan 1"

2. **Classification**
   - Sistem auto-classify based on keywords
   - Jika salah kategori, edit nama item
   - Tidak ada manual category picker (by design)

3. **Volume Input**
   - Format: angka desimal (contoh: 16.50)
   - Satuan jangan lupa (m3, m2, kg, dll)
   - Volume 0 = item tidak count

4. **Export Timing**
   - Export sebelum save ke database
   - Filename auto-date-stamp
   - One export = one file

### 📋 Export Quality:

- ✅ Sudah siap print & kirim ke klien
- ✅ Professional appearance
- ✅ Correct calculations
- ✅ Proper grouping
- ✅ ❌ NO flat table export (design requirement)

---

## 🔧 Troubleshooting

### ❓ Item tidak ter-group dengan benar?
**Solusi:** Edit nama item dengan keyword yang lebih spesifik
- Contoh: "Galian" → "Galian Tanah Pondasi"
- Sistem akan re-classify otomatis

### ❓ Subtotal tidak muncul?
**Solusi:** Pastikan ada item untuk kategori tersebut
- Kategori kosong: tidak muncul
- Tambah minimal 1 item per kategori

### ❓ Export Excel tidak grouped?
**Solusi:** Sistem design hanya export grouped format
- Jika masih flat: ada bug, lapor dev
- File harus grouped (requirement)

### ❓ Remember Me tidak bekerja?
**Solusi:** 
1. Clear browser cookies & localStorage
2. Enable Local Storage di browser
3. Logout sebelum update browser
4. Check browser private/incognito mode

---

## 📁 File-file Terkait

### Frontend:
- `src/utils/rabClassifier.ts` - Classification engine
- `src/components/rab/GroupedRABDisplay.tsx` - UI component
- `src/utils/exportUtils.ts` - Export logic
- `src/utils/calculations.ts` - Calculations helper

### Backend:
- `server/utils/exportGenerator.js` - Excel generation
- `server/utils/rabCalculator.js` - RAB calculations
- `server/controllers/export.js` - Export endpoints

---

## 🎓 Learning Path

1. **Understand Structure**
   - Read IMPLEMENTATION_GUIDE_V2.md
   - Review rabClassifier.ts

2. **Use the Feature**
   - Create RAB project
   - Export to Excel
   - Check grouping

3. **Customize** (Advanced)
   - Modify keywords in classifier
   - Add new categories
   - Change Excel styling

---

## 📞 Support & Feedback

System ini dirancang untuk:
- ✅ Professional RAB documents
- ✅ Automatic categorization  
- ✅ Grouped display & export
- ✅ Ready for client presentation

Jika ada pertanyaan atau issue:
1. Check classification logic di rabClassifier.ts
2. Review export format di exportUtils.ts
3. Test dengan sample data
4. Report dengan detail file name & category

---

**Version:** 2.0
**Last Updated:** April 2, 2026
**Status:** Production Ready ✅
