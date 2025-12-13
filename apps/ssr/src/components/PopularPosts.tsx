import { Stack, Title } from '@ui8kit/core'
import { useRenderContext } from '@/data'
import { SmallMediaCard } from '@/components/SmallMediaCard'

export function PopularPosts() {
  const { context, loading } = useRenderContext()

  // Always calculate popular posts, but with fallback
  const postsData = context?.posts.posts || []
  const popular = postsData.slice(0, 5)

  if (loading) {
    return (
      <Stack gap="md">
        <Title order={3} size="lg">Popular Posts</Title>
        <Stack gap="sm">Loading...</Stack>
      </Stack>
    )
  }

  return (
    <Stack gap="md">
      <Title order={3} size="lg">Popular Posts</Title>
      <Stack gap="lg">
        {popular.map(p => <SmallMediaCard key={p.id} item={p as any} />)}
      </Stack>
    </Stack>
  )
}


