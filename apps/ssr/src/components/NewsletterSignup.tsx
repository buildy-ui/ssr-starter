import { Card, Stack, Title, Text, Button } from '@ui8kit/core'
import { useTheme } from '@/providers/theme'

export function NewsletterSignup() {
  const { rounded } = useTheme()
  return (
    <Card p="lg" rounded={rounded.default} shadow="md" bg="primary" data-class="newsletter-signup" w="full">
      <Stack gap="md">
        <Title order={3} size="lg" fw="bold" c="primary-foreground">The Title of the Promo</Title>
        <Text size="sm" c="primary-foreground" leading="relaxed">The text of the promo here...</Text>
        <Button variant="secondary" w="full">CTA Button</Button>
      </Stack>
    </Card>
  )
}


