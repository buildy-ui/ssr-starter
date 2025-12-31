import { Card, Stack, Title, Text, Button } from '@ui8kit/core'
import { Link } from 'react-router-dom'
import { tagPath } from '@/lib/paths'
import { useTheme } from '@/providers/theme'

type Tag = { id: number; name: string; slug: string; count?: number }

export function TagCard({ item }: { item: Tag }) {
  const { rounded } = useTheme()
  return (
    <Card p="6" rounded={rounded.default} shadow="sm" bg="card">
      <Stack gap="4">
        <Title order={3} text="lg">{item.name}</Title>
        {typeof item.count === 'number' && (
          <Text text="sm" bg="secondary-foreground">{item.count} posts</Text>
        )}
        <Link to={tagPath(item.slug)}>
          <Button>View posts</Button>
        </Link>
      </Stack>
    </Card>
  )
}


