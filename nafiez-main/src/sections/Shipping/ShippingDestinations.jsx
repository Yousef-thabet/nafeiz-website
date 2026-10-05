import { ArrowRight, Globe2, Plane, Route, Ship } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { SupportedDestinations } from '@/components/shipping/SupportedDestinations';

const SERVICEOPTIONS = [
  {
    key: 'seaFreight',
    icon: Ship,
    title: 'shipping.seaFreight',
    subtitle: 'shipping.methods.fcl',
    extras: ['shipping.methods.lcl', 'shipping.methods.containerShipping'],
  },
  {
    key: 'airFreight',
    icon: Plane,
    title: 'shipping.airFreight',
    subtitle: 'shipping.methods.airCargo',
    extras: ['shipping.methods.flexibleShipping'],
  },
];

export function ShippingDestinations({ compact = false, showActions = true }) {
  const { t } = useTranslation();

  return (
    <section className={`${compact ? 'py-16 lg:py-20' : 'section-pad'} bg-brand-bg dark:bg-navy-950`}>
      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600 dark:text-gold-300">{t('shipping.label')}</p>
          <h2 className="mt-3 text-2xl font-bold text-navy-800 dark:text-white sm:text-3xl">
            {t(compact ? 'shipping.homeTitle' : 'shipping.globalTitle')}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-navy-500 dark:text-navy-300 sm:text-base">
            {t(compact ? 'shipping.homeSubtitle' : 'shipping.globalSubtitle')}
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_1fr_1fr]">
          <div className="rounded-[1.5rem] border border-navy-100 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-navy-900">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.18em] text-gold-600 dark:text-gold-300">{t('shipping.origin')}</span>
              <span aria-hidden="true" className="text-xl">🇨🇳</span>
            </div>
            <div className="mt-8 flex items-center justify-center gap-3 text-lg font-bold text-navy-800 dark:text-white">
              <span>{t('shipping.origin')}</span>
              <Route size={16} className="text-gold-500" aria-hidden="true" />
              <Globe2 size={18} className="text-blue-500" aria-hidden="true" />
            </div>
            <p className="mt-6 text-center text-sm text-navy-500 dark:text-navy-300">{t('shipping.globalDestination')}</p>
          </div>

          {SERVICEOPTIONS.map(({ key, icon: Icon, title, subtitle, extras }) => (
            <article key={key} className="rounded-[1.5rem] border border-navy-100 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-navy-900">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-800 text-gold-300 dark:bg-navy-950">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <h3 className="text-lg font-bold text-navy-800 dark:text-white">{t(title)}</h3>
              </div>
              <p className="mt-4 text-sm text-navy-500 dark:text-navy-300">{t(subtitle)}</p>
              <ul className="mt-4 space-y-2 text-sm text-navy-700 dark:text-navy-100">
                {extras.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <ArrowRight size={12} className="text-gold-500 rtl:rotate-180" aria-hidden="true" />
                    <span>{t(item)}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {compact && <SupportedDestinations compact />}

        {showActions && (
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button to="/contact?service=shipping" variant="gold">{t('shipping.requestQuote')}</Button>
            <Button to="/shipping" variant="outline">{t('shipping.viewServices')}</Button>
          </div>
        )}
      </Container>
    </section>
  );
}