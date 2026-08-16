import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { registerServiceWorker } from './lib/pwa'
import { applyTheme, readTheme } from './lib/theme'
import { applyTextSize, readTextSize } from './lib/textSize'

applyTheme(readTheme())
applyTextSize(readTextSize())
registerServiceWorker()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
