## 🚀 Quick Start - Development Setup

Untuk menjalankan aplikasi SIVILIZE-HUB PRO di development mode, ikuti langkah berikut:

### Prerequisites
- Node.js v16+ 
- npm atau yarn
- 2 terminal (untuk backend dan frontend)

---

## ⚙️ Backend Setup

### 1. Install Dependencies Backend
```bash
cd server
npm install
```

### 2. Setup Environment Variables
File `.env` sudah ada di `server/.env` dengan konfigurasi:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/sivilize_hub_pro
JWT_SECRET=your_jwt_secret_key_1234567890
NODE_ENV=development
```

**Catatan:** Backend berjalan dalam **Local Mode** tanpa MongoDB, menggunakan JSON file storage.

### 3. Run Backend Server
```bash
cd server
npm run dev
# atau
npm start
```

Backend akan berjalan di: **http://localhost:5000**

✅ Jika Anda lihat output:
```
Loading routes...
Auth routes loaded
Project routes loaded
AHSP routes loaded
...
Server running in development mode on port 5000
```

Berarti backend sudah berjalan dengan sempurna!

---

## 🎨 Frontend Setup

### 1. Install Dependencies Frontend (di root project)
```bash
npm install
```

### 2. Run Frontend Development Server
Buka terminal baru dan jalankan:
```bash
npm run dev
```

Frontend akan berjalan di: **http://localhost:5173**

✅ Anda akan melihat:
```
VITE v8.0.3  ready in 828 ms

  ➜  Local:   http://localhost:5173/
```

---

## 🔄 Full Setup (Backend + Frontend Bersamaan)

**Option 1: Terminal Terpisah**
1. Terminal 1 - Backend: 
   ```bash
   cd server && npm run dev
   ```

2. Terminal 2 - Frontend:
   ```bash
   npm run dev
   ```

**Option 2: Menggunakan Windows Batch Script**

Buat file `run-dev.bat` di root folder project:

```batch
@echo off
echo Starting SIVILIZE-HUB PRO Development Environment...
echo.

REM Create two new terminal instances
start "Backend Server" cmd /k "cd server && npm run dev"
timeout /t 2
start "Frontend Dev" cmd /k "npm run dev"

echo.
echo ✅ Both services started!
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
pause
```

Kemudian double-click file `run-dev.bat` untuk menjalankan keduanya.

---

## 🌐 Access the Application

1. Buka browser: **http://localhost:5173**
2. Seharusnya Anda lihat aplikasi SIVILIZE-HUB PRO
3. Jika ada error "Gagal menyambung ke server", pastikan:
   - ✅ Backend berjalan di port 5000
   - ✅ Frontend berjalan di port 5173
   - ✅ Tidak ada firewall yang memblokir localhost:5000

---

## 🔧 Troubleshooting

### Error: "Gagal menyambung ke server"

**Solusi:**
1. Pastikan backend sudah berjalan: `npm run dev` di folder `/server`
2. Cek port 5000 sudah terpakai:
   ```bash
   netstat -ano | find ":5000"
   ```
3. Kill process jika port sudah terpakai:
   ```bash
   taskkill /PID {PID_NUMBER} /F
   ```
4. Restart backend server

### Error: Module not found / Dependencies missing

**Solusi:**
```bash
# Backend
cd server && npm install

# Frontend  
npm install
```

### Port Already in Use

**Jika port 5000 sudah terpakai**, ubah di `server/.env`:
```env
PORT=5001  # atau port lain yang tersedia
```

Kemudian ubah juga di `src/services/api.ts`:
```typescript
const API_URL = 'http://localhost:5001/api';  // Ganti port di sini
```

---

## 📦 Build untuk Production

```bash
# Build frontend
npm run build

# Build akan ter-create di folder 'dist/'
```

---

## 📚 Project Structure

```
SIVILIZE-HUB-PRO/
├── server/              # Backend API (Node.js + Express)
│   ├── index.js
│   ├── config/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   └── .env
├── src/                 # Frontend (React + TypeScript + Vite)
│   ├── components/
│   ├── services/
│   ├── store/
│   ├── App.tsx
│   └── main.tsx
├── public/              # Static assets
└── package.json
```

---

## 🎯 Next Steps

After setup:
- 📖 Read [DEPLOYMENT.md](./DEPLOYMENT.md) untuk production deployment
- 🏗️ Mulai gunakan aplikasi di http://localhost:5173
- 💡 Lihat README.md untuk fitur detail

---

**Happy Building! 🏗️✨**
