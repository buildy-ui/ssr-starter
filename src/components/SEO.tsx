import { useDocumentHead } from '@/hooks/useDocumentHead'

export function SEO({ title, description }: { title: string; description?: string }) {
  useDocumentHead({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: 'website'
  })

  return null
}

export function BreadcrumbJSONLD({ items }: { items: { name: string; url?: string }[] }) {
  const itemListElement = items.map((it, idx) => ({
    '@type': 'ListItem',
    position: idx + 1,
    name: it.name,
    item: it.url || undefined,
  }))
  const json = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement,
  }
  
  // Use dangerouslySetInnerHTML for script injection
  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  )
}


