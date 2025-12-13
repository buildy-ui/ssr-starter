import { Group, Text, Icon } from '@ui8kit/core'
import { Calendar, Tag } from 'lucide-react'
import { Link } from 'react-router-dom'
import { categoryPath, tagPath } from '@/lib/paths'

type Meta = {
  date: string
  categories?: { id: number; name: string; slug?: string }[]
  tags?: { id: number; name: string; slug?: string }[]
}

export function PostMeta({ date, categories, tags }: Meta) {
  return (
    <Group gap="md" align="center">
      <Group gap="sm" align="center">
        <Icon lucideIcon={Calendar} c="muted" />
        <Text size="sm" c="secondary-foreground">{date}</Text>
      </Group>
      {categories?.length ? (
        <Group gap="sm" align="center">
          <Icon lucideIcon={Tag} c="muted" />
          <Group gap="sm" align="center">
            {categories.map((c, idx) => (
              <Link key={c.id} to={c.slug ? categoryPath(c.slug) : '#'}><Text size="sm" c="secondary-foreground">{c.name}{idx < (categories.length - 1) ? ',' : ''}</Text></Link>
            ))}
          </Group>
        </Group>
      ) : null}
      {tags?.length ? (
        <Group gap="sm" align="center">
          <Icon lucideIcon={Tag} c="muted" />
          <Group gap="sm" align="center">
            {tags.map((t, idx) => (
              <Link key={t.id} to={t.slug ? tagPath(t.slug) : '#'}><Text size="sm" c="secondary-foreground">{t.name}{idx < (tags.length - 1) ? ',' : ''}</Text></Link>
            ))}
          </Group>
        </Group>
      ) : null}
    </Group>
  )
}


