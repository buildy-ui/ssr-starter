## 🎯 **Максимально простой подход**

### **1. Сервер рендерит страницу с нужными карточками:**

```typescript:server/render.tsx
// Добавляем роут для пагинации
<Route path="/blog" element={<MainLayout context={context}><Blog page={1} /></MainLayout>} />
<Route path="/blog/:page" element={<MainLayout context={context}><Blog /></MainLayout>} />
```

### **2. Blog компонент - чистый HTML:**

```typescript:src/routes/Blog.tsx
import { Block, Stack, Title, Text, Grid, Group, Button } from '@ui8kit/core'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SEO } from '@/components/SEO'
import { PostCard } from '@/components/PostCard'
import { useRenderContext } from '@/data'
import { useParams } from 'react-router-dom'

export default function Blog() {
  const { context } = useRenderContext()
  const { page } = useParams()
  
  // Номер страницы из URL
  const currentPage = Number(page) || 1
  const perPage = 10
  
  // Посты для текущей страницы
  const allPosts = context?.posts.posts || []
  const start = (currentPage - 1) * perPage
  const posts = allPosts.slice(start, start + perPage)
  const totalPages = Math.ceil(allPosts.length / perPage)
  
  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages
  
  return (
    <Block component="main" py="lg">
      <Stack gap="lg">
        <SEO 
          title={`Blog${currentPage > 1 ? ` - Page ${currentPage}` : ''}`} 
          description="Latest posts" 
        />
        
        <Title order={1} size="2xl">
          Blog {currentPage > 1 && `- Page ${currentPage}`}
        </Title>

        <Grid cols="1-2-3" gap="lg">
          {posts.map((post: any) => (
            <PostCard key={post.id} post={post} />
          ))}
        </Grid>

        {/* Простые ссылки */}
        <Group align="center" justify="center" gap="sm">
          {hasPrev && (
            <a href={currentPage === 2 ? '/blog' : `/blog/${currentPage - 1}`}>
              <Button variant="secondary">← Prev</Button>
            </a>
          )}
          
          <Text size="sm">Page {currentPage} of {totalPages}</Text>
          
          {hasNext && (
            <a href={`/blog/${currentPage + 1}`}>
              <Button>Next →</Button>
            </a>
          )}
        </Group>
      </Stack>
    </Block>
  )
}
```

### **3. Entry point - только для темы и меню:**

```typescript:src/entry-client.tsx
// Только интерактивность - никакого React рендеринга!
import { ThemeProvider, lesseUITheme } from './providers/theme'

// Dark mode toggle
const darkModeBtn = document.querySelector('[data-toggle-dark]')
if (darkModeBtn) {
  darkModeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark')
    localStorage.setItem('ui:dark', isDark ? '1' : '0')
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
  })
}

// Mobile menu toggle
const menuBtn = document.querySelector('[data-toggle-menu]')
const menu = document.querySelector('[data-menu]')
if (menuBtn && menu) {
  menuBtn.addEventListener('click', () => {
    menu.classList.toggle('hidden')
  })
}
```

---

## 🎯 **Итог:**

| Что | Размер | Описание |
|-----|--------|----------|
| **Сервер** | - | Рендерит полный HTML |
| **Entry-client.js** | ~1KB | Только toggle для темы и меню |
| **React** | 0KB на клиенте | Только на сервере |

### **Как работает:**
1. Пользователь открывает `/blog` → сервер отдает HTML с 10 карточками
2. Клик на "Next" → браузер открывает `/blog/2` → сервер отдает новый HTML
3. JavaScript на клиенте только для dark mode и mobile menu

**Это именно то, что вы хотели!** Хотите реализовать?