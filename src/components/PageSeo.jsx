import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getPageSeo, sanitizePageTitle } from '@/lib/pageSeo';
import { syncThemeColor } from '@/lib/themeMeta';
import { syncPageMeta } from '@/lib/pageMeta';

function setMeta(attr, key, content) {
  if (!content) return;
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Uppdaterar title + meta/OG per route så beskrivningar inte trunkeras.
 */
export default function PageSeo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const { title, description } = getPageSeo(pathname);
    const safeTitle = sanitizePageTitle(title);
    document.title = safeTitle;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', safeTitle);
    setMeta('property', 'og:description', description);
    setMeta('name', 'twitter:title', safeTitle);
    setMeta('name', 'twitter:description', description);
    syncPageMeta();
    syncThemeColor();
  }, [pathname]);

  return null;
}
