import { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Block, Container, Group, Stack, Title, Text, Sheet, Button, Icon, Grid } from '@ui8kit/core'
import { useTheme } from "@/providers/theme"
import { useMobile } from "@/hooks/use-mobile"
import { SearchBar } from '@/components/SearchBar'
import { CategoryList } from '@/components/CategoryList'
import { TagList } from '@/components/TagList'
import { PopularPosts } from '@/components/PopularPosts'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { Menu, Sun, Moon } from 'lucide-react'
import type { RenderContext } from '@/data/types'
import { useRenderContext } from '@/providers/render-context'

export function MainLayout({ children, sidebar = 'right' as 'left' | 'right' | 'none', context }: { children: ReactNode; sidebar?: 'left' | 'right' | 'none'; context?: RenderContext }) {
  const { context: ctxFromHook } = useRenderContext()
  const ctx = context ?? ctxFromHook
  const isMobile = useMobile()
  const { toggleDarkMode, isDarkMode } = useTheme()
  const { menu } = ctx
  const defaultGap = isMobile ? "none" : "lg";
  const navigate = useNavigate()

  return (
    <>
      <Block component="nav" py="xs" bg="background" data-class="nav-bar" borderBottom="1px" borderColor="border" shadow="lg">
        <Container size="lg">
          <Group justify="between" align="center">
            <Group align="center" gap="md">
              <Link to="/">
                <Title order={2} size="2xl" fw="bold" c="primary">UI8Kit</Title>
              </Link>
              <Text size="sm" c="secondary-foreground">Design System</Text>
            </Group>

            <Group align="center" gap="sm">

              {!isMobile && (
                <nav>
                  <Group align="center" gap="sm" data-class="nav">
                    {menu.primary.items.map(item => (
                      <Button onClick={() => navigate(item.url)} key={item.id} variant="ghost" size="sm">
                        {item.title}
                      </Button>
                    ))}
                  </Group>
                </nav>
              )}

              <Button variant="ghost" aria-label="Toggle dark mode" onClick={toggleDarkMode}>
                <Icon lucideIcon={isDarkMode ? Sun : Moon} />
              </Button>

              {isMobile && (
                <Sheet id="site-sheet" side="left" title="Menu" showTrigger triggerIcon={Menu}>
                  <Stack gap="sm">
                    <SearchBar />
                    {menu.primary.items.map(item => (
                      <Button key={item.id} variant="ghost" onClick={() => navigate(item.url)}>{item.title}</Button>
                    ))}
                  </Stack>
                </Sheet>
              )}
            </Group>
          </Group>
        </Container>
      </Block>

      <Block component="main" py="lg" data-class="main-page">
        <Container size="lg">
          {sidebar === 'none' ? (
            <Stack gap="lg">
              {children}
            </Stack>
          ) : (
            <Grid cols="1-4" gap={defaultGap}>
              <Grid.Col span={3} data-class="main-content" order={sidebar === 'left' ? 2 : 1}>
                <Stack gap="lg">
                  {children}
                </Stack>
              </Grid.Col>
              <Grid.Col span={1} data-class="sidebar" order={sidebar === 'left' ? 1 : 2}>
                <Aside context={ctx} />
              </Grid.Col>
            </Grid>
          )}
        </Container>
      </Block>

      <Block component="footer" py="md" borderTop="1px" borderColor="border" bg="card" data-class="site-footer">
        <Container size="lg">
          <Stack gap="lg" align="center">
            <Text size="sm" c="secondary-foreground" ta="center">© 2025 UI8Kit Design System</Text>
            <Group gap="md" justify="center">
              <Link to="/"><Text size="xs" c="secondary-foreground">Home</Text></Link>
              <Link to="/blog"><Text size="xs" c="secondary-foreground">Blog</Text></Link>
              <Link to="/about"><Text size="xs" c="secondary-foreground">About</Text></Link>
            </Group>
          </Stack>
        </Container>
      </Block>
    </>
  )
}

const Aside = ({ context }: { context: RenderContext }) => (
  <Block component="aside">
    <Stack gap="lg">
      <SearchBar />
      <CategoryList items={context.categories as any} />
      <Link to="/categories"><Text size="sm" c="secondary-foreground">View all categories</Text></Link>
      <TagList items={context.tags as any} />
      <Link to="/tags"><Text size="sm" c="secondary-foreground">View all tags</Text></Link>
      <Link to="/authors"><Text size="sm" c="secondary-foreground">View all authors</Text></Link>
      <PopularPosts />
      <NewsletterSignup />
    </Stack>
  </Block>

)
