import { Block, Stack, Title, Text, Grid, Card, Image } from '@ui8kit/core'
import { useRenderContext } from '@/providers/render-context'
import { SEO } from '@/components/SEO'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { HtmlContent } from '@/components/HtmlContent'
import { useTheme } from '@/providers/theme'


export default function About() {
  const { context, loading, error } = useRenderContext()
  const { rounded } = useTheme()

  if (loading) {
    return (
      <Block component="main" py="lg">
        <Stack gap="lg">
          <SEO title="Loading About..." description="Loading page content..." />
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'About' }]} />
          <Stack gap="lg">
            <Title order={2} size="3xl" fw="bold">Loading About...</Title>
            <Text size="md" c="secondary-foreground">Fetching page content...</Text>
          </Stack>
        </Stack>
      </Block>
    )
  }

  if (error) {
    return (
      <Block component="main" py="lg">
        <Stack gap="lg">
          <SEO title="About Error" description="Failed to load page content" />
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'About' }]} />
          <Stack gap="lg">
            <Title order={2} size="3xl" fw="bold">About Error</Title>
            <Text size="md" c="secondary-foreground">Failed to load page content: {error}</Text>
          </Stack>
        </Stack>
      </Block>
    )
  }

  if (!context) {
    return (
      <Block component="main" py="lg">
        <Stack gap="lg">
          <SEO title="About Not Available" description="Page content not available" />
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'About' }]} />
          <Stack gap="lg">
            <Title order={2} size="3xl" fw="bold">Content Not Available</Title>
            <Text size="md" c="secondary-foreground">Page content is not available at the moment.</Text>
          </Stack>
        </Stack>
      </Block>
    )
  }

  const { about } = context
  return (
    <Block component="main" py="lg">
      <Stack gap="lg">
        <SEO title={about.page.title} description={about.page.excerpt} />
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'About' }]} />
        <Stack gap="lg">
          <Stack gap="lg">
            <Title order={2} size="3xl" fw="bold">{about.page.title}</Title>
            <HtmlContent html={about.page.excerpt} className="prose prose-sm text-secondary-foreground leading-relaxed" />
          </Stack>
          <Grid cols="1-2-3" gap="lg">
            {about.features.map((f: any) => (
              <Card key={f.id} p="lg" rounded={rounded.default} shadow="md" bg="card">
                <Stack gap="lg">
                  {f.featuredImage?.url && (
                    <Image src={f.featuredImage.url} alt={f.featuredImage.alt} rounded={rounded.default} w="full" h="auto" fit="cover" />
                  )}
                  <Stack gap="md">
                    <Title order={3} size="xl" fw="semibold">{f.title}</Title>
                    <HtmlContent html={f.excerpt} className="prose prose-sm text-secondary-foreground leading-relaxed" />
                  </Stack>
                </Stack>
              </Card>
            ))}
          </Grid>
        </Stack>
      </Stack>
    </Block>
  )
}


