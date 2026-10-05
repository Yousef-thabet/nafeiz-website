import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
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
    <section id="markets" className="section-pad bg-white dark:bg-navy-950">
      <Container>
        <SectionHeading
          label={t('countries.label')}
          title={getLocalizedSetting(settings, 'countriesTitle', lang, t('countries.title'))}
          subtitle={getLocalizedSetting(settings, 'countriesDescription', lang, t('countries.subtitle'))}
        />
        <Stagger className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {list.map((country) => {
            const countryName = getLocalizedField(country.nameL10n, lang) || t(`countries.${country.key}.name`);
            const imageUrl = country.imageUrl || country.image || '';

            return (
              <StaggerItem key={country.id}>
                <div className="group flex min-h-28 h-full flex-col items-center justify-center gap-2 rounded-lg border border-navy-100 bg-white px-3 py-3 text-center shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-gold-300 dark:border-white/10 dark:bg-navy-900">
                  <div className="flex aspect-[3/2] w-16 items-center justify-center overflow-hidden rounded-sm border border-navy-100 bg-navy-50 dark:border-white/10 dark:bg-navy-800">
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                        onError={(event) => { event.currentTarget.hidden = true; }}
                      />
                    )}
                  </div>
                  <h3 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-navy-800 dark:text-white">{countryName}</h3>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

      </Container>
    </section>
  );
}
