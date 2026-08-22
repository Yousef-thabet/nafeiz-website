import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ClipboardCheck, Factory, Handshake, MessageSquare, PackageCheck, Search, Truck } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { useSettings } from '@/context/SettingsContext';
import { getLocalizedSetting } from '@/lib/utils';

const STEPS = [
  { num: 1, key: 'step1', icon: MessageSquare },
  { num: 2, key: 'step2', icon: Search },
  { num: 3, key: 'step3', icon: Handshake },
  { num: 4, key: 'step4', icon: PackageCheck },
  { num: 5, key: 'step5', icon: ClipboardCheck },
  { num: 6, key: 'step6', icon: Factory },
  { num: 7, key: 'step7', icon: Truck },
];

export function HowItWorks() {
  const { t, i18n } = useTranslation();
  const { settings = {} } = useSettings() || {};

  return (
    <section className="section-pad bg-brand-bg dark:bg-navy-950">
      <Container>
        <SectionHeading
          label={t('howItWorks.label')}
          title={getLocalizedSetting(settings, 'howTitle', i18n.language, t('howItWorks.title'))}
          subtitle={getLocalizedSetting(settings, 'howDescription', i18n.language, t('howItWorks.subtitle'))}
        />

        <div className="relative mt-14">
          <div className="absolute start-5 top-6 h-[calc(100%-3rem)] w-px bg-gold-300/50 lg:start-0 lg:top-8 lg:h-px lg:w-full" />

          <div className="relative grid gap-8 lg:grid-cols-7 lg:gap-3">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative flex gap-5 ps-14 lg:block lg:ps-0 lg:text-center"
              >
                <div className="absolute start-0 top-0 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-gold-400 bg-white text-navy-800 shadow-soft dark:bg-navy-900 dark:text-gold-300 lg:relative lg:mx-auto lg:mb-5 lg:h-16 lg:w-16">
                  <step.icon size={20} aria-hidden="true" />
                  <span className="absolute -end-1 -top-2 font-mono text-[0.65rem] font-bold text-gold-600 dark:text-gold-300">{String(step.num).padStart(2, '0')}</span>
                </div>
                <div className="min-w-0 lg:px-2">
                  <h3 className="mb-2 text-sm font-bold text-navy-800 dark:text-white lg:text-base">
                    {t(`howItWorks.${step.key}.title`)}
                  </h3>
                  <p className="text-xs leading-relaxed text-navy-500 dark:text-navy-300 lg:text-sm">
                    {t(`howItWorks.${step.key}.description`)}
                  </p>
                </div>
                {i < STEPS.length - 1 && <ArrowRight size={16} className="absolute -end-3 top-8 hidden text-gold-500 rtl:rotate-180 lg:block" aria-hidden="true" />}
              </motion.div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
