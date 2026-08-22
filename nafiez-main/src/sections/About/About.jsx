import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Check, Target, Eye } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { getStatistics } from '@/data/statistics';
import { getLocalizedSetting } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

const ABOUT_IMAGE = 'https://images.pexels.com/photos/33175650/pexels-photo-33175650.jpeg?auto=compress&cs=tinysrgb&w=900';

export function About() {
  const { t, i18n } = useTranslation();
  const { settings = {} } = useSettings() || {};
  const liveStatistics = getStatistics(settings);
  const title = getLocalizedSetting(settings, 'aboutTitle', i18n.language, t('about.title'));
  const description = getLocalizedSetting(settings, 'aboutDescription', i18n.language, t('about.story'));

  return (
    <section className="section-pad bg-brand-bg dark:bg-navy-950">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <div className="relative">
              <div className="overflow-hidden rounded-2xl shadow-card">
                <img
                  src={ABOUT_IMAGE}
                  alt={t('about.title')}
                  className="aspect-[4/3] w-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute -bottom-6 end-6 hidden rounded-2xl bg-navy-800 p-5 shadow-navy dark:bg-gold-400 sm:block">
                <div className="font-serif text-3xl font-bold text-gold-300 dark:text-navy-900">
                  <AnimatedCounter value={liveStatistics.find((stat) => stat.id === 'years')?.value || 8} suffix="+" />
                </div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-navy-200 dark:text-navy-800">
                  {t('whyNafeiz.stat4')}
                </div>
              </div>
            </div>
          </Reveal>

          <div>
            <SectionHeading
              label={t('about.label')}
              title={title}
              align="start"
            />
            <Reveal delay={0.1}>
              <p className="mt-6 text-base leading-relaxed text-navy-600 dark:text-navy-200">
                {description}
              </p>
              <p className="mt-4 text-base leading-relaxed text-navy-600 dark:text-navy-200">
                {t('about.story2')}
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-navy-100 bg-white p-4 dark:border-white/10 dark:bg-navy-900">
                <Check className="mt-0.5 shrink-0 text-gold-500" size={20} />
                <p className="text-sm leading-relaxed text-navy-600 dark:text-navy-200">
                  {t('about.whoWeAre')}
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button to="/about" variant="primary">
                  {t('common.readMore')}
                </Button>
                <Button to="/contact" variant="outline">
                  {t('nav.contact')}
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}

export function VisionMission() {
  const { t, i18n } = useTranslation();
  const { settings = {} } = useSettings() || {};
  const cards = [
    { icon: Eye, title: getLocalizedSetting(settings, 'visionTitle', i18n.language, t('about.visionTitle')), text: getLocalizedSetting(settings, 'visionDescription', i18n.language, t('about.visionText')) },
    { icon: Target, title: getLocalizedSetting(settings, 'missionTitle', i18n.language, t('about.missionTitle')), text: getLocalizedSetting(settings, 'missionDescription', i18n.language, t('about.missionText')) },
  ];

  return (
    <section className="bg-white py-16 dark:bg-navy-900 lg:py-20">
      <Container>
        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {cards.map((card, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="h-full rounded-2xl border border-navy-100 bg-brand-bg p-8 dark:border-white/10 dark:bg-navy-800">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-800 dark:bg-gold-400">
                  <card.icon className="text-gold-300 dark:text-navy-900" size={24} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-navy-800 dark:text-white">
                  {card.title}
                </h3>
                <p className="text-sm leading-relaxed text-navy-600 dark:text-navy-200">
                  {card.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
