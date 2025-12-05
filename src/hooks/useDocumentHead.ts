import { useEffect } from 'react'

interface DocumentHeadOptions {
  title?: string
  description?: string
  ogTitle?: string
  ogDescription?: string
  ogType?: string
}

export function useDocumentHead(options: DocumentHeadOptions) {
  useEffect(() => {
    if (typeof document === 'undefined') return

    const { title, description, ogTitle, ogDescription, ogType } = options

    // Store original values to restore on cleanup
    const originalTitle = document.title
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute('content')

    // Update title
    if (title) {
      document.title = title
    }

    // Update or create description meta tag
    if (description) {
      let descMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement
      if (!descMeta) {
        descMeta = document.createElement('meta')
        descMeta.name = 'description'
        document.head.appendChild(descMeta)
      }
      descMeta.content = description
    }

    // Update or create Open Graph tags
    const updateOgTag = (property: string, content: string) => {
      let ogMeta = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement
      if (!ogMeta) {
        ogMeta = document.createElement('meta')
        ogMeta.setAttribute('property', property)
        document.head.appendChild(ogMeta)
      }
      ogMeta.content = content
    }

    if (ogTitle) updateOgTag('og:title', ogTitle)
    if (ogDescription) updateOgTag('og:description', ogDescription)
    if (ogType) updateOgTag('og:type', ogType)

    // Cleanup function to restore original values
    return () => {
      document.title = originalTitle
      if (originalDescription) {
        const descMeta = document.querySelector('meta[name="description"]') as HTMLMetaElement
        if (descMeta) {
          descMeta.content = originalDescription
        }
      }
    }
  }, [options.title, options.description, options.ogTitle, options.ogDescription, options.ogType])
}
