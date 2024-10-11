import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { SocketProvider } from './context/socketProvider.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google'


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId='244538642568-ebip2tf8s6p6g2egu7qdsid28ri2c5k1.apps.googleusercontent.com' >
      <SocketProvider>
        <App />
      </SocketProvider>
    </GoogleOAuthProvider>
  </StrictMode>,
)
