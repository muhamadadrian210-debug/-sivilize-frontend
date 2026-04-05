@echo off
echo ========================================
echo   SIVILIZE HUB PRO - DEPLOY SCRIPT
echo ========================================
echo.

echo Langkah 1: Login ke Vercel...
npx vercel login
if %errorlevel% neq 0 (
    echo ERROR: Login gagal. Coba lagi.
    pause
    exit /b 1
)

echo.
echo Langkah 2: Deploy Backend ke Vercel...
cd server
npx vercel --prod --yes --env JWT_SECRET=sivilize_hub_pro_jwt_secret_2024_production_key --env NODE_ENV=production
if %errorlevel% neq 0 (
    echo ERROR: Deploy backend gagal.
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo Langkah 3: Build Frontend...
npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build frontend gagal.
    pause
    exit /b 1
)

echo.
echo Langkah 4: Deploy Frontend ke Vercel...
npx vercel --prod --yes
if %errorlevel% neq 0 (
    echo ERROR: Deploy frontend gagal.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   DEPLOY BERHASIL!
echo ========================================
echo.
echo Frontend: https://sivilize-hub-pro.vercel.app
echo Backend:  https://server-topaz-eta.vercel.app
echo.
pause
