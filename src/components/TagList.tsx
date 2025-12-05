import { Stack, Title, Badge } from '@ui8kit/core'
import { Link } from 'react-router-dom'

type Tag = { id: number; name: string; slug: string; count?: number }

export function TagList({ items }: { items: Tag[] }) {
  return (
    <Stack gap="md">
      <Title order={3} size="lg">Tags</Title>
      <Stack gap="sm">
        {items.map(t => (
          <Link key={t.id} to={`/tag/${t.slug}`}>
            <Badge variant="secondary" rounded="full" size="sm">{t.name}{typeof t.count === 'number' ? ` (${t.count})` : ''}</Badge>
          </Link>
        ))}
      </Stack>
    </Stack>
  )
}


