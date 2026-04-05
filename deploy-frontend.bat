@echo off
echo ========================================
echo  DEPLOY FRONTEND KE VERCEL
echo ========================================
echo.

set /p BACKEND_URL="Masukkan URL backend (contoh: https://server-xxx.vercel.app/api): "

echo.
echo [1/4] Update environment variable...
echo VITE_API_URL=%BACKEND_URL% > .env.local

echo.
echo [2/4] Build frontend...
call npm run build

echo.
echo [3/4] Deploy ke Vercel...
npx vercel --prod

echo.
echo [4/4] Set environment variable di Vercel...
npx vercel env add VITE_API_URL production

echo.
echo ========================================
echo  SELESAI! Frontend sudah di-deploy.
echo ========================================
pause
