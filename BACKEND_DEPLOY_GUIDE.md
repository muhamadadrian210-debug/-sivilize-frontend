# 📘 Panduan Deploy Backend ke Render.com (Cloud)

> ✅ **Rekomendasi:** Deploy backend ke Render.com - gratis, otomatis, tidak perlu setup local

## 🚀 Langkah-langkah Deploy Backend ke Render.com

### 1️⃣ Siapkan Repository Backend di GitHub

```bash
# Di folder server/
git init
git add .
git commit -m "Initial backend commit"
```

Atau push ke GitHub repo baru:
```bash
git remote add origin https://github.com/YOUR_USERNAME/sivilize-backend.git
git branch -M main
git push -u origin main
```

### 2️⃣ Daftar di Render.com

- Buka: https://render.com
- Sign up dengan GitHub
- Authorize Render untuk access repo Anda

### 3️⃣ Create Web Service di Render

1. Dashboard Render → **New +** → **Web Service**
2. Connect GitHub → pilih repo `sivilize-backend`
3. Fill form:
   - **Name:** `sivilize-backend` (atau custom)
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run dev` atau `node index.js`
   - **Plan:** Free (oke untuk development)

4. Click **Create Web Service** → tunggu 3-5 menit

### 4️⃣ Dapatkan Backend URL

Public URL akan ada di format: `https://sivilize-backend.onrender.com`

### 5️⃣ Update Environment Variable di Vercel

```bash
# Frontend di Vercel
VITE_API_URL=https://your-service.onrender.com/api
```

1. Buka: https://vercel.com/dashboard
2. Click `sivilize-hub-pro` → **Settings**
3. **Environment Variables**
4. Add: `VITE_API_URL` = `https://sivilize-backend.onrender.com/api`
5. Save
6. Go to **Deployments** → Redeploy latest

### 6️⃣ Test Koneksi

```bash
# Test backend health
curl https://your-service.onrender.com/api/health

# Test dari frontend
# Cek browser console untuk network requests
```

---

## ⚡ Alternatif: Setup Lokal + Test

Jika mau test dulu sebelum deploy, gunakan ini:

### Localhost Dev Testing
```bash
# Terminal 1: Backend
cd server && npm run dev
# http://localhost:5000

# Terminal 2: Frontend
npm run dev
# http://localhost:5173
```

Ubah frontend `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

### Lalu Deploy Production
Setelah tested lokal, deploy ke Render dan update VITE_API_URL di Vercel.

---

## 📋 Checklist Deploy Backend Cloud

- [ ] Siap GitHub repo backend
- [ ] Create account Render.com
- [ ] Create Web Service di Render
- [ ] Dapatkan public URL
- [ ] Update VITE_API_URL di Vercel
- [ ] Redeploy frontend Vercel
- [ ] Test login/register
- [ ] Test project creation
- [ ] Test Excel export
- [ ] Test AI assistant

---

## 🎯 Timeline

| Step | Waktu | Notes |
|------|-------|-------|
| GitHub Setup | 5 menit | Push code ke GitHub |
| Render Signup | 2 menit | Daftar + authorize |
| Create Service | 1 menit | Fill form |
| Build & Deploy | 5-10 menit | Render auto-build |
| Backend URL | - | Copy dari Render dashboard |
| Update Vercel | 2 menit | Add environment variable |
| Vercel Redeploy | 5 menit | Auto-redeploy |
| **Total** | **~25 menit** | Backend cloud-ready ✅ |

---

**Siap mulai? Saya bantu setup Render.com! 🚀**
