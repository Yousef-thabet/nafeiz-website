import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }
    const target = document.querySelector(hash);
    if (target) target.scrollIntoView({ block: 'start' });
  }, [pathname, hash]);
  return null;
}
