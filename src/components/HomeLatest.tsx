import { Stack, Title, Text, Grid } from '@ui8kit/core'
import { useRenderContext } from '@/data'
import { PostCard } from '@/components/PostCard'

export function HomeLatest() {
  const { context, loading, error } = useRenderContext()

  // Always calculate latest posts, but with fallback
  const postsData = context?.posts.posts || []
  const latest = postsData.slice(0, 4)

  if (loading) {
    return (
      <Stack gap="md">
        <Title order={2} size="2xl">Latest Posts</Title>
        <Text c="secondary-foreground">Loading posts...</Text>
      </Stack>
    )
  }

  if (error) {
    return (
      <Stack gap="md">
        <Title order={2} size="2xl">Latest Posts</Title>
        <Text c="secondary-foreground">Failed to load posts</Text>
      </Stack>
    )
  }

  if (!context) {
    return (
      <Stack gap="md">
        <Title order={2} size="2xl">Latest Posts</Title>
        <Text c="secondary-foreground">No posts available</Text>
      </Stack>
    )
  }

  return (
    <Stack gap="md">
      <Title order={2} size="2xl">Latest Posts</Title>
      <Text c="secondary-foreground">Fresh insights from the blog</Text>
      <Grid cols="1-2-4" gap="lg">
        {latest.map(p => <PostCard key={p.id} post={p as any} media="top" />)}
      </Grid>
    </Stack>
  )
}


