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
    <Card p="lg" rounded={rounded.default} shadow="sm" bg="card">
      <Link to={author.slug ? authorPath(author.slug) : '#'}>
        <Group gap="md" align="start">
          {author.avatar?.url && (
            <Image src={author.avatar.url} alt={author.avatar.alt} rounded="full" width={72} height={72} />
          )}
          <Stack gap="sm">
            <Title order={3} size="sm" fw="bold">{author.name}</Title>
            {author.role && <Text size="xs" fw="bold" c="secondary-foreground">{author.role}</Text>}
            {author.bio && <Text size="xs" c="secondary-foreground">{author.bio}</Text>}
          </Stack>
        </Group>
      </Link>
    </Card>
  )
}


