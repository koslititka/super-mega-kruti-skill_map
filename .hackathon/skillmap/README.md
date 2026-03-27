# SkillMap

Централизованная платформа-агрегатор IT-мероприятий для школьников 6-11 классов.

## Стек

- **Frontend:** React 18 + TypeScript + Vite (FSD-архитектура)
- **Backend:** Node.js + Express + TypeScript (модульная архитектура)
- **БД:** PostgreSQL 15 + Prisma ORM
- **Auth:** Email/пароль (bcrypt + JWT в httpOnly cookies) + Telegram Login Widget
- **Контейнеризация:** Docker + docker-compose

## Быстрый старт

### Docker (рекомендуется)

```bash
cp .env.example .env
# Отредактируйте .env (JWT_SECRET, опционально TELEGRAM_BOT_TOKEN)
docker-compose up --build
```

Приложение будет доступно:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api

### Локальная разработка

```bash
# Backend
cd server
npm install
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
npm run dev

# Frontend (в другом терминале)
cd client
npm install
npm run dev
```

## Тестовые аккаунты

| Email | Пароль | Роль |
|-------|--------|------|
| admin@skillmap.ru | admin123 | Admin |
| organizer@skillmap.ru | organizer123 | Organizer |
| ivan@example.com | password123 | User |

## Возможности

- Просмотр календаря/афиши IT-мероприятий с фильтрами
- Регистрация и авторизация (email + Telegram)
- Персональные рекомендации "Для вас"
- Регистрация на мероприятия
- Избранное
- Кабинет организатора (CRUD событий, просмотр участников, экспорт CSV)
- Админка (статистика, управление пользователями и ролями)

## Архитектура

### Frontend (FSD)
```
shared -> entities -> features -> widgets -> pages -> app
```

### Backend (модульный)
```
modules: auth, users, events, favorites, registrations, recommendations, categories, admin
```

Каждый модуль: `index.ts` (роуты) + `controller.ts` + `service.ts` + `validation.ts`
