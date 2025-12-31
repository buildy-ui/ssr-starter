import { Stack, Title, Text } from '@ui8kit/core'
import { Link } from 'react-router-dom'

type Category = { id: number; name: string; slug: string; count?: number }

export function CategoryList({ items }: { items: Category[] }) {
  return (
    <Stack gap="4">
      <Title order={3} text="lg">Categories</Title>
      <Stack gap="2">
        {items.map(c => (
          <Link key={c.id} to={`/category/${c.slug}`}>
            <Text text="sm" bg="secondary-foreground">{c.name}{typeof c.count === 'number' ? ` (${c.count})` : ''}</Text>
          </Link>
        ))}
      </Stack>
    </Stack>
  )
}


