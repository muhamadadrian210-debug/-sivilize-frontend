# 🚀 Quick Deploy Render.com - Manual Steps

> Karena Git tidak tersedia lokal, berikut cara deploy backend ke Render.com:

---

## Metode 1: Push via GitHub Web UI (Tercepat)

### 1️⃣ Create GitHub Repository

1. Go to: https://github.com/new
2. Create repo: `sivilize-backend` (atau nama lain)
3. Click **Create repository**

### 2️⃣ Upload Backend Files

1. Di GitHub repo baru, click **Add file** → **Upload files**
2. Navigate ke: `c:\Users\AXIOO\Desktop\SIVILIZE - PUSAT PERADABAN (Origin Edition)\server`
3. Pilih SEMUA files:
   - `index.js`
   - `package.json`
   - `localDb.json`
   - `config/`, `controllers/`, `middleware/`, `models/`, `routes/`, `utils/` folders
4. Click **Commit changes**

### 3️⃣ Connect Render.com

1. Go to: https://render.com (signup with GitHub)
2. Dashboard → **New** → **Web Service**
3. Authorize & select `sivilize-backend` repo
4. Settings:
   - **Name:** `sivilize-backend`
   - **Environment:** Node
   - **Build:** `npm install`
   - **Start:** `npm run dev`
   - **Plan:** Free
5. Deploy!

### 4️⃣ Get Backend URL

Render dashboard → Copy URL: `https://sivilize-backend.onrender.com`

---

## Metode 2: ZIP Upload (Jika GitHub tidak mau)

### 1️⃣ Buat ZIP File

```bash
# Di Windows Explorer:
C:\Users\AXIOO\Desktop\SIVILIZE - PUSAT PERADABAN (Origin Edition)\server\
klik kanan → Send to → Compressed folder
# Hasilnya: server.zip
```

### 2️⃣ Create Render.com via Upload

1. Go to: https://render.com
2. Dashboard → **New** → **Web Service**
3. Di section "Deploy code", pilih:
   - **Provide a GitHub, GitLab, or Bitbucket repository URL** → Tidak bisa zip
   
⚠️ Render.com butuh GitHub repo, tidak support ZIP direct.

---

## ✅ Recommended: Metode 1 (GitHub Web UI)

**Total waktu: ~10 menit**

1. ✅ Create GitHub repo (1 min)
2. ✅ Upload backend files (3 min)
3. ✅ Connect to Render (2 min)
4. ✅ Wait deployment (5-10 min)
5. ✅ Get public URL

**Setelah dapat URL dari Render, kembali ke VITE_API_URL setup:**

```
VITE_API_URL=https://sivilize-backend.onrender.com/api
```

---

**Siap? Atau Anda prefer saya bantu step-by-step?** 🚀
