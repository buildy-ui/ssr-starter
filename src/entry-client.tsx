import { hydrateRoot, createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import MainRouter from './main-router'
import { ThemeProvider, lesseUITheme } from './providers/theme'
import { RenderContextProvider } from './providers/render-context'

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
