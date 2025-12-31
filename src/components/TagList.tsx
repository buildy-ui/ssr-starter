import { Stack, Title, Badge } from '@ui8kit/core'
import { Link } from 'react-router-dom'

type Tag = { id: number; name: string; slug: string; count?: number }

export function TagList({ items }: { items: Tag[] }) {
  return (
    <Stack gap="4">
      <Title order={3} text="lg">Tags</Title>
      <Stack gap="2">
        {items.map(t => (
          <Link key={t.id} to={`/tag/${t.slug}`}>
            <Badge variant="secondary" rounded="full" size="sm">{t.name}{typeof t.count === 'number' ? ` (${t.count})` : ''}</Badge>
          </Link>
        ))}
      </Stack>
    </Stack>
  )
}


