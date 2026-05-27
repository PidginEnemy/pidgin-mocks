# Pidgin Mocks

Вспомогательное приложение для разработчиков: генерация mock API с админ-панелью.

## Возможности

- Коллекции mock endpoint'ов с группировкой в sidebar
- Настройка HTTP-метода, пути, статус-кода и JSON-ответа
- Админ-панель с аккордеоном коллекций и формой редактирования
- Персистентное хранение в SQLite

## Быстрый старт

```bash
npm install
npm run db:migrate
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) — админ-панель.

## Управление коллекциями в админке

- Создание: кнопка «Новая коллекция»
- Переименование: иконка карандаша у коллекции в sidebar (slug в URL `/api/{slug}/...` пересчитывается из имени автоматически)
- Удаление: иконка корзины у коллекции; все её mock endpoint&apos;ы удаляются каскадно. Коллекцию **Common** удалить нельзя (ответ API `403`).

## Использование mock API

После создания коллекции `Common` и endpoint с путём `/users` и методом `GET`:

```bash
curl http://localhost:3000/api/common/users
```

Формат URL: `http://localhost:3000/api/{collection}{path}`

Примеры:

| Коллекция (slug) | Path в админке | Метод | URL |
|------------------|----------------|-------|-----|
| `common` | `/users` | GET | `GET /api/common/users` |
| `common` | `/v1/orders` | POST | `POST /api/common/v1/orders` |

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
| `/settings` | Общие настройки |
| `/api/{collection}/*` | Mock API |
| `/admin/api/collections` | Список и создание коллекций для UI |
| `/admin/api/collections/[id]` | Обновление и удаление коллекции |
| `/admin/api/endpoints` | CRUD endpoint'ов для UI |

## Стек

- Next.js (App Router)
- SQLite + Drizzle ORM
- Tailwind CSS + shadcn/ui-подобные компоненты
- Zod
