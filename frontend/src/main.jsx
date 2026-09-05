import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import LiveDemo from './pages/LiveDemo.jsx'
import JoinPage from './pages/JoinPage.jsx'

// No router dependency in this project — App.jsx is a single-page mock
// driven entirely by in-memory state. The live-backend demo pages are
// intentionally kept outside that state machine (see LiveDemo.jsx's
// comment), so they're routed here by raw pathname instead. Vite's dev
// server (and any static host with an SPA fallback) serves index.html for
// both paths, so this runs on a real navigation or a real QR scan alike.
const path = window.location.pathname;
const RootComponent = path.startsWith('/join/') ? JoinPage : path === '/live-demo' ? LiveDemo : App;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootComponent />
  </StrictMode>,
)
