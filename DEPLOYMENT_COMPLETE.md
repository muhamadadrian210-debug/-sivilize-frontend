# 🚀 DEPLOYMENT COMPLETE - Setup Guide

**Status:** ✅ Frontend deployed to Vercel  
**Live URL:** https://sivilize-hub-pro.vercel.app  
**Deployment Date:** April 2, 2026

---

## ✅ What's Done

### Frontend Deployment
- ✅ Frontend built successfully (dist folder created)
- ✅ Deployed to Vercel (production)
- ✅ URL active: **https://sivilize-hub-pro.vercel.app**
- ✅ All features available: Multilingual, AI Assistant, RAB Grouping
- ✅ HTTPS enabled automatically

---

## 🔧 Backend Setup (Choose ONE)

Your frontend is live, but need to setup backend API. Choose one option:

### **Option A: Backend on Local Server + ngrok (Quick)**

This exposes your local backend to internet without deploying to cloud.

**Step 1: Install ngrok**
```bash
# Download from: https://ngrok.com/download
# Or via Chocolatey:
choco install ngrok
```

**Step 2: Start Backend Server**
```bash
cd "c:\Users\AXIOO\Desktop\SIVILIZE - PUSAT PERADABAN (Origin Edition)\server"
npm run dev
# Should say: "Server running on port 5000"
```

**Step 3: Start ngrok Tunnel**
```bash
ngrok http 5000
# You'll see: https://xxxxx-xx-xx-xxx.ngrok-free.app
# Copy this URL
```

**Step 4: Update .env.production in Vercel**
```
VITE_API_URL=https://xxxxx-xx-xx-xxx.ngrok-free.app/api
```

---

### **Option B: Backend on Cloud Server (Production)**

Deploy backend to cloud for production-grade reliability.

**Recommended Platforms:**
1. **Render.com** - Free tier available
2. **Railway.app** - Pay-as-you-go
3. **Heroku** - Limited free tier
4. **AWS EC2** - More complex setup

**After deployment, update in Vercel:**
```
VITE_API_URL=https://your-backend-domain.com/api
```

---

### **Option C: Backend on Same Vercel (Advanced)**

Deploy backend as a Vercel serverless function.

*Not recommended for this project due to database limitations*

---

## 📝 Update Vercel Environment Variables

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Click "sivilize-hub-pro" project
3. Click "Settings"
4. Click "Environment Variables"

### Step 2: Add Backend API URL
```
Name: VITE_API_URL
Value: https://your-backend-api.com/api
```

### Step 3: Add Claude API Key (Optional)
```
Name: VITE_CLAUDE_API_KEY
Value: sk-ant-your-key-here
```

### Step 4: Redeploy
- Click "Deployments"
- Click three dots (…) on latest deployment
- Click "Redeploy"

---

## 🧪 Quick Test

### Frontend Working
```
Open: https://sivilize-hub-pro.vercel.app
✓ See login page with multilingual switcher
✓ AI chat bubble visible in bottom-right
✓ Logo displays correctly
✓ All text in selected language
```

### Backend API Connected
1. Register new account
2. Should create user in backend
3. Login should work
4. Create RAB project
5. Export to Excel should work

---

## 📊 Current Architecture

```
Users (Internet)
    ↓
[Vercel Frontend] ← https://sivilize-hub-pro.vercel.app
    ↓ (API calls to)
[Backend Server] ← http://localhost:5000 OR https://your-api.com
    ↓
[Local Database] (JSON file or MongoDB)
```

---

## 🔐 Environment Variables Needed

| Variable | Value | Required | Example |
|----------|-------|----------|---------|
| `VITE_API_URL` | Backend API URL | ✅ Yes | `https://api.sivilize.com/api` |
| `VITE_CLAUDE_API_KEY` | Claude API key | ⭕ No | `sk-ant-abc123xyz...` |

---

## ⚡ Quick Deployment Checklist

- [x] Frontend built & deployed
- [x] Frontend live at https://sivilize-hub-pro.vercel.app
- [ ] Backend server running (local or cloud)
- [ ] Backend exposed to internet (ngrok or deployment)
- [ ] Environment variables updated in Vercel
- [ ] Test login & project creation
- [ ] Test export to Excel
- [ ] Test AI Assistant with backend API

---

## 🆘 Troubleshooting

### Frontend loads but API calls fail
**Problem:** "API error" or blank responses
**Solution:** 
1. Check VITE_API_URL in Vercel dashboard
2. Verify backend is actually running
3. Check CORS settings in backend
4. Test API manually: `curl https://your-api-url/api`

### Login not working
**Problem:** "Invalid credentials" error
**Solution:**
1. Check backend database (localDb.json)
2. Verify CORS is enabled
3. Check browser console for error details
4. Test API: `curl -X POST https://api-url/api/auth/login`

### Multilingual not working
**Problem:** Language switcher doesn't change text
**Solution:**
1. Check if translations.ts imported correctly
2. Clear browser cache: Ctrl+Shift+Delete
3. Reload page
4. Check console for import errors

### AI Assistant not responding
**Problem:** Chat bubble frozen or "error"
**Solution:**
1. If Claude API: check API key is valid
2. Try FAQ questions first (don't need API)
3. Check browser console for errors
4. Test backend API connection first

---

## 📞 Support

For issues, debug by checking:
1. **Browser console** (F12 → Console tab)
2. **Network tab** (F12 → Network tab) - check API calls
3. **Backend logs** - check server terminal
4. **Vercel logs** - https://vercel.com/dashboard → Deployments

---

## 🎯 Next Steps

1. Choose backend setup option (A, B, or C)
2. Setup and start backend
3. Update VITE_API_URL in Vercel
4. Redeploy frontend
5. Test all features
6. Monitor for errors

---

## 📈 Production Checklist (Before Going Live)

- [ ] Backend has CORS configured for Vercel domain
- [ ] HTTPS enabled on backend (if not ngrok)
- [ ] Database secured (passwords hashed, etc.)
- [ ] Rate limiting enabled on API
- [ ] Error logging setup
- [ ] Monitoring/alerting configured
- [ ] Backup strategy for database
- [ ] SSL certificate valid (if custom domain)

---

**Congratulations!** 🎉 Your SIVILIZE-HUB PRO is now live on Vercel!

🔗 **Main URL:** https://sivilize-hub-pro.vercel.app
📱 **Features:** Multilingual (EN+ID), AI Assistant 24/7, RAB Grouping, Professional Export
🚀 **Status:** Ready for production use

Next: Setup backend and test full integration!
