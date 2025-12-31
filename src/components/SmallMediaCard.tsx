import { Group, Image, Stack, Title, Text, Card } from '@ui8kit/core'
import { Link } from 'react-router-dom'
import { postPath } from '@/lib/paths'
import { useTheme } from '@/providers/theme'
import { HtmlContent } from '@/components/HtmlContent'

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
    <Card p="4" rounded={rounded.default} shadow="none" bg="card" data-class="small-media-card">
      <Group gap="4" justify="start">
        {item.thumbnail?.url && (
          <Link to={postPath(item.slug)}>
            <Image src={item.thumbnail.url} alt={item.title} rounded={rounded.default} width={72} height={72} aspect="square" fit="cover" />
          </Link>
        )}
        <Stack gap="2">
          <Link to={postPath(item.slug)}>
            <Title order={4} text="sm" font="bold" bg="foreground">{item.title}</Title>
          </Link>
          {item.excerpt && <HtmlContent html={item.excerpt.slice(0, 80)} className="text-sm text-secondary-foreground leading-relaxed" />}
        </Stack>
      </Group>
    </Card>
  )
}


