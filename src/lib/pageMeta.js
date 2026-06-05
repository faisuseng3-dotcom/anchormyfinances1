import { GLOBAL_PAGE_META } from '@/lib/pageSeo';

function setNameMeta(name, content) {
  if (!content || typeof document === 'undefined') return;
  let el = document.querySelector(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setPropertyMeta(property, content) {
  if (!content || typeof document === 'undefined') return;
  let el = document.querySelector(`meta[property="${property}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('property', property);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Håll viewport-fit=cover och sv_SE-locale på alla routes (iOS notch + social delning). */
export function syncPageMeta() {
  setNameMeta('viewport', GLOBAL_PAGE_META.viewport);
  document.documentElement.lang = GLOBAL_PAGE_META.language;
  setPropertyMeta('og:locale', GLOBAL_PAGE_META.ogLocale);
  setPropertyMeta('og:type', GLOBAL_PAGE_META.ogType);
}
