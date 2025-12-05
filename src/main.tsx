import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { ThemeProvider, lesseUITheme } from "@/providers/theme"
import { RenderContextProvider } from '@/providers/render-context'
import MainRouter from './main-router'
// styles
import './assets/css/index.css'

function readRenderContext() {
  const el = document.getElementById('render-context')
  if (!el) return null
  try {
    return JSON.parse(el.textContent || 'null')
  } catch {
    return null
  }
}

const context = readRenderContext()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={lesseUITheme}>
      <RenderContextProvider value={context}>
        <MainRouter />
      </RenderContextProvider>
    </ThemeProvider>
  </StrictMode>
)
