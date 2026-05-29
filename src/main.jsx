import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import { initEmbeddedLayout } from '@/lib/embedLayout'

document.documentElement.classList.add('dark');
initEmbeddedLayout();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
