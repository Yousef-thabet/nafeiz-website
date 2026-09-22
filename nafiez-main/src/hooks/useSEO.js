import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';

function setMeta(name, content, attr = 'name') {
  let el = document.head.querySelector(`meta[${attr}="${name}"]`);
  if (!content) {
    if (el) el.remove();
    return;
  }
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function useSEO(pageKey, override = null) {
  const { t } = useTranslation();

  useEffect(() => {
    if (!pageKey && !override) return;
    const title = override?.title || t(`meta.${pageKey}.title`);
    const description = override?.description || t(`meta.${pageKey}.description`);

    document.title = title;
    setMeta('description', description);
    setMeta('og:title', title, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', override?.type || 'website', 'property');
    setMeta('og:image', override?.image, 'property');
    setMeta('article:published_time', override?.publishedAt, 'property');
    setMeta('twitter:card', 'summary_large_image');
    setMeta('twitter:title', title);
    setMeta('twitter:description', description);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    const currentUrl = new URL(window.location.href);
    currentUrl.hash = '';
    canonical.setAttribute('href', currentUrl.toString());

    const pathSegments = window.location.pathname.split('/').filter(Boolean);
    const hasLocale = SUPPORTED_LANGUAGES.some((language) => language.code === pathSegments[0]);
    const localizedPath = hasLocale ? pathSegments.slice(1) : pathSegments;
    document.head.querySelectorAll('link[rel="alternate"][data-nafeiz-hreflang]').forEach((link) => link.remove());
    SUPPORTED_LANGUAGES.forEach(({ code }) => {
      const alternate = document.createElement('link');
      alternate.rel = 'alternate';
      alternate.hreflang = code;
      alternate.href = `${window.location.origin}/${[code, ...localizedPath].join('/')}`;
      alternate.dataset.nafeizHreflang = 'true';
      document.head.appendChild(alternate);
    });
    const defaultAlternate = document.createElement('link');
    defaultAlternate.rel = 'alternate';
    defaultAlternate.hreflang = 'x-default';
    defaultAlternate.href = `${window.location.origin}/en${localizedPath.length ? `/${localizedPath.join('/')}` : ''}`;
    defaultAlternate.dataset.nafeizHreflang = 'true';
    document.head.appendChild(defaultAlternate);
  }, [pageKey, override, t]);
}
