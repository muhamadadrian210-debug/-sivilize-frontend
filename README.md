# 🏗️ SIVILIZE-HUB PRO - Professional RAB System

> **Sistem RAB Rumah Tinggal Berbasis AHSP/SNI Standar Nasional Indonesia**
> 
> Professional Construction Budget Calculator with Grouped Structure

## 🌟 Live Demo

🔗 **[https://sivilize-hub-pro.vercel.app](https://sivilize-hub-pro.vercel.app)**

## 📋 About Project

SIVILIZE-HUB PRO adalah aplikasi web profesional untuk perhitungan Rencana Anggaran Biaya (RAB) konstruksi yang mengacu pada standar AHSP/SNI Indonesia. Aplikasi ini dirancang khusus untuk kontraktor, developer, dan pemilik bangunan yang membutuhkan perhitungan biaya konstruksi yang akurat dan profesional.

## ✨ Key Features

### 🏗️ **4 Kategori Utama**
- **Struktur** - Pondasi, kolom, balok, plat, pembesian
- **Dinding** - Bata, plester, acian, tembok
- **Lantai** - Keramik, granit, penutup lantai
- **Finishing** - Cat, kusen, atap, plumbing, listrik, persiapan

### 📊 **Grouped Structure System**
- ✅ Auto-classification pekerjaan per kategori
- ✅ Tabel terpisah per kategori (A, B, C, D)
- ✅ Subtotal otomatis per kategori
- ✅ Grand total dengan breakdown PPN, Profit, Biaya Tidak Terduga
- ✅ Validasi structure (anti-flat list)

### 📤 **Export Professional**
- 📊 **Excel Export** - Multi-sheet dengan grouped structure
- 📄 **PDF Export** - Format RAB profesional siap presentasi
- 🔄 Real-time calculation dengan AHSP/SNI standards

### 🎯 **Advanced Features**
- 📐 Input data proyek lengkap (luas, tipe, lokasi)
- ⏱️ Estimasi waktu pengerjaan otomatis
- 👥 Perhitungan tenaga kerja (mandor, tukang, kenek)
- 🏗️ Volume calculator berdasarkan standar konstruksi
- 💰 Harga material per wilayah Indonesia
- 📱 Responsive design untuk mobile & desktop

## 🛠️ Technology Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: TailwindCSS + Framer Motion
- **Export**: XLSX + jsPDF + html2canvas
- **Icons**: Lucide React
- **State**: Zustand
- **Deployment**: Vercel

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0

### Installation
```bash
# Clone the repository
git clone https://github.com/muhamadadrian/sivilize-hub-pro.git
cd sivilize-hub-pro

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to Vercel
npm run deploy
```

### Development
```bash
# Start local development server
npm run dev

# Open http://localhost:5174
```

### Production Build
```bash
# Build optimized production version
npm run build

# Preview production build
npm run preview
```

## 📱 Usage

### 1. Input Data Proyek
- Nama proyek
- Tipe rumah (36-72m², 72-120m², 120-200m²)
- Luas bangunan (m²)
- Jumlah lantai, kamar tidur, kamar mandi
- Lokasi provinsi

### 2. Hitung RAB
- Klik tombol "Hitung RAB"
- Sistem otomatis menghitung:
  - Volume pekerjaan per kategori
  - Kebutuhan material (semen, pasir, batu, besi, dll)
  - Biaya tenaga kerja
  - Estimasi waktu pengerjaan

### 3. Export Hasil
- **Excel**: Multi-sheet dengan grouped structure
- **PDF**: Format RAB profesional siap presentasi
- **Simpan**: Simpan proyek untuk akses kembali

## 📊 RAB Structure

### Format Output (Grouped Structure)
```
A. STRUKTUR
┌─────┬─────────────────────┬────────┬────────┬─────────────┬──────────┐
│ No  │ Uraian Pekerjaan   │ Volume │ Satuan  │ Harga Satuan│ Total    │
├─────┼─────────────────────┼────────┼────────┼─────────────┼──────────┤
│ 1   │ Galian Tanah       │ 21.60  │ m³     │ Rp 75.000   │ Rp 1.620.000│
│ 2   │ Pondasi Batu       │ 10.80  │ m³     │ Rp 85.000   │ Rp 918.000│
└─────┴─────────────────────┴────────┴────────┴─────────────┴──────────┘
                    SUBTOTAL STRUKTUR: Rp 2.682.000

B. DINDING
┌─────┬─────────────────────┬────────┬────────┬─────────────┬──────────┐
│ No  │ Uraian Pekerjaan   │ Volume │ Satuan  │ Harga Satuan│ Total    │
├─────┼─────────────────────┼────────┼────────┼─────────────┼──────────┤
│ 1   │ Pasangan Bata Merah │ 252.00 │ m²     │ Rp 65.000   │ Rp 16.380.000│
│ 2   │ Plesteran Dinding  │ 252.00 │ m²     │ Rp 40.000   │ Rp 10.080.000│
└─────┴─────────────────────┴────────┴────────┴─────────────┴──────────┘
                      SUBTOTAL DINDING: Rp 34.020.000

GRAND TOTAL: Rp 161.728.393
```

## 🏗️ AHSP/SNI Standards

Aplikasi mengacu pada standar:
- **AHSP** (Analisa Harga Satuan Pekerjaan)
- **SNI** (Standar Nasional Indonesia)
- **Volume koefisien** berdasarkan praktik konstruksi
- **Harga material** per wilayah Indonesia
- **Upah tenaga kerja** standar kontraktor

## 🌐 Deployment

### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
vercel --prod

# Or use npm script
npm run deploy
```

### Environment Variables
```bash
VITE_API_URL=https://your-api-url.com
NODE_ENV=production
```

## 📁 Project Structure

```
sivilize-hub-pro/
├── src/
│   ├── App.jsx              # Main application component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── public/                  # Static assets
├── dist/                   # Build output
├── vercel.json             # Vercel configuration
├── .vercelignore           # Vercel ignore file
└── package.json            # Dependencies
```

## 🔧 Configuration

### Vercel Configuration
```json
{
  "version": 2,
  "name": "sivilize-hub-pro",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Muhamad Adrian**
- 📧 Email: muhamadadrian210@gmail.com
- 📱 WhatsApp: 081338219957
- 🌐 Website: https://sivilize-hub-pro.vercel.app
- 📍 Location: Kupang, NTT, Indonesia

## 🙏 Acknowledgments

- AHSP/SNI Standar Nasional Indonesia
- React Community
- Vercel Platform
- TailwindCSS Team

## 📞 Support

For support, please contact:
- 📧 Email: muhamadadrian210@gmail.com
- 📱 WhatsApp: 081338219957
- 🌐 Live Demo: https://sivilize-hub-pro.vercel.app

---

**⭐ If this project helps you, please give it a star!**

**🚀 Built with ❤️ for Indonesian Construction Industry**
