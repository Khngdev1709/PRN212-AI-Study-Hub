import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext'
import { UploadProvider } from './context/UploadContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <UploadProvider>
        <App />
      </UploadProvider>
    </AuthProvider>
  </StrictMode>,
)
