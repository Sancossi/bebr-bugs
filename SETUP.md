# 🚀 Инструкция по настройке BEBR Bugs

## Предварительные требования

- Node.js 18+ 
- npm или yarn
- Discord аккаунт для создания приложения

## 1. Установка зависимостей

```bash
npm install
```

## 2. Настройка Discord приложения

### Создание Discord приложения

1. Перейдите на [Discord Developer Portal](https://discord.com/developers/applications)
2. Нажмите "New Application"
3. Введите название "BEBR Bugs" (или любое другое)
4. Перейдите в раздел "OAuth2" → "General"
5. Скопируйте **Client ID** и **Client Secret**

### Настройка OAuth2

1. В разделе "OAuth2" → "General" добавьте Redirect URL:
   ```
   http://localhost:3000/api/auth/callback/discord
   ```

2. В разделе "OAuth2" → "URL Generator" выберите scopes:
   - `identify` - для получения информации о пользователе
   - `email` - для получения email (опционально)
   - `guilds` - для доступа к серверам (опционально)

## 3. Настройка переменных окружения

Отредактируйте файл `.env.local` и заполните следующие переменные:

```bash
# Next.js
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=ваш-супер-секретный-ключ-минимум-32-символа

# Discord OAuth
DISCORD_CLIENT_ID=ваш-discord-client-id
DISCORD_CLIENT_SECRET=ваш-discord-client-secret

# Discord Webhook (опционально для автоматического создания багов)
DISCORD_WEBHOOK_SECRET=ваш-webhook-секрет
DISCORD_QA_AUTOREPORT_CHANNEL_ID=1411777081804849325
DISCORD_GAME_IDEAS_CHANNEL_ID=1411807360896204960

# Database
DATABASE_URL="file:./dev.db"
```

### Генерация NEXTAUTH_SECRET

Выполните команду для генерации случайного секрета:

```bash
# В PowerShell
[System.Web.Security.Membership]::GeneratePassword(32, 0)

# Или онлайн: https://generate-secret.vercel.app/32
```

## 4. Инициализация базы данных

```bash
# Генерируем Prisma клиент
npx prisma generate

# Создаем базу данных и таблицы
npx prisma db push
```

## 5. Запуск приложения

```bash
# Запуск в режиме разработки
npm run dev
```

Приложение будет доступно по адресу: http://localhost:3000

## 6. Настройка Discord Webhook (опционально)

Для автоматического создания багов из Discord каналов:

### Создание бота

1. В Discord Developer Portal перейдите в раздел "Bot"
2. Нажмите "Add Bot"
3. Скопируйте токен бота
4. Включите необходимые Privileged Gateway Intents

### Настройка webhook

Создайте webhook в ваших Discord каналах:

1. Зайдите в настройки канала
2. Перейдите в "Integrations" → "Webhooks"
3. Создайте новый webhook
4. Установите URL: `http://localhost:3000/api/discord/webhook`
5. Добавьте заголовок: `Authorization: Bearer ваш-webhook-секрет`

## 7. Первый запуск

1. Откройте http://localhost:3000
2. Нажмите "Войти через Discord"
3. Авторизуйтесь через Discord
4. Вы будете перенаправлены на дашборд

## 8. Использование системы

### Создание багов

- **Вручную**: через интерфейс приложения
- **Автоматически**: через Discord webhook из каналов qa-autoreport и game-ideas

### Управление багами

- **Kanban доска**: `/kanban` - визуальное управление
- **Список багов**: `/bugs` - табличный вид
- **Дашборд**: `/dashboard` - статистика и обзор

### Статусы багов

1. **NEW** - новые баги
2. **IN_PROGRESS** - в работе
3. **TESTING** - на тестировании
4. **READY_TO_RELEASE** - готов к релизу
5. **CLOSED** - закрыт

## 🔧 Разработка

### Структура проекта

```
src/
├── dao/              # Data Access Objects
├── services/         # Бизнес-логика
├── controllers/      # HTTP контроллеры
├── types/           # TypeScript типы
└── lib/             # Утилиты

app/                 # Next.js App Router
├── api/            # API endpoints
├── dashboard/      # Дашборд
├── kanban/        # Kanban доска
└── auth/          # Авторизация

components/         # React компоненты
├── ui/            # Базовые компоненты
├── layout/        # Макет
└── providers/     # Провайдеры
```

### Полезные команды

```bash
# Просмотр базы данных
npx prisma studio

# Сброс базы данных
npx prisma db push --force-reset

# Просмотр логов
npm run dev

# Проверка типов
npx tsc --noEmit
```

## 🐛 Решение проблем

### Ошибки авторизации

- Проверьте правильность DISCORD_CLIENT_ID и DISCORD_CLIENT_SECRET
- Убедитесь, что Redirect URL настроен правильно в Discord
- Проверьте NEXTAUTH_SECRET (должен быть минимум 32 символа)

### Ошибки базы данных

- Выполните `npx prisma db push` для синхронизации схемы
- Удалите `dev.db` и выполните команды заново для полного сброса

### Проблемы с импортами

- Проверьте относительные пути импортов
- Убедитесь, что все файлы находятся в правильных директориях

## 📞 Поддержка

При возникновении проблем:

1. Проверьте логи в консоли браузера и терминале
2. Убедитесь, что все переменные окружения заполнены
3. Проверьте, что Discord приложение настроено правильно
4. Создайте issue в репозитории с описанием проблемы 