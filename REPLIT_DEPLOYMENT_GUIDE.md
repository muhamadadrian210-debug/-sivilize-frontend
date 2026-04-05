# 🚀 Deploy Backend ke Replit

> **Waktu Estimasi: 10 menit**
> **Yang Anda butuhkan:** GitHub account, browser

---

## 📋 Pre-requisite: Upload ke GitHub Dulu

> ⚠️ Jika belum upload backend ke GitHub, lakukan dulu!
> Lihat: GITHUB_UPLOAD_GUIDE.md

Pastikan Anda sudah punya:
- ✅ GitHub repository: `https://github.com/YOUR_USERNAME/sivilize-backend`
- ✅ Semua backend files terupload
- ✅ Repository berstatus PUBLIC

---

## 🔑 Step 1: Masuk ke Replit.com

### A. Buka Replit
```
1. Go to: https://replit.com
```

### B. Sign Up dengan GitHub
```
1. Klik tombol "Sign up"
2. Pilih "Continue with GitHub"
3. Arahan GitHub: Authorize Replit
4. Klik "Authorize replit"
```

**Hasil:** Anda sekarang login ke Replit dengan akun GitHub

---

## 🎯 Step 2: Create Replit dari GitHub Repo

### A. Import dari GitHub

```
1. Di Replit dashboard, cari tombol "Create" atau "Import"
2. Pilih opsi "Import from GitHub"
3. Akan muncul modal untuk GitHub authorization (klik "Authorize" jika diminta)
```

### B. Pilih Repository

```
1. Di list repo, cari: sivilize-backend
2. Klik untuk select
3. Replit akan auto-detect project type sebagai Node.js
4. Klik "Import" (hijau button)
```

**Hasil:** Replit akan clone repo dan buat project baru

⏳ **TUNGGU:** Replit processing file (~1-2 menit)

---

## ⚙️ Step 3: Setup Run Configuration

Setelah repo ter-import, Replit akan ask untuk "Run" command.

### A. Set Run Command

```
IMPORTANT: Backend ini adalah Express, bukan frontend!

Di box "Run", pastikan isi dengan:
  npm run dev

atau alternatif:
  node index.js

Pilih SALAH SATU saja!
```

### B. Klik "Done"

Replit akan start menjalankan index.js atau npm run dev.

---

## 🌐 Step 4: Get Replit Live URL

Setelah aplikasi running:

```
1. Lihat panel sebelah kanan (biasanya ada preview window)
2. Di atas preview, ada URL yang terlihat seperti:
   https://sivilize-backend.replit.dev
   atau
   https://[RANDOM-ID].replit.dev

3. Copy URL ini!
   ⚠️ PENTING: Gunakan URL ini untuk setup Vercel!
```

### Jika Preview Tidak Muncul

```
1. Klik tombol "Show new webview" (di panel kanan)
   atau
2. Di terminal, Replit biasanya show:
   "Server running at: https://[URL].replit.dev"
   
Gunakan URL itu!
```

---

## 📝 Step 5: Verify Backend Working

### A. Test di Replit Console

```
1. Open terminal di Replit (sudah terbuka biasanya)
2. Jika tidak running, ketik:
   npm run dev
   atau
   node index.js

3. Harusnya terlihat: "Server running on port 5000"
   atau "Listening on http://localhost:5000"
```

### B. Test API Endpoint

```
1. Open di browser baru:
   https://[REPLIT-URL]/api/auth/register

   (Ganti [REPLIT-URL] dengan URL Anda, misal: https://sivilize-backend.replit.dev)

2. Harusnya menerima POST request
   Jika ada error 405 (Method Not Allowed), itu NORMAL untuk GET
   - Hanya POST yang diterima di endpoint ini
```

---

## 🔗 Step 6: Setup Vercel Environment Variable

Sekarang kita update Vercel dengan backend URL Replit.

### A. Buka Vercel Dashboard

```
1. Go to: https://vercel.com/dashboard
2. Login dengan GitHub account Anda
```

### B. Select Project: sivilize-hub-pro

```
1. Cari project "sivilize-hub-pro" di list
2. Klik untuk buka project settings
```

### C. Klik "Settings"

