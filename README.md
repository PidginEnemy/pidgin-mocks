# Pidgin Mocks

Вспомогательное приложение для разработчиков: генерация mock API с админ-панелью.

## Возможности

- Неограниченное количество mock endpoint'ов
- Настройка HTTP-метода, пути, статус-кода и JSON-ответа
- Админ-панель с sidebar и формой редактирования
- Персистентное хранение в SQLite

## Быстрый старт

```bash
npm install
npm run db:migrate
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) — админ-панель.

## Использование mock API

После создания endpoint с путём `/users` и методом `GET`:

```bash
curl http://localhost:3000/api/users
```

Формат URL: `http://localhost:3000/api{path}`

Примеры:

| Path в админке | Метод | URL |
|----------------|-------|-----|
| `/users` | GET | `GET /api/users` |
| `/v1/orders` | POST | `POST /api/v1/orders` |

Если endpoint не настроен, API вернёт `404`:

```json
{ "error": "Mock endpoint not configured" }
```

## Скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер |
| `npm run build` | Production-сборка |
| `npm run start` | Запуск production |
| `npm run db:generate` | Сгенерировать миграцию из схемы |
| `npm run db:migrate` | Применить миграции |
| `npm run db:push` | Синхронизировать схему с БД (без миграций) |

База данных: `data/mocks.db` (создаётся автоматически).

## Структура маршрутов

| Маршрут | Назначение |
|---------|------------|
| `/` | Админ-панель |
| `/settings` | Общие настройки (заглушка) |
| `/api/*` | Mock API |
| `/admin/api/endpoints` | CRUD API для UI |

## Стек

- Next.js (App Router)
- SQLite + Drizzle ORM
- Tailwind CSS + shadcn/ui-подобные компоненты
- Zod
