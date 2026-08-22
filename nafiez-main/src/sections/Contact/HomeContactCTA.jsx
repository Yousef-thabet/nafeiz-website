import { Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { SocialLinks } from '@/components/common/SocialLinks';
import { useSettings } from '@/context/SettingsContext';
import { getLocalizedSetting } from '@/lib/utils';

function settingValue(settings, key) {
  const value = settings?.[key];
  return typeof value === 'string' ? value.trim() : '';
}

function whatsappHref(value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const phone = value.replace(/[^\d]/g, '');
  return phone ? `https://wa.me/${phone}` : '';
}

export function HomeContactCTA() {
  const { t, i18n } = useTranslation();
  const { settings = {} } = useSettings() || {};
  const phone = settingValue(settings, 'phone');
  const email = settingValue(settings, 'email');
  const whatsapp = whatsappHref(settingValue(settings, 'whatsapp'));
  const wechat = settingValue(settings, 'wechat');
  const address = settingValue(settings, 'address');
  const title = getLocalizedSetting(settings, 'contactTitle', i18n.language, t('contact.home.title'));
  const text = getLocalizedSetting(settings, 'contactDescription', i18n.language, t('contact.home.text'));
  const contactItems = [
    phone && { href: `tel:${phone.replace(/[^+\d]/g, '')}`, label: t('contact.home.phone'), value: phone, icon: Phone, technical: true },
    email && { href: `mailto:${email}`, label: t('contact.home.email'), value: email, icon: Mail, technical: true },
    address && { label: t('contact.home.location'), value: address, icon: MapPin },
  ].filter(Boolean);

  return (
    <section className="section-pad bg-brand-bg dark:bg-navy-950">
      <Container>
        <div className="overflow-hidden rounded-[1.5rem] bg-navy-800 shadow-navy dark:bg-navy-900">
          <div className="grid gap-10 px-6 py-10 sm:px-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-14 lg:py-14">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-300">{t('contact.home.eyebrow')}</p>
              <h2 className="mt-4 max-w-2xl text-3xl font-bold leading-tight text-white sm:text-4xl">
                {title}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-200">
                {text}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button to="/contact" variant="gold" size="lg">
                  {t('contact.home.cta')}
                </Button>
                {whatsapp && (
                  <a
                    href={whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 px-6 text-sm font-semibold text-white transition-colors hover:border-gold-300 hover:text-gold-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
                  >
                    <MessageCircle size={18} />
                    {t('contact.home.whatsapp')}
                  </a>
                )}
              </div>
            </div>

            <div className="border-t border-white/10 pt-8 lg:border-s lg:border-t-0 lg:ps-10 lg:pt-0">
              <div className="space-y-4">
                {contactItems.map(({ href, label, value, icon: Icon, technical }) => {
                  const content = (
                    <>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-gold-300">
                        <Icon size={18} />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold uppercase tracking-wider text-navy-300">{label}</span>
                        <span dir={technical ? 'ltr' : undefined} className={`mt-1 block truncate text-sm font-medium text-white ${technical ? 'bidi-isolate' : ''}`}>{value}</span>
                      </span>
                    </>
                  );
                  return href ? (
                    <a key={label} href={href} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300">
                      {content}
                    </a>
                  ) : (
                    <div key={label} className="flex items-center gap-3 rounded-xl p-2">{content}</div>
                  );
                })}
              </div>
              <div className="mt-7 flex items-center justify-between gap-4 border-t border-white/10 pt-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-navy-300">{t('social.connect')}</span>
                <SocialLinks settings={settings} keys={['tiktok', 'instagram', 'facebook', 'wechat']} compact className="justify-end text-white" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
