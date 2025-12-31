import { Card, Stack, Title, Text, Button, Image, Group } from '@ui8kit/core'
import { Link } from 'react-router-dom'
import { authorPath } from '@/lib/paths'
import { useTheme } from '@/providers/theme'

type Author = { id: number; name: string; slug: string; count?: number; avatarUrl?: string }

export function AuthorCard({ item }: { item: Author }) {
  const { rounded } = useTheme()
  return (
    <Card p="6" rounded={rounded.default} shadow="sm" bg="card">
      <Group gap="4" text="center">
        {item.avatarUrl && <Image src={item.avatarUrl} alt={item.name} rounded="full" w={"auto"} height={48} />}
        <Stack gap="2">
          <Title order={3} text="lg">{item.name}</Title>
          {typeof item.count === 'number' && <Text text="sm" bg="secondary-foreground">{item.count} posts</Text>}
        </Stack>
      </Group>
      <Link to={authorPath(item.slug)}>
        <Button size="sm">View posts</Button>
      </Link>
    </Card>
  )
}


