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
      <Stack gap="4">
        <Title order={3} text="lg">Popular Posts</Title>
        <Stack gap="2">Loading...</Stack>
      </Stack>
    )
  }

  return (
    <Stack gap="4">
      <Title order={3} text="lg">Popular Posts</Title>
      <Stack gap="6">
        {popular.map(p => <SmallMediaCard key={p.id} item={p as any} />)}
      </Stack>
    </Stack>
  )
}


