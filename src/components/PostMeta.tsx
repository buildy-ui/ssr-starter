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
    <Group gap="4" text="center">
      <Group gap="2" text="center">
        <Icon lucideIcon={Calendar} bg="muted" />
        <Text text="sm" bg="secondary-foreground">{date}</Text>
      </Group>
      {categories?.length ? (
        <Group gap="2" text="center">
          <Icon lucideIcon={Tag} bg="muted" />
          <Group gap="2" text="center">
            {categories.map((c, idx) => (
              <Link key={c.id} to={c.slug ? categoryPath(c.slug) : '#'}><Text text="sm" bg="secondary-foreground">{c.name}{idx < (categories.length - 1) ? ',' : ''}</Text></Link>
            ))}
          </Group>
        </Group>
      ) : null}
      {tags?.length ? (
        <Group gap="2" text="center">
          <Icon lucideIcon={Tag} bg="muted" />
          <Group gap="2" text="center">
            {tags.map((t, idx) => (
              <Link key={t.id} to={t.slug ? tagPath(t.slug) : '#'}><Text text="sm" bg="secondary-foreground">{t.name}{idx < (tags.length - 1) ? ',' : ''}</Text></Link>
            ))}
          </Group>
        </Group>
      ) : null}
    </Group>
  )
}


