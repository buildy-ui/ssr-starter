import { Stack, Title } from '@ui8kit/core'
import { SmallMediaCard } from '@/components/SmallMediaCard'

type Post = { id: number; categories?: { slug: string }[] }

export function RelatedPosts({ currentId, posts }: { currentId: number; posts: Post[] }) {
  const current = posts.find(p => p.id === currentId)
  const tags = new Set(current?.categories?.map(c => c.slug))
  const related = posts.filter(p => p.id !== currentId && p.categories?.some(c => tags.has(c.slug))).slice(0, 3)
  if (!related.length) return null
  return (
    <Stack gap="4">
      <Title order={2} text="xl">Related Posts</Title>
      <Stack gap="6">
        {related.map(p => (
          <SmallMediaCard key={p.id} item={p as any} />
        ))}
      </Stack>
    </Stack>
  )
}


