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
      <Stack gap="4">
        <Title order={2} text="2xl">Recent Posts</Title>
        <Text bg="secondary-foreground">Loading...</Text>
      </Stack>
    )
  }

  return (
    <Stack gap="4">
      <Title order={2} text="2xl">Recent Posts</Title>
      <Text bg="secondary-foreground">Fresh insights from the blog</Text>
      <Grid cols="1-2-3" gap="6">
        {recent.map(p => <PostCard key={p.id} post={p as any} />)}
      </Grid>
    </Stack>
  )
}


