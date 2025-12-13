import React from 'react';
import { Block, Box, Stack, Title, Text, Grid, Group, Button, Card } from '../components/ui8kit';
import { Database, FileText, BarChart3 } from 'lucide-react';
import { useRenderContext } from '../providers/render-context';

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Box component="a" href={href} className="inline-block">
      <Button variant={active ? 'default' : 'ghost'} size="sm">
        {children}
      </Button>
    </Box>
  );
}

function Field({
  label,
  name,
  placeholder,
  defaultValue,
}: {
  label: string;
  name: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <Block className="space-y-2">
      <Box component="label" className="text-sm font-medium text-muted-foreground">
        {label}
      </Box>
      <Box
        component="input"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        w="full"
        p="md"
        rounded="md"
        border="1px"
        borderColor="border"
        bg="background"
        className="focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </Block>
  );
}

function JsonTextarea({ name, defaultValue }: { name: string; defaultValue?: string }) {
  return (
    <Box
      component="textarea"
      name={name}
      defaultValue={defaultValue}
      rows={14}
      w="full"
      p="md"
      rounded="md"
      border="1px"
      borderColor="border"
      bg="background"
      className="font-mono text-xs leading-5 focus:outline-none focus:ring-2 focus:ring-primary/30"
    />
  );
}

export default function Admin() {
  const { context } = useRenderContext();
  const admin = context.admin;

  const view = admin?.view ?? 'collections';
  const currentCollection = admin?.currentCollection;
  const collections = admin?.collections ?? [];
  const documents = admin?.documents ?? [];
  const selected = admin?.selectedDocument ?? null;

  const banner = admin?.error
    ? { tone: 'error' as const, text: admin.error }
    : admin?.notice
      ? { tone: 'ok' as const, text: admin.notice }
      : null;

  return (
    <Block component="section" py="lg">
      <Stack gap="lg">
        <Group justify="between" align="center">
          <Stack gap="xs">
            <Title order={1} size="2xl">CMS Admin</Title>
            <Text size="sm" c="secondary-foreground">
              Data source: <b>{admin?.source ?? 'none'}</b>
            </Text>
          </Stack>
          <Group gap="sm">
            <Text size="sm" c="secondary-foreground">
              <Database className="inline-block align-text-bottom mr-2" size={16} />
              {collections.length} collections
            </Text>
            <Text size="sm" c="secondary-foreground">
              <FileText className="inline-block align-text-bottom mr-2" size={16} />
              {documents.length} docs (current view)
            </Text>
          </Group>
        </Group>

        {banner && (
          <Card className={banner.tone === 'error' ? 'border-red-500/40' : 'border-emerald-500/40'}>
            <Card.Content>
              <Text className={banner.tone === 'error' ? 'text-red-600' : 'text-emerald-600'}>
                {banner.text}
              </Text>
            </Card.Content>
          </Card>
        )}

        <Group gap="sm">
          <NavLink href="/admin?view=collections" active={view === 'collections'}>Collections</NavLink>
          <NavLink href={`/admin?view=documents${currentCollection ? `&collection=${encodeURIComponent(currentCollection)}` : ''}`} active={view === 'documents'}>Documents</NavLink>
          <NavLink href="/admin?view=stats" active={view === 'stats'}>Stats</NavLink>
        </Group>

        {view === 'collections' && <CollectionsView collections={collections} />}
        {view === 'documents' && (
          <DocumentsView
            collections={collections}
            currentCollection={currentCollection}
            documents={documents}
            selected={selected}
          />
        )}
        {view === 'stats' && <StatsView />}
      </Stack>
    </Block>
  );
}

function CollectionsView({ collections }: { collections: string[] }) {
  return (
    <Stack gap="lg">
      <Card>
        <Card.Header>
          <Card.Title order={2} size="lg">Create collection</Card.Title>
          <Card.Description>Create a new local collection (works offline).</Card.Description>
        </Card.Header>
        <Card.Content>
          <Block component="form" method="post" action="/admin/actions/collection/create" className="space-y-4">
            <Field label="Collection name" name="name" placeholder="tasks" />
            <Group justify="end" gap="sm">
              <Button type="submit">Create</Button>
            </Group>
          </Block>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header>
          <Card.Title order={2} size="lg">Existing collections</Card.Title>
          <Card.Description>Click a collection to open documents view.</Card.Description>
        </Card.Header>
        <Card.Content>
          {collections.length === 0 ? (
            <Text c="secondary-foreground">No collections yet.</Text>
          ) : (
            <Grid cols="1-2-3-4" gap="md">
              {collections.map((c) => (
                <Card key={c} className="hover:shadow-md transition-shadow">
                  <Card.Content className="space-y-3">
                    <Group justify="between" align="center">
                      <Group gap="sm" align="center">
                        <Database size={18} />
                        <Text className="font-medium">{c}</Text>
                      </Group>
                      <Box component="a" href={`/admin?view=documents&collection=${encodeURIComponent(c)}`}>
                        <Button size="sm" variant="ghost">Open</Button>
                      </Box>
                    </Group>
                    <Block component="form" method="post" action="/admin/actions/collection/drop" onSubmit={(e) => {
                      // SSR-only: keep a basic confirm without relying on JS; if JS isn't running, it just won't block.
                      // eslint-disable-next-line no-alert
                      if (!confirm(`Drop collection "${c}"? This removes all docs.`)) e.preventDefault();
                    }}>
                      <Box component="input" type="hidden" name="name" value={c} />
                      <Button type="submit" size="sm" variant="outline" className="w-full">
                        Drop
                      </Button>
                    </Block>
                  </Card.Content>
                </Card>
              ))}
            </Grid>
          )}
        </Card.Content>
      </Card>
    </Stack>
  );
}

