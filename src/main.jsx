import React, { useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { AnimatePresence } from 'framer-motion'
import App from '@/App.jsx'
import ErrorBoundary from '@/components/ErrorBoundary'
import AnchorSplash from '@/components/loading/AnchorSplash'
import '@/index.css'
import '@/organicPremium.css'
import '@/components/dashboard/copilot/anchorCopilot.css'
import { initEmbeddedLayout } from '@/lib/embedLayout'
import { syncThemeColor } from '@/lib/themeMeta'
import { syncPageMeta } from '@/lib/pageMeta'

document.documentElement.classList.add('dark');
initEmbeddedLayout();
syncPageMeta();
syncThemeColor();

function Root() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {showSplash ? (
        <AnchorSplash key="splash" />
      ) : (
        <ErrorBoundary key="app">
          <App />
        </ErrorBoundary>
      )}
    </AnimatePresence>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />)
