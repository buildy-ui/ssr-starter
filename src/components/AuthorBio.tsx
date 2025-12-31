import { Card, Group, Image, Stack, Title, Text } from '@ui8kit/core'
import { Link } from 'react-router-dom'
import { authorPath } from '@/lib/paths'
import { useTheme } from '@/providers/theme'

type Author = {
  name: string
  role?: string
  avatar?: { url: string; alt: string }
  bio?: string
}

export function AuthorBio({ author }: { author: Author & { slug?: string } }) {
  const { rounded } = useTheme()
  return (
    <Card p="6" rounded={rounded.default} shadow="sm" bg="card">
      <Link to={author.slug ? authorPath(author.slug) : '#'}>
        <Group gap="4" justify="start" items="start">
          {author.avatar?.url && (
            <Image src={author.avatar.url} alt={author.avatar.alt} rounded="full" width={72} height={72} />
          )}
          <Stack gap="2">
            <Title order={3} text="sm" font="bold">{author.name}</Title>
            {author.role && <Text text="xs" font="bold" bg="secondary-foreground">{author.role}</Text>}
            {author.bio && <Text text="xs" bg="secondary-foreground">{author.bio}</Text>}
          </Stack>
        </Group>
      </Link>
    </Card>
  )
}


