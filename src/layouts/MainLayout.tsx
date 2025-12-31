import { ReactNode } from 'react'
import { Block, Container, Group, Stack, Title, Text, Button, Icon, Grid } from '@ui8kit/core'
import { SearchBar } from '@/components/SearchBar'
import { CategoryList } from '@/components/CategoryList'
import { TagList } from '@/components/TagList'
import { PopularPosts } from '@/components/PopularPosts'
import { NewsletterSignup } from '@/components/NewsletterSignup'
import { Sheet } from '@/components/Sheet'
import { Menu, Sun, Moon } from 'lucide-react'
import type { RenderContext } from '@/data/types'

export function MainLayout({ children, sidebar = 'right' as 'left' | 'right' | 'none', context }: { children: ReactNode; sidebar?: 'left' | 'right' | 'none'; context?: RenderContext }) {
  if (!context) return null
  const { menu } = context
  const defaultGap = "lg"

  return (
    <>
      <Block component="nav" py="2" bg="background" data-class="nav-bar" border="b" shadow="lg">
        <Container max="w-6xl"> 
          <Group justify="between" object="center">
            <Group object="center" gap="4">
              <a href="/">
                <Title order={2} text="2xl" font="bold" bg="primary">UI8Kit</Title>
              </a>
              <Text text="sm" bg="secondary-foreground">Design System</Text>
            </Group>

            <Group object="center" gap="2">

              <nav className="hidden md:flex">
                <Group object="center" gap="2" data-class="nav">
                  {menu.primary.items.map(item => (
                    <a key={item.id} href={item.url}>
                      <Button variant="ghost" size="sm">
                        {item.title}
                      </Button>
                    </a>
                  ))}
                </Group>
              </nav>

              <Button variant="ghost" aria-label="Toggle dark mode" data-toggle-dark>
                <Icon lucideIcon={Sun} className="block dark:hidden" />
                <Icon lucideIcon={Moon} className="hidden dark:block" />
              </Button>

              <Sheet
                id="mobile-menu"
                side="left"
                title="Navigation"
                size="md"
                showTrigger
                triggerIcon={Menu}
                triggerVariant="ghost"
                className="md:hidden"
              >
                <Stack gap="2">
                  <SearchBar />
                  {menu.primary.items.map(item => (
                    <a key={item.id} href={item.url} className="block w-full">
                      <Button variant="ghost" className="w-full justify-start">
                        {item.title}
                      </Button>
                    </a>
                  ))}
                </Stack>
              </Sheet>
            </Group>
          </Group>
        </Container>
      </Block>

      <Block component="main" py="8" data-class="main-page">
        <Container max="w-6xl">
          {sidebar === 'none' ? (
            <Stack gap="6">
              {children}
            </Stack>
          ) : (
            <Grid cols="1-4" gap="6">
              <Grid.Col span={3} data-class="main-content" className={sidebar === 'left' ? 'md:order-2 order-1' : 'order-1'}>
                <Stack gap="6">
                  {children}
                </Stack>
              </Grid.Col>
              <Grid.Col span={1} data-class="sidebar" className={sidebar === 'left' ? 'md:order-1 order-2' : 'order-2'}>
                <Aside context={context} />
              </Grid.Col>
            </Grid>
          )}
        </Container>
      </Block>

      <Block component="footer" py="4" border="t" bg="card" data-class="site-footer">
        <Container max="w-6xl">
          <Stack gap="6" object="center">
            <Text text="sm" bg="secondary-foreground">© 2025 UI8Kit Design System</Text>
            <Group gap="4" justify="center">
              <a href="/"><Text text="xs" bg="secondary-foreground">Home</Text></a>
              <a href="/blog"><Text text="xs" bg="secondary-foreground">Blog</Text></a>
              <a href="/about"><Text text="xs" bg="secondary-foreground">About</Text></a>
            </Group>
          </Stack>
        </Container>
      </Block>
    </>
  )
}

const Aside = ({ context }: { context: RenderContext }) => (
  <Block component="aside">
    <Stack gap="6">
      <SearchBar />
      <CategoryList items={context.categories as any} />
      <a href="/categories"><Text text="sm" bg="secondary-foreground">View all categories</Text></a>
      <TagList items={context.tags as any} />
      <a href="/tags"><Text text="sm" bg="secondary-foreground">View all tags</Text></a>
      <a href="/authors"><Text text="sm" bg="secondary-foreground">View all authors</Text></a>
      <PopularPosts />
      <NewsletterSignup />
    </Stack>
  </Block>

)
