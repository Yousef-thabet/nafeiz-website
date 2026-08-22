import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/ui/Container';
import { SocialLinks } from '@/components/common/SocialLinks';
import { Logo } from '@/components/common/Logo';
import { useSettings } from '@/context/SettingsContext';
import { getLocalizedSetting } from '@/lib/utils';

const NAV_LINKS = [
  { to: '/', key: 'nav.home' },
  { to: '/about', key: 'nav.about' },
  { to: '/services', key: 'nav.services' },
  { to: '/products', key: 'nav.products' },
  { to: '/countries', key: 'nav.countries' },
  { to: '/testimonials', key: 'nav.testimonials' },
  { to: '/contact', key: 'nav.contact' },
];

export function Footer() {
  const { t, i18n } = useTranslation();
  const { settings = {} } = useSettings() || {};
  const year = new Date().getFullYear();
  const getSetting = (key) => (typeof settings[key] === 'string' ? settings[key].trim() : '');
  const companyName = getSetting('companyName') || t('footer.madeWith');
  const footerDescription = getLocalizedSetting(settings, 'footerDescription', i18n.language, t('footer.tagline'));
  const address = getSetting('address');
  const phone = getSetting('phone');
  const email = getSetting('email');
  const phoneHref = phone ? `tel:${phone.replace(/[^+\d]/g, '')}` : '';

  return (
    <footer className="bg-navy-900 text-navy-100">
      <Container className="py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo light />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-navy-300">
              {footerDescription}
            </p>
          </div>

          <div className="lg:col-span-3">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="group inline-flex items-center gap-1.5 text-sm text-navy-300 transition-colors hover:text-gold-300"
                  >
                    <ArrowRight
                      size={14}
                      className="rotate-0 text-gold-400 opacity-0 transition-all group-hover:opacity-100 rtl:rotate-180"
                    />
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              {t('footer.contact')}
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-center gap-3 text-navy-300">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                  <MapPin size={16} className="text-gold-400" />
                </span>
                {address || t('contact.info.locationValue')}
              </li>
              {phone && <li className="flex items-center gap-3 text-navy-300">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                  <Phone size={16} className="text-gold-400" />
                </span>
                <a dir="ltr" href={phoneHref} className="bidi-isolate transition-colors hover:text-gold-300">{phone}</a>
              </li>}
              {email && <li className="flex items-center gap-3 text-navy-300">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                  <Mail size={16} className="text-gold-400" />
                </span>
                <a dir="ltr" href={`mailto:${email}`} className="bidi-isolate truncate transition-colors hover:text-gold-300">{email}</a>
              </li>}
            </ul>
            <SocialLinks settings={settings} keys={['tiktok', 'instagram', 'facebook', 'wechat']} compact className="mt-6 text-navy-300" />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-navy-400">
            © {year} {companyName}. {t('footer.rights')}
          </p>
          <p className="text-xs text-navy-400">China ↔ Arab Markets</p>
        </div>
      </Container>
    </footer>
  );
}
