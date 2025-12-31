import { Block, Stack } from '@ui8kit/core'
import { useRenderContext } from '@/providers/render-context'
import { SEO } from '@/components/SEO'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { HtmlContent } from '@/components/HtmlContent'

export default function About() {
  const { context, loading, error } = useRenderContext()

  if (loading) {
    return (
      <Block component="main" py="8">
        <SEO title="Loading About..." description="Loading page content..." />
        <p>Loading...</p>
      </Block>
    )
  }

  if (error) {
    return (
      <Block component="main" py="8">
        <SEO title="About Error" description="Failed to load page content" />
        <p>Failed to load page content: {error}</p>
      </Block>
    )
  }

  if (!context) {
    return (
      <Block component="main" py="8">
        <SEO title="About Not Available" description="Page content not available" />
        <p>Page content is not available at the moment.</p>
      </Block>
    )
  }

  const aboutPage = context.pages.find((p) => p.slug === 'about')
  if (!aboutPage) {
    return (
      <Block component="main" py="8">
        <SEO title="About not found" description="About page is missing" />
        <p>About page not found</p>
      </Block>
    )
  }

  return (
    <Block component="main" py="8">
      <Stack gap="6">
        <SEO title={aboutPage.title} description={aboutPage.excerpt} />
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'About' }]} />
        <HtmlContent html={aboutPage.content || aboutPage.excerpt} className="prose prose-lg max-w-none" />
      </Stack>
    </Block>
  )
}


