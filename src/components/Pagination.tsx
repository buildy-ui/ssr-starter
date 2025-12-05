import { Group, Button, Text } from '@ui8kit/core'

export function Pagination({ page, total, onPrev, onNext }: { page: number; total: number; onPrev: () => void; onNext: () => void }) {
  return (
    <Group align="center" justify="between">
      <Button variant="secondary" onClick={onPrev} disabled={page <= 1}>Previous</Button>
      <Text size="sm" c="secondary-foreground">Page {page} of {total}</Text>
      <Button onClick={onNext} disabled={page >= total}>Next</Button>
    </Group>
  )
}


