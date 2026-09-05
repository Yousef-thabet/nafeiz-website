import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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
    canonical.setAttribute('href', window.location.href);
  }, [pageKey, override, t]);
}
