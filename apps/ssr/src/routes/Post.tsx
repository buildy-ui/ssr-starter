import { useParams, Link } from 'react-router-dom'
import { Block, Stack, Title, Text, Image, Badge, Group, Button, Grid } from '@ui8kit/core'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SEO } from '@/components/SEO'
import { HtmlContent } from '@/components/HtmlContent'
import { PostMeta } from '@/components/PostMeta'
import { AuthorBio } from '@/components/AuthorBio'
import { RelatedPosts } from '@/components/RelatedPosts'
import { useRenderContext } from '@/data'
import { useTheme } from '@/providers/theme'

export default function Post() {
  const { slug } = useParams<{ slug: string }>()
  const { context, loading, error } = useRenderContext()
  const { rounded } = useTheme()

  // Show loading state
  if (loading) {
    return (
      <Block component="article">
        <Stack gap="lg">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Blog', to: '/blog' }, { label: 'Loading...' }]} />
          <Title order={1} size="3xl">Loading Post...</Title>
          <Text>Fetching post from CMS...</Text>
        </Stack>
      </Block>
    )
  }

  // Show error state
  if (error) {
    return (
      <Block component="article">
        <Stack gap="lg">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Blog', to: '/blog' }, { label: 'Error' }]} />
          <Title order={1} size="3xl">Post Error</Title>
          <Text>Failed to load post: {error}</Text>
          <Link to="/blog"><Button>Return to blog</Button></Link>
        </Stack>
      </Block>
    )
  }

  // Check if context is available
  if (!context) {
    return (
      <Block component="article">
        <Stack gap="lg">
          <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Blog', to: '/blog' }, { label: 'Not Found' }]} />
          <Title order={1} size="3xl">Post Not Available</Title>
          <Text>No posts data available.</Text>
          <Link to="/blog"><Button>Return to blog</Button></Link>
        </Stack>
      </Block>
    )
  }

  const { posts } = context
  const post = posts.posts.find((p: any) => p.slug === slug)
  if (!post) {
    return (
      <Block component="main" py="lg">
        <Stack gap="md">
          <Title order={1} size="2xl">Post Not Found</Title>
          <Text>The post you're looking for doesn't exist.</Text>
          <Link to="/"><Button>Return to homepage</Button></Link>
        </Stack>
      </Block>
    )
  }

  return (
    <Block component="article">
      <Stack gap="lg">
        <SEO title={post.title} description={post.excerpt} />
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Blog', to: '/blog' }, { label: post.title }]} />
        {post.featuredImage?.url && (
          <Image 
            src={post.featuredImage.sizes?.large?.url || post.featuredImage.sizes?.full?.url || post.featuredImage.url} 
            alt={post.featuredImage.alt} 
            rounded={rounded.default} 
            w="full" 
            h="auto" 
            fit="cover" 
          />
        )}

        <Stack gap="md">
          <Title order={1} size="3xl">{post.title}</Title>
          <PostMeta date={post.date.display} categories={post.categories as any} tags={post.tags as any} />
        </Stack>
        
        <HtmlContent html={post.content} className="prose" />

        <Grid cols="1-2" gap="lg">
          <Stack gap="lg">
            {post.categories?.length ? (
              <Group gap="md" align="center">
                {post.categories.map((cat: any) => (
                  <Badge key={cat.id} variant="secondary" rounded="full">{cat.name}</Badge>
                ))}
              </Group>
            ) : null}
            <AuthorBio author={{ name: post.author?.name || 'John Doe', slug: post.author?.slug, role: 'Editor', avatar: { url: 'https://i.pravatar.cc/128?img=' + post.author?.id, alt: 'Author' }, bio: 'Writer and frontend engineer. Passionate about semantic HTML and design systems.' }} />
          </Stack>

          <RelatedPosts currentId={post.id} posts={posts.posts as any} />
        </Grid>
      </Stack>
    </Block>
  )
}


