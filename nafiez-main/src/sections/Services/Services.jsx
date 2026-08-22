import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';
import { services } from '@/data/services';
import { useSettings } from '@/context/SettingsContext';
import { getLocalizedSetting } from '@/lib/utils';

export function Services({ showAll = false }) {
  const { t, i18n } = useTranslation();
  const { settings = {} } = useSettings() || {};
  const list = showAll ? services : services.slice(0, 8);

  return (
    <section className="section-pad bg-white dark:bg-navy-950">
      <Container>
        <SectionHeading
          label={t('services.label')}
          title={getLocalizedSetting(settings, 'servicesTitle', i18n.language, t('services.title'))}
          subtitle={getLocalizedSetting(settings, 'servicesDescription', i18n.language, t('services.subtitle'))}
        />
        <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((service) => {
            const Icon = service.icon;
            return (
              <StaggerItem key={service.id}>
                <div className="group h-full rounded-2xl border border-navy-100 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-gold-300 hover:shadow-card dark:border-white/10 dark:bg-navy-900">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-700 transition-colors group-hover:bg-navy-800 group-hover:text-gold-300 dark:bg-navy-800 dark:text-gold-300 dark:group-hover:bg-gold-400 dark:group-hover:text-navy-900">
                      <Icon size={24} />
                    </div>
                    <span className="font-serif text-2xl font-bold text-navy-100 dark:text-navy-700">
                      {String(service.id).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mb-2 text-base font-bold text-navy-800 dark:text-white">
                    {t(`services.${service.key}.title`)}
                  </h3>
                  <p className="text-sm leading-relaxed text-navy-500 dark:text-navy-300">
                    {t(`services.${service.key}.description`)}
                  </p>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>

        {!showAll && (
          <div className="mt-12 text-center">
            <Button to="/services" variant="outline">
              {t('services.all')}
              <ArrowRight size={18} className="rtl:rotate-180" />
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}
