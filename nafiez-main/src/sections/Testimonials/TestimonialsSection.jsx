import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { getTestimonials } from '@/services/api';
import { getLocalizedField } from '@/lib/utils';
import { getLocalizedSetting } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

const AUTOPLAY_DELAY = 6000;

function parseLocalizedValue(value, fallback = '') {
  if (typeof value !== 'string') return value ?? fallback;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function getTestimonialField(testimonial, localizedKey, legacyKey) {
  const localized = parseLocalizedValue(testimonial?.[localizedKey]);
  if (localized !== undefined && localized !== null && localized !== '') return localized;
  return testimonial?.[legacyKey] ?? '';
}

export function TestimonialsSection() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { settings = {} } = useSettings() || {};
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const response = await getTestimonials();
        if (response.ok && response.data) {
          // Parse multilingual fields if they're JSON strings
          const data = Array.isArray(response.data) ? response.data : response.data.testimonials;
          const parsed = (Array.isArray(data) ? data : [])
            .filter((item) => item && typeof item === 'object')
            .map((t) => ({
            ...t,
            nameL10n: getTestimonialField(t, 'nameL10n', 'name'),
            positionL10n: getTestimonialField(t, 'positionL10n', 'jobTitle' in t ? 'jobTitle' : 'company'),
            reviewL10n: getTestimonialField(t, 'reviewL10n', 'comment' in t ? 'comment' : 'testimonial'),
            }));
          setTestimonials(parsed.filter(t => t.isVisible !== false));
        } else {
          setError('Failed to load testimonials');
        }
      } catch (err) {
        setError('Failed to load testimonials');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const next = useCallback(() => {
    setIndex((prev) => (prev + 1) % testimonials.length);
  }, [testimonials.length]);

  const prev = useCallback(() => {
    setIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  }, [testimonials.length]);

  useEffect(() => {
    if (paused || testimonials.length <= 1) return;
    const timer = setInterval(next, AUTOPLAY_DELAY);
    return () => clearInterval(timer);
  }, [paused, next, testimonials.length]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    }
    const el = document.getElementById('testimonials-slider');
    el?.addEventListener('keydown', onKeyDown);
    return () => el?.removeEventListener('keydown', onKeyDown);
  }, [prev, next]);

  if (loading) {
    return (
      <section className="section-pad bg-white dark:bg-navy-950">
        <Container>
          <SectionHeading
            label={t('testimonials.label')}
            title={getLocalizedSetting(settings, 'testimonialsTitle', lang, t('testimonials.title'))}
            subtitle={getLocalizedSetting(settings, 'testimonialsDescription', lang, t('testimonials.subtitle'))}
          />
          <div className="mt-12 flex justify-center">
            <LoadingSpinner size={40} />
          </div>
        </Container>
      </section>
    );
  }

  if (error || testimonials.length === 0) {
    return (
      <section className="section-pad bg-white dark:bg-navy-950">
        <Container>
          <SectionHeading
            label={t('testimonials.label')}
            title={getLocalizedSetting(settings, 'testimonialsTitle', lang, t('testimonials.title'))}
            subtitle={getLocalizedSetting(settings, 'testimonialsDescription', lang, t('testimonials.subtitle'))}
          />
          <p className="mt-12 text-center text-navy-500 dark:text-navy-300">
            {t('testimonials.empty')}
          </p>
        </Container>
      </section>
    );
  }

  const current = testimonials[index];
  const name = getLocalizedField(current.nameL10n, lang);
  const position = getLocalizedField(current.positionL10n, lang);
  const review = getLocalizedField(current.reviewL10n, lang);
  const displayName = name.trim() || 'Anonymous';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'A';

  return (
    <section className="section-pad bg-white dark:bg-navy-950">
      <Container>
        <SectionHeading
          label={t('testimonials.label')}
          title={getLocalizedSetting(settings, 'testimonialsTitle', lang, t('testimonials.title'))}
          subtitle={getLocalizedSetting(settings, 'testimonialsDescription', lang, t('testimonials.subtitle'))}
        />

        <div
          id="testimonials-slider"
          tabIndex={0}
          role="region"
          aria-roledescription="carousel"
          aria-label={t('testimonials.label')}
          className="relative mx-auto mt-12 max-w-3xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="overflow-hidden rounded-2xl border border-navy-100 bg-brand-bg p-8 shadow-soft dark:border-white/10 dark:bg-navy-900 lg:p-12">
            <Quote className="mb-6 text-gold-400" size={40} />
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-4 flex gap-1" aria-label={`${current.rating} / 5`}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={i < current.rating ? 'fill-gold-400 text-gold-400' : 'text-navy-200 dark:text-navy-700'}
                    />
                  ))}
                </div>
                <p className="text-base leading-relaxed text-navy-700 dark:text-navy-100 lg:text-lg">
                  "{review}"
                </p>
                <div className="mt-6 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-800 font-serif text-sm font-bold text-gold-300 dark:bg-gold-400 dark:text-navy-900">
                    {initials}
                  </div>
                  <div>
                    <p className="font-semibold text-navy-800 dark:text-white">
                      {displayName}
                    </p>
                    <p className="text-sm text-navy-500 dark:text-navy-300">
                      {position}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {testimonials.length > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label={t('testimonials.previous')}
                className="absolute top-1/2 -start-4 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-navy-100 bg-white shadow-soft transition-colors hover:bg-navy-50 dark:border-white/10 dark:bg-navy-800 dark:hover:bg-white/10 lg:-start-6"
              >
                <ChevronLeft size={20} className="rtl:rotate-180" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label={t('testimonials.next')}
                className="absolute top-1/2 -end-4 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border border-navy-100 bg-white shadow-soft transition-colors hover:bg-navy-50 dark:border-white/10 dark:bg-navy-800 dark:hover:bg-white/10 lg:-end-6"
              >
                <ChevronRight size={20} className="rtl:rotate-180" />
              </button>

              <div className="mt-6 flex justify-center gap-2">
                {testimonials.map((tst, i) => (
                  <button
                    key={tst.id}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Go to testimonial ${i + 1}`}
                    aria-current={i === index}
                    className={`h-2 rounded-full transition-all ${
                      i === index ? 'w-8 bg-gold-400' : 'w-2 bg-navy-200 dark:bg-navy-700'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </Container>
    </section>
  );
}

