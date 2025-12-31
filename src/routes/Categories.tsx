import { Block, Stack, Title, Text, Grid } from '@ui8kit/core'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SEO } from '@/components/SEO'
import { useRenderContext } from '@/data'
import { CategoryCard } from '@/components/cards/CategoryCard'

export default function Categories() {
  const { context, loading, error } = useRenderContext()

  if (loading) {
    return (
      <Block component="main" py="8">
        <Stack gap="6">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Categories' }]} />
          <Title order={1} text="2xl">Loading Categories...</Title>
        </Stack>
      </Block>
    )
  }

  if (error) {
    return (
      <Block component="main" py="8">
        <Stack gap="6">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Categories' }]} />
          <Title order={1} text="2xl">Categories Error</Title>
          <Text>Failed to load categories: {error}</Text>
        </Stack>
      </Block>
    )
  }

  const { categories } = context!
  return (
    <Block component="main" py="8">
      <Stack gap="6">
        <SEO title="Categories" description="Browse all categories." />
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Categories' }]} />
        <Stack gap="4">
          <Title order={1} text="2xl" font="bold">Categories</Title>
          <Text bg="secondary-foreground">Browse all categories.</Text>
        </Stack>
        <Grid cols="1-2-3" gap="6">
          {categories.map(c => <CategoryCard key={c.id} item={c as any} />)}
        </Grid>
      </Stack>
    </Block>
  )
}


