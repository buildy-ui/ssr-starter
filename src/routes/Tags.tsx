import { Block, Stack, Title, Text, Grid } from '@ui8kit/core'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SEO } from '@/components/SEO'
import { useRenderContext } from '@/data'
import { TagCard } from '@/components/cards/TagCard'

export default function Tags() {
  const { context, loading, error } = useRenderContext()

  if (loading) {
    return (
      <Block component="main" py="8">
        <Stack gap="6">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Tags' }]} />
          <Title order={1} text="2xl">Loading Tags...</Title>
        </Stack>
      </Block>
    )
  }

  if (error) {
    return (
      <Block component="main" py="8">
        <Stack gap="6">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Tags' }]} />
          <Title order={1} text="2xl">Tags Error</Title>
          <Text>Failed to load tags: {error}</Text>
        </Stack>
      </Block>
    )
  }

  const { tags } = context!
  return (
    <Block component="main" py="8">
      <Stack gap="6">
        <SEO title="Tags" description="Browse all tags." />
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Tags' }]} />
        <Stack gap="4">
          <Title order={1} text="2xl">Tags</Title>
          <Text bg="secondary-foreground">Browse all tags.</Text>
        </Stack>
        <Grid cols="1-2-3" gap="6">
          {tags.map(t => <TagCard key={t.id} item={t as any} />)}
        </Grid>
      </Stack>
    </Block>
  )
}


