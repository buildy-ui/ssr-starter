import { useSearchParams } from 'react-router-dom'
import { Block, Stack, Title, Text, Grid } from '@ui8kit/core'
import { useRenderContext } from '@/data'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SEO } from '@/components/SEO'
import { PostCard } from '@/components/PostCard'
import { CategoryCard } from '@/components/cards/CategoryCard'
import { TagCard } from '@/components/cards/TagCard'
import { AuthorCard } from '@/components/cards/AuthorCard'
import { SearchBar } from '@/components/SearchBar'

export default function Search() {
  const [sp] = useSearchParams()
  const q = (sp.get('q') || '').trim().toLowerCase()
  const { context, loading, error } = useRenderContext()

  if (loading) {
    return (
      <Block component="main" py="8">
        <Stack gap="lg">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Search' }]} />
          <Title order={1} size="2xl">Loading Search...</Title>
        </Stack>
      </Block>
    )
  }

  if (error) {
    return (
      <Block component="main" py="8">
        <Stack gap="lg">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Search' }]} />
          <Title order={1} size="2xl">Search Error</Title>
          <Text>Failed to load search data: {error}</Text>
        </Stack>
      </Block>
    )
  }

  const { posts, categories, tags, authors } = context!

  const postHits = posts.posts.filter(p => p.title.toLowerCase().includes(q) || p.excerpt.toLowerCase().includes(q))
  const catHits = categories.filter(c => c.name.toLowerCase().includes(q))
  const tagHits = tags.filter(t => t.name.toLowerCase().includes(q))
  const authorHits = authors.filter(a => a.name.toLowerCase().includes(q))

  return (
    <Block component="main" py="8">
      <Stack gap="lg">
        <SEO title={q ? `Search: ${q}` : 'Search'} description={q ? `Search results for "${q}"` : 'Search for posts, categories, tags and authors.'} />
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Search' }]} />
        <Stack gap="md">
          <Title order={1} size="2xl">Search</Title>
          <SearchBar initial={q} />
        </Stack>

        <Stack gap="md">
          <Title order={2} size="xl">Posts ({postHits.length})</Title>
          {postHits.length ? (
            <Grid cols="1-2-3" gap="lg">
              {postHits.map(p => <PostCard key={p.id} post={p as any} />)}
            </Grid>
          ) : <Text c="secondary-foreground">No posts found.</Text>}
        </Stack>

        <Stack gap="md">
          <Title order={2} size="xl">Categories ({catHits.length})</Title>
          {catHits.length ? (
            <Grid cols="1-2-3" gap="lg">
              {catHits.map(c => <CategoryCard key={c.id} item={c as any} />)}
            </Grid>
          ) : <Text c="secondary-foreground">No categories found.</Text>}
        </Stack>

        <Stack gap="md">
          <Title order={2} size="xl">Tags ({tagHits.length})</Title>
          {tagHits.length ? (
            <Grid cols="1-2-3" gap="lg">
              {tagHits.map(t => <TagCard key={t.id} item={t as any} />)}
            </Grid>
          ) : <Text c="secondary-foreground">No tags found.</Text>}
        </Stack>

        <Stack gap="md">
          <Title order={2} size="xl">Authors ({authorHits.length})</Title>
          {authorHits.length ? (
            <Grid cols="1-2-3" gap="lg">
              {authorHits.map(a => <AuthorCard key={a.id} item={{ ...(a as any), avatarUrl: 'https://i.pravatar.cc/96?img=' + a.id }} />)}
            </Grid>
          ) : <Text c="secondary-foreground">No authors found.</Text>}
        </Stack>
      </Stack>
    </Block>
  )
}


