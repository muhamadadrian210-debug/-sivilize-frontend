## 🔴 ERROR YANG DIPERBAIKI

### Masalah: "Gagal menyambung ke server. Pastikan backend server berjalan."

---

## ✅ Solusi yang Dilakukan

### 1. **Enable Backend Database Connection** ✔️
- **Masalah:** `connectDB()` di-comment di `server/index.js`
- **Solusi:** Uncomment function `connectDB()` agar backend dapat menjalankan routes dengan benar
- **File:** `server/index.js` line 65

### 2. **Setup Environment Variables** ✔️
- **File:** `server/.env` sudah dikonfigurasi dengan:
  - `PORT=5000` - Port untuk backend server
  - `JWT_SECRET` - Secret key untuk JWT authentication
  - `NODE_ENV=development` - Development mode
  - `MONGODB_URI` - Database connection (Local Mode)

### 3. **Backend Server Configuration** ✔️
- Backend menggunakan **Local Mode** tanpa MongoDB
- Menggunakan JSON file-based storage (`server/localDb.json`)
- CORS sudah ter-enable untuk komunikasi frontend-backend

### 4. **Startup Scripts** ✔️
- Created `SETUP.md` - Panduan lengkap setup development
- Created `run-dev.bat` - Batch script untuk menjalankan backend & frontend

---

## 🚀 Cara Menjalankan Aplikasi

### **Opsi 1: Menggunakan Batch Script (Paling Mudah)**

1. Navigate ke folder project
2. Double-click file `run-dev.bat`
3. Tunggu kedua terminal muncul
4. Buka browser ke `http://localhost:5173`

---

### **Opsi 2: Terminal Manual**

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Buka browser: `http://localhost:5173`

---

## 🔍 Verifikasi Setup

### Backend Running Check:
```bash
Backend akan menampilkan:
✓ Loading routes...
✓ Auth routes loaded
✓ Project routes loaded
✓ Server running in development mode on port 5000
```

### Frontend Running Check:
```bash
Frontend akan menampilkan:
✓ VITE v8.0.3 ready in 828 ms
✓ Local: http://localhost:5173/
```

---

## 📋 Port Configuration

- **Backend:** `http://localhost:5000/api`
- **Frontend:** `http://localhost:5173`

**Jika port sudah terpakai:**
```bash
# Ubah di server/.env
PORT=5001

# Ubah juga di src/services/api.ts line 3
const API_URL = 'http://localhost:5001/api';
```

---

## 🛠️ Troubleshooting

### ❌ Error: Port 5000 sudah terpakai
```bash
# Check process menggunakan port 5000
netstat -ano | find ":5000"

# Kill process
taskkill /PID {PID} /F

# Atau gunakan port berbeda di .env
```

### ❌ Error: npm command not found
- Install Node.js dari https://nodejs.org/
- Restart terminal/IDE

### ❌ Error: Module not found
```bash
cd server && npm install
cd ..
npm install
```

### ❌ Still seeing "Gagal menyambung ke server" error?

**Debugging steps:**

1. **Pastikan backend berjalan:**
   ```bash
   curl http://localhost:5000/
   ```
   Should return: `{"success":true,"message":"Welcome to Sivilize Hub Pro API"}`

2. **Check browser console (F12):**
   - Lihat Network tab untuk failed requests ke localhost:5000
   - Lihat Console tab untuk JavaScript errors

3. **Restart semua:**
   - Close semua terminals
   - Run `run-dev.bat` lagi
   - Clear browser cache (Ctrl+Shift+Delete)
   - Refresh page (F5)

---

## 📊 Application Architecture

```
Frontend (Vite + React + TypeScript)
    ↓ API Calls (axios)
    ↓
Backend (Node.js + Express)
    ├── Routes (Auth, Projects, AHSP, etc.)
    ├── Controllers (Business logic)
    └── Local Storage (JSON file)
```

---

## ✨ Status

✅ **Backend:** Configured & Running
✅ **Frontend:** Configured & Running  
✅ **CORS:** Enabled
✅ **API Communication:** Ready

Aplikasi siap digunakan! 🚀

---

**Questions? Check SETUP.md for detailed instructions.**
