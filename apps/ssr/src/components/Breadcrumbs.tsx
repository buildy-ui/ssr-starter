import { Link } from 'react-router-dom'
import { Group, Text, Icon } from '@ui8kit/core'
import { BreadcrumbJSONLD } from '@/components/SEO'
import { ChevronRight } from 'lucide-react'

type Crumb = { label: string; to?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const ldItems = items.map(({ label, to }) => ({ name: label, url: to }))
  return (
    <>
      <Group align="center" gap="sm" aria-label="Breadcrumb">
        {items.map((item, idx) => (
          <Group key={idx} align="center" gap="sm">
            {idx > 0 && <Icon lucideIcon={ChevronRight} c="muted" />}
            {item.to ? (
              <Link to={item.to}><Text size="sm" c="secondary-foreground">{item.label}</Text></Link>
            ) : (
              <Text size="sm">{item.label}</Text>
            )}
          </Group>
        ))}
      </Group>
      <BreadcrumbJSONLD items={ldItems} />
    </>
  )
}


