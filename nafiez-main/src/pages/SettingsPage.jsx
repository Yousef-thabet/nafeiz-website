import { useEffect, useState } from 'react';
import { apiPut } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import i18n, { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/formErrors';

const LOCALIZED_KEYS = [
  'heroTitle', 'heroDescription', 'aboutTitle', 'aboutDescription',
  'visionTitle', 'visionDescription', 'missionTitle', 'missionDescription',
  'servicesTitle', 'servicesDescription', 'productsTitle', 'productsDescription',
  'countriesTitle', 'countriesDescription', 'whyTitle', 'whyDescription',
  'howTitle', 'howDescription', 'testimonialsTitle', 'testimonialsDescription',
  'contactTitle', 'contactDescription', 'footerDescription',
];

const LOCALE_PATHS = {
  heroTitle: 'hero.headline',
  heroDescription: 'hero.subheadline',
  aboutTitle: 'about.title',
  aboutDescription: 'about.story',
  visionTitle: 'about.visionTitle',
  visionDescription: 'about.visionText',
  missionTitle: 'about.missionTitle',
  missionDescription: 'about.missionText',
  servicesTitle: 'services.title',
  servicesDescription: 'services.subtitle',
  productsTitle: 'products.title',
  productsDescription: 'products.subtitle',
  countriesTitle: 'countries.title',
  countriesDescription: 'countries.subtitle',
  whyTitle: 'whyNafeiz.title',
  whyDescription: 'whyNafeiz.subtitle',
  howTitle: 'howItWorks.title',
  howDescription: 'howItWorks.subtitle',
  testimonialsTitle: 'testimonials.title',
  testimonialsDescription: 'testimonials.subtitle',
  contactTitle: 'contact.title',
  contactDescription: 'contact.subtitle',
  footerDescription: 'footer.tagline',
};

const groups = [
  { title: 'Contact & company', fields: [['companyName', 'Company name'], ['phone', 'Phone'], ['email', 'Email'], ['whatsapp', 'WhatsApp'], ['address', 'Address'], ['workingHours', 'Working hours']] },
  { title: 'Hero', fields: [['heroTitle', 'Title', true], ['heroDescription', 'Description', true], ['heroImageUrl', 'Image URL']] },
  { title: 'About & vision', fields: [['aboutTitle', 'About title', true], ['aboutDescription', 'About description', true], ['visionTitle', 'Vision title', true], ['visionDescription', 'Vision description', true], ['missionTitle', 'Mission title', true], ['missionDescription', 'Mission description', true]] },
  { title: 'Home sections', fields: [['servicesTitle', 'Services title', true], ['servicesDescription', 'Services description', true], ['productsTitle', 'Products title', true], ['productsDescription', 'Products description', true], ['countriesTitle', 'Countries title', true], ['countriesDescription', 'Countries description', true], ['whyTitle', 'Why NAFEIZ title', true], ['whyDescription', 'Why NAFEIZ description', true], ['howTitle', 'How it works title', true], ['howDescription', 'How it works description', true], ['testimonialsTitle', 'Testimonials title', true], ['testimonialsDescription', 'Testimonials description', true], ['contactTitle', 'Contact title', true], ['contactDescription', 'Contact description', true]] },
  { title: 'Statistics', fields: [['statisticsClients', 'Clients'], ['statisticsCountries', 'Countries'], ['statisticsFactories', 'Suppliers / factories'], ['statisticsShipments', 'Shipments / orders'], ['statisticsYears', 'Years of experience']] },
  { title: 'Footer', fields: [['footerDescription', 'Footer description', true]] },
];

const socialFields = [['instagram', 'Instagram'], ['facebook', 'Facebook'], ['tiktok', 'TikTok'], ['wechat', 'WeChat']];

function parseLocalizedValue(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

function getLocaleValue(language, path) {
  return path.split('.').reduce((value, key) => value?.[key], i18n.getResourceBundle(language, 'translation')) || '';
}

function normalizeSettings(settings = {}) {
  const normalized = { ...settings };
  LOCALIZED_KEYS.forEach((key) => {
    const savedValues = parseLocalizedValue(settings[`${key}L10n`]);
    const values = { ...savedValues };
    SUPPORTED_LANGUAGES.forEach(({ code }) => {
      if (!values[code]) {
        values[code] = getLocaleValue(code, LOCALE_PATHS[key]);
      }
    });
    if (!values.en && typeof settings[key] === 'string') values.en = settings[key];
    normalized[`${key}L10n`] = values;
  });
  return normalized;
}

function Field({ field, values, language, onChange }) {
  const [key, label, multiline] = field;
  const localized = LOCALIZED_KEYS.includes(key);
  const technical = ['companyName', 'phone', 'email', 'whatsapp', 'address', 'workingHours', 'heroImageUrl', 'instagram', 'facebook', 'tiktok', 'wechat'].includes(key);
  const fieldDirection = technical ? 'ltr' : (language === 'ar' ? 'rtl' : 'ltr');
  const value = localized
    ? values[`${key}L10n`]?.[language] || (language === 'en' ? values[key] || '' : '')
    : values[key] || '';
  const update = (nextValue) => onChange(key, nextValue, localized);

  return (
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
      <span className="mb-2 block">{label}{localized ? ` (${language})` : ''}</span>
      {multiline ? (
        <textarea dir={fieldDirection} value={value} onChange={(event) => update(event.target.value)} rows={3} className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-gold-500 dark:border-slate-700 dark:bg-slate-800" />
      ) : (
        <input dir={fieldDirection} value={value} onChange={(event) => update(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-gold-500 dark:border-slate-700 dark:bg-slate-800" />
      )}
    </label>
  );
}

export default function SettingsPage() {
  const [values, setValues] = useState({});
  const [language, setLanguage] = useState('en');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [dirtyKeys, setDirtyKeys] = useState(() => new Set());
  const [fieldErrors, setFieldErrors] = useState({});
  const { settings, loading, setSettings } = useSettings() || {};

  useEffect(() => {
    if (settings) {
      setValues(normalizeSettings(settings));
      setDirtyKeys(new Set());
    }
  }, [settings]);

  function updateValue(key, value, localized) {
    const changedKey = localized ? `${key}L10n` : key;
    setDirtyKeys((current) => new Set(current).add(changedKey));
    setValues((current) => {
      if (!localized) return { ...current, [key]: value };
      const localizedKey = `${key}L10n`;
      return { ...current, [localizedKey]: { ...(current[localizedKey] || {}), [language]: value } };
    });
  }

  async function save(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setFieldErrors({});
    setSaving(true);
    try {
      const payload = {};
      dirtyKeys.forEach((key) => {
        payload[key] = key.endsWith('L10n')
          ? JSON.stringify(values[key] || {})
          : values[key] ?? '';
      });
      if (!Object.keys(payload).length) {
        setMessage('No changes to save');
        return;
      }
      const response = await apiPut('/settings', payload);
      const savedSettings = response?.data?.settings || payload;
      const nextValues = normalizeSettings({ ...values, ...savedSettings });
      setValues(nextValues);
      setDirtyKeys(new Set());
      setSettings?.((current) => ({ ...current, ...savedSettings }));
      setMessage(response?.message || 'Settings saved');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to save settings.'));
      setFieldErrors(getApiFieldErrors(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-xl font-semibold">Website Settings</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Choose a language, edit its content, and save it independently from the other languages.</p>

      <div className="mt-6 flex flex-wrap gap-2 border-b border-slate-200 pb-4 dark:border-slate-700" role="tablist" aria-label="Settings language">
        {SUPPORTED_LANGUAGES.map((item) => (
          <button key={item.code} type="button" role="tab" aria-selected={language === item.code} onClick={() => setLanguage(item.code)} className={`rounded-full px-4 py-2 text-sm font-semibold transition ${language === item.code ? 'bg-gold-400 text-slate-900' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}>
            {item.flag} {item.name}
          </button>
        ))}
      </div>

      {loading ? <p className="mt-6 text-sm text-slate-500">Loading settings...</p> : (
        <form onSubmit={save} className="mt-6 space-y-6">
          {groups.map((group) => (
            <section key={group.title} className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">{group.title}</h3>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {group.fields.map((field) => <div key={field[0]}><Field field={field} values={values} language={language} onChange={updateValue} />{fieldErrors[field[0]] && <p className="mt-1 text-xs text-rose-600">{fieldErrors[field[0]]}</p>}</div>)}
              </div>
            </section>
          ))}

          <section className="rounded-2xl border border-slate-200 p-5 dark:border-slate-700">
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">Social links</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {socialFields.map((field) => <div key={field[0]}><Field field={field} values={values} language={language} onChange={updateValue} />{fieldErrors[field[0]] && <p className="mt-1 text-xs text-rose-600">{fieldErrors[field[0]]}</p>}</div>)}
            </div>
          </section>

          <button type="submit" disabled={saving} className="w-full rounded-full bg-gold-400 px-4 py-3 font-semibold text-slate-900 transition hover:bg-gold-500 disabled:cursor-not-allowed disabled:opacity-60">
            {saving ? 'Saving...' : `Save ${language} settings`}
          </button>
        </form>
      )}

      {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
