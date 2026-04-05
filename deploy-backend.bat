@echo off
echo ========================================
echo  DEPLOY BACKEND KE VERCEL
echo ========================================
echo.

cd server

echo [1/3] Login ke Vercel (jika belum)...
npx vercel login

echo.
echo [2/3] Deploy backend...
npx vercel --prod

echo.
echo [3/3] Selesai! Copy URL backend di atas.
echo Lalu jalankan: deploy-frontend.bat
echo.
pause
