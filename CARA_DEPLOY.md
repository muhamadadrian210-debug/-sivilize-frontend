# Cara Deploy Backend + Frontend ke Vercel

## LANGKAH 1: Login ke Vercel

Buka terminal, jalankan:
```
npx vercel login
```
Pilih "Continue with GitHub" atau email, lalu ikuti instruksi di browser.

---

## LANGKAH 2: Deploy Backend

```
cd server
npx vercel --prod
```

Saat ditanya:
- "Set up and deploy?" → Y
- "Which scope?" → pilih akun kamu
- "Link to existing project?" → Y (pilih project "server")
- Tunggu sampai selesai

Setelah selesai, kamu akan dapat URL seperti:
`https://server-abc123.vercel.app`

---

## LANGKAH 3: Set Environment Variables Backend

Buka https://vercel.com/dashboard → pilih project "server" → Settings → Environment Variables

Tambahkan:
| Key | Value |
|-----|-------|
| `JWT_SECRET` | `isi_random_string_panjang_minimal_32_karakter` |
| `NODE_ENV` | `production` |
| `ALLOWED_ORIGINS` | `https://sivilize-hub-pro.vercel.app` |

Lalu redeploy backend:
```
cd server
npx vercel --prod
```

---

## LANGKAH 4: Set Environment Variables Frontend

Buka https://vercel.com/dashboard → pilih project "sivilize-hub-pro" → Settings → Environment Variables

Tambahkan:
| Key | Value |
|-----|-------|
| `VITE_API_URL` | `https://server-abc123.vercel.app/api` (URL backend dari langkah 2 + `/api`) |

---

## LANGKAH 5: Deploy Frontend

```
cd ..  (kembali ke root project)
npx vercel --prod
```

---

## LANGKAH 6: Test

Buka https://sivilize-hub-pro.vercel.app dan coba:
1. Register akun baru
2. Login
3. Buat project RAB

---

## Catatan

- Data backend akan **reset** setiap cold start (in-memory storage)
- Untuk data persisten, tambahkan `MONGODB_URI` dari MongoDB Atlas di env vars backend
- Development lokal: jalankan `npm run dev` di root dan `npm start` di folder `server`
