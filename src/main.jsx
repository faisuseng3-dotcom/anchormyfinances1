import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import '@/index.css'
import '@/styles/organicPremium.css'
import { initEmbeddedLayout } from '@/lib/embedLayout'
import { syncThemeColor } from '@/lib/themeMeta'
import { syncPageMeta } from '@/lib/pageMeta'

document.documentElement.classList.add('dark');
initEmbeddedLayout();
syncPageMeta();
syncThemeColor();

ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
)
