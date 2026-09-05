import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { apiPut } from '@/services/api';
import { useSettings } from '@/context/SettingsContext';
import i18n, { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { services } from '@/data/services';
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/formErrors';

const emptyLocalized = () => Object.fromEntries(SUPPORTED_LANGUAGES.map(({ code }) => [code, '']));

function getTranslation(language, serviceId, field) {
  return i18n.getResource(language, 'translation', `services.${serviceId}.${field}`) || '';
}

function parse(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { return JSON.parse(value) || {}; } catch { return {}; }
  }
  return {};
}

function normalizeServices(settings = {}) {
  return Object.fromEntries(services.map((service) => ['service' + service.id, {
    title: Object.fromEntries(SUPPORTED_LANGUAGES.map(({ code }) => [code, parse(settings[`service${service.id}TitleL10n`])[code] || getTranslation(code, service.key, 'title')])),
    description: Object.fromEntries(SUPPORTED_LANGUAGES.map(({ code }) => [code, parse(settings[`service${service.id}DescriptionL10n`])[code] || getTranslation(code, service.key, 'description')])),
  }]));
}

export default function ServicesPage() {
  const { settings = {}, setSettings } = useSettings() || {};
  const [language, setLanguage] = useState('en');
  const [values, setValues] = useState(() => normalizeServices(settings));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => { setValues(normalizeServices(settings)); }, [settings]);

  const update = (serviceId, field, value) => {
    setValues((current) => ({ ...current, [`service${serviceId}`]: { ...current[`service${serviceId}`], [field]: { ...current[`service${serviceId}`][field], [language]: value } } }));
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true); setMessage(''); setError(''); setFieldErrors({});
    const payload = {};
    services.forEach((service) => {
      const item = values[`service${service.id}`];
      payload[`service${service.id}TitleL10n`] = JSON.stringify(item.title);
      payload[`service${service.id}DescriptionL10n`] = JSON.stringify(item.description);
    });
    try {
      const response = await apiPut('/settings', payload);
      setSettings?.((current) => ({ ...current, ...payload }));
      setMessage(response?.message || 'Services saved');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to save services.'));
      setFieldErrors(getApiFieldErrors(err));
    } finally { setSaving(false); }
  };

  return <div className="space-y-6">
    <div><h1 className="text-2xl font-semibold">Services Management</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Edit service titles and descriptions for each website language.</p></div>
    {message && <p className="rounded-lg bg-emerald-50 p-3 text-emerald-700">{message}</p>}
    {error && <p className="rounded-lg bg-rose-50 p-3 text-rose-700">{error}</p>}
    <form onSubmit={save} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4 dark:border-slate-700" role="tablist" aria-label="Services language">
        {SUPPORTED_LANGUAGES.map((item) => <button key={item.code} type="button" role="tab" aria-selected={language === item.code} onClick={() => setLanguage(item.code)} className={`rounded-full px-4 py-2 text-sm font-semibold ${language === item.code ? 'bg-gold-400 text-slate-900' : 'bg-slate-100 dark:bg-slate-800'}`}>{item.flag} {item.name}</button>)}
      </div>
      <div className="space-y-4">
        {services.map((service) => <section key={service.id} className="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
          <h2 className="font-semibold">{String(service.id).padStart(2, '0')} · {values[`service${service.id}`]?.title?.[language]}</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <input dir={language === 'ar' ? 'rtl' : 'ltr'} value={values[`service${service.id}`]?.title?.[language] || ''} onChange={(event) => update(service.id, 'title', event.target.value)} placeholder="Service title" className="input-base" />
            <textarea dir={language === 'ar' ? 'rtl' : 'ltr'} value={values[`service${service.id}`]?.description?.[language] || ''} onChange={(event) => update(service.id, 'description', event.target.value)} placeholder="Service description" rows={2} className="input-base" />
          </div>
          {fieldErrors[`service${service.id}TitleL10n`] && <p className="mt-1 text-xs text-rose-600">{fieldErrors[`service${service.id}TitleL10n`]}</p>}
        </section>)}
      </div>
      <button type="submit" disabled={saving} className="flex w-full items-center justify-center gap-2 rounded-full bg-gold-400 px-4 py-3 font-semibold text-slate-900 disabled:opacity-60"><Save size={17} />{saving ? 'Saving...' : `Save ${language} services`}</button>
    </form>
  </div>;
}