import { Block, Container, Button, Title, Text, Stack } from "@ui8kit/core"
import { ThemeProvider, useTheme } from "@/providers/theme"

// LesseUI Theme
export const lesseUITheme = {
  name: "LesseUI",
  rounded: {
    // none | default | sm | md | lg | xl | "2xl" | "3xl" | full
    default: "2xl" as const,
    button: "lg" as const,
    badge: "full" as const
  },
  buttonSize: {
    // xs | sm | default | md | lg | xl | icon
    default: "sm" as const,
    badge: "sm" as const
  },
  isNavFixed: true
} as const;

function AppContent() {
  const { toggleDarkMode, isDarkMode } = useTheme()

  return (
    <Block variant="section" py="xl">
      <Container ta="center">
        <Stack gap="lg" align="center">
          <Title size="5xl">Welcome to UI8Kit</Title>
          <Text>Create beautiful web applications with ease using our UI components</Text>
          <Button variant={isDarkMode ? "primary" : "secondary"} onClick={toggleDarkMode}>
            {!isDarkMode ? "🌙 Dark Mode" : "☀️ Light Mode"}
          </Button>
        </Stack>
      </Container>
    </Block>
  )
}

export default function App() {
  return (
    <ThemeProvider theme={lesseUITheme}>
      <AppContent />
    </ThemeProvider>
  )
}