Di top navigation, ada tab:
- Deployments
- **Settings** ← Klik sini
- Analytics
- dll

### D. Cari "Environment Variables"

```
Di Settings page, scroll ke bawah sampai ketemu section:
"Environment Variables"

Klik "Add" atau "New Environment Variable"
```

### E. Tambah Variable

```
Isi field:
  Name:  VITE_API_URL
  Value: https://[REPLIT-URL]/api
  
Contoh:
  Name:  VITE_API_URL
  Value: https://sivilize-backend.replit.dev/api

⚠️ PENTING: 
- Jangan lupa "/api" di akhir!
- Jangan include "{}" atau quotes

Klik "Save" (tombol apa pun yang blue/hijau)
```

---

## 🔄 Step 7: Redeploy Frontend di Vercel

Setelah env var ditambah, kita perlu redeploy frontend.

### A. Buka Deployments Tab

```
Di project Vercel, klik tab "Deployments"
Akan terlihat list semua deployment sebelumnya
```

### B. Re-deploy

Cari recent deployment (paling atas), klik dropdown (3 dots) → "Redeploy"

atau

```
Bisa juga dari root folder terminal:
  vercel --prod --yes
```

⏳ **TUNGGU:** Vercel build dan deploy (~2-3 menit)

---

## ✅ Step 8: Test Production

Setelah Vercel redeploy selesai:

```
1. Buka: https://sivilize-hub-pro.vercel.app
2. Coba fitur: Register → Login → Buat Project → Export
3. Buka DevTools (F12) → Console tab
4. Cek: Tidak ada error merah tentang "Cannot reach backend"
5. Response dari backend = Koneksi berhasil!
```

---

## 🎉 Checklist Complete

- [ ] Step 1: Login ke Replit dengan GitHub
- [ ] Step 2: Import sivilize-backend repo
- [ ] Step 3: Set run command (`npm run dev`)
- [ ] Step 4: Copy Replit URL (https://...replit.dev)
- [ ] Step 5: Backend tested dan running
- [ ] Step 6: VITE_API_URL set di Vercel
- [ ] Step 7: Vercel redeployed
- [ ] Step 8: Production integration working

**Status: SEMUANYA SELESAI? 🎊**

---

## 🚨 Troubleshooting

### "Server tidak running di Replit"
```
- Lihat console/logs
- Run manual: npm run dev
- Jika ada error, screenshot dan share di chat
```

### "Cannot reach backend dari Vercel"
```
- Check VITE_API_URL di Vercel settings
- Pastikan URL benar dan include /api
- Buka DevTools (F12) → Network tab
- Cek request ke /api/auth/register
- Status 200 = OK, 0 atau error = masalah koneksi
```

### "Replit keeps stopping after 1 hour"
```
- Ini normal di free tier Replit
- Untuk unlimited uptime: Upgrade ke Paid
- Alternatif: Gunakan Render.com (lebih stable)
```

### "Cannot authorize Replit dengan GitHub"
```
- Logout dari GitHub
- Clear cookies browser
- Coba lagi
- Atau manual import repo bukan from GitHub
```

---

## 📊 Final Architecture

```
┌─────────────────────────────────────┐
│ Frontend LIVE ✅                    │
│ https://sivilize-hub-pro.vercel.app │
│ (React + TypeScript + Vite)         │
└──────────────┬──────────────────────┘
               │
               ↓ API Request
               │ (VITE_API_URL)
               │
┌──────────────────────────────────────┐
│ Backend LIVE ✅                      │
│ https://[ID].replit.dev              │
│ (Express + Node.js)                  │
│ Database: localDb.json               │
└──────────────────────────────────────┘
```

---

## 🎯 Apa Selanjutnya?

Setelah semuanya live dan integrated:

1. **Monitor**: Backend berjalan 24/7? Cek Replit console
2. **Data**: Semua data tersimpan di localDb.json (Replit file storage)
3. **Scalability**: Jika traffic besar, upgrade ke Render/Railway
4. **Backup**: Backup localDb.json secara berkala

---

**Siap deploy? Mulai di Step 1! 🚀**

Kalau ada masalah atau pertanyaan, screenshot dan share! 💬

