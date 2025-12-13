import { Stack, Title, Text, Grid } from '@ui8kit/core'
import { useRenderContext } from '@/data'
import { PostCard } from '@/components/PostCard'

export function RecentPosts() {
  const { context, loading } = useRenderContext()

  // Always calculate recent posts, but with fallback
  const postsData = context?.posts.posts || []
  const recent = postsData.slice(0, 3)

  if (loading) {
    return (
      <Stack gap="md">
        <Title order={2} size="2xl">Recent Posts</Title>
        <Text c="secondary-foreground">Loading...</Text>
      </Stack>
    )
  }

  return (
    <Stack gap="md">
      <Title order={2} size="2xl">Recent Posts</Title>
      <Text c="secondary-foreground">Fresh insights from the blog</Text>
      <Grid cols="1-2-3" gap="lg">
        {recent.map(p => <PostCard key={p.id} post={p as any} />)}
      </Grid>
    </Stack>
  )
}


