import { Block, Stack, Title, Text, Grid } from '@ui8kit/core'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SEO } from '@/components/SEO'
import { useRenderContext } from '@/data'
import { TagCard } from '@/components/cards/TagCard'

export default function Tags() {
  const { context, loading, error } = useRenderContext()

  if (loading) {
    return (
      <Block component="main" py="lg">
        <Stack gap="lg">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Tags' }]} />
          <Title order={1} size="2xl">Loading Tags...</Title>
        </Stack>
      </Block>
    )
  }

  if (error) {
    return (
      <Block component="main" py="lg">
        <Stack gap="lg">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Tags' }]} />
          <Title order={1} size="2xl">Tags Error</Title>
          <Text>Failed to load tags: {error}</Text>
        </Stack>
      </Block>
    )
  }

  const { tags } = context!
  return (
    <Block component="main" py="lg">
      <Stack gap="lg">
        <SEO title="Tags" description="Browse all tags." />
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Tags' }]} />
        <Stack gap="md">
          <Title order={1} size="2xl">Tags</Title>
          <Text c="secondary-foreground">Browse all tags.</Text>
        </Stack>
        <Grid cols="1-2-3" gap="lg">
          {tags.map(t => <TagCard key={t.id} item={t as any} />)}
        </Grid>
      </Stack>
    </Block>
  )
}


