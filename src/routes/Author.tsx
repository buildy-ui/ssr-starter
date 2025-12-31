import { useParams, Link } from 'react-router-dom'
import { Block, Stack, Title, Text, Grid, Button } from '@ui8kit/core'
import { useRenderContext } from '@/data'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { PostCard } from '@/components/PostCard'
import { SEO } from '@/components/SEO'

export default function Author() {
  const { slug } = useParams<{ slug: string }>()
  const { context, loading, error } = useRenderContext()

  if (loading) {
    return (
      <Block component="main" py="8">
        <Stack gap="lg">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Blog', to: '/blog' }, { label: 'Loading...' }]} />
          <Title order={1} text="2xl">Loading Author...</Title>
        </Stack>
      </Block>
    )
  }

  if (error) {
    return (
      <Block component="main" py="8">
        <Stack gap="lg">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Blog', to: '/blog' }, { label: 'Error' }]} />
          <Title order={1} text="2xl">Author Error</Title>
          <Text>Failed to load author: {error}</Text>
        </Stack>
      </Block>
    )
  }

  const { posts } = context!
  const filtered = posts.posts.filter(p => p.author?.slug === slug)
  const authorName = filtered[0]?.author?.name || 'Author'

  return (
    <Block component="main" py="8">
      <Stack gap="lg">
        <SEO title={`Author: ${authorName}`} description={`Posts written by ${authorName}.`} />
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Blog', to: '/blog' }, { label: authorName }]} />
        <Stack gap="md">
          <Title order={1} text="2xl">Author: {authorName}</Title>
          <Text bg="secondary-foreground">Posts written by {authorName}.</Text>
        </Stack>
        {filtered.length === 0 ? (
          <Stack gap="md">
            <Text>No posts found for this author.</Text>
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


