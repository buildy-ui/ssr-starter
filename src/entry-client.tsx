import { hydrateRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import MainRouter from './main-router'
import { ThemeProvider, lesseUITheme } from '@/providers/theme'
import { RenderContextProvider } from '@/providers/render-context'

// RenderContext was serialized on the server into window.__RENDER_CONTEXT__
const context = (globalThis as any).__RENDER_CONTEXT__

hydrateRoot(
  document.getElementById('root')!,
  <StrictMode>
    <ThemeProvider theme={lesseUITheme}>
      <RenderContextProvider value={context}>
        <MainRouter />
      </RenderContextProvider>
    </ThemeProvider>
  </StrictMode>
)
