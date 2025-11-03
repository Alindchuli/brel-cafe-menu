@echo off
echo 🚀 Deploying Brel Menu to Vercel (Free)...
echo.

REM Check if vercel is installed
vercel --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

echo 🗄️ Initializing database...
npm run init-db

echo 🌐 Deploying to Vercel...
echo.
echo 📝 When prompted:
echo    - Project name: brel-menu (or your choice)
echo    - Link to existing project: N (No)
echo    - Which scope: Your username
echo    - Link to Git: Y (Yes, recommended)
echo.
vercel

echo.
echo ✅ Deployment complete!
echo 🌍 Your menu is now live with a free domain!
echo 🔐 Admin login: admin / admin123
echo ⚠️  Remember to change the admin password!
pause