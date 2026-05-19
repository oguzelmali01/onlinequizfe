import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

/**
 * React Uygulamasının Giriş Noktası (Entry Point).
 * App bileşenini DOM içerisindeki 'root' div'inin içine render eder.
 * StrictMode, geliştirme aşamasında potansiyel sorunları yakalamaya yardımcı olur.
 */
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
