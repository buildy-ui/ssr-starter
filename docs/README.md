# SSR-Starter: WordPress GraphQL → SSR/SSG Framework

**Уровень документации: 101** - Полное руководство для новичков и опытных разработчиков

Этот гайд поможет вам установить, настроить, разработать и протестировать SSR-приложение на базе WordPress GraphQL API с поддержкой оффлайн-режима и множественных адаптеров хранения данных.

## 📁 Содержание

- [Обзор приложения](#-обзор-приложения)
- [Установка](#-установка)
- [Настройка](#-настройка)
- [Разработка](#-разработка)
- [Тестирование](#-тестирование)
- [Руководство разработчика](#-руководство-разработчика)
- [API и адаптеры](#-api-и-адаптеры)
- [Деплой](#-деплой)
- [Troubleshooting](#-troubleshooting)

## 🎯 Обзор приложения

**SSR-Starter** - это фреймворк для создания SSR (Server-Side Rendering) и SSG (Static Site Generation) приложений на основе WordPress GraphQL API.

### Архитектура

```
WordPress GraphQL API → SSR Server → React Components → HTML/CSS/JS
                       ↓
                   Storage Adapters (LMDB, IndexedDB, JSON, etc.)
```

### Ключевые возможности

- **SSR**: Серверный рендеринг для быстрой загрузки
- **SSG**: Статическая генерация для CDN-раздачи
- **Оффлайн-режим**: Работа без интернета через локальные адаптеры
- **Адаптеры хранения**: LMDB, IndexedDB, JSON, ContextDB
- **Гибкая настройка**: Переключение между базами данных через ENV

### Режимы работы

| Режим | Описание | Использование |
|-------|----------|---------------|
| **GraphQL → In-Memory** | Без хранения, прямой запрос к API | Разработка, тестирование |
| **MAINDB=IndexedDB** | Данные в браузере | Оффлайн PWA |
| **MAINDB=LMDB** | Серверная база LMDB | Production с персистентностью |
| **BACKUPDB=LMDB** | Резервная копия | Фолбек при сбое сети |

## 🚀 Установка

### Предварительные требования

- **Node.js**: 18+ или **Bun** 1.0+
- **WordPress** с плагином **WPGraphQL**
- **Git**

### 1. Клонирование репозитория

```bash
git clone https://github.com/your-repo/ssr-starter.git
cd ssr-starter
```

### 2. Установка зависимостей

```bash
# С Bun (рекомендуется)
bun install

# Или с npm
npm install
```

### 3. Настройка переменных окружения

Создайте файл `.env`:

```bash
# Обязательные
GRAPHQL_ENDPOINT=https://your-wordpress.com/graphql
S3_ASSETS_URL=https://your-assets.com

# Опциональные
PORT=3000
MAINDB=IndexedDB        # LMDB | IndexedDB | ContextDB | JsonDB | FALSE
BACKUPDB=LMDB          # LMDB | JsonDB | ContextDB | FALSE
NODE_ENV=development
```

### 4. Проверка установки

```bash
# Сборка ассетов
bun run build

# Запуск сервера
bun run dev
```

Откройте `http://localhost:3000` - должна загрузиться главная страница.

## ⚙️ Настройка

### Основные переменные окружения

#### `GRAPHQL_ENDPOINT` (обязательно)
URL вашего WordPress GraphQL API.
```bash
GRAPHQL_ENDPOINT=https://myblog.com/graphql
```

#### `S3_ASSETS_URL` (обязательно)
URL для статических ассетов (шрифты, изображения).
```bash
S3_ASSETS_URL=https://cdn.myblog.com
```

#### `MAINDB` (опционально)
Основная база данных для хранения данных.

| Значение | Хранение | Использование |
|----------|----------|---------------|
| `FALSE` | In-Memory | Только GraphQL, без хранения |
| `IndexedDB` | `src/data/json/full.json` | Оффлайн в браузере |
| `LMDB` | `./data/db/` | Быстрая серверная БД |
| `ContextDB` | HTML контекст | Встраивание в страницы |

#### `BACKUPDB` (опционально)
Резервная база данных для оффлайн-режима.

```bash
MAINDB=IndexedDB    # Основная: браузер
BACKUPDB=LMDB      # Резерв: сервер
```

### Настройка WordPress

1. Установите плагин **WPGraphQL**
2. Настройте CORS для вашего домена
3. Проверьте доступность эндпоинта: `curl https://your-site.com/graphql`

## 💻 Разработка

### Структура проекта

```
├── src/                    # Клиентский код
│   ├── components/         # React компоненты
│   ├── routes/            # Страницы приложения
│   ├── data/              # Типы и GraphQL запросы
│   └── layouts/           # Макеты страниц
├── server/                # Серверный код
│   ├── storage/           # Адаптеры хранения
│   ├── index.ts           # Главный сервер
│   ├── sync.ts            # Синхронизация данных
│   └── render.tsx         # SSR рендеринг
├── scripts/               # Скрипты сборки
├── dist/                  # Собранные ассеты
└── data/                  # Данные (LMDB, JSON)
```

### Основные команды

```bash
# Разработка
bun run dev              # Полная разработка (сборка + сервер)
bun run server:dev       # Только сервер (горячая перезагрузка)
bun run tailwind:watch   # Слежение за стилями

# Сборка
bun run build            # Сборка для production
bun run tailwind:build   # Сборка стилей
bun run client:build     # Сборка клиентского JS

# Статическая генерация
bun run scripts/generate # Генерация статических HTML
```

### Добавление новой страницы

1. Создайте компонент в `src/routes/NewPage.tsx`:

```tsx
import { useRenderContext } from '@/data'

export default function NewPage() {
  const { context } = useRenderContext()

  return (
    <div>
      <h1>Новая страница</h1>
      {/* Ваш код */}
    </div>
  )
}
```

2. Добавьте маршрут в `server/render.tsx`:

```tsx
import NewPage from '../src/routes/NewPage'

// В AppRouter добавьте:
<Route path="/new-page" element={<MainLayout context={context}><NewPage /></MainLayout>} />
```

3. Добавьте в статическую генерацию в `scripts/routeToStatic.ts`:

```tsx
routes.add('/new-page')
```

### Работа с данными

```tsx
import { useRenderContext } from '@/data'

function MyComponent() {
  const { context, loading, error } = useRenderContext()

  if (loading) return <div>Загрузка...</div>
  if (error) return <div>Ошибка: {error}</div>

  // Доступ к данным
  const { posts, categories, tags, authors } = context

  return (
    <div>
      {/* Ваш код с данными */}
    </div>
  )
}
```

## 🧪 Тестирование

### Режимы тестирования

#### 1. GraphQL → In-Memory (по умолчанию)

```bash
# Без дополнительных переменных
bun run dev
```

**Что проверять:**
- Страницы загружаются
- Данные приходят из GraphQL
- `/health` показывает количество постов
- При отключении интернета: ошибка 500

#### 2. IndexedDB + LMDB Backup

```bash
MAINDB=IndexedDB BACKUPDB=LMDB bun run dev
```

**Что проверять:**
- После первого запроса создается `src/data/json/full.json`
- При отключении GraphQL данные берутся из IndexedDB
- При повторном запуске данные восстанавливаются

#### 3. Только LMDB

```bash
MAINDB=LMDB bun run dev
```

**Что проверять:**
- Данные сохраняются в `./data/db/`
- Быстрая загрузка при повторных запросах

#### 4. Статическая генерация

```bash
bun run scripts/generate
```

**Что проверять:**
- Создается папка `www/html/` с HTML файлами
- Каждая страница содержит правильные данные
- Создаются JSON-срезы в `src/data/json/`

### API эндпоинты для тестирования

```bash
# Здоровье приложения
curl http://localhost:3000/health

# API постов
curl "http://localhost:3000/api/posts?page=1&limit=5"

# Проверка страниц
curl http://localhost:3000/
curl http://localhost:3000/blog
curl http://localhost:3000/posts/your-post-slug
```

## 👨‍💻 Руководство разработчика

### Проверки перед коммитом

#### 1. Линтинг и типы

```bash
# TypeScript проверки
bun run tsc --noEmit

# Если есть ESLint
bun run lint
```

#### 2. Сборка проекта

```bash
bun run build
```

#### 3. Тестирование в разных режимах

```bash
# Тест 1: In-Memory режим
MAINDB=FALSE bun run build && timeout 10s bun run start

# Тест 2: IndexedDB режим
MAINDB=IndexedDB bun run build && timeout 10s bun run start

# Тест 3: LMDB режим
MAINDB=LMDB BACKUPDB=FALSE bun run build && timeout 10s bun run start

# Тест 4: Статическая генерация
bun run scripts/generate
ls -la www/html/
```

#### 4. Проверка файловой структуры

```bash
# Проверить наличие всех необходимых файлов
ls -la dist/           # entry-client.js, styles.css
ls -la src/assets/     # Шрифты и ассеты
ls -la data/db/        # LMDB файлы (если используются)
ls -la src/data/json/  # JSON данные (если используются)
```

### Отладка проблем

#### GraphQL ошибки

```bash
# Проверить доступность API
curl $GRAPHQL_ENDPOINT -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ posts { nodes { id } } }"}'
```

#### Проблемы с адаптерами

```bash
# Проверить JSON адаптер
cat src/data/json/full.json | head -20

# Проверить LMDB (если установлен lmdb-tools)
lmdb_dump data/db/
```

#### Ошибки сборки

```bash
# Очистить кэш
rm -rf node_modules/.cache dist/ data/db/

# Переустановить зависимости
rm -rf node_modules bun.lock
bun install

# Собрать заново
bun run build
```

### Добавление нового адаптера хранения

1. Создайте файл в `server/storage/adapter.new.ts`:

```typescript
import type { StorageAdapter, DataCollections } from './types'

export class NewAdapter implements StorageAdapter {
  async save(collections: DataCollections): Promise<void> {
    // Сохранение данных
  }

  async load(): Promise<DataCollections | null> {
    // Загрузка данных
    return null
  }

  async clear(): Promise<void> {
    // Очистка данных
  }
}
```

2. Добавьте в `server/storage/index.ts`:

```typescript
case 'newdb':
  return new NewAdapter()
```

## 🔧 API и адаптеры

### Интерфейс StorageAdapter

```typescript
interface StorageAdapter {
  save(collections: DataCollections): Promise<void>
  load(): Promise<DataCollections | null>
  clear(): Promise<void>
}
```

### Типы данных

#### DataCollections
```typescript
interface DataCollections {
  posts: PostData[]
  categories: CategoryData[]
  tags: TagData[]
  authors: AuthorData[]
  pages: PageSummary[]
  site?: any
  menu?: any
}
```

### CRUD операции

#### Создание поста (в GraphQL)
```graphql
mutation CreatePost($input: CreatePostInput!) {
  createPost(input: $input) {
    post {
      id
      title
      content
    }
  }
}
```

#### Чтение данных
```typescript
import { getBaseContext } from '../server/sync'

const context = await getBaseContext()
// context.posts, context.categories, etc.
```

#### Обновление данных
```typescript
import { fetchAllData } from '../server/sync'

await fetchAllData() // Синхронизация с GraphQL
```

### Генерация статических страниц

```typescript
import { RouteToStatic } from './scripts/routeToStatic'

const generator = new RouteToStatic({
  outputDir: './www/html',
  syncBefore: true,  // Синхронизировать данные перед генерацией
  blogPageSize: 5    // Постов на странице блога
})

await generator.generateAll()
```

## 🚀 Деплой

### Docker

#### Сборка образа

```bash
docker build \
  --build-arg GRAPHQL_ENDPOINT=https://your-site.com/graphql \
  --build-arg S3_ASSETS_URL=https://cdn.your-site.com \
  -t ssr-starter .
```

#### Запуск контейнера

```bash
docker run \
  -e GRAPHQL_ENDPOINT=https://your-site.com/graphql \
  -e S3_ASSETS_URL=https://cdn.your-site.com \
  -e MAINDB=LMDB \
  -p 3000:3000 \
  ssr-starter
```

### Railway/Nixpacks

Файл `nixpacks.toml` настроен для автоматического деплоя:

```toml
[phases.install]
cmds = ["bun install --frozen-lockfile"]

[phases.build]
cmds = ["bun run build"]

[start]
cmd = "bun run start"
```

### Vercel/Netlify (SSG)

```bash
# Генерация статических файлов
bun run scripts/generate

# Деплой папки www/html/
# На Vercel: указать root directory как www/html
# На Netlify: publish directory как www/html
```

### Переменные окружения для production

```bash
NODE_ENV=production
PORT=3000
GRAPHQL_ENDPOINT=https://your-production-site.com/graphql
S3_ASSETS_URL=https://cdn.your-production-site.com
MAINDB=LMDB
BACKUPDB=FALSE
```

## 🔍 Troubleshooting

### "GraphQL endpoint not configured"

**Решение:** Установите переменную окружения `GRAPHQL_ENDPOINT`

```bash
export GRAPHQL_ENDPOINT=https://your-site.com/graphql
```

### "Cannot find module 'lmdb'"

**Решение:** Установите зависимости или отключите LMDB

```bash
# Отключить LMDB
export MAINDB=IndexedDB
export BACKUPDB=FALSE
```

### "Port 3000 already in use"

**Решение:** Измените порт

```bash
export PORT=3001
```

### "Static generation fails"

**Решение:** Проверьте доступность GraphQL API

```bash
curl $GRAPHQL_ENDPOINT -X POST \
  -H "Content-Type: application/json" \
  -d '{"query": "{ posts { nodes { id } } }"}'
```

### "Styles not loading"

**Решение:** Соберите Tailwind

```bash
bun run tailwind:build
```

---

## 📚 Дополнительные ресурсы

- [WPGraphQL Documentation](https://docs.wpgraphql.com/)
- [Elysia.js Guide](https://elysiajs.com/)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS](https://tailwindcss.com/)

Для вопросов и предложений: [GitHub Issues](https://github.com/your-repo/ssr-starter/issues)
