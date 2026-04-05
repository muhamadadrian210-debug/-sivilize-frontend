# 🚀 Panduan Setup Backend URL di Vercel

> **Status:** Frontend live, Backend running lokal, Backend URL pending

## 📋 3 Pilihan Setup Backend

### **PILIHAN 1: Deploy Backend ke Render.com (⭐ REKOMENDASI)**

**Keuntungan:** Permanen, gratis, auto-deploy

#### Langkah 1: Push Backend ke GitHub

```bash
# Di folder backend/server/
git init
git add .
git commit -m "Initial backend"
git remote add origin https://github.com/YOUR_USERNAME/sivilize-backend.git
git push -u origin main
```

#### Langkah 2: Sign Up Render.com
- Buka: https://render.com
- Login dengan GitHub
- Authorize Render

#### Langkah 3: Create Web Service
1. Dashboard → **New** → **Web Service**
2. Select `sivilize-backend` repo
3. Fill settings:
   - **Name:** `sivilize-backend`
   - **Environment:** Node
   - **Build:** `npm install`
   - **Start:** `npm run dev` atau `node index.js`
   - **Plan:** Free

4. Deploy (tunggu 5-10 menit)

#### Langkah 4: Copy Backend URL
Dashboard Render → Dapatkan URL: `https://sivilize-backend.onrender.com`

#### Langkah 5: Update Vercel
```
VITE_API_URL=https://sivilize-backend.onrender.com/api
```

---

### **PILIHAN 2: Gunakan ngrok (Instan, Lokal)**

**Keuntungan:** Cepat, tidak perlu deploy, direct tunnel

#### Langkah 1: Download ngrok
- Buka: https://ngrok.com/download
- Download → Extract di folder manapun
- Jalankan: `ngrok http 5000`

#### Langkah 2: Copy Public URL
Output akan seperti:
```
Forwarding   https://xxxxx-xxxxx.ngrok-free.app -> http://localhost:5000
```

#### Langkah 3: Update Vercel
```
VITE_API_URL=https://xxxxx-xxxxx.ngrok-free.app/api
```

⚠️ **Note:** URL berubah setiap restart ngrok (free tier)

---

### **PILIHAN 3: Localhost Dev (Untuk Testing Only)**

```
VITE_API_URL=http://localhost:5000/api
```

❌ **Hanya buat localhost testing saja - TIDAK bisa untuk production!**

---

## 🎯 Setup di Vercel Dashboard

### Langkah 1: Kunjungi Vercel Dashboard
https://vercel.com/dashboard

### Langkah 2: Buka Project `sivilize-hub-pro`
Click → Settings Tab

### Langkah 3: Environment Variables
1. Click **Environment Variables** (sidebar kiri)
2. Add New: **VITE_API_URL**
3. Value: `https://your-backend-url/api` (sesuai pilihan di atas)
4. Select Environments: **Production**
5. Save

### Langkah 4: Redeploy
1. Go to **Deployments** tab
2. Find latest deployment
3. Click **3 dots** → **Redeploy**
4. Tunggu 3-5 menit

### Langkah 5: Open dan Test
- Buka: https://sivilize-hub-pro.vercel.app
- Try Register/Login
- Check Browser Console (F12) untuk errors

---

## ✅ Verification Checklist

- [ ] Backend URL copied
- [ ] Environment variable added to Vercel
- [ ] Vercel redeployed
- [ ] Frontend loads (sivilize-hub-pro.vercel.app)
- [ ] Register new user works
- [ ] Login with registered user works
- [ ] Create RAB project works
- [ ] Export to Excel works
- [ ] AI Assistant (jika enabled) bekerja
- [ ] Multilingual (EN/ID) berfungsi

---

## 🔧 Testing Endpoints

```bash
# Test backend health
curl https://your-backend-url/api/health

# Register user
curl -X POST https://your-backend-url/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Test",
    "email": "test@test.com",
    "password": "Test123!"
  }'

# Login
curl -X POST https://your-backend-url/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@test.com",
    "password": "Test123!"
  }'
```

---

## 📊 Deployment Status

| Component | Status | URL |
|-----------|--------|-----|
| Frontend | ✅ Live | https://sivilize-hub-pro.vercel.app |
| Backend | ✅ Running | http://localhost:5000 |
| Backend Public | ⏳ Setup | Pilih dari 3 opsi di atas |
| Database | ✅ JSON | Local storage |
| AI (Optional) | ✅ Ready | Claude API support |

---

## 🆘 Troubleshooting

### "Connection refused" at frontend
- Backend tidak public (belum setup pilihan 1-2)
- Update VITE_API_URL di Vercel
- Redeploy frontend

### "401 Unauthorized"
- Token tidak valid
- Clear localStorage di browser (F12 → Application)
- Try login ulang

### ngrok URL keeps changing
- Free tier ngrok URL berubah setiap restart
- Upgrade ke ngrok pro, atau gunakan Render.com

###Backend tidak respond
- Check backend running: `npm run dev` di server folder
- Check port 5000 terbuka

---

**Sudah siap? Mana pilihan yang ingin digunakan?**
- Option 1: Render.com (rekomendasi) ⭐
- Option 2: ngrok (cepat)
- Option 3: Test lokal

**Saya siap setup apakah yang dipilih! 🚀**
