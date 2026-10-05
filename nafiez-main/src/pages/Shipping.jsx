import { ArrowRight, Globe2, Plane, Route, Ship } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';
import { SupportedDestinations } from '@/components/shipping/SupportedDestinations';
import { useSEO } from '@/hooks/useSEO';

const SHIPPING_METHODS = [
  {
    key: 'seaFreight',
    icon: Ship,
    titleKey: 'shipping.seaFreight',
    descriptionKey: 'shipping.seaDescription',
    items: ['shipping.methods.fcl', 'shipping.methods.lcl', 'shipping.methods.containerShipping'],
  },
  {
    key: 'airFreight',
    icon: Plane,
    titleKey: 'shipping.airFreight',
    descriptionKey: 'shipping.airDescription',
    items: ['shipping.methods.airCargo', 'shipping.methods.flexibleShipping'],
  },
];

const PROCESS_STEPS = [
  { number: '01', titleKey: 'shipping.steps.need.title', descriptionKey: 'shipping.steps.need.description' },
  { number: '02', titleKey: 'shipping.steps.review.title', descriptionKey: 'shipping.steps.review.description' },
  { number: '03', titleKey: 'shipping.steps.quote.title', descriptionKey: 'shipping.steps.quote.description' },
];

export default function Shipping() {
  const { t } = useTranslation();
  useSEO('shipping');

  return (
    <>
      <div className="h-16 lg:h-20" />

      <section className="relative overflow-hidden bg-navy-800 py-14 text-white lg:py-18">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(210,163,67,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(37,150,190,0.14),transparent_40%)]" />
        <Container className="relative">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-300">{t('shipping.label')}</p>
              <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">{t('shipping.title')}</h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-navy-100 sm:text-lg">{t('shipping.subtitle')}</p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button to="/contact?service=shipping" variant="gold">{t('shipping.requestQuote')}</Button>
                <Button to="/contact" variant="outline" className="border-white/30 text-white hover:bg-white hover:text-navy-900">{t('shipping.contactUs')}</Button>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-soft backdrop-blur-sm">
              <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-navy-900/40 p-4 text-center">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gold-300">{t('shipping.origin')}</p>
                  <div className="mt-3 flex items-center justify-center gap-2 text-lg font-bold text-white">
                    <span aria-hidden="true">🇨🇳</span>
                    <span>{t('shipping.origin')}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center rounded-2xl border border-gold-400/30 bg-gold-400/10 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 text-gold-200">
                    <Ship size={18} />
                    <Plane size={18} />
                  </div>
                  <p className="mt-3 text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gold-300">{t('shipping.route')}</p>
                  <div className="mt-2 h-px w-full bg-gradient-to-r from-transparent via-gold-300 to-transparent" />
                  <p className="mt-2 text-sm text-navy-100">{t('shipping.logistics')}</p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-navy-900/40 p-4 text-center">
                  <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-gold-300">{t('shipping.destination')}</p>
                  <div className="mt-3 flex items-center justify-center gap-2 text-lg font-bold text-white">
                    <Globe2 size={18} className="text-blue-300" />
                    <span>{t('shipping.destination')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-white py-12 dark:bg-navy-950 lg:py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600 dark:text-gold-300">{t('shipping.label')}</p>
            <h2 className="mt-3 text-2xl font-bold text-navy-800 dark:text-white sm:text-3xl">{t('shipping.overviewTitle')}</h2>
            <p className="mt-3 text-sm leading-relaxed text-navy-500 dark:text-navy-300 sm:text-base">{t('shipping.overviewSubtitle')}</p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {SHIPPING_METHODS.map(({ key, icon: Icon, titleKey, descriptionKey, items }) => (
              <article key={key} className="rounded-[1.5rem] border border-navy-100 bg-brand-bg p-6 shadow-soft dark:border-white/10 dark:bg-navy-900">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-800 text-gold-300 dark:bg-navy-950">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <h3 className="text-xl font-bold text-navy-800 dark:text-white">{t(titleKey)}</h3>
                </div>
                <p className="mt-4 text-sm leading-relaxed text-navy-500 dark:text-navy-300">{t(descriptionKey)}</p>
                <ul className="mt-5 space-y-3">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm font-medium text-navy-700 dark:text-navy-100">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold-100 text-gold-600 dark:bg-gold-400/10 dark:text-gold-300">
                        <ArrowRight size={12} className="rtl:rotate-180" aria-hidden="true" />
                      </span>
                      {t(item)}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <SupportedDestinations />

      <section className="bg-brand-bg py-12 dark:bg-navy-950 lg:py-16">
        <Container>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600 dark:text-gold-300">{t('shipping.processLabel')}</p>
            <h2 className="mt-3 text-2xl font-bold text-navy-800 dark:text-white sm:text-3xl">{t('shipping.processTitle')}</h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {PROCESS_STEPS.map((step) => (
              <div key={step.number} className="rounded-[1.5rem] border border-navy-100 bg-white p-6 text-center shadow-soft dark:border-white/10 dark:bg-navy-900">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border-2 border-gold-400 bg-gold-50 text-lg font-bold text-gold-600 dark:bg-gold-400/10 dark:text-gold-300">
                  {step.number}
                </div>
                <h3 className="text-lg font-bold text-navy-800 dark:text-white">{t(step.titleKey)}</h3>
                <p className="mt-3 text-sm leading-relaxed text-navy-500 dark:text-navy-300">{t(step.descriptionKey)}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-white py-12 dark:bg-navy-950 lg:py-16">
        <Container>
          <div className="overflow-hidden rounded-[1.75rem] border border-navy-100 bg-brand-bg p-6 shadow-soft dark:border-white/10 dark:bg-navy-900 lg:p-8">
            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-600 dark:text-gold-300">{t('shipping.globalLabel')}</p>
              <h2 className="mt-3 text-2xl font-bold text-navy-800 dark:text-white sm:text-3xl">{t('shipping.globalTitle')}</h2>
            </div>

            <div className="mt-8 grid items-center gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-navy-100 bg-white p-5 text-center dark:border-white/10 dark:bg-navy-950">
                <div className="flex items-center justify-center gap-2 text-lg font-bold text-navy-800 dark:text-white">
                  <span aria-hidden="true">🇨🇳</span>
                  <span>{t('shipping.origin')}</span>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center rounded-2xl border border-gold-400/30 bg-gold-50 p-5 text-center dark:bg-gold-400/10">
                <div className="flex items-center gap-3 text-gold-600 dark:text-gold-300">
                  <Ship size={18} />
                  <Route size={18} />
                  <Plane size={18} />
                </div>
                <p className="mt-3 text-sm font-semibold text-navy-700 dark:text-navy-100">{t('shipping.globalRoute')}</p>
              </div>

              <div className="rounded-2xl border border-navy-100 bg-white p-5 text-center dark:border-white/10 dark:bg-navy-950">
                <div className="flex items-center justify-center gap-2 text-lg font-bold text-navy-800 dark:text-white">
                  <Globe2 size={18} className="text-blue-500" />
                  <span>{t('shipping.destination')}</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-brand-bg py-12 dark:bg-navy-950 lg:py-16">
        <Container>
          <div className="rounded-[1.75rem] bg-navy-800 px-6 py-8 text-white shadow-navy lg:px-10 lg:py-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-gold-300">{t('shipping.ctaEyebrow')}</p>
              <h2 className="mt-3 text-2xl font-bold sm:text-3xl">{t('shipping.ctaTitle')}</h2>
              <p className="mt-4 text-sm leading-relaxed text-navy-100 sm:text-base">{t('shipping.ctaDescription')}</p>
              <div className="mt-6 flex justify-center">
                <Button to="/contact?service=shipping" variant="gold">{t('shipping.requestQuote')}</Button>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}