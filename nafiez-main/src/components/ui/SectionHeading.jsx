import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function SectionHeading({ label, title, subtitle, align = 'center', light = false }) {
  const { t } = useTranslation();
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-start';

  return (
    <div className={`max-w-2xl ${alignment} ${align === 'center' ? 'mx-auto' : ''}`}>
      {label && (
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5 }}
          className={`mb-3 inline-block text-xs font-semibold uppercase tracking-[0.2em] ${
            light ? 'text-gold-300' : 'text-gold-500'
          }`}
        >
          {t(label) !== label ? t(label) : label}
        </motion.span>
      )}
      {title && (
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className={`text-3xl font-bold leading-tight sm:text-4xl lg:text-[2.75rem] ${
            light ? 'text-white' : 'text-navy-800 dark:text-white'
          }`}
        >
          {typeof title === 'string' ? t(title) !== title ? t(title) : title : title}
        </motion.h2>
      )}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`mt-4 text-base leading-relaxed lg:text-lg ${
            light ? 'text-navy-100' : 'text-navy-500 dark:text-navy-200'
          }`}
        >
          {typeof subtitle === 'string' ? t(subtitle) !== subtitle ? t(subtitle) : subtitle : subtitle}
        </motion.p>
      )}
    </div>
  );
}
