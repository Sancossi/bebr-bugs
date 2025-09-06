# 🚀 Деплой BEBR Bugs на Vercel

## Предварительные требования

1. Аккаунт на [Vercel](https://vercel.com)
2. База данных PostgreSQL (рекомендуется [Neon](https://neon.tech) или [Supabase](https://supabase.com))
3. Discord приложение (настроенное согласно SETUP.md)

## 1. Подготовка базы данных

### Вариант A: Neon (рекомендуется)
1. Зарегистрируйтесь на [Neon](https://neon.tech)
2. Создайте новый проект
3. Скопируйте connection string из дашборда
4. Формат: `postgresql://username:password@host/database?sslmode=require`

### Вариант B: Supabase
1. Зарегистрируйтесь на [Supabase](https://supabase.com)
2. Создайте новый проект
3. Перейдите в Settings → Database
4. Скопируйте connection string (URI)

### Вариант C: Vercel Postgres
1. В проекте на Vercel перейдите в Storage
2. Создайте Postgres базу данных
3. Скопируйте переменные окружения

## 2. Настройка переменных окружения на Vercel

В дашборде Vercel перейдите в Settings → Environment Variables и добавьте:

```bash
# Next.js
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=ваш-32-символьный-секретный-ключ

# Discord OAuth
DISCORD_CLIENT_ID=ваш-discord-client-id
DISCORD_CLIENT_SECRET=ваш-discord-client-secret

# Discord Bot (опционально)
DISCORD_BOT_TOKEN=ваш-discord-bot-token

# Discord Webhook (опционально)
DISCORD_WEBHOOK_SECRET=ваш-webhook-секрет
DISCORD_QA_AUTOREPORT_CHANNEL_ID=1411777081804849325
DISCORD_GAME_IDEAS_CHANNEL_ID=1411807360896204960

# Database
DATABASE_URL=postgresql://username:password@host:port/database?sslmode=require
```

## 3. Обновление Discord OAuth настроек

В Discord Developer Portal обновите Redirect URL:
```
https://your-app-name.vercel.app/api/auth/callback/discord
```

## 4. Деплой

### Через Vercel CLI
```bash
# Установка Vercel CLI
npm i -g vercel

# Деплой
vercel

# Следуйте инструкциям CLI
```

### Через Git Integration
1. Подключите репозиторий к Vercel
2. Vercel автоматически задеплоит при push в main ветку

## 5. Инициализация базы данных

После первого деплоя выполните миграцию:

```bash
# Локально с переменной продакшен DATABASE_URL
npx prisma db push

# Или через Vercel CLI
vercel env pull .env.local
npx prisma db push
```

## 6. Проверка деплоя

1. Откройте https://your-app-name.vercel.app
2. Проверьте авторизацию через Discord
3. Убедитесь, что база данных работает

## 🔧 Troubleshooting

### Ошибки Prisma
```bash
# Перегенерировать клиент
npx prisma generate

# Принудительный push схемы
npx prisma db push --force-reset
```

### Ошибки авторизации
- Проверьте NEXTAUTH_URL (должен совпадать с доменом)
- Проверьте Discord Redirect URL
- Убедитесь, что NEXTAUTH_SECRET не менее 32 символов

### Ошибки функций
- API routes имеют лимит времени выполнения 10 секунд (Hobby план)
- Для Pro плана можно увеличить до 60 секунд

## 📊 Мониторинг

1. **Vercel Analytics**: автоматически включена
2. **Vercel Logs**: доступны в дашборде
3. **Database Monitoring**: через провайдера БД (Neon/Supabase)

## 🚀 Оптимизация

1. **Edge Runtime**: рассмотрите использование для API routes
2. **ISR**: настройте для статичных страниц
3. **Image Optimization**: уже настроена в next.config.js

## 💡 Полезные команды

```bash
# Просмотр логов
vercel logs

# Откат к предыдущему деплою
vercel rollback

# Просмотр переменных окружения
vercel env ls

# Локальная разработка с продакшн переменными
vercel dev
``` 