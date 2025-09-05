@echo off
echo Starting BEBR Bugs development server...

REM Проверяем, существует ли .env.local
if not exist .env.local (
    echo Creating .env.local from env.example...
    copy env.example .env.local
    echo.
    echo Please edit .env.local with your Discord credentials before running the app again.
    echo.
    pause
    exit
)

REM Генерируем Prisma клиент
echo Generating Prisma client...
npx prisma generate

REM Синхронизируем базу данных
echo Syncing database...
npx prisma db push

REM Запускаем сервер разработки
echo Starting Next.js development server...
npm run dev 