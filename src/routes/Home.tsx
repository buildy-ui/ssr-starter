import { Block, Stack, Title, Text, Button, Grid, Card, Group, Image } from '@ui8kit/core'
import { SEO } from '@/components/SEO'
import { HtmlContent } from '@/components/HtmlContent'
import { HomeLatest } from '@/components/HomeLatest'
import { useRenderContext } from '@/providers/render-context'
import { useTheme } from '@/providers/theme'

export default function Home() {
  const { context, loading, error } = useRenderContext()
  const { rounded } = useTheme()

  if (loading) {
    return (
      <Block component="main" py="lg">
        <Stack gap="lg">
          <SEO title="Loading..." description="Loading page content..." />
          <Stack gap="2xl" py="lg" data-class="hero-section">
            <Stack gap="md" align="center" ta="center">
              <Title order={1} size="4xl" fw="bold" c="foreground">Loading...</Title>
              <Text size="lg" c="secondary-foreground" leading="relaxed">Fetching page content...</Text>
            </Stack>
          </Stack>
        </Stack>
      </Block>
    )
  }

  if (error) {
    return (
      <Block component="main" py="lg">
        <Stack gap="lg">
          <SEO title="Error" description="Failed to load page content" />
          <Stack gap="2xl" py="lg" data-class="hero-section">
            <Stack gap="md" align="center" ta="center">
              <Title order={1} size="4xl" fw="bold" c="foreground">Error</Title>
              <Text size="lg" c="secondary-foreground" leading="relaxed">Failed to load page content: {error}</Text>
            </Stack>
          </Stack>
        </Stack>
      </Block>
    )
  }

  if (!context) {
    return (
      <Block component="main" py="lg">
        <Stack gap="lg">
          <SEO title="Not Available" description="Page content not available" />
          <Stack gap="2xl" py="lg" data-class="hero-section">
            <Stack gap="md" align="center" ta="center">
              <Title order={1} size="4xl" fw="bold" c="foreground">Content Not Available</Title>
              <Text size="lg" c="secondary-foreground" leading="relaxed">Page content is not available at the moment.</Text>
            </Stack>
          </Stack>
        </Stack>
      </Block>
    )
  }

  const { home } = context
  return (
    <Block component="main" py="lg">
      <SEO title={home.page.title} description={home.page.excerpt} />

      <Stack gap="2xl" py="lg" data-class="hero-section">
        <Stack gap="md" align="center" ta="center">
          <Title order={1} size="4xl" fw="bold" c="foreground">{home.page.title}</Title>
          <HtmlContent html={home.page.excerpt} className="text-lg text-secondary-foreground leading-relaxed" />
        </Stack>
        <Group gap="md" justify="center">
          <Button variant="default">Get Started</Button>
          <Button variant="secondary">Learn More</Button>
        </Group>
      </Stack>

      <Stack gap="lg">
        <Stack gap="lg">
          <Title order={2} size="3xl" fw="bold">Features Posts</Title>
          <Text size="md" c="secondary-foreground">Discover what makes our approach unique</Text>
        </Stack>
        <Grid cols="1-2-3" gap="lg">
          {home.features.map((f) => (
            <Card key={f.id} p="lg" rounded={rounded.default} shadow="md" bg="card">
              <Stack gap="lg">
                {f.featuredImage?.url && (
                  <Image src={f.featuredImage.url} alt={f.featuredImage.alt} rounded={rounded.default} w="full" h="auto" fit="cover" />
                )}
                <Stack gap="md">
                  <Title order={3} size="xl" fw="semibold">{f.title}</Title>
                  <HtmlContent html={f.excerpt} className="text-sm text-secondary-foreground leading-relaxed" />
                </Stack>
              </Stack>
            </Card>
          ))}
        </Grid>

        <HomeLatest />
      </Stack>
    </Block>
  )
}


