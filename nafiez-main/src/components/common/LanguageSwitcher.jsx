import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';

export function LanguageSwitcher({ compact = false, light = false, dropUp = false }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = SUPPORTED_LANGUAGES.find((l) => l.code === i18n.language) || SUPPORTED_LANGUAGES[1];

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function handleEscape(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  function selectLang(code) {
    i18n.changeLanguage(code);
    setOpen(false);

    const segments = location.pathname.split('/').filter(Boolean);
    const hasLocalePrefix = SUPPORTED_LANGUAGES.some((language) => language.code === segments[0]);
    const pageSegments = hasLocalePrefix ? segments.slice(1) : segments;
    const nextPath = `/${[code, ...pageSegments].join('/')}`;
    navigate(`${nextPath}${location.search}${location.hash}`);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={t('common.language')}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${light ? 'text-white hover:bg-white/10' : 'text-navy-700 hover:bg-navy-50 dark:text-navy-100 dark:hover:bg-white/10'}`}
      >
        <Globe size={18} />
        {!compact && <span className="hidden sm:inline">{current.name}</span>}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div
          role="listbox"
          className={`absolute z-50 w-40 overflow-hidden rounded-xl border border-navy-100 bg-white shadow-card dark:border-white/10 dark:bg-navy-800 ${dropUp ? 'start-0 bottom-full mb-2 end-auto' : 'end-0 mt-2'}`}
        >
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              role="option"
              aria-selected={lang.code === current.code}
              onClick={() => selectLang(lang.code)}
              className={`flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-navy-50 dark:hover:bg-white/10 ${
                lang.code === current.code
                  ? 'text-gold-600 dark:text-gold-300 font-semibold'
                  : 'text-navy-700 dark:text-navy-100'
              }`}
            >
              <span>{lang.name}</span>
              {lang.code === current.code && <Check size={16} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
