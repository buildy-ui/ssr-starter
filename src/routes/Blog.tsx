import { Block, Stack, Title, Text, Grid } from '@ui8kit/core'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SEO } from '@/components/SEO'
import { HtmlContent } from '@/components/HtmlContent'
import { PostCard } from '@/components/PostCard'
import { Pagination } from '@/components/Pagination'
import { useMemo, useState } from 'react'
import { useRenderContext } from '@/data'

export default function Blog() {
  const { context, loading, error } = useRenderContext()
  const [page, setPage] = useState(1)
  const perPage = 3

  // Always calculate pagination data, but with fallback
  const postsData = context?.posts.posts || []
  const total = Math.max(1, Math.ceil(postsData.length / perPage))
  const pageItems = useMemo(() => postsData.slice((page - 1) * perPage, page * perPage), [postsData, page])

  // Show loading state
  if (loading) {
    return (
      <Block component="main" py="lg">
        <Stack gap="lg">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Blog' }]} />
          <Stack gap="md">
            <Title order={1} size="2xl">Loading Blog...</Title>
            <Text c="secondary-foreground">Fetching posts from CMS...</Text>
          </Stack>
        </Stack>
      </Block>
    )
  }

  // Show error state
  if (error) {
    return (
      <Block component="main" py="lg">
        <Stack gap="lg">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Blog' }]} />
          <Stack gap="md">
            <Title order={1} size="2xl">Blog Error</Title>
            <Text c="secondary-foreground">Failed to load posts: {error}</Text>
          </Stack>
        </Stack>
      </Block>
    )
  }

  // Use context data
  if (!context) {
    return (
      <Block component="main" py="lg">
        <Stack gap="lg">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Blog' }]} />
          <Stack gap="md">
            <Title order={1} size="2xl">Blog</Title>
            <Text c="secondary-foreground">No data available</Text>
          </Stack>
        </Stack>
      </Block>
    )
  }

  const { blog } = context

  return (
    <Block component="main" py="lg">
      <Stack gap="lg">
        <SEO title={blog.page.title} description={blog.page.excerpt} />
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Blog' }]} />
        <Stack gap="md">
          <Title order={1} size="2xl">{blog.page.title}</Title>
          <HtmlContent html={blog.page.content || blog.page.excerpt} className="prose" />
        </Stack>

        <Grid cols="1-2-3" gap="lg">
          {pageItems.map((p: any) => (
            <PostCard key={p.id} post={p as any} />
          ))}
        </Grid>

        <Pagination page={page} total={total} onPrev={() => setPage(p => Math.max(1, p - 1))} onNext={() => setPage(p => Math.min(total, p + 1))} />
      </Stack>
    </Block>
  )
}


