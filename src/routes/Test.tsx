import { Block, Stack, Title, Button } from '@ui8kit/core'

export default function Test() {
  return (
    <Block component="main" py="lg">
      <Stack gap="lg">
        <Title order={1} size="2xl">Test Title</Title>
      </Stack>
      <Stack gap="lg">
        <Title data-class="subtitle" order={2} size="xl">Test Subtitle</Title>
      </Stack>
      <Stack data-class="stack-button" gap="md" justify="center" align="center">
        <Button>Test</Button>
      </Stack>
    </Block>
  )
}