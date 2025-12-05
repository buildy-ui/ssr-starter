import { Card, Image, Stack, Title, Text, Group, Badge, Button } from '@ui8kit/core'
import { Link } from 'react-router-dom'
import { postPath } from '@/lib/paths'
import { useTheme } from '@/providers/theme'

type Post = {
  id: number
  title: string
  excerpt: string
  slug: string
  thumbnail?: { url: string; alt: string }
  categories?: { id: number; name: string; slug: string }[]
  media?: string
}

export function PostCard({ post, media = 'default' }: { post: Post, media?: 'top' | 'default' }) {
  const { rounded } = useTheme()

  return (
    <Card p={media === 'top' ? 'none' : 'lg'} rounded={rounded.default} shadow="md" bg="card" data-class="post-card">
      <Stack gap={media === 'top' ? 'none' : 'lg'}>
        {post.thumbnail?.url && (
          <Link to={postPath(post.slug)}>
            <Image
              src={post.thumbnail.url}
              alt={post.thumbnail.alt}
              rounded={media === 'top' ? 'none' : rounded.default}
              w="full"
              h="auto"
              fit="cover"
            />
          </Link>
        )}
        <Stack p={media === 'top' ? 'md' : 'none'} gap="md">
          <Link to={postPath(post.slug)}>
            <Title order={3} size="xl" fw="semibold" c="foreground">{post.title}</Title>
          </Link>
          <Text size="xs" c="secondary-foreground" leading="relaxed">{post.excerpt}</Text>
          {post.categories?.length ? (
            <Group gap="sm" align="center">
              {post.categories.slice(0, 2).map(cat => (
                <Badge key={cat.id} variant="secondary" rounded="full" size="sm">{cat.name}</Badge>
              ))}
            </Group>
          ) : null}
        </Stack>
        <Stack p={media === 'top' ? 'md' : 'none'} align="end">
          <Link to={postPath(post.slug)}>
            <Button variant="secondary">Read more</Button>
          </Link>
        </Stack>
      </Stack>
    </Card>
  )
}


