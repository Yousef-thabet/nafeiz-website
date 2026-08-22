import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MapPin, Languages, Layers, ShieldCheck } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { getStatistics } from '@/data/statistics';
import { getLocalizedSetting } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';
import logisticsImage from '@/assets/hero-bg.jpg';

const FEATURES = [
  { icon: MapPin, titleKey: 'feature1Title', textKey: 'feature1Text' },
  { icon: Languages, titleKey: 'feature2Title', textKey: 'feature2Text' },
  { icon: Layers, titleKey: 'feature3Title', textKey: 'feature3Text' },
  { icon: ShieldCheck, titleKey: 'feature4Title', textKey: 'feature4Text' },
];

function LogisticsVisual() {
  const { t, i18n } = useTranslation();

  return (
    <div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-white/10 bg-navy-900 sm:min-h-[360px] lg:min-h-[430px]">
      <img src={logisticsImage} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(4,11,28,0.9),rgba(13,33,68,0.35)_65%,rgba(4,11,28,0.8))]" />
      <div className="absolute inset-x-6 bottom-6 sm:inset-x-8 sm:bottom-8">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-300">{t('whyNafeiz.visualEyebrow')}</p>
        <p className="mt-2 max-w-xs font-serif text-2xl font-semibold leading-tight text-white sm:text-3xl">{t('whyNafeiz.visualTitle')}</p>
        <div className="mt-5 flex items-center gap-2 text-sm text-navy-200">
          <span className="h-2 w-2 rounded-full bg-brand-blue" />
          {t('whyNafeiz.visualText')}
        </div>
      </div>
    </div>
  );
}

export function WhyNafeiz() {
  const { t, i18n } = useTranslation();
  const { settings = {} } = useSettings() || {};
  const liveStatistics = getStatistics(settings);

  return (
    <section className="section-pad bg-navy-800 dark:bg-navy-900">
      <Container>
        <SectionHeading
          label={t('whyNafeiz.label')}
          title={getLocalizedSetting(settings, 'whyTitle', i18n.language, t('whyNafeiz.title'))}
          subtitle={getLocalizedSetting(settings, 'whyDescription', i18n.language, t('whyNafeiz.subtitle'))}
          light
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:items-center">
          <LogisticsVisual />

          <div className="grid grid-cols-2 gap-4">
            {liveStatistics.map((stat, i) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm"
              >
                <div className="font-serif text-4xl font-bold text-gold-300 lg:text-5xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-2 text-xs font-medium uppercase tracking-wider text-navy-200 lg:text-sm">
                  {t(`whyNafeiz.${stat.key}`)}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400/15">
                <feature.icon className="text-gold-300" size={22} />
              </div>
              <h3 className="mb-2 text-base font-bold text-white">
                {t(`whyNafeiz.${feature.titleKey}`)}
              </h3>
              <p className="text-sm leading-relaxed text-navy-200">
                {t(`whyNafeiz.${feature.textKey}`)}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>
    </section>
  );
}
