import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle, Loader2, Search } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { submitContactForm } from '@/services/api';
import { COUNTRY_PHONE_OPTIONS } from '@/data/countryPhoneCodes';
import { useSettings } from '@/context/SettingsContext';
import { getLocalizedSetting } from '@/lib/utils';

const INITIAL_FORM = {
  name: '',
  companyName: '',
  email: '',
  country: '',
  countryCode: '',
  dialCode: '+1',
  phoneNumber: '',
  visitedChina: '',
  interests: [],
  estimatedOrderQuantity: '',
  startTimeline: '',
  productReadiness: '',
  message: '',
};

const INTEREST_OPTIONS = [
  { value: 'SOURCING', key: 'contact.qualify.interests.options.sourcing' },
  { value: 'QUALITY_INSPECTION', key: 'contact.qualify.interests.options.qualityInspection' },
  { value: 'LOGISTICS', key: 'contact.qualify.interests.options.logistics' },
  { value: 'FINDING_SUPPLIERS', key: 'contact.qualify.interests.options.findingSuppliers' },
  { value: 'OTHER', key: 'contact.qualify.interests.options.other' },
];

const ORDER_OPTIONS = [
  { value: 'SMALL', key: 'contact.qualify.estimatedOrder.options.small' },
  { value: 'MEDIUM', key: 'contact.qualify.estimatedOrder.options.medium' },
  { value: 'LARGE', key: 'contact.qualify.estimatedOrder.options.large' },
  { value: 'NOT_SURE', key: 'contact.qualify.estimatedOrder.options.notSure' },
];

const TIMELINE_OPTIONS = [
  { value: 'IMMEDIATELY', key: 'contact.qualify.startTimeline.options.immediately' },
  { value: 'WITHIN_1_MONTH', key: 'contact.qualify.startTimeline.options.within1Month' },
  { value: 'WITHIN_3_MONTHS', key: 'contact.qualify.startTimeline.options.within3Months' },
  { value: 'JUST_EXPLORING', key: 'contact.qualify.startTimeline.options.justExploring' },
];

const PRODUCT_READINESS_OPTIONS = [
  { value: 'EXACTLY_KNOW', key: 'contact.qualify.productReadiness.options.exactlyKnow' },
  { value: 'NEEDS_HELP', key: 'contact.qualify.productReadiness.options.needsHelp' },
  { value: 'STILL_EXPLORING', key: 'contact.qualify.productReadiness.options.stillExploring' },
];

