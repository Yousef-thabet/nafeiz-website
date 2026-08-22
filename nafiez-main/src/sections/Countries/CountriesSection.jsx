import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getCountries } from '@/services/api';
import { getLocalizedField } from '@/lib/utils';
import { getLocalizedSetting } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

export function CountriesSection({ limit }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { settings = {} } = useSettings() || {};
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await getCountries();
        if (response.ok && response.data) {
          setCountries(response.data);
        } else {
          setError('Failed to load countries');
        }
      } catch (err) {
        setError('Failed to load countries');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const list = limit ? countries.slice(0, limit) : countries;

  if (loading) {
    return (
      <section className="section-pad bg-white dark:bg-navy-950">
        <Container>
          <div className="flex min-h-96 items-center justify-center">
            <LoadingSpinner size={40} />
          </div>
        </Container>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section-pad bg-white dark:bg-navy-950">
        <Container>
          <ErrorState title={t('countries.error')} description={error} />
        </Container>
      </section>
    );
  }

  if (list.length === 0) {
    return (
      <section className="section-pad bg-white dark:bg-navy-950">
        <Container>
          <SectionHeading
            label={t('countries.label')}
            title={getLocalizedSetting(settings, 'countriesTitle', lang, t('countries.title'))}
            subtitle={getLocalizedSetting(settings, 'countriesDescription', lang, t('countries.subtitle'))}
          />
          <div className="mt-12">
            <EmptyState title={t('countries.noResults')} description={t('countries.noResultsText')} />
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="section-pad bg-white dark:bg-navy-950">
      <Container>
        <SectionHeading
          label={t('countries.label')}
          title={getLocalizedSetting(settings, 'countriesTitle', lang, t('countries.title'))}
          subtitle={getLocalizedSetting(settings, 'countriesDescription', lang, t('countries.subtitle'))}
        />
        <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((country) => {
            const countryName = getLocalizedField(country.nameL10n, lang) || t(`countries.${country.key}.name`);
            const countryDesc = getLocalizedField(country.descriptionL10n, lang) || t(`countries.${country.key}.description`);
            const countryTrade = getLocalizedField(country.detailsL10n, lang) || t(`countries.${country.key}.trade`);
            const imageUrl = country.imageUrl || country.image || '';

            return (
              <StaggerItem key={country.id}>
                <div className="group h-full overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card dark:border-white/10 dark:bg-navy-900">
                  <div className="relative aspect-[4/3] overflow-hidden bg-navy-100 dark:bg-navy-800">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={countryName}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-navy-400">{country.code}</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent" />
                    <h3 className="absolute bottom-3 start-4 text-lg font-bold text-white">
                      {countryName}
                    </h3>
                  </div>
                  <div className="p-5">
                    <p className="text-sm leading-relaxed text-navy-500 dark:text-navy-300 line-clamp-3">
                      {countryDesc}
                    </p>
                    <div className="mt-4 border-t border-navy-50 pt-3 dark:border-white/5">
                      <p className="text-xs font-semibold uppercase tracking-wider text-gold-500 dark:text-gold-300">
                        {t('countries.tradeInfo')}
                      </p>
                      <p className="mt-1.5 text-xs leading-relaxed text-navy-400 dark:text-navy-400 line-clamp-2">
                        {countryTrade}
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        {limit && (
          <div className="mt-12 text-center">
            <Button to="/countries" variant="outline">
              {t('common.viewAll')}
              <ArrowRight size={18} className="rtl:rotate-180" />
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}
