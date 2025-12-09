import { Card, Image, Stack, Title, Text, Group, Badge, Button } from '@ui8kit/core'
import { Link } from 'react-router-dom'
import { postPath } from '@/lib/paths'
import { useTheme } from '@/providers/theme'
import { HtmlContent } from '@/components/HtmlContent'
import { PostData } from '@/data/types'

type Post = PostData

export function PostCard({ post, media = 'default' }: { post: Post, media?: 'top' | 'default' }) {
  const { rounded } = useTheme()
  const cardImage = post.featuredImage?.sizes?.full;

  // Prefer medium for cards; fall back to mediumLarge -> thumbnail -> thumbnail field -> full
  /* const cardImage = post.featuredImage?.sizes?.medium
    || post.featuredImage?.sizes?.mediumLarge
    || post.featuredImage?.sizes?.thumbnail
    || post.thumbnail
    || post.featuredImage; */

  return (
    <Card p={media === 'top' ? 'none' : 'lg'} rounded={rounded.default} shadow="md" bg="card" data-class="post-card">
      <Stack gap={media === 'top' ? 'none' : 'lg'}>
        {cardImage?.url && (
          <Link to={postPath(post.slug)}>
            <Image
              src={cardImage.url}
              alt={cardImage.alt}
              rounded={media === 'top' ? 'none' : rounded.default}
              width={cardImage.width}
              height={cardImage.height}
              fit="cover"
            />
          </Link>
        )}
        <Stack p={media === 'top' ? 'md' : 'none'} gap="md">
          <Link to={postPath(post.slug)}>
            <Title order={3} size="xl" fw="semibold" c="foreground">{post.title}</Title>
          </Link>
          <HtmlContent html={post.excerpt.slice(0, 140)} className="text-sm text-secondary-foreground leading-relaxed" />
          {post.categories?.length ? (
            <Group gap="sm" align="center">
              {post.categories.slice(0, 2).map(cat => (
                <Badge key={cat.id} variant="secondary" rounded="full" size="sm">{cat.name}</Badge>
              ))}
            </Group>
          ) : null}
        </Stack>
        <Stack p={media === 'top' ? 'md' : 'none'} align="end">
          <Link to={postPath(post.slug)} title={`Read "${post.title}"`}>
            <Button variant="secondary">Read post</Button>
          </Link>
        </Stack>
      </Stack>
    </Card>
  )
}


