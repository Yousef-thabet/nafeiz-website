import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { SocialLinks } from '@/components/common/SocialLinks';
import { useSettings } from '@/context/SettingsContext';
import { getStatistics } from '@/data/statistics';
import { getLocalizedSetting } from '@/lib/utils';
import heroBackground from '@/assets/hero-bg.jpg';

const HERO_IMAGE = heroBackground;

export function Hero() {
  const { t, i18n } = useTranslation();
  const { settings = {} } = useSettings() || {};
  const statistics = getStatistics(settings);
  const headline = getLocalizedSetting(settings, 'heroTitle', i18n.language, t('hero.headline'));
  const subheadline = getLocalizedSetting(settings, 'heroDescription', i18n.language, t('hero.subheadline'));
  const configuredImage = typeof settings.heroImageUrl === 'string' ? settings.heroImageUrl.trim() : '';
  const hasQuickLinks = ['tiktok', 'instagram', 'facebook', 'wechat'].some((key) => typeof settings[key] === 'string' && settings[key].trim());
  const [heroImage, setHeroImage] = useState(configuredImage || HERO_IMAGE);

  useEffect(() => {
    setHeroImage(configuredImage || HERO_IMAGE);
  }, [configuredImage]);

  return (
    <section className="relative flex min-h-[min(100svh,900px)] items-center overflow-hidden bg-navy-800 pt-20 lg:pt-24">
      <div className="absolute inset-0">
        <img
          src={heroImage}
          alt={t('hero.imageAlt')}
          className="h-full w-full object-cover object-[58%_center]"
          loading="eager"
          onError={() => setHeroImage(HERO_IMAGE)}
        />
        <div className="absolute inset-0 bg-hero-overlay" />
      </div>

      <div className="container-base relative z-10 w-full py-16 sm:py-20">
        <div className="grid max-w-6xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-16">
          <div className="max-w-3xl border-s-2 border-gold-400/70 ps-5 sm:ps-7 lg:ps-8">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-gold-400/30 bg-gold-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-gold-300 backdrop-blur-sm"
          >
            <Sparkles size={14} />
            {t('hero.badge')}
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="mt-6 max-w-3xl text-3xl font-bold leading-[1.12] text-white text-balance sm:text-4xl lg:text-5xl xl:text-[3.4rem]"
          >
            {headline}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mt-6 max-w-2xl text-base leading-relaxed text-navy-100 lg:text-lg"
          >
            {subheadline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <Button to="/contact" variant="gold" size="lg">
              {t('hero.primaryCta')}
              <ArrowRight size={18} className="rtl:rotate-180" />
            </Button>
            <Button to="/services" variant="outline" size="lg" className="border-white/25 text-white hover:bg-white hover:text-navy-900">
              {t('hero.secondaryCta')}
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-12 grid max-w-xl grid-cols-3 divide-x divide-white/15 rounded-2xl border border-white/15 bg-navy-950/25 px-3 py-4 backdrop-blur-sm sm:px-5 sm:py-5 rtl:divide-x-reverse"
          >
            {statistics.slice(0, 3).map((stat) => (
              <div key={stat.id} className="px-2 sm:px-3">
                <div className="font-serif text-2xl font-bold text-gold-300 sm:text-3xl lg:text-4xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-navy-200 lg:text-sm">
                  {t(`whyNafeiz.${stat.key}`)}
                </div>
              </div>
            ))}
          </motion.div>

          {hasQuickLinks && <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-white/15 pt-5 text-sm text-navy-200"
          >
            <span className="font-semibold uppercase tracking-[0.16em] text-gold-300">{t('hero.quickLabel')}</span>
            <span className="hidden h-4 w-px bg-white/20 sm:block" />
            <SocialLinks settings={settings} keys={['tiktok', 'instagram', 'facebook', 'wechat']} compact className="text-white" />
          </motion.div>}

          </div>

          <motion.aside
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.35 }}
            className="hidden rounded-2xl border border-white/20 bg-navy-950/45 p-5 text-white shadow-navy backdrop-blur-md lg:block"
            aria-label={t('hero.badge')}
          >
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-300">{t('hero.badge')}</span>
              <span className="h-2 w-2 rounded-full bg-brand-blue shadow-[0_0_0_4px_rgba(37,150,190,0.16)]" />
            </div>
            <p className="mt-5 font-serif text-2xl font-semibold leading-tight text-white">{t('whyNafeiz.visualTitle')}</p>
            <p className="mt-3 text-sm leading-relaxed text-navy-200">{t('whyNafeiz.visualText')}</p>
            <div className="mt-6 space-y-3 border-t border-white/15 pt-5">
              {statistics.slice(0, 3).map((stat) => (
                <div key={stat.id} className="flex items-center justify-between gap-4 text-sm">
                  <span className="text-navy-300">{t(`whyNafeiz.${stat.key}`)}</span>
                  <span className="font-semibold text-gold-300"><AnimatedCounter value={stat.value} suffix={stat.suffix} /></span>
                </div>
              ))}
            </div>
          </motion.aside>
        </div>
      </div>

      <motion.button
        type="button"
        aria-label={t('common.scrollDown', 'Scroll to About section')}
        onClick={() => document.getElementById('home-about')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 cursor-pointer items-start justify-center rounded-full border-2 border-white/30 p-1.5 transition-colors hover:border-gold-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="h-2 w-1 rounded-full bg-gold-400"
        />
      </motion.button>
    </section>
  );
}
