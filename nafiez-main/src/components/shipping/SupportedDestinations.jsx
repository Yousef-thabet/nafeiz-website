import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getLocalizedField } from '@/lib/utils';
import { getCountries } from '@/services/api';

const DESTINATIONS = [
  { code: 'AE', flag: '🇦🇪', nameKey: 'countries.uae.name', compactNameKey: 'shipping.destinations.compactNames.uae' },
  { code: 'SA', flag: '🇸🇦', nameKey: 'countries.saudi.name', compactNameKey: 'shipping.destinations.compactNames.saudi' },
  { code: 'LY', flag: '🇱🇾', nameKey: 'countries.libya.name', compactNameKey: 'shipping.destinations.compactNames.libya' },
];

export function SupportedDestinations({ compact = false }) {
  const { t, i18n } = useTranslation();
  const [countries, setCountries] = useState([]);

  useEffect(() => {
    let active = true;

    getCountries().then((response) => {
      if (active && response.ok) setCountries(response.data || []);
    });

    return () => {
      active = false;
    };
  }, []);

  const countryName = (destination) => {
    const country = countries.find((item) => item.code === destination.code);
    return getLocalizedField(country?.nameL10n, i18n.language) || t(destination.nameKey);
  };

  if (compact) {
    return (
      <div className="mt-5 border-t border-navy-100 pt-4 dark:border-white/10">
        <p className="text-center text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-gold-600 dark:text-gold-300">
          {t('shipping.destinations.label')}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
          {DESTINATIONS.map((destination) => (
            <span key={destination.code} className="inline-flex whitespace-nowrap items-center gap-1.5 text-xs font-medium text-navy-700 dark:text-navy-100">
              <span aria-hidden="true" className="text-base">{destination.flag}</span>
              {t(destination.compactNameKey)}
            </span>
          ))}
          <span className="text-xs font-semibold text-navy-500 dark:text-navy-300">{t('shipping.destination')}</span>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-brand-bg py-10 dark:bg-navy-950 lg:py-12">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600 dark:text-gold-300">
            {t('shipping.destinations.label')}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-navy-800 dark:text-white sm:text-3xl">
            {t('shipping.destinations.title')}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-navy-500 dark:text-navy-300 sm:text-base">
            {t('shipping.destinations.description')}
          </p>
        </div>

        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-3 gap-3 sm:gap-4">
          {DESTINATIONS.map((destination) => (
            <div
              key={destination.code}
              className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border border-navy-100 bg-white/80 px-2 py-3 text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-soft dark:border-white/10 dark:bg-navy-900/80 dark:hover:border-gold-400/50"
            >
              <span aria-hidden="true" className="text-2xl leading-none">{destination.flag}</span>
              <span className="text-xs font-semibold leading-tight text-navy-800 dark:text-white sm:text-sm">
                {countryName(destination)}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-3 text-center text-xs font-semibold text-navy-600 dark:text-navy-200">
          + {t('shipping.destination')}
        </p>

        <p className="mx-auto mt-4 max-w-3xl text-center text-xs leading-relaxed text-navy-500 dark:text-navy-300">
          {t('shipping.destinations.note')}
        </p>
      </div>
    </section>
  );
}