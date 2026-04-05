# 🚂 Deploy Backend ke Railway.app (Better Alternative!)

> **Recommended: Railway.app - Simpler, NO Credit Card Required (initially)**

---

## ✅ Keuntungan Railway vs Render

| Feature | Railway | Render |
|---------|---------|--------|
| **No CC Required** | ✅ (Free $5 credits) | ❌ Wajib CC |
| **Ease of Use** | ✅ Very simple | ⏳ Complex |
| **Free Tier** | ✅ $5/mo credits | ✅ Free but limited |
| **Cold Start** | ✅ No sleep | ❌ Auto sleep 15min |
| **Support** | ✅ Good | ✅ Good |
| **Indonesia-friendly** | ✅ Yes | ✅ Yes |

---

## 🎯 Step-by-Step: Deploy ke Railway

### 1️⃣ Sign Up Railway

1. Buka: https://railway.app
2. Click **"Start for Free"**
3. Pilih: **Sign up with GitHub**
4. Authorize Railway
5. ✅ Done! No CC needed

---

### 2️⃣ Create New Project

1. Railway Dashboard → Click **"New Project"**
2. Select: **"Deploy from GitHub"**
3. Authorize GitHub repo access
4. Select repo: `sivilize-backend`

---

### 3️⃣ Configure Service

Railway akan auto-detect Node.js project.

Settings yang perlu dicheck:

```
Project Name: sivilize-backend (atau custom)

Environment:
  NODE_ENV: production

Start Command: npm run dev
(atau: node index.js)

Port: 3000 (atau biarkan auto-detect)
```

---

### 4️⃣ Deploy

1. Click **"Deploy"**
2. Wait ~3-5 minutes
3. ✅ Backend live!

---

### 5️⃣ Get Backend URL

1. Railway Dashboard → Buka project `sivilize-backend`
2. Tab **"Deploy"** atau **"Settings"**
3. Cari: **"Service URL"** atau **"Public URL"**
4. Format: `https://sivilize-backend-production.up.railway.app`

---

## 📝 Important Notes

### First 30 Minutes (Initial Setup)

```
1. SignUp → Dashboard (done)
2. Deploy project → Start (done at Step 2)
3. Wait for build (~3-5 min)
4. Get URL
5. Add to Vercel environment
6. Redeploy frontend
```

### Railway Free Tier

```
✅ $5 USD in free credits monthly
✅ MORE than enough untuk development
✅ Small production workload

Formula:
- $0.000463/hour per GB RAM
- Backend (512MB) ≈ $0.0002/hour
- Monthly ≈ $1-2 USD (well within free credits!)
```

---

## 🚀 After Railway Deploy

Once backend URL ready (e.g., `https://sivilize-backend-production.up.railway.app`):

### Go to Vercel Dashboard

1. Open: https://vercel.com/dashboard
2. Select: `sivilize-hub-pro`
3. Settings → Environment Variables
4. Add/Update:
   ```
   VITE_API_URL = https://sivilize-backend-production.up.railway.app/api
   ```
5. Save
6. Go to Deployments → Redeploy latest
7. Wait ~3-5 min

### Test Production

```
Frontend: https://sivilize-hub-pro.vercel.app
✅ Try register new user
✅ Try login
✅ Create project
✅ Check console (F12) for errors
```

---

## 🔧 If Deploy Fails

### Common Issues

**Issue: Build fails - missing dependencies**
```
Solution: Same as Render - delete package-lock.json locally:
  1. cd server
  2. del package-lock.json
  3. npm install
  4. Push to GitHub
  5. Redeploy at Railway
```

**Issue: Start command error**
```
Check: npm run dev adalah valid di package.json
  "scripts": {
    "dev": "nodemon index.js",  ← atau "node index.js"
    "start": "node index.js"
  }
```

**Issue: Port conflict**
```
Railway auto-assigns random port.
Add to index.js (if not already):
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
```

---

## 📋 Deployment Checklist

- [ ] GitHub repo created with backend files
- [ ] Railway account sign up (FREE, no CC)
- [ ] Railway project created
- [ ] Backend deployed & showing "Live" status
- [ ] Railway service URL copied
- [ ] Vercel environment variable updated (VITE_API_URL)
- [ ] Frontend redeployed at Vercel
- [ ] Test register/login at production URL
- [ ] All features working (RAB, export, etc)

---

## ⏱️ Timeline

| Step | Time | Who |
|------|------|-----|
| SignUp Railway | 2 min | You |
| Create & deploy project | 5 min | You |
| Build & startup | 5 min | Railway (auto) |
| Update Vercel env | 2 min | You |
| Frontend redeploy | 5 min | Vercel (auto) |
| Testing | 5 min | You |
| **TOTAL** | **~25 min** | 🎉 Production Ready |

---

## 🎯 Next Steps

**Right now:**
1. Go to: https://railway.app
2. Sign up FREE (GitHub)
3. Create new project
4. Select GitHub repo: `sivilize-backend`
5. Deploy!

**After Railway URL ready:**
1. Copy backend URL dari Railway dashboard
2. Add to Vercel environment (VITE_API_URL)
3. Redeploy frontend
4. Test production

---

## 💡 Railway vs Render Comparison

```
RENDER:
❌ Requires credit card upfront
❌ Deploy error (missing dependencies)
❌ More complex UI
❌ Auto-sleep (30 sec startup)

RAILWAY:
✅ No CC required (free $5 credits)
✅ Better error messages
✅ Simple, intuitive UI
✅ No sleep (instant startup)
✅ Better for development
```

---

**Railway adalah pilihan yang lebih baik! Mari mulai! 🚂**

Buka: https://railway.app → Sign up → Deploy!

Tell me when backend live di Railway! 🎉