export function ContactSection() {
  const { t, i18n } = useTranslation();
  const { settings = {} } = useSettings() || {};
  const [form, setForm] = useState(INITIAL_FORM);
  const [countrySearch, setCountrySearch] = useState('');
  const [countryMenuOpen, setCountryMenuOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [submitError, setSubmitError] = useState('');
  const contactPhone = typeof settings.phone === 'string' ? settings.phone.trim() : '';
  const contactEmail = typeof settings.email === 'string' ? settings.email.trim() : '';
  const contactAddress = typeof settings.address === 'string' ? settings.address.trim() : '';
  const workingHours = typeof settings.workingHours === 'string' ? settings.workingHours.trim() : '';
  const contactTitle = getLocalizedSetting(settings, 'contactTitle', i18n.language, t('contact.title'));
  const contactDescription = getLocalizedSetting(settings, 'contactDescription', i18n.language, t('contact.subtitle'));

  const filteredCountries = COUNTRY_PHONE_OPTIONS.filter((country) => {
    const query = countrySearch.trim().toLowerCase();
    if (!query) return true;
    return (
      country.name.toLowerCase().includes(query) ||
      country.iso2.toLowerCase().includes(query) ||
      country.dialCode.toLowerCase().includes(query)
    );
  }).slice(0, 120);

  const selectedCountry = COUNTRY_PHONE_OPTIONS.find((country) => country.iso2 === form.countryCode) || null;

  function validate() {
    const e = {};

    if (!form.name.trim()) e.name = t('contact.validation.nameRequired');
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('contact.validation.emailInvalid');

    if (!form.countryCode || !selectedCountry) e.country = t('contact.validation.countryRequired');
    if (!form.phoneNumber.trim()) e.phoneNumber = t('contact.validation.phoneRequired');
    else if (!/^[0-9+()\-\s]{5,30}$/.test(form.phoneNumber.trim())) e.phoneNumber = t('contact.validation.phoneInvalid');

    if (form.visitedChina === '') e.visitedChina = t('contact.validation.visitedChinaRequired');
    if (!form.interests.length) e.interests = t('contact.validation.interestsRequired');
    if (!form.estimatedOrderQuantity) e.estimatedOrderQuantity = t('contact.validation.estimatedOrderQuantityRequired');
    if (!form.startTimeline) e.startTimeline = t('contact.validation.startTimelineRequired');
    if (!form.productReadiness) e.productReadiness = t('contact.validation.productReadinessRequired');
    if (!form.message.trim()) e.message = t('contact.validation.messageRequired');
    else if (form.message.trim().length < 10) e.message = t('contact.validation.messageShort');

    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === 'loading') return;

    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('loading');
    setSubmitError('');
    const normalizedForm = {
      ...form,
      companyName: form.companyName.trim(),
      phone: [form.dialCode, form.phoneNumber.trim()].filter(Boolean).join(' ').trim(),
      country: form.country || selectedCountry?.name || '',
      dialCode: form.dialCode || selectedCountry?.dialCode || '',
      phoneNumber: form.phoneNumber.trim(),
    };

    const result = await submitContactForm(normalizedForm);
    if (result.ok) {
      setStatus('success');
      setForm(INITIAL_FORM);
      setCountrySearch('');
      setCountryMenuOpen(false);
      setErrors({});
    } else {
      setStatus('error');
      setSubmitError(result.message || t('contact.errorText'));
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleCountrySelect(country) {
    setForm((prev) => ({
      ...prev,
      country: country.name,
      countryCode: country.iso2,
      dialCode: country.dialCode,
    }));
    setCountrySearch('');
    setCountryMenuOpen(false);
    if (errors.country) {
      setErrors((prev) => ({ ...prev, country: undefined }));
    }
  }

  function handleInterestToggle(value) {
    setForm((prev) => {
      const nextInterests = prev.interests.includes(value)
        ? prev.interests.filter((item) => item !== value)
        : [...prev.interests, value];

      return { ...prev, interests: nextInterests };
    });

    if (errors.interests) {
      setErrors((prev) => ({ ...prev, interests: undefined }));
    }
  }

  return (
    <section id="contact" className="section-pad bg-brand-bg dark:bg-navy-950">
      <Container>
        <SectionHeading
          label={t('contact.label')}
          title={contactTitle}
          subtitle={contactDescription}
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="h-full rounded-2xl border border-navy-100 bg-white p-8 shadow-soft dark:border-white/10 dark:bg-navy-900">
              <h3 className="mb-6 text-lg font-bold text-navy-800 dark:text-white">
                {t('contact.info.title')}
              </h3>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 dark:bg-navy-800">
                    <MapPin size={20} className="text-gold-500" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">
                      {t('contact.info.location')}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-navy-700 dark:text-navy-100">
                      {contactAddress || t('contact.info.locationValue')}
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 dark:bg-navy-800">
                    <Phone size={20} className="text-gold-500" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">
                      {t('contact.info.phone')}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-navy-700 dark:text-navy-100">
                      <span dir="ltr" className="bidi-isolate">{contactPhone || t('contact.info.phoneUnavailable')}</span>
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 dark:bg-navy-800">
                    <Mail size={20} className="text-gold-500" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">
                      {t('contact.info.email')}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-navy-700 dark:text-navy-100">
                      <span dir="ltr" className="bidi-isolate">{contactEmail || t('contact.info.emailUnavailable')}</span>
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 dark:bg-navy-800">
                    <Clock size={20} className="text-gold-500" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-navy-400">
                      {t('contact.info.hours')}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-navy-700 dark:text-navy-100">
                      {workingHours || t('contact.info.hoursValue')}
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="rounded-2xl border border-navy-100 bg-white p-8 shadow-soft dark:border-white/10 dark:bg-navy-900">
              <AnimatePresence mode="wait">
                {status === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center py-12 text-center"
                  >
                    <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-900/20">
                      <CheckCircle2 size={36} className="text-green-500" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-navy-800 dark:text-white">
                      {t('contact.successTitle')}
                    </h3>
                    <p className="max-w-sm text-sm text-navy-500 dark:text-navy-300">
                      {t('contact.successText')}
                    </p>
                    <Button variant="outline" size="sm" className="mt-6" onClick={() => setStatus('idle')}>
                      {t('contact.sendAnother')}
                    </Button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-5"
                  >
                    {status === 'error' && (
                      <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900/30 dark:bg-red-900/20">
                        <AlertCircle size={20} className="shrink-0 text-red-500" />
                        <div>
                          <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                            {t('contact.errorTitle')}
                          </p>
                          <p className="text-xs text-red-600 dark:text-red-400">
                            {submitError || t('contact.errorText')}
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <label htmlFor="name" className="label-base">
                        {t('contact.name')}
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder={t('contact.namePlaceholder')}
                        className="input-base"
                        aria-invalid={!!errors.name}
                        aria-describedby={errors.name ? 'name-error' : undefined}
                      />
                      {errors.name && (
                        <p id="name-error" className="mt-1.5 text-xs text-red-500">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="companyName" className="label-base">
                        {t('contact.companyName')}
                      </label>
                      <input
                        id="companyName"
                        type="text"
                        value={form.companyName}
                        onChange={(e) => handleChange('companyName', e.target.value)}
                        placeholder={t('contact.companyNamePlaceholder')}
                        className="input-base"
                        aria-invalid={!!errors.companyName}
                        aria-describedby={errors.companyName ? 'companyName-error' : undefined}
                      />
                      {errors.companyName && (
                        <p id="companyName-error" className="mt-1.5 text-xs text-red-500">
                          {errors.companyName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="label-base">
                        {t('contact.email')}
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        placeholder={t('contact.emailPlaceholder')}
                        className="input-base"
                        dir="ltr"
                        aria-invalid={!!errors.email}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                      />
                      {errors.email && (
                        <p id="email-error" className="mt-1.5 text-xs text-red-500">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="label-base">{t('contact.phone.title')}</label>
                      <div className="space-y-3">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setCountryMenuOpen((prev) => !prev)}
                            className="input-base flex w-full items-center justify-between gap-3 text-left"
                            aria-expanded={countryMenuOpen}
                          >
                            <span className="flex items-center gap-2 truncate">
                              <span>{selectedCountry?.flag || '🌍'}</span>
                              <span className="truncate">
                                {form.country || t('contact.phone.countryPlaceholder')}
                              </span>
                            </span>
                            <span className="text-xs text-navy-400">{selectedCountry?.dialCode || form.dialCode || '+1'}</span>
                          </button>

                          {countryMenuOpen && (
                            <div className="absolute left-0 right-0 z-20 mt-2 rounded-2xl border border-navy-100 bg-white p-2 shadow-soft dark:border-white/10 dark:bg-navy-900">
                              <div className="mb-2 flex items-center gap-2 rounded-xl border border-navy-100 bg-navy-50 px-3 py-2 dark:border-white/10 dark:bg-navy-800">
                                <Search size={16} className="text-navy-400" />
                                <input
                                  type="text"
                                  value={countrySearch}
                                  onChange={(event) => setCountrySearch(event.target.value)}
                                  placeholder={t('contact.phone.searchCountry')}
                                  className="w-full bg-transparent text-sm outline-none placeholder:text-navy-400"
                                />
                              </div>
                              <div className="max-h-64 space-y-1 overflow-y-auto">
                                {filteredCountries.map((country) => (
                                  <button
                                    key={country.iso2}
                                    type="button"
                                    onClick={() => handleCountrySelect(country)}
                                    className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition hover:bg-navy-50 dark:hover:bg-navy-800"
                                  >
                                    <span className="flex items-center gap-2">
                                      <span>{country.flag}</span>
                                      <span>{country.name}</span>
                                    </span>
                                    <span className="text-xs text-navy-500 dark:text-navy-300">{country.dialCode}</span>
                                  </button>
                                ))}
                                {!filteredCountries.length && (
                                  <p className="px-2 py-3 text-xs text-navy-500 dark:text-navy-300">
                                    {t('contact.phone.noCountriesFound')}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="grid gap-3 md:grid-cols-[130px_minmax(0,1fr)]">
                          <div>
                            <label htmlFor="dialCode" className="mb-1.5 block text-xs font-medium text-navy-500 dark:text-navy-300">
                              {t('contact.phone.countryCode')}
                            </label>
                            <input
                              id="dialCode"
                              type="text"
                              readOnly
                              value={selectedCountry?.dialCode || form.dialCode || '+1'}
                              className="input-base"
                              dir="ltr"
                            />
                          </div>

                          <div>
                            <label htmlFor="phoneNumber" className="mb-1.5 block text-xs font-medium text-navy-500 dark:text-navy-300">
                              {t('contact.phone.phoneNumber')}
                            </label>
                            <div className="flex items-center overflow-hidden rounded-xl border border-navy-200 bg-white dark:border-white/10 dark:bg-navy-950">
                              <span className="border-r border-navy-200 bg-navy-50 px-3 py-3 text-sm font-medium text-navy-700 dark:border-white/10 dark:bg-navy-800 dark:text-navy-100">
                                {selectedCountry?.dialCode || form.dialCode || '+1'}
                              </span>
                              <input
                                id="phoneNumber"
                                type="tel"
                                value={form.phoneNumber}
                                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                                placeholder={t('contact.phone.phonePlaceholder')}
                                className="w-full border-0 bg-transparent px-3 py-3 text-sm text-navy-800 outline-none placeholder:text-navy-400 dark:text-white"
                                dir="ltr"
                                aria-invalid={!!errors.phoneNumber}
                                aria-describedby={errors.phoneNumber ? 'phoneNumber-error' : undefined}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {(errors.country || errors.phoneNumber) && (
                        <div className="mt-2 space-y-1 text-xs text-red-500">
                          {errors.country && <p id="country-error">{errors.country}</p>}
                          {errors.phoneNumber && <p id="phoneNumber-error">{errors.phoneNumber}</p>}
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 rounded-2xl border border-navy-100 bg-navy-50/60 p-4 dark:border-white/10 dark:bg-navy-950/40">
                      <div>
                        <label className="label-base">{t('contact.qualify.visitedChina')}</label>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {[{ value: true, label: t('contact.qualify.yes') }, { value: false, label: t('contact.qualify.no') }].map((option) => (
                            <button
                              key={String(option.value)}
                              type="button"
                              onClick={() => handleChange('visitedChina', option.value)}
                              className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${
                                form.visitedChina === option.value
                                  ? 'border-gold-500 bg-gold-50 text-gold-700 dark:border-gold-400 dark:bg-gold-400/10 dark:text-gold-300'
                                  : 'border-navy-200 bg-white text-navy-700 hover:border-navy-300 dark:border-white/10 dark:bg-navy-900 dark:text-navy-200'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                        {errors.visitedChina && <p className="mt-1.5 text-xs text-red-500">{errors.visitedChina}</p>}
                      </div>

                      <div>
                        <label className="label-base">{t('contact.qualify.interestsLabel')}</label>
                        <div className="mt-2 grid gap-2 sm:grid-cols-2">
                          {INTEREST_OPTIONS.map((option) => (
                            <label key={option.value} className="flex items-center gap-2 rounded-xl border border-navy-200 bg-white px-3 py-2 text-sm text-navy-700 dark:border-white/10 dark:bg-navy-900 dark:text-navy-200">
                              <input
                                type="checkbox"
                                checked={form.interests.includes(option.value)}
                                onChange={() => handleInterestToggle(option.value)}
                                className="h-4 w-4 rounded border-navy-300 text-gold-500 focus:ring-gold-500"
                              />
                              {t(option.key)}
                            </label>
                          ))}
                        </div>
                        {errors.interests && <p className="mt-1.5 text-xs text-red-500">{errors.interests}</p>}
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <label htmlFor="estimatedOrderQuantity" className="label-base">
                            {t('contact.qualify.estimatedOrderQuantity')}
                          </label>
                          <select
                            id="estimatedOrderQuantity"
                            value={form.estimatedOrderQuantity}
                            onChange={(e) => handleChange('estimatedOrderQuantity', e.target.value)}
                            className="input-base"
                            aria-invalid={!!errors.estimatedOrderQuantity}
                          >
                            <option value="">{t('contact.qualify.selectPlaceholder')}</option>
                            {ORDER_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>{t(option.key)}</option>
                            ))}
                          </select>
                          {errors.estimatedOrderQuantity && <p className="mt-1.5 text-xs text-red-500">{errors.estimatedOrderQuantity}</p>}
                        </div>

                        <div>
                          <label htmlFor="startTimeline" className="label-base">
                            {t('contact.qualify.startTimeline.label')}
                          </label>
                          <select
                            id="startTimeline"
                            value={form.startTimeline}
                            onChange={(e) => handleChange('startTimeline', e.target.value)}
                            className="input-base"
                            aria-invalid={!!errors.startTimeline}
                          >
                            <option value="">{t('contact.qualify.selectPlaceholder')}</option>
                            {TIMELINE_OPTIONS.map((option) => (
                              <option key={option.value} value={option.value}>{t(option.key)}</option>
                            ))}
                          </select>
                          {errors.startTimeline && <p className="mt-1.5 text-xs text-red-500">{errors.startTimeline}</p>}
                        </div>
                      </div>

                      <div>
                        <label className="label-base">{t('contact.qualify.productReadiness.label')}</label>
                        <div className="mt-2 grid gap-2">
                          {PRODUCT_READINESS_OPTIONS.map((option) => (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleChange('productReadiness', option.value)}
                              className={`rounded-xl border px-3 py-2 text-left text-sm font-medium transition ${
                                form.productReadiness === option.value
                                  ? 'border-gold-500 bg-gold-50 text-gold-700 dark:border-gold-400 dark:bg-gold-400/10 dark:text-gold-300'
                                  : 'border-navy-200 bg-white text-navy-700 hover:border-navy-300 dark:border-white/10 dark:bg-navy-900 dark:text-navy-200'
                              }`}
                            >
                              {t(option.key)}
                            </button>
                          ))}
                        </div>
                        {errors.productReadiness && <p className="mt-1.5 text-xs text-red-500">{errors.productReadiness}</p>}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="label-base">
                        {t('contact.message')}
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        value={form.message}
                        onChange={(e) => handleChange('message', e.target.value)}
                        placeholder={t('contact.messagePlaceholder')}
                        className="input-base resize-none"
                        aria-invalid={!!errors.message}
                        aria-describedby={errors.message ? 'message-error' : undefined}
                      />
                      {errors.message && (
                        <p id="message-error" className="mt-1.5 text-xs text-red-500">
                          {errors.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      className="w-full"
                      disabled={status === 'loading'}
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          {t('contact.sending')}
                        </>
                      ) : (
                        <>
                          <Send size={18} className="rtl:rotate-180" />
                          {t('contact.submit')}
                        </>
                      )}
                    </Button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
