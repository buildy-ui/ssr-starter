import { Block, Stack } from '@ui8kit/core'
import { SEO } from '@/components/SEO'
import { HtmlContent } from '@/components/HtmlContent'
import { HomeLatest } from '@/components/HomeLatest'
import { useRenderContext } from '@/providers/render-context'

export default function Home() {
  const { context, loading, error } = useRenderContext()

  if (loading) {
    return (
      <Block component="main" py="8">
        <SEO title="Loading..." description="Loading page content..." />
        <p>Loading...</p>
      </Block>
    )
  }

  if (error) {
    return (
      <Block component="main" py="8">
        <SEO title="Error" description="Failed to load page content" />
        <p>Failed to load page content: {error}</p>
      </Block>
    )
  }

  if (!context) {
    return (
      <Block component="main" py="8">
        <SEO title="Not Available" description="Page content not available" />
        <p>Page content is not available at the moment.</p>
      </Block>
    )
  }

  const homePage = context.pages.find((p) => p.slug === 'home')
  if (!homePage) {
    return (
      <Block component="main" py="8">
        <SEO title="Home not found" description="Home page is missing" />
        <p>Home page not found</p>
      </Block>
    )
  }

  return (
    <Block component="main" py="8">
      <SEO title={homePage.title} description={homePage.excerpt} />

      <Stack gap="lg">
        <HtmlContent html={homePage.content || homePage.excerpt} className="prose prose-lg max-w-none" />

        <HomeLatest />
      </Stack>
    </Block>
  )
}


