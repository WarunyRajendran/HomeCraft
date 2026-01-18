import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Handle Supabase password recovery redirect before React mounts
const hash = window.location.hash;
if (hash && hash.includes('type=recovery') && window.location.pathname !== '/reset-password') {
  window.location.replace('/reset-password' + hash);
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}
