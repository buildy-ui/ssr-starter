import { useParams, Link } from 'react-router-dom'
import { Block, Stack, Title, Text, Grid, Button } from '@ui8kit/core'
import { useRenderContext } from '@/data'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PostCard } from '@/components/PostCard'
import { SEO } from '@/components/SEO'

export default function Tag() {
  const { slug } = useParams<{ slug: string }>()
  const { context, loading, error } = useRenderContext()

  if (loading) {
    return (
      <Block component="main" py="lg">
        <Stack gap="lg">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Blog', to: '/blog' }, { label: 'Loading...' }]} />
          <Title order={1} size="2xl">Loading Tag...</Title>
        </Stack>
      </Block>
    )
  }

  if (error) {
    return (
      <Block component="main" py="lg">
        <Stack gap="lg">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Blog', to: '/blog' }, { label: 'Error' }]} />
          <Title order={1} size="2xl">Tag Error</Title>
          <Text>Failed to load tag: {error}</Text>
        </Stack>
      </Block>
    )
  }

  const { posts } = context!
  const filtered = posts.posts.filter(p => p.tags?.some(t => t.slug === slug))
  const tagName = filtered[0]?.tags?.find(t => t.slug === slug)?.name || 'Tag'

  return (
    <Block component="main" py="lg">
      <Stack gap="lg">
        <SEO title={`Tag: ${tagName}`} description={`Posts tagged with ${tagName}.`} />
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Blog', to: '/blog' }, { label: tagName }]} />
        <Stack gap="md">
          <Title order={1} size="2xl">Tag: {tagName}</Title>
          <Text c="secondary-foreground">Posts tagged with “{tagName}”.</Text>
        </Stack>
        {filtered.length === 0 ? (
          <Stack gap="md">
            <Text>No posts found for this tag.</Text>
            <Link to="/blog"><Button>Back to blog</Button></Link>
          </Stack>
        ) : (
          <Grid cols="1-2-3" gap="lg">
            {filtered.map(p => <PostCard key={p.id} post={p as any} />)}
          </Grid>
        )}
      </Stack>
    </Block>
  )
}


