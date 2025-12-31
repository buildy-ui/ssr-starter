import { Link } from 'react-router-dom'
import { Group, Text, Icon } from '@ui8kit/core'
import { BreadcrumbJSONLD } from '@/components/SEO'
import { ChevronRight } from 'lucide-react'

type Crumb = { label: string; to?: string }

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const ldItems = items.map(({ label, to }) => ({ name: label, url: to }))
  return (
    <>
      <Group text="center" gap="2" aria-label="Breadcrumb">
        {items.map((item, idx) => (
          <Group key={idx} text="center" gap="2">
            {idx > 0 && <Icon lucideIcon={ChevronRight} bg="muted" />}
            {item.to ? (
              <Link to={item.to}><Text text="sm" bg="secondary-foreground">{item.label}</Text></Link>
            ) : (
              <Text text="sm">{item.label}</Text>
            )}
          </Group>
        ))}
      </Group>
      <BreadcrumbJSONLD items={ldItems} />
    </>
  )
}


