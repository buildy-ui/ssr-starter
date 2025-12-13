import { Block, Button, Group } from "@ui8kit/core"
import { ThemeProvider, useTheme } from "@/providers/theme"
import { GraphQLExplorer } from "@/components/GraphQLExplorer"

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
    <>
      <Block component="nav" py="sm" className="border-b border-border bg-background">
        <Group justify="end" align="center">
          <Button variant={isDarkMode ? "primary" : "secondary"} onClick={toggleDarkMode}>
            {!isDarkMode ? "Dark Mode" : "Light Mode"}
          </Button>
        </Group>
      </Block>
      <GraphQLExplorer />
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider theme={lesseUITheme}>
      <AppContent />
    </ThemeProvider>
  )
}
