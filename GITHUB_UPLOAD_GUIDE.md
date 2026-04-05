# 📤 Step-by-Step: Upload Backend ke GitHub (Web UI)

> **Estimated Time: 15 minutes total**
> **What you need:** GitHub account (free), browser

---

## 🔑 Step 1: Siapkan File Backend

Kumpulkan semua files dari folder backend Anda:
```
📁 c:\Users\AXIOO\Desktop\SIVILIZE - PUSAT PERADABAN (Origin Edition)\server\
   ├── 📄 index.js
   ├── 📄 package.json
   ├── 📄 localDb.json
   ├── 📁 config/
   ├── 📁 controllers/
   ├── 📁 middleware/
   ├── 📁 models/
   ├── 📁 routes/
   ├── 📁 utils/
   └── 📁 uploads/ (optional)
```

**Catatan:** Files ini siap upload, tidak perlu di-zip.

---

## 1️⃣ Create GitHub Repository

### A. Buka GitHub
```
1. Go to: https://github.com
2. Login dengan akun Anda
   (Jika belum ada akun, sign up terlebih dulu)
```

### B. Create New Repository
```
1. Click ➕ icon (top-right) → "New repository"
   OR buka: https://github.com/new

2. Fill form:
   📝 Repository name: sivilize-backend
   📝 Description: SIVILIZE Backend - RAB Construction Management
   ⭕ Visibility: Public (untuk Render bisa access)
   ☑️ Add README (optional)
   
3. Click: "Create repository" (hijau button)
```

**Result:** Anda akan di redirect ke repo baru yang kosong

---

## 2️⃣ Upload Backend Files

### A. Klik "Add file" Dropdown
```
Di halaman repo kosong, lihat button "Add file" (atas)
Klik dropdown → Select "Upload files"
```

### B. Upload Process

**Method 1: Drag & Drop**
```
1. Tab Explorer Anda: buka folder server locally
2. Pilih ALL files (Ctrl+A di server folder)
3. Drag ke GitHub upload area
4. Wait sampai upload selesai
```

**Method 2: Click to Browse**
```
1. Click "choose your files"
2. Navigate ke: c:\Users\AXIOO\Desktop\SIVILIZE - PUSAT PERADABAN (Origin Edition)\server
3. Select all files di folder ini
   - Ctrl+A untuk select semua
4. Click "Open"
5. GitHub akan start upload
```

### C. Organize Files (If Needed)

Jika ada folder-level files (config/, controllers/, etc):
```
Ada dua opsi:
1. Drag individual files satu-satu (tedious)
2. Create folder structure dulu, then drag files

Recommended: Jika terlalu banyak, gunakan:
👉 GitHub Desktop app (simpler UI)
atau
👉 GitHub CLI (geek way)
```

### D. Commit Message

GitHub akan minta commit message:
```
Message: "Initial backend commit" atau "Add SIVILIZE backend"
Description: "RAB calculator backend - auth, projects, export"
```

Click: **Commit changes** (hijau)

---

## ⏳ Wait for Upload Complete

GitHub akan:
1. Upload semua files
2. Process struktur folder
3. Create initial commit
4. Redirect ke repo page

**Estimated Time:** 2-5 menit depending on file size

---

## ✅ Verify Repository Created

Setelah upload complete:

```
Cek di: https://github.com/YOUR_USERNAME/sivilize-backend

Harusnya terlihat:
✅ Repo name: sivilize-backend
✅ Files listed: index.js, package.json, config/, dll
✅ Commit history: "Initial backend commit"
✅ "Code" tab menunjukkan file structure
```

**Copy repository URL:**
```
https://github.com/YOUR_USERNAME/sivilize-backend

(Ini perlu untuk Render.com nanti)
```

---

## 🎯 Next: Connect Render.com

Setelah Repository Created, proceed ke:

### 1. Open Render.com
```
1. Go to: https://render.com
2. Sign up dengan GitHub account (click "Sign up with GitHub")
3. Authorize Render to access GitHub
```

### 2. Create Web Service
```
1. Dashboard → "New" → "Web Service"
2. Select repository: sivilize-backend
```

### 3. Configure Service
```
⚠️ PENTING: Ini Backend Express, BUKAN Frontend!
Jangan gunakan "npm install; npm run build" 

SETTINGS:
Name: sivilize-backend

Environment: Node

BUILD COMMAND: npm install
(atau biarkan kosong - Render auto-run npm install)

START COMMAND: npm run dev
(atau: node index.js)

Instance Type: Free

👉 JANGAN centang "Enable auto-deploy on push" (optional)

Click: "Create Web Service" → Deploy akan start
```

⚠️ **PENTING - Backend vs Frontend:**
- Backend (Express): Hanya perlu `npm install` + `npm run dev`
- Frontend (Vite): Butuh `npm install; npm run build` + `npm run preview`

Kita deploy BACKEND, jadi ikuti setup di atas!

### 4. Get Backend URL
```
Setelah deploy selesai (~5-10 min):
- Dashboard akan show live URL
- Format: https://sivilize-backend.onrender.com

Copy URL ini untuk langkah berikutnya!
```

---

## 📝 Complete Checklist

- [ ] Step 1: Files prepared (server folder with all content)
- [ ] Step 2: GitHub repository created (sivilize-backend)
- [ ] Step 3: Files uploaded to GitHub
- [ ] Step 4: Commit verified (see files in repo)
- [ ] Step 5: Render.com connected
- [ ] Step 6: Web Service deployed
- [ ] Step 7: Backend URL copied (https://...onrender.com)
- [ ] Step 8: Ready for Vercel setup

---

## 🚨 Troubleshooting

### "Cannot upload files"
- Check internet connection
- GitHub might be slow, refresh page
- Try upload fewer files at once

### Folder structure not preserved
- GitHub might flatten some folders
- Solution: Upload ZIP instead (GitHub will extract)
- Or use GitHub Desktop app

### Render.com shows error during deploy
- Common cause: Missing dependency
- Check: package.json harus lengkap
- Solution: Update package.json manually in GitHub, re-deploy

### Can't authorize Render with GitHub
- Sign out dari GitHub first
- Clear browser cookies
- Try again with fresh login

---

## ✅ Final Result

```
SETELAH SEMUANYA SELESAI:

Frontend ✅ Live on: https://sivilize-hub-pro.vercel.app
Backend  ✅ Live on: https://sivilize-backend.onrender.com

NEXT STEP:
1. Copy backend URL
2. Add to Vercel environment (VITE_API_URL)
3. Redeploy frontend
4. Test production integration
5. DONE! 🎉
```

---

**Sudah siap mulai? Kunjungi: https://github.com/new untuk create repo! 🚀**

Kalau ada pertanyaan atau stuck, let me know!
