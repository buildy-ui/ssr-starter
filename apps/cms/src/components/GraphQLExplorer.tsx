import React from 'react';
import { Block, Box, Button, Card, Container, Group, Stack, Text, Title } from '@ui8kit/core';
import { fetchGraphQL, getGraphQLEndpoint } from '@/lib/graphql';

type Tab = 'posts' | 'categories' | 'tags' | 'authors' | 'pages';

const QUERIES: Record<Tab, string> = {
  posts: `
    query GetAllPosts {
      posts(first: 100) {
        nodes {
          postId
          title
          excerpt
          slug
          date
        }
      }
    }
  `,
  categories: `
    query GetCategories {
      categories(first: 100) {
        nodes {
          categoryId
          name
          slug
          description
          count
        }
      }
    }
  `,
  tags: `
    query GetTags {
      tags(first: 100) {
        nodes {
          tagId
          name
          slug
          count
        }
      }
    }
  `,
  authors: `
    query GetUsers {
      users(first: 100) {
        nodes {
          userId
          name
          slug
          avatar {
            url
          }
        }
      }
    }
  `,
  pages: `
    query GetPages {
      pages(first: 50) {
        nodes {
          pageId
          title
          slug
        }
      }
    }
  `,
};

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <Button size="sm" variant={active ? 'primary' : 'secondary'} onClick={onClick}>
      {children}
    </Button>
  );
}

export function GraphQLExplorer() {
  const [tab, setTab] = React.useState<Tab>('posts');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [items, setItems] = React.useState<any[]>([]);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    const ac = new AbortController();

    setLoading(true);
    setError(null);
    setItems([]);

    fetchGraphQL<any>({ query: QUERIES[tab], signal: ac.signal })
      .then((res) => {
        if (res.errors?.length) {
          setError(res.errors.map((e) => e.message).join('\n'));
          return;
        }

        const data = res.data || {};
        const next =
          tab === 'posts' ? data.posts?.nodes :
          tab === 'categories' ? data.categories?.nodes :
          tab === 'tags' ? data.tags?.nodes :
          tab === 'authors' ? data.users?.nodes :
          tab === 'pages' ? data.pages?.nodes :
          [];

        setItems(Array.isArray(next) ? next : []);
      })
      .catch((e) => setError(String(e?.message || e)))
      .finally(() => setLoading(false));

    return () => ac.abort();
  }, [tab]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((x) => JSON.stringify(x).toLowerCase().includes(q));
  }, [items, search]);

  return (
    <Block component="main" py="xl">
      <Container size="lg">
        <Stack gap="lg">
          <Stack gap="xs">
            <Title size="4xl">Offline CMS</Title>
            <Text c="secondary-foreground" size="sm">
              GraphQL endpoint: <Box component="code" className="px-2 py-1 rounded bg-muted">{getGraphQLEndpoint()}</Box>
            </Text>
          </Stack>

          <Card>
            <Card.Content>
              <Group justify="between" align="center" className="flex-wrap gap-3">
                <Group gap="sm" className="flex-wrap">
                  <TabButton active={tab === 'posts'} onClick={() => setTab('posts')}>Posts</TabButton>
                  <TabButton active={tab === 'categories'} onClick={() => setTab('categories')}>Categories</TabButton>
                  <TabButton active={tab === 'tags'} onClick={() => setTab('tags')}>Tags</TabButton>
                  <TabButton active={tab === 'authors'} onClick={() => setTab('authors')}>Authors</TabButton>
                  <TabButton active={tab === 'pages'} onClick={() => setTab('pages')}>Pages</TabButton>
                </Group>

                <Box
                  component="input"
                  type="search"
                  value={search}
                  onChange={(e: any) => setSearch(e.target.value)}
                  placeholder="Search..."
                  w="full"
                  maxW="sm"
                  p="sm"
                  rounded="md"
                  border="default"
                  borderColor="border"
                  bg="background"
                />
              </Group>
            </Card.Content>
          </Card>

          {loading && (
            <Card>
              <Card.Content>
                <Text>Loading…</Text>
              </Card.Content>
            </Card>
          )}

          {error && (
            <Card>
              <Card.Content>
                <Text c="destructive" className="whitespace-pre-wrap">{error}</Text>
              </Card.Content>
            </Card>
          )}

          {!loading && !error && (
            <Card>
              <Card.Header>
                <Card.Title order={2} size="lg">
                  {tab} ({filtered.length})
                </Card.Title>
                <Card.Description>
                  This view reads via GraphQL. In GETMODE, writes should go to local flexible storage via a separate API.
                </Card.Description>
              </Card.Header>
              <Card.Content className="space-y-3">
                {filtered.length === 0 ? (
                  <Text c="secondary-foreground">No items.</Text>
                ) : (
                  <Stack gap="sm">
                    {filtered.slice(0, 50).map((item, idx) => (
                      <Card key={`${idx}`} variant="outlined">
                        <Card.Content className="space-y-2">
                          <Text className="font-medium">
                            {item.title || item.name || item.slug || item.postId || item.pageId || item.userId || `Item ${idx + 1}`}
                          </Text>
                          <Text size="sm" c="secondary-foreground" className="font-mono whitespace-pre-wrap">
                            {JSON.stringify(item, null, 2)}
                          </Text>
                        </Card.Content>
                      </Card>
                    ))}
                  </Stack>
                )}
              </Card.Content>
            </Card>
          )}
        </Stack>
      </Container>
    </Block>
  );
}


