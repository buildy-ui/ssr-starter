import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { ThemeProvider, lesseUITheme } from "@/providers/theme"
import { RenderContextProvider } from '@/providers/render-context'
import MainRouter from './main-router'
// styles
import './assets/css/index.css'

const context = (globalThis as any).__RENDER_CONTEXT__

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={lesseUITheme}>
      <RenderContextProvider value={context}>
        <MainRouter />
      </RenderContextProvider>
    </ThemeProvider>
  </StrictMode>
)
