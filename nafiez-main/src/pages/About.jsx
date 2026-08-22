import { useTranslation } from 'react-i18next';
import { useSEO } from '@/hooks/useSEO';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/components/ui/Reveal';
import { Button } from '@/components/ui/Button';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { VisionMission } from '@/sections/About/About';
import { getStatistics } from '@/data/statistics';
import { useSettings } from '@/context/SettingsContext';

const ABOUT_IMAGE = 'https://images.pexels.com/photos/33175650/pexels-photo-33175650.jpeg?auto=compress&cs=tinysrgb&w=900';

export default function About() {
  useSEO('about');
  const { t } = useTranslation();
  const { settings = {} } = useSettings() || {};
  const statistics = getStatistics(settings);

  return (
    <>
      <section className="bg-navy-800 pt-28 pb-16 dark:bg-navy-900 lg:pt-36">
        <Container>
          <SectionHeading
            label={t('about.label')}
            title={t('about.title')}
            light
          />
        </Container>
      </section>

      <section className="section-pad bg-brand-bg dark:bg-navy-950">
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <Reveal>
              <div className="overflow-hidden rounded-2xl shadow-card">
                <img
                  src={ABOUT_IMAGE}
                  alt={t('about.title')}
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              </div>
            </Reveal>
            <div>
              <Reveal delay={0.1}>
                <p className="text-base leading-relaxed text-navy-600 dark:text-navy-200">
                  {t('about.story')}
                </p>
                <p className="mt-4 text-base leading-relaxed text-navy-600 dark:text-navy-200">
                  {t('about.story2')}
                </p>
                <p className="mt-4 text-base leading-relaxed text-navy-600 dark:text-navy-200">
                  {t('about.whoWeAre')}
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="mt-6 rounded-xl border border-navy-100 bg-white p-5 dark:border-white/10 dark:bg-navy-900">
                  <h3 className="mb-2 text-sm font-bold text-navy-800 dark:text-white">
                    {t('about.positioning')}
                  </h3>
                  <p className="text-sm leading-relaxed text-navy-500 dark:text-navy-300">
                    {t('about.positioningText')}
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </Container>
      </section>

      <VisionMission />

      <section className="bg-white py-16 dark:bg-navy-950 lg:py-20">
        <Container>
          <SectionHeading
            label={t('about.statsTitle')}
            title={t('about.statsTitle')}
            subtitle={t('about.statsSubtitle')}
          />
          <div className="mt-12 grid grid-cols-2 gap-6 lg:grid-cols-4">
            {statistics.map((stat, i) => (
              <Reveal key={stat.id} delay={i * 0.1}>
                <div className="rounded-2xl border border-navy-100 bg-brand-bg p-8 text-center dark:border-white/10 dark:bg-navy-900">
                  <div className="font-serif text-4xl font-bold text-navy-800 dark:text-gold-300 lg:text-5xl">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="mt-2 text-xs font-medium uppercase tracking-wider text-navy-500 dark:text-navy-300 lg:text-sm">
                    {t(`whyNafeiz.${stat.key}`)}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-navy-800 py-16 dark:bg-navy-900 lg:py-20">
        <Container narrow className="text-center">
          <Reveal>
            <h2 className="text-2xl font-bold text-white lg:text-3xl">
              {t('about.ctaTitle')}
            </h2>
            <p className="mt-4 text-navy-200">
              {t('about.ctaText')}
            </p>
            <Button to="/contact" variant="gold" size="lg" className="mt-8">
              {t('about.ctaButton')}
            </Button>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
