import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Mail, MapPin, Phone, Clock3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { SocialLinks } from '@/components/common/SocialLinks';
import { useSettings } from '@/context/SettingsContext';
import { Logo } from '@/components/common/Logo';

const NAV_LINKS = [
  { to: '/', key: 'nav.home' },
  { to: '/about', key: 'nav.about' },
  { to: '/services', key: 'nav.services' },
  { to: '/products', key: 'nav.products' },
  { to: '/countries', key: 'nav.countries' },
  { to: '/testimonials', key: 'nav.testimonials' },
  { to: '/contact', key: 'nav.contact' },
];

function settingValue(settings, key) {
  const value = settings?.[key];
  return typeof value === 'string' ? value.trim() : '';
}

function TopInfoBar({ settings, transparent }) {
  const { t } = useTranslation();
  const phone = settingValue(settings, 'phone');
  const email = settingValue(settings, 'email');
  const address = settingValue(settings, 'address');
  const workingHours = settingValue(settings, 'workingHours');

  return (
    <div className={`hidden border-b text-xs sm:block ${transparent ? 'border-white/15 bg-navy-950/20 text-navy-100' : 'border-navy-100/70 bg-navy-50/80 text-navy-600 dark:border-white/10 dark:bg-navy-950/50 dark:text-navy-300'}`}>
      <Container className="flex min-h-8 items-center justify-between gap-4 py-1">
        <div className="flex min-w-0 items-center gap-4 overflow-hidden">
          {phone && <a dir="ltr" href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="hidden items-center gap-1.5 whitespace-nowrap transition-colors hover:text-gold-300 md:inline-flex"><Phone size={13} /><span className="bidi-isolate">{phone}</span></a>}
          {email && <a dir="ltr" href={`mailto:${email}`} className="hidden items-center gap-1.5 truncate transition-colors hover:text-gold-300 lg:inline-flex"><Mail size={13} /><span className="bidi-isolate">{email}</span></a>}
          {workingHours && <span className="hidden items-center gap-1.5 whitespace-nowrap xl:inline-flex"><Clock3 size={13} />{workingHours}</span>}
          {address && <span className="flex min-w-0 items-center gap-1.5 truncate"><MapPin size={13} className="shrink-0" />{address}</span>}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden text-[0.68rem] font-semibold uppercase tracking-wider lg:inline">{t('header.information')}</span>
          <SocialLinks settings={settings} keys={['instagram', 'facebook', 'tiktok', 'wechat']} compact />
        </div>
      </Container>
    </div>
  );
}

export function Navbar() {
  const { t, i18n } = useTranslation();
  const { settings = {} } = useSettings() || {};
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';
  const drawerStart = i18n.language === 'ar' ? '-100%' : '100%';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    function onEscape(e) {
      if (e.key === 'Escape') setMobileOpen(false);
    }
    document.addEventListener('keydown', onEscape);
    return () => document.removeEventListener('keydown', onEscape);
  }, []);

  const transparent = isHome && !scrolled && !mobileOpen;

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          transparent
            ? 'bg-transparent'
            : 'border-b border-navy-100/60 bg-white/85 shadow-soft backdrop-blur-md dark:border-white/10 dark:bg-navy-900/85'
        }`}
      >
        {isHome && <TopInfoBar settings={settings} transparent={transparent} />}
        <Container className="flex h-16 items-center justify-between lg:h-20">
          <div className="transition-transform duration-300 hover:scale-[1.02]">
            <Logo light={transparent} />
          </div>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `relative rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${
                    transparent
                      ? 'text-white/90 hover:text-white'
                      : 'text-navy-700 hover:text-navy-900 dark:text-navy-100 dark:hover:text-white'
                  } ${isActive ? '!text-gold-500 dark:!text-gold-300' : ''}`
                }
              >
                {({ isActive }) => (
                  <span className="relative">
                    {t(link.key)}
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute -bottom-1 start-0 h-0.5 w-full rounded-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-400"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            <ThemeToggle />
            <Button
              to="/contact"
              variant="gold"
              size="sm"
              className="hidden transition-transform duration-200 hover:scale-105 active:scale-95 lg:inline-flex"
            >
              {t('nav.cta')}
            </Button>
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label={t('common.openMenu')}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-200 lg:hidden ${
                transparent
                  ? 'text-white hover:bg-white/10'
                  : 'text-navy-800 hover:bg-navy-50 dark:text-white dark:hover:bg-white/10'
              }`}
            >
              <Menu size={22} />
            </button>
          </div>
        </Container>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-navy-900/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: drawerStart }}
              animate={{ x: 0 }}
              exit={{ x: drawerStart }}
              transition={{ type: 'tween', duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="fixed end-0 top-0 z-50 h-full w-[85%] max-w-sm overflow-y-auto bg-white shadow-navy dark:bg-navy-900 lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-navy-100 p-5 dark:border-white/10">
                <Logo />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label={t('common.closeMenu')}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-navy-700 transition-transform duration-200 hover:rotate-90 hover:bg-navy-50 dark:text-navy-100 dark:hover:bg-white/10"
                >
                  <X size={22} />
                </button>
              </div>
              <nav className="flex flex-col gap-1 px-3 py-2" aria-label="Mobile navigation">
                {NAV_LINKS.map((link, index) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: i18n.language === 'ar' ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.25 }}
                  >
                    <NavLink
                      to={link.to}
                      className={({ isActive }) =>
                        `block rounded-xl px-4 py-3 text-base font-medium transition-colors duration-200 ${
                          isActive
                            ? 'bg-gold-50 text-gold-600 dark:bg-gold-400/15 dark:text-gold-300'
                            : 'text-navy-700 hover:bg-navy-50 dark:text-navy-100 dark:hover:bg-white/10'
                        }`
                      }
                    >
                      {t(link.key)}
                    </NavLink>
                  </motion.div>
                ))}
              </nav>
              <div className="mt-4 flex items-center justify-between gap-2 border-t border-navy-100 px-5 py-4 dark:border-white/10">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
              <div className="px-5 pb-8 pt-2">
                <Button
                  to="/contact"
                  variant="gold"
                  className="w-full transition-transform duration-200 active:scale-95"
                >
                  {t('nav.cta')}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
