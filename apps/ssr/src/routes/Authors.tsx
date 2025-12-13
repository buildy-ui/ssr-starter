import { Block, Stack, Title, Text, Grid } from '@ui8kit/core'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SEO } from '@/components/SEO'
import { useRenderContext } from '@/data'
import { AuthorCard } from '@/components/cards/AuthorCard'

export default function Authors() {
  const { context, loading, error } = useRenderContext()

  if (loading) {
    return (
      <Block component="main" py="lg">
        <Stack gap="lg">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Authors' }]} />
          <Title order={1} size="2xl">Loading Authors...</Title>
        </Stack>
      </Block>
    )
  }

  if (error) {
    return (
      <Block component="main" py="lg">
        <Stack gap="lg">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Authors' }]} />
          <Title order={1} size="2xl">Authors Error</Title>
          <Text>Failed to load authors: {error}</Text>
        </Stack>
      </Block>
    )
  }

  const { authors } = context!
  const items = authors.map(a => ({ ...a, avatarUrl: 'https://i.pravatar.cc/96?img=' + a.id }))
  return (
    <Block component="main" py="lg">
      <Stack gap="lg">
        <SEO title="Authors" description="Browse all authors." />
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Authors' }]} />
        <Stack gap="md">
          <Title order={1} size="2xl">Authors</Title>
          <Text c="secondary-foreground">Browse all authors.</Text>
        </Stack>
        <Grid cols="1-2-3" gap="lg">
          {items.map(a => <AuthorCard key={a.id} item={a as any} />)}
        </Grid>
      </Stack>
    </Block>
  )
}


