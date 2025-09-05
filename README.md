# BEBR Bugs - Система управления багами

Современная система управления багами с интеграцией Discord и Kanban доской, построенная на архитектуре MCP (Model-Controller-Presenter) с паттерном DAO.

## Возможности

- 🔐 **Авторизация через Discord** - безопасный вход через Discord OAuth
- 📊 **Kanban доска** - визуальное управление багами с статусами:
  - NEW (Новый)
  - IN_PROGRESS (В работе) 
  - TESTING (Тестирование)
  - READY_TO_RELEASE (Готов к релизу)
  - CLOSED (Закрыт)
- 🤖 **Discord интеграция** - автоматическое создание багов из каналов:
  - `qa-autoreport` - баги геймплея
  - `game-ideas` - идеи для игры
- 💬 **Комментарии** - возможность добавлять комментарии к багам
- 📎 **Вложения** - поддержка изображений и файлов
- 📈 **Аналитика** - статистика по багам и их статусам
- 👥 **Назначение** - назначение багов участникам команды

## Архитектура

Проект построен на паттернах MCP и DAO:

### Структура проекта
```
src/
├── dao/              # Data Access Objects
│   ├── BugDAO.ts
│   ├── CommentDAO.ts
│   └── UserDAO.ts
├── services/         # Бизнес-логика
│   └── BugService.ts
├── controllers/      # HTTP контроллеры
│   └── BugController.ts
├── types/           # TypeScript типы
│   └── index.ts
└── lib/             # Утилиты
    ├── database.ts
    ├── auth.ts
    └── utils.ts

app/                 # Next.js App Router
├── api/            # API routes
├── dashboard/      # Страница дашборда
├── kanban/        # Kanban доска
└── bugs/          # Управление багами

components/         # React компоненты
├── ui/            # Базовые UI компоненты
├── layout/        # Компоненты макета
└── providers/     # React провайдеры
```

### Паттерны

- **DAO (Data Access Object)** - изоляция доступа к данным
- **Service Layer** - бизнес-логика приложения
- **Controller** - обработка HTTP запросов
- **Repository Pattern** - абстракция над базой данных

## Технологии

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Next.js API Routes, Prisma ORM
- **База данных**: SQLite (можно легко переключить на PostgreSQL/MySQL)
- **Авторизация**: NextAuth.js с Discord провайдером
- **UI**: Современный дизайн с темной/светлой темой

## Установка и запуск

1. **Клонирование репозитория**
```bash
git clone <repository-url>
cd bebr-bugs
```

2. **Установка зависимостей**
```bash
npm install
```

3. **Настройка переменных окружения**
```bash
cp env.example .env.local
```

Заполните необходимые переменные:
- `DISCORD_CLIENT_ID` и `DISCORD_CLIENT_SECRET` - из Discord Developer Portal
- `NEXTAUTH_SECRET` - случайная строка для подписи JWT токенов
- `DISCORD_WEBHOOK_SECRET` - секретный ключ для webhook'ов

4. **Настройка базы данных**
```bash
npx prisma generate
npx prisma db push
```

5. **Запуск в режиме разработки**
```bash
npm run dev
```

Приложение будет доступно по адресу http://localhost:3000

## Discord настройка

### 1. Создание Discord приложения

1. Перейдите в [Discord Developer Portal](https://discord.com/developers/applications)
2. Создайте новое приложение
3. В разделе OAuth2 добавьте redirect URL: `http://localhost:3000/api/auth/callback/discord`
4. Скопируйте Client ID и Client Secret в `.env.local`

### 2. Настройка webhook'а

Для автоматического создания багов из Discord каналов настройте webhook:

```bash
POST /api/discord/webhook
Authorization: Bearer YOUR_WEBHOOK_SECRET
Content-Type: application/json

{
  // Discord message data
}
```

## API Endpoints

### Аутентификация
- `GET /api/auth/signin` - страница входа
- `GET /api/auth/callback/discord` - Discord callback
- `POST /api/auth/signout` - выход

### Баги
- `GET /api/bugs` - получить список багов
- `POST /api/bugs` - создать новый баг
- `GET /api/bugs/[id]` - получить баг по ID
- `PUT /api/bugs/[id]` - обновить баг
- `DELETE /api/bugs/[id]` - удалить баг
- `POST /api/bugs/[id]/comments` - добавить комментарий

### Webhook'и
- `POST /api/discord/webhook` - Discord webhook для автоматического создания багов

## Разработка

### Добавление новых типов багов

1. Обновите enum `BugType` в `prisma/schema.prisma`
2. Запустите `npx prisma db push`
3. Обновите парсер в `BugService.parseDiscordBugType()`

### Добавление новых статусов

1. Обновите enum `BugStatus` в `prisma/schema.prisma`
2. Запустите `npx prisma db push`
3. Обновите Kanban доску в компонентах

## Развертывание

### Vercel (рекомендуется)

1. Подключите репозиторий к Vercel
2. Настройте переменные окружения в панели Vercel
3. Измените `DATABASE_URL` на PostgreSQL для продакшена

## Лицензия

MIT License - смотрите файл LICENSE для деталей.

## Поддержка

Если у вас есть вопросы или предложения, создайте issue в репозитории. 