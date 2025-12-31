import { Block, Stack, Title, Text } from '@ui8kit/core'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { SEO } from '@/components/SEO'
import { SearchBar } from '@/components/SearchBar'
import { RecentPosts } from '@/components/RecentPosts'

export default function NotFound() {
  return (
    <Block component="main" py="8">
      <Stack gap="6">
        <SEO title="Page Not Found" description="The page you're looking for doesn't exist." />
        <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Not Found' }]} />
        <Stack gap="4">
          <Title order={1} text="2xl">Page not found</Title>
          <Text bg="secondary-foreground">Try searching for what you need:</Text>
          <SearchBar />
        </Stack>
      </Stack>
      
      <RecentPosts />
    </Block>
  )
}


