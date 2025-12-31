import { Card, Stack, Title, Text, Button } from '@ui8kit/core'
import { useTheme } from '@/providers/theme'

export function NewsletterSignup() {
  const { rounded } = useTheme()
  return (
    <Card p="6" rounded={rounded.default} shadow="md" bg="primary" data-class="newsletter-signup" w="full">
      <Stack gap="4">
        <Title order={3} text="lg" font="bold" bg="primary-foreground">The Title of the Promo</Title>
        <Text text="sm" bg="primary-foreground" leading="relaxed">The text of the promo here...</Text>
        <Button variant="secondary" w="full">CTA Button</Button>
      </Stack>
    </Card>
  )
}


