import { Group, Image, Stack, Title, Text, Card } from '@ui8kit/core'
import { Link } from 'react-router-dom'
import { postPath } from '@/lib/paths'
import { useTheme } from '@/providers/theme'

type Item = {
  id: number
  title: string
  slug: string
  excerpt?: string
  thumbnail?: { url: string; alt: string }
}

export function SmallMediaCard({ item }: { item: Item }) {
  const { rounded } = useTheme()
  return (
    <Card p="md" rounded={rounded.default} shadow="none" bg="card" data-class="small-media-card">
      <Group gap="md" align="start">
        {item.thumbnail?.url && (
          <Link to={postPath(item.slug)}>
            <Image src={item.thumbnail.url} alt={item.title} rounded={rounded.default} width={72} height={72} aspect="square" fit="cover" />
          </Link>
        )}
        <Stack gap="sm">
          <Link to={postPath(item.slug)}>
            <Title order={4} size="sm" fw="bold" c="foreground">{item.title}</Title>
          </Link>
          {item.excerpt && <Text size="xs" c="secondary-foreground" leading="relaxed">{item.excerpt.slice(0, 80)}...</Text>}
        </Stack>
      </Group>
    </Card>
  )
}