function DocumentsView(params: {
  collections: string[];
  currentCollection?: string;
  documents: any[];
  selected: any | null;
}) {
  const { collections, currentCollection, documents, selected } = params;

  if (!currentCollection) {
    return (
      <Card>
        <Card.Content>
          <Text c="secondary-foreground">No collection selected. Create one first.</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Stack gap="lg">
      <Card>
        <Card.Header>
          <Card.Title order={2} size="lg">Current collection</Card.Title>
          <Card.Description>Switch collection without client JS.</Card.Description>
        </Card.Header>
        <Card.Content>
          <Block className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Block component="form" method="get" action="/admin" className="space-y-2">
              <Box component="input" type="hidden" name="view" value="documents" />
              <Box component="label" className="text-sm font-medium text-muted-foreground">Open collection</Box>
              <Box
                component="select"
                name="collection"
                defaultValue={currentCollection}
                className="w-full p-3 rounded-md border border-border bg-background"
              >
                {collections.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </Box>
              <Group justify="end" gap="sm">
                <Button type="submit" variant="outline" size="sm">Open</Button>
              </Group>
            </Block>
            <Block className="space-y-2">
              <Box component="label" className="text-sm font-medium text-muted-foreground">Create new document (JSON)</Box>
              <Block component="form" method="post" action="/admin/actions/document/create" className="space-y-3">
                <Box component="input" type="hidden" name="collection" value={currentCollection} />
                <JsonTextarea name="json" defaultValue={JSON.stringify({ title: 'Hello', createdAt: new Date().toISOString() }, null, 2)} />
                <Group justify="end" gap="sm">
                  <Button type="submit">Create</Button>
                </Group>
              </Block>
            </Block>
          </Block>
        </Card.Content>
      </Card>

      {selected && (
        <Card>
          <Card.Header>
            <Card.Title order={2} size="lg">Edit document</Card.Title>
            <Card.Description>ID: {String(selected._id)}</Card.Description>
          </Card.Header>
          <Card.Content>
            <Block component="form" method="post" action="/admin/actions/document/update" className="space-y-3">
              <Box component="input" type="hidden" name="collection" value={currentCollection} />
              <Box component="input" type="hidden" name="id" value={String(selected._id)} />
              <JsonTextarea name="json" defaultValue={JSON.stringify(selected, null, 2)} />
              <Group justify="end" gap="sm">
                <Button type="submit">Save</Button>
              </Group>
            </Block>

            <Block component="form" method="post" action="/admin/actions/document/delete" className="mt-3">
              <Box component="input" type="hidden" name="collection" value={currentCollection} />
              <Box component="input" type="hidden" name="id" value={String(selected._id)} />
              <Button type="submit" variant="outline" className="w-full">Delete</Button>
            </Block>
          </Card.Content>
        </Card>
      )}

      <Card>
        <Card.Header>
          <Card.Title order={2} size="lg">Documents</Card.Title>
          <Card.Description>Click “Edit” to open editor via query param.</Card.Description>
        </Card.Header>
        <Card.Content className="space-y-3">
          {documents.length === 0 ? (
            <Text c="secondary-foreground">No documents in this collection yet.</Text>
          ) : (
            <Block className="space-y-2">
              {documents.map((doc) => (
                <Card key={String(doc._id)} variant="outlined" className="border-border">
                  <Card.Content>
                    <Group justify="between" align="center">
                      <Stack gap="xs">
                        <Text className="font-mono text-xs text-muted-foreground">{String(doc._id)}</Text>
                        <Text className="text-sm text-muted-foreground line-clamp-2">
                          {JSON.stringify(doc).slice(0, 140)}…
                        </Text>
                      </Stack>
                      <Box component="a" href={`/admin?view=documents&collection=${encodeURIComponent(currentCollection)}&edit=${encodeURIComponent(String(doc._id))}`}>
                        <Button size="sm" variant="ghost">Edit</Button>
                      </Box>
                    </Group>
                  </Card.Content>
                </Card>
              ))}
            </Block>
          )}
        </Card.Content>
      </Card>
    </Stack>
  );
}

function StatsView() {
  const { context } = useRenderContext();
  const stats = context.admin?.stats;

  if (!stats) {
    return (
      <Card>
        <Card.Content>
          <Text c="secondary-foreground">No stats available.</Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Grid cols="1-2-3" gap="lg">
      <Card>
        <Card.Content className="space-y-2">
          <Group gap="sm" align="center">
            <Database size={18} />
            <Text className="text-sm text-muted-foreground">Collections</Text>
          </Group>
          <Title order={3} size="2xl">{stats.collections}</Title>
        </Card.Content>
      </Card>
      <Card>
        <Card.Content className="space-y-2">
          <Group gap="sm" align="center">
            <FileText size={18} />
            <Text className="text-sm text-muted-foreground">Documents</Text>
          </Group>
          <Title order={3} size="2xl">{stats.documents}</Title>
        </Card.Content>
      </Card>
      <Card>
        <Card.Content className="space-y-2">
          <Group gap="sm" align="center">
            <BarChart3 size={18} />
            <Text className="text-sm text-muted-foreground">DB Size (bytes)</Text>
          </Group>
          <Title order={3} size="2xl">{stats.size}</Title>
          <Text size="sm" c="secondary-foreground">Last modified: {stats.lastModified}</Text>
        </Card.Content>
      </Card>
    </Grid>
  );
}
