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
      <Block component="nav" py="xs" bg="background" data-class="nav-bar" borderBottom="1px" borderColor="border" shadow="lg">
        <Container size="lg">
          <Group justify="between" align="center">
            <Group align="center" gap="md">
              <a href="/">
                <Title order={2} size="2xl" fw="bold" c="primary">UI8Kit</Title>
              </a>
              <Text size="sm" c="secondary-foreground">Design System</Text>
            </Group>

            <Group align="center" gap="sm">

              <nav className="hidden md:flex">
                <Group align="center" gap="sm" data-class="nav">
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
                <Stack gap="sm">
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

      <Block component="main" py="lg" data-class="main-page">
        <Container size="lg">
          {sidebar === 'none' ? (
            <Stack gap="lg">
              {children}
            </Stack>
          ) : (
            <Grid cols="1-4" gap={defaultGap}>
              <Grid.Col span={3} data-class="main-content" className={sidebar === 'left' ? 'md:order-2 order-1' : 'order-1'}>
                <Stack gap="lg">
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

      <Block component="footer" py="md" borderTop="1px" borderColor="border" bg="card" data-class="site-footer">
        <Container size="lg">
          <Stack gap="lg" align="center">
            <Text size="sm" c="secondary-foreground" ta="center">© 2025 UI8Kit Design System</Text>
            <Group gap="md" justify="center">
              <a href="/"><Text size="xs" c="secondary-foreground">Home</Text></a>
              <a href="/blog"><Text size="xs" c="secondary-foreground">Blog</Text></a>
              <a href="/about"><Text size="xs" c="secondary-foreground">About</Text></a>
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
      <a href="/categories"><Text size="sm" c="secondary-foreground">View all categories</Text></a>
      <TagList items={context.tags as any} />
      <a href="/tags"><Text size="sm" c="secondary-foreground">View all tags</Text></a>
      <a href="/authors"><Text size="sm" c="secondary-foreground">View all authors</Text></a>
      <PopularPosts />
      <NewsletterSignup />
    </Stack>
  </Block>

)
