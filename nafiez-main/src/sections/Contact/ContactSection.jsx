import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { SocialLinks } from '@/components/common/SocialLinks';
import { submitContactForm } from '@/services/api';
import { COUNTRY_PHONE_OPTIONS } from '@/data/countryPhoneCodes';
import { useSettings } from '@/context/SettingsContext';
import { getLocalizedSetting } from '@/lib/utils';
import { getApiFieldErrors } from '@/lib/formErrors';

const INITIAL_FORM = {
  name: '',
  companyName: '',
  email: '',
  country: '',
  countryCode: '',
  phoneCountryCode: 'CN',
  dialCode: '+86',
  phoneNumber: '',
  visitedChina: '',
  interests: [],
  estimatedOrderQuantity: '',
  startTimeline: '',
  productReadiness: '',
  message: '',
};

const INTEREST_OPTIONS = [
  { value: 'sourcing', key: 'contact.qualify.interests.options.sourcing', interests: ['SOURCING'] },
  { value: 'qualityInspection', key: 'contact.qualify.interests.options.qualityInspection', interests: ['QUALITY_INSPECTION'] },
  { value: 'shipping', key: 'contact.serviceOptions.shipping', interests: ['LOGISTICS'] },
  { value: 'findingSuppliers', key: 'contact.qualify.interests.options.findingSuppliers', interests: ['FINDING_SUPPLIERS'] },
  { value: 'sourcingAndShipping', key: 'contact.serviceOptions.sourcingAndShipping', interests: ['SOURCING', 'LOGISTICS'] },
  { value: 'other', key: 'contact.qualify.interests.options.other', interests: ['OTHER'] },
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

function getInterestValues(selectedOptions) {
  return [...new Set(selectedOptions.flatMap((value) => INTEREST_OPTIONS.find((option) => option.value === value)?.interests || []))];
}

function getInitialServiceOptions(shippingRequested) {
  return shippingRequested ? ['shipping'] : [];
}

function getInitialForm(shippingRequested) {
  const selectedOptions = getInitialServiceOptions(shippingRequested);
  return { ...INITIAL_FORM, interests: getInterestValues(selectedOptions) };
}

function getCountryName(countryCode, t) {
  if (countryCode === 'OTHER') return t('contact.countryOptions.other');
  return COUNTRY_PHONE_OPTIONS.find((country) => country.iso2 === countryCode)?.name || '';
}

function getPhoneCountry(countryCode) {
  return COUNTRY_PHONE_OPTIONS.find((country) => country.iso2 === countryCode)
    || COUNTRY_PHONE_OPTIONS.find((country) => country.iso2 === 'CN');
}

function getSettingText(settings, key) {
  const value = settings?.[key];
  return typeof value === 'string' ? value.trim() : '';
}

export function ContactSection() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const shippingRequested = searchParams.get('service') === 'shipping';
  const { settings = {} } = useSettings() || {};
  const [form, setForm] = useState(() => getInitialForm(shippingRequested));
  const [selectedServiceOptions, setSelectedServiceOptions] = useState(() => getInitialServiceOptions(shippingRequested));
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [submitError, setSubmitError] = useState('');
  const contactPhone = typeof settings.phone === 'string' ? settings.phone.trim() : '';
  const contactEmail = typeof settings.email === 'string' ? settings.email.trim() : '';
  const contactAddress = typeof settings.address === 'string' ? settings.address.trim() : '';
  const workingHours = typeof settings.workingHours === 'string' ? settings.workingHours.trim() : '';
  const responseTime = !workingHours || workingHours === '24/1' ? t('contact.info.hoursValue') : workingHours;
  const contactTitle = getLocalizedSetting(settings, 'contactTitle', i18n.language, t('contact.title'));
  const contactDescription = getLocalizedSetting(settings, 'contactDescription', i18n.language, t('contact.subtitle'));
  const qrChannels = [
    {
      key: 'whatsapp',
      imageUrl: getSettingText(settings, 'whatsappQrImageUrl'),
      enabled: getSettingText(settings, 'whatsappQrEnabled') !== 'false',
      label: getSettingText(settings, 'whatsappQrLabel') || t('contact.qr.whatsapp'),
      description: getSettingText(settings, 'whatsappQrDescription'),
    },
    {
      key: 'wechat',
      imageUrl: getSettingText(settings, 'wechatQrImageUrl'),
      enabled: getSettingText(settings, 'wechatQrEnabled') !== 'false',
      label: getSettingText(settings, 'wechatQrLabel') || t('contact.qr.wechat'),
      description: getSettingText(settings, 'wechatQrDescription'),
    },
  ].filter((channel) => channel.enabled && channel.imageUrl);

  function validate() {
    const e = {};

    if (!form.name.trim()) e.name = t('contact.validation.nameRequired');
    if (!form.email.trim()) e.email = t('contact.validation.emailRequired');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t('contact.validation.emailInvalid');

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
      name: form.name.trim(),
      companyName: form.companyName.trim(),
      email: form.email.trim(),
      phone: [form.dialCode, form.phoneNumber.trim()].filter(Boolean).join(' ').trim(),
      country: getCountryName(form.country, t),
      countryCode: form.countryCode,
      dialCode: form.dialCode,
      phoneNumber: form.phoneNumber.trim(),
      visitedChina: form.visitedChina === true,
      interests: form.interests,
      estimatedOrderQuantity: form.estimatedOrderQuantity,
      startTimeline: form.startTimeline,
      productReadiness: form.productReadiness,
      message: form.message.trim(),
    };

    const result = await submitContactForm(normalizedForm);
    if (result.ok) {
      setStatus('success');
      setForm(getInitialForm(shippingRequested));
      setSelectedServiceOptions(getInitialServiceOptions(shippingRequested));
      setErrors({});
    } else {
      setStatus('error');
      setSubmitError(result.message || t('contact.errorText'));
      const apiErrors = getApiFieldErrors({ payload: result.payload });
      setErrors(apiErrors);
    }
  }

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (status === 'error') {
      setStatus('idle');
      setSubmitError('');
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handlePhoneCountryChange(event) {
    const country = getPhoneCountry(event.target.value);
    if (!country) return;
    setForm((prev) => ({ ...prev, phoneCountryCode: country.iso2, dialCode: country.dialCode }));
  }

  function handleContactCountryChange(event) {
    const countryCode = event.target.value;
    setForm((previous) => ({ ...previous, countryCode, country: getCountryName(countryCode, t) }));
    if (errors.country) setErrors((previous) => ({ ...previous, country: undefined }));
  }

  function handleInterestToggle(value) {
    const nextOptions = selectedServiceOptions.includes(value)
      ? selectedServiceOptions.filter((item) => item !== value)
      : [...selectedServiceOptions, value];
    setSelectedServiceOptions(nextOptions);
    setForm((previous) => ({ ...previous, interests: getInterestValues(nextOptions) }));
    if (status === 'error') {
      setStatus('idle');
      setSubmitError('');
    }
    setErrors((previous) => ({ ...previous, interests: undefined }));
  }

  function handleOptionChange(field, value) {
    handleChange(field, value);
  }

  return (
    <section id="contact" className="section-pad bg-brand-bg dark:bg-navy-950">
      <Container>
        <SectionHeading
          label={t('contact.label')}
          title={contactTitle}
          subtitle={contactDescription}
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="lg:col-span-1">
            <div className="rounded-xl border border-navy-100 bg-white p-6 dark:border-white/10 dark:bg-navy-900">
              <h3 className="mb-5 text-lg font-bold text-navy-800 dark:text-white">
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
                    <p className="mt-0.5 whitespace-pre-line text-sm font-medium text-navy-700 dark:text-navy-100">
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
                      {responseTime}
                    </p>
                  </div>
                </li>
              </ul>
              <div className="mt-6 border-t border-navy-100 pt-5 dark:border-white/10">
                <SocialLinks
                  settings={settings}
                  keys={['instagram', 'facebook', 'tiktok']}
                  order={['instagram', 'facebook', 'tiktok']}
                  compact
                  className="justify-center text-navy-600 dark:text-navy-300"
                />
              </div>
            </div>
            {qrChannels.length > 0 && (
              <div className="mt-5 rounded-2xl border border-navy-100 bg-white p-5 shadow-soft dark:border-white/10 dark:bg-navy-900">
                <h3 className="text-base font-bold text-navy-800 dark:text-white">{t('contact.qr.title')}</h3>
                <p className="mt-1 text-sm text-navy-500 dark:text-navy-300">{t('contact.qr.scanText')}</p>
                <div className={`mt-4 grid gap-3 ${qrChannels.length === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
                  {qrChannels.map((channel) => (
                    <article key={channel.key} className="flex w-full max-w-[14rem] flex-col items-center justify-self-center rounded-xl border border-navy-100 bg-navy-50/60 p-3 text-center dark:border-white/10 dark:bg-navy-950/40">
                      <img src={channel.imageUrl} alt={channel.label} loading="lazy" className="h-[120px] w-[120px] rounded-md border border-navy-100 bg-white p-1 object-contain dark:border-white/10" />
                      <p className="mt-2 text-sm font-semibold text-navy-800 dark:text-white">{channel.label}</p>
                      {channel.description && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-navy-500 dark:text-navy-300">{channel.description}</p>}
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-xl border border-navy-100 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-navy-900 sm:p-7">
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
                    className="space-y-4"
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

                    <fieldset className="min-w-0 space-y-4 border-b border-navy-100 pb-5 dark:border-white/10">
                      <legend className="pb-2 text-sm font-bold text-navy-800 dark:text-white"><span className="me-2 text-xs font-semibold text-gold-600 dark:text-gold-300">01</span>{t('contact.sections.yourInformation')}</legend>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="name" className="label-base">{t('contact.name')}</label>
                          <input id="name" type="text" autoComplete="name" required value={form.name} onChange={(event) => handleChange('name', event.target.value)} placeholder={t('contact.namePlaceholder')} className="input-base" aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} />
                          {errors.name && <p id="name-error" className="mt-1.5 text-xs text-red-500">{errors.name}</p>}
                        </div>
                        <div>
                          <label htmlFor="companyName" className="label-base">{t('contact.companyName')}</label>
                          <input id="companyName" type="text" autoComplete="organization" value={form.companyName} onChange={(event) => handleChange('companyName', event.target.value)} placeholder={t('contact.companyNamePlaceholder')} className="input-base" />
                        </div>
                        <div>
                          <label htmlFor="email" className="label-base">{t('contact.email')}</label>
                          <input id="email" type="email" autoComplete="email" required value={form.email} onChange={(event) => handleChange('email', event.target.value)} placeholder={t('contact.emailPlaceholder')} className="input-base" dir="ltr" aria-invalid={!!errors.email} aria-describedby={errors.email ? 'email-error' : undefined} />
                          {errors.email && <p id="email-error" className="mt-1.5 text-xs text-red-500">{errors.email}</p>}
                        </div>
                        <div>
                          <label htmlFor="country" className="label-base">{t('contact.country')}</label>
                          <select id="country" value={form.countryCode} onChange={handleContactCountryChange} className="input-base">
                            <option value="">{t('contact.countryPlaceholder')}</option>
                            {COUNTRY_PHONE_OPTIONS.map((country) => <option key={country.iso2} value={country.iso2}>{country.name}</option>)}
                            <option value="OTHER">{t('contact.countryOptions.other')}</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="label-base">{t('contact.phone.title')}</p>
                          <div className="grid grid-cols-[minmax(7rem,0.38fr)_minmax(0,1fr)] gap-2">
                            <div>
                              <label htmlFor="phoneCountryCode" className="mb-1.5 block text-xs font-medium text-navy-500 dark:text-navy-300">{t('contact.phone.countryCode')}</label>
                              <select id="phoneCountryCode" value={form.phoneCountryCode} onChange={handlePhoneCountryChange} className="input-base px-2" dir="ltr">
                                {COUNTRY_PHONE_OPTIONS.map((country) => <option key={country.iso2} value={country.iso2}>{country.flag} {country.dialCode}</option>)}
                              </select>
                            </div>
                            <div>
                              <label htmlFor="phoneNumber" className="mb-1.5 block text-xs font-medium text-navy-500 dark:text-navy-300">{t('contact.phone.phoneNumber')}</label>
                              <input id="phoneNumber" type="tel" autoComplete="tel-national" required value={form.phoneNumber} onChange={(event) => handleChange('phoneNumber', event.target.value)} placeholder={t('contact.phone.phonePlaceholder')} className="input-base" dir="ltr" aria-invalid={!!errors.phoneNumber} aria-describedby={errors.phoneNumber ? 'phoneNumber-error' : undefined} />
                            </div>
                          </div>
                          {errors.phoneNumber && <p id="phoneNumber-error" className="mt-1.5 text-xs text-red-500">{errors.phoneNumber}</p>}
                        </div>
                      </div>
                    </fieldset>

                    <fieldset className="min-w-0 space-y-4 border-b border-navy-100 pb-5 dark:border-white/10">
                      <legend className="pb-2 text-sm font-bold text-navy-800 dark:text-white"><span className="me-2 text-xs font-semibold text-gold-600 dark:text-gold-300">02</span>{t('contact.sections.whatYouNeed')}</legend>
                      <div>
                        <p id="interests-label" className="label-base">{t('contact.qualify.interestsLabel')}</p>
                        <div role="group" aria-labelledby="interests-label" className="grid gap-2 sm:grid-cols-2">
                          {INTEREST_OPTIONS.map((option) => (
                            <label key={option.value} className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-colors ${selectedServiceOptions.includes(option.value) ? 'border-gold-500 bg-gold-50 text-gold-700 dark:border-gold-400 dark:bg-gold-400/10 dark:text-gold-200' : 'border-navy-200 bg-white text-navy-700 hover:border-navy-300 dark:border-white/10 dark:bg-navy-900 dark:text-navy-200'}`}>
                              <input type="checkbox" checked={selectedServiceOptions.includes(option.value)} onChange={() => handleInterestToggle(option.value)} className="h-4 w-4 shrink-0 rounded border-navy-300 text-gold-500 focus:ring-gold-500" />
                              {t(option.key)}
                            </label>
                          ))}
                        </div>
                        {errors.interests && <p className="mt-1.5 text-xs text-red-500">{errors.interests}</p>}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="estimatedOrderQuantity" className="label-base">{t('contact.qualify.estimatedOrderQuantity')}</label>
                          <select id="estimatedOrderQuantity" value={form.estimatedOrderQuantity} onChange={(event) => handleOptionChange('estimatedOrderQuantity', event.target.value)} className="input-base" aria-invalid={!!errors.estimatedOrderQuantity} aria-describedby={errors.estimatedOrderQuantity ? 'estimatedOrderQuantity-error' : undefined}>
                            <option value="">{t('contact.qualify.selectPlaceholder')}</option>
                            {ORDER_OPTIONS.map((option) => <option key={option.value} value={option.value}>{t(option.key)}</option>)}
                          </select>
                          {errors.estimatedOrderQuantity && <p id="estimatedOrderQuantity-error" className="mt-1.5 text-xs text-red-500">{errors.estimatedOrderQuantity}</p>}
                        </div>
                        <div>
                          <label htmlFor="startTimeline" className="label-base">{t('contact.qualify.startTimeline.label')}</label>
                          <select id="startTimeline" value={form.startTimeline} onChange={(event) => handleOptionChange('startTimeline', event.target.value)} className="input-base" aria-invalid={!!errors.startTimeline} aria-describedby={errors.startTimeline ? 'startTimeline-error' : undefined}>
                            <option value="">{t('contact.qualify.selectPlaceholder')}</option>
                            {TIMELINE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{t(option.key)}</option>)}
                          </select>
                          {errors.startTimeline && <p id="startTimeline-error" className="mt-1.5 text-xs text-red-500">{errors.startTimeline}</p>}
                        </div>
                      </div>
                    </fieldset>

                    <fieldset className="min-w-0 space-y-4 border-b border-navy-100 pb-5 dark:border-white/10">
                      <legend className="pb-2 text-sm font-bold text-navy-800 dark:text-white"><span className="me-2 text-xs font-semibold text-gold-600 dark:text-gold-300">03</span>{t('contact.sections.businessNeeds')}</legend>
                      <div>
                        <p id="visitedChina-label" className="label-base">{t('contact.qualify.visitedChina')}</p>
                        <div role="radiogroup" aria-labelledby="visitedChina-label" className="grid gap-2 sm:grid-cols-2">
                          {[{ value: true, label: t('contact.qualify.yes') }, { value: false, label: t('contact.qualify.no') }].map((option) => (
                            <button key={String(option.value)} type="button" role="radio" aria-checked={form.visitedChina === option.value} onClick={() => handleOptionChange('visitedChina', option.value)} className={`min-h-11 rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${form.visitedChina === option.value ? 'border-gold-500 bg-gold-50 text-gold-700 dark:border-gold-400 dark:bg-gold-400/10 dark:text-gold-200' : 'border-navy-200 bg-white text-navy-700 hover:border-navy-300 dark:border-white/10 dark:bg-navy-900 dark:text-navy-200'}`}>
                              {option.label}
                            </button>
                          ))}
                        </div>
                        {errors.visitedChina && <p className="mt-1.5 text-xs text-red-500">{errors.visitedChina}</p>}
                      </div>
                      <div>
                        <p id="productReadiness-label" className="label-base">{t('contact.qualify.productReadiness.label')}</p>
                        <div role="radiogroup" aria-labelledby="productReadiness-label" className="grid gap-2">
                          {PRODUCT_READINESS_OPTIONS.map((option) => (
                            <button key={option.value} type="button" role="radio" aria-checked={form.productReadiness === option.value} onClick={() => handleOptionChange('productReadiness', option.value)} className={`min-h-11 rounded-lg border px-3 py-2.5 text-start text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${form.productReadiness === option.value ? 'border-gold-500 bg-gold-50 text-gold-700 dark:border-gold-400 dark:bg-gold-400/10 dark:text-gold-200' : 'border-navy-200 bg-white text-navy-700 hover:border-navy-300 dark:border-white/10 dark:bg-navy-900 dark:text-navy-200'}`}>
                              {t(option.key)}
                            </button>
                          ))}
                        </div>
                        {errors.productReadiness && <p className="mt-1.5 text-xs text-red-500">{errors.productReadiness}</p>}
                      </div>
                    </fieldset>

                    <fieldset className="min-w-0 space-y-3">
                      <legend className="pb-2 text-sm font-bold text-navy-800 dark:text-white"><span className="me-2 text-xs font-semibold text-gold-600 dark:text-gold-300">04</span>{t('contact.sections.additionalDetails')}</legend>
                      <div>
                        <label htmlFor="message" className="label-base">{t('contact.message')}</label>
                        <textarea id="message" rows={5} required value={form.message} onChange={(event) => handleChange('message', event.target.value)} placeholder={t('contact.messagePlaceholder')} className="input-base min-h-36 resize-y" aria-invalid={!!errors.message} aria-describedby={errors.message ? 'message-error' : undefined} />
                        {errors.message && <p id="message-error" className="mt-1.5 text-xs text-red-500">{errors.message}</p>}
                      </div>
                    </fieldset>

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
