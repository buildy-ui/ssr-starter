import { Block, Stack, Title, Button } from '@ui8kit/core'

export default function Test() {
  return (
    <Block component="main" py="8">
      <Stack gap="6">
        <Title order={1} text="2xl">Test Title</Title>
      </Stack>
      <Stack gap="6">
        <Title data-class="subtitle" order={2} text="xl">Test Subtitle</Title>
      </Stack>
      <Stack data-class="stack-button" gap="4" justify="center" text="center">
        <Button>Test</Button>
      </Stack>
    </Block>
  )
}