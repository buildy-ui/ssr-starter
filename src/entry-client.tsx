import { hydrateRoot, createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import MainRouter from './main-router'
import { ThemeProvider, lesseUITheme } from '@/providers/theme'
import { RenderContextProvider } from '@/providers/render-context'

// RenderContext was serialized on the server into window.__RENDER_CONTEXT__
const context = (globalThis as any).__RENDER_CONTEXT__
const rootEl = document.getElementById('root')

if (!rootEl) {
  throw new Error('Root container #root not found')
}

const render =
  typeof hydrateRoot === 'function'
    ? (node: React.ReactElement) => hydrateRoot(rootEl, node)
    : (node: React.ReactElement) => {
        const root = createRoot(rootEl)
        root.render(node)
        return root
      }

render(
  <StrictMode>
    <ThemeProvider theme={lesseUITheme}>
      <RenderContextProvider value={context}>
        <MainRouter />
      </RenderContextProvider>
    </ThemeProvider>
  </StrictMode>
)
