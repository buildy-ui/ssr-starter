import { Block, Stack, Title, Text, Grid, Group, Button } from '@ui8kit/core'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SEO } from '@/components/SEO'
import { PostCard } from '@/components/PostCard'
import { useRenderContext } from '@/data'
import { useParams } from 'react-router-dom'

export default function Blog() {
  const { context } = useRenderContext()
  const { page } = useParams()
  const currentPage = Math.max(1, Number(page) || 1)

  const perPage = context?.route?.perPage ?? 3
  const totalPosts = context?.route?.totalPosts ?? (context?.posts.posts.length ?? 0)
  const totalPages = Math.max(1, Math.ceil(totalPosts / perPage))

  // For SSR we already slice posts per route; keep fallback for safety.
  const pageItems = context?.route?.type === 'blog'
    ? context.posts.posts
    : context?.posts.posts.slice((currentPage - 1) * perPage, (currentPage - 1) * perPage + perPage) || []

  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages
  const prevHref = currentPage === 2 ? '/blog' : `/blog/${currentPage - 1}`
  const nextHref = `/blog/${currentPage + 1}`

  return (
    <Block component="main" py="8">
      <Stack gap="lg">
        <SEO
          title={`Blog${currentPage > 1 ? ` - Page ${currentPage}` : ''}`}
          description="Latest posts"
        />
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Blog' }]} />
        <Title order={1} size="2xl">
          Blog {currentPage > 1 && `- Page ${currentPage}`}
        </Title>

        <Grid cols="1-2-3" gap="lg">
          {pageItems.map((p: any) => (
            <PostCard key={p.id} post={p as any} />
          ))}
        </Grid>

        <Group align="center" justify="center" gap="sm">
          {hasPrev && (
            <a href={prevHref}>
              <Button variant="secondary">← Prev</Button>
            </a>
          )}
          <Text size="sm" c="secondary-foreground">
            Page {currentPage} of {totalPages}
          </Text>
          {hasNext && (
            <a href={nextHref}>
              <Button>Next →</Button>
            </a>
          )}
        </Group>
      </Stack>
    </Block>
  )
}


