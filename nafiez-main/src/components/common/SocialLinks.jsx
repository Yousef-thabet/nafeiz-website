import { Instagram, MessageCircle, Music2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SOCIALS = [
  { key: 'tiktok', labelKey: 'social.tiktok', icon: Music2 },
  { key: 'instagram', labelKey: 'social.instagram', icon: Instagram },
  { key: 'facebook', labelKey: 'social.facebook', icon: null },
  { key: 'wechat', labelKey: 'social.wechat', icon: MessageCircle },
];

function getSocialHref(key, value) {
  const setting = String(value || '').trim();
  if (!setting) return '';
  if (key === 'whatsapp' && !/^https?:\/\//i.test(setting)) {
    const phone = setting.replace(/[^\d]/g, '');
    return phone ? `https://wa.me/${phone}` : '';
  }
  return setting;
}

export function SocialLinks({ settings = {}, keys, className = '', compact = false }) {
  const { t } = useTranslation();
  const allowedKeys = keys ? new Set(keys) : null;
  const links = SOCIALS.filter(({ key }) => !allowedKeys || allowedKeys.has(key))
    .map((social) => ({ ...social, href: getSocialHref(social.key, settings[social.key]) }))
    .filter((social) => social.href);

  if (!links.length) return null;

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {links.map(({ key, labelKey, icon: Icon, href }) => (
        <a
          key={key}
          href={href}
          target={key === 'whatsapp' || key === 'wechat' ? '_blank' : undefined}
          rel={key === 'whatsapp' || key === 'wechat' ? 'noreferrer' : undefined}
          aria-label={t(labelKey)}
          title={t(labelKey)}
          className={`inline-flex items-center justify-center rounded-full border border-current/20 text-current transition-colors hover:border-gold-300 hover:text-gold-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300 ${compact ? 'h-8 w-8' : 'h-10 w-10'}`}
        >
          {Icon ? <Icon size={compact ? 15 : 18} strokeWidth={1.8} /> : <span className="text-sm font-bold">f</span>}
        </a>
      ))}
    </div>
  );
}
