# ⚠️ PENTING: Backend vs Frontend Build Commands

> Penjelasan perbedaan build command untuk Backend EXPRESS vs Frontend VITE

---

## 🔴 Masalah yang Mungkin Terjadi

Saat setup di Render.com, mungkin Anda lihat form ini dengan default values:

```
Build Command: npm install; npm run build
Start Command: npm start
```

⚠️ **INI TIDAK TEPAT untuk Backend Express!**

Ini adalah template default Render untuk **full-stack projects**, bukan untuk backend only.

---

## ✅ Yang BENAR untuk Backend SIVILIZE

Render form harus diisi seperti ini:

```
✅ BUILD COMMAND:    npm install
   (atau biarkan kosong)

✅ START COMMAND:    npm run dev
   (atau: node index.js)
```

**Jangan gunakan:** `npm install; npm run build`

---

## 📊 Perbandingan: Backend vs Frontend

| Aspek | Backend (Express) | Frontend (Vite) |
|-------|------|------|
| **Bahasa** | Node.js | React/TypeScript |
| **Build Command** | ❌ Tidak perlu | ✅ npm run build |
| **Start Command** | ✅ npm run dev | ❌ npm run preview |
| **Output** | Server berjalan | dist/ folder created |
| **Render Build** | npm install | npm install; npm run build |
| **Render Start** | npm run dev | npm run preview atau npx serve dist |

---

## 🎯 Jika Sudah Setup Salah di Render

### Gejala:
```
Render kelihatan deploy berhasil, tapi:
❌ Backend tidak accessible
❌ Error: "Start command failed"
❌ "Cannot find module build"
```

### Solusi:

**Step 1: Pergi ke Render Dashboard**
```
https://render.com/dashboard
```

**Step 2: Buka sivilize-backend Service**
```
Click: sivilize-backend di dashboard
```

**Step 3: Go to Settings**
```
Tab: Settings (kanan atas)
```

**Step 4: Update Build & Start Command**
```
EDIT:
  Build Command FROM: npm install; npm run build
  Build Command TO:   npm install
  
  Start Command FROM: npm start
  Start Command TO:   npm run dev
  
Save → Re-deploy
```

**Step 5: Trigger Re-deployment**
```
Tab: "Manual Deploy" atau "Deployments"
Click: "Deploy latest" / "Redeploy"
Wait for build finish (~5-10 min)
```

**Step 6: Check Status**
```
Look for green "Live" indicator
If error, check Build logs (click "View logs")
```

---

## 🔍 Checking Build Logs in Render

Jika ada error pada deploy:

```
1. Dashboard → sivilize-backend
2. Tab: "Logs" (atau scroll down)
3. Look for:
   ✅ "Running build command..."
   ✅ "Build succeeded"
   ✅ "Starting process with command: npm run dev"
   ✅ "Server running on port 10000" (Render internal)
   
❌ Common errors:
   "npm: command not found" → Node.js not installed
   "Cannot find module" → package.json missing
   "EADDRINUSE" → Port conflict
```

---

## 📝 Your Backend's package.json Scripts

Verify your server/package.json has these scripts:

```json
{
  "scripts": {
    "dev": "nodemon index.js",
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^5.2.1",
    "dotenv": "^17.3.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.1.2"
  }
}
```

✅ If `npm run dev` exists → Render will work
❌ If not → Need to update package.json

---

## ✅ Correct Setup Summary

### For SIVILIZE Backend on Render:

```
Build Command:  npm install
Start Command:  npm run dev
```

### NOT:

```
❌ npm install; npm run build
❌ npm install; npm start  
❌ npm run build
```

---

## 🚨 If Deploy Still Fails

**Checklist:**
- [ ] package.json exists di repo root
- [ ] "npm run dev" works locally
- [ ] All dependencies in package.json (no missing libraries)
- [ ] index.js exists dan bisa diakses
- [ ] Env variables set (if needed) → Render Settings
- [ ] Repo is PUBLIC (Render needs access)

**If still stuck:**
1. Check render logs for exact error message
2. Try: Delete service + recreate
3. Or: Deploy locally first to verify everything works

---

**Sekarang sudah benar? Cek Render dashboard dan pastikan setting sudah diperbaiki! ✅**
