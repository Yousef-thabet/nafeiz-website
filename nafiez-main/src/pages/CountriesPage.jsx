import { useEffect, useState } from 'react';
import { X, Plus, Eye, EyeOff } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '@/services/api';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { getApiErrorMessage, getApiFieldErrors, getValidationErrors } from '@/lib/formErrors';

export default function CountriesPage() {
  const [countries, setCountries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    code: '',
    slug: '',
    imageUrl: '',
    published: true,
    nameL10n: Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, ''])),
    descriptionL10n: Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, ''])),
    detailsL10n: Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, ''])),
  });

  const loadCountries = async () => {
    try {
      const response = await apiGet('/countries');
      setCountries(response?.data?.countries || []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load countries'));
    }
  };

  useEffect(() => {
    loadCountries();
  }, []);

  const resetForm = () => {
    setForm({
      code: '',
      slug: '',
      imageUrl: '',
      published: true,
      nameL10n: Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, ''])),
      descriptionL10n: Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, ''])),
      detailsL10n: Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, ''])),
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setFieldErrors({});
    const validationErrors = getValidationErrors(form, ['code', 'slug', 'nameL10n.en', 'nameL10n.ar', 'nameL10n.zh']);
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      return;
    }
    setLoading(true);

    try {
      if (editingId) {
        const response = await apiPut(`/countries/${editingId}`, form);
        setMessage(response?.message || 'Country updated successfully');
      } else {
        const response = await apiPost('/countries', form);
        setMessage(response?.message || 'Country created successfully');
      }

      resetForm();
      setShowForm(false);
      await loadCountries();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save country'));
      setFieldErrors(getApiFieldErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (country) => {
    // Parse JSON strings back to objects
    const nameL10n = typeof country.nameL10n === 'string' ? JSON.parse(country.nameL10n) : country.nameL10n;
    const descriptionL10n = country.descriptionL10n ? (typeof country.descriptionL10n === 'string' ? JSON.parse(country.descriptionL10n) : country.descriptionL10n) : Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, '']));
    const detailsL10n = country.detailsL10n ? (typeof country.detailsL10n === 'string' ? JSON.parse(country.detailsL10n) : country.detailsL10n) : Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, '']));

    setForm({
      code: country.code,
      slug: country.slug,
      imageUrl: country.imageUrl || '',
      published: country.published,
      nameL10n,
      descriptionL10n,
      detailsL10n,
    });
    setEditingId(country.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this country?')) return;

    try {
      setError('');
      setMessage('');
      setActionLoading(`delete:${id}`);
      const response = await apiDelete(`/countries/${id}`);
      setMessage(response?.message || 'Country deleted');
      await loadCountries();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete country'));
    } finally {
      setActionLoading(null);
    }
  };

  const toggleVisibility = async (id) => {
    try {
      setError('');
      setMessage('');
      setActionLoading(`visibility:${id}`);
      const response = await apiPatch(`/countries/${id}/toggle-visibility`, {});
      setMessage(response?.message || 'Visibility updated');
      await loadCountries();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update visibility'));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Countries Management</h1>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2 font-medium text-slate-900 hover:bg-gold-500"
          >
            <Plus size={18} />
            New Country
          </button>
        )}
      </div>

      {message && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
          {message}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200">
          {error}
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editingId ? 'Edit' : 'Create'} Country</h2>
            <button
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="Country code (e.g., EG, SA)"
                maxLength="2"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-gold-400 dark:border-slate-600 dark:bg-slate-800"
                required
              />
              {fieldErrors.code && <p className="mt-1 text-xs text-rose-600">{fieldErrors.code}</p>}
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="Country slug (e.g., egypt)"
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-gold-400 dark:border-slate-600 dark:bg-slate-800"
                required
              />
              {fieldErrors.slug && <p className="mt-1 text-xs text-rose-600">{fieldErrors.slug}</p>}
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium">Image URL</label>
              <input
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-gold-400 dark:border-slate-600 dark:bg-slate-800"
              />
              {form.imageUrl && (
                <img src={form.imageUrl} alt="Preview" className="mt-3 h-32 w-32 rounded-lg object-cover" />
              )}
            </div>

            {/* Published Checkbox */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => setForm({ ...form, published: e.target.checked })}
                className="rounded"
              />
              <span>Published</span>
            </label>

            {/* Multilingual Fields */}
            {SUPPORTED_LANGUAGES.map(lang => (
              <div key={lang.code} className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <h3 className="font-semibold">{lang.name}</h3>
                <input
                  type="text"
                  value={form.nameL10n[lang.code] || ''}
                  onChange={(e) => setForm({
                    ...form,
                    nameL10n: { ...form.nameL10n, [lang.code]: e.target.value }
                  })}
                  placeholder="Country name"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-gold-400 dark:border-slate-600 dark:bg-slate-800"
                  required
                />
                {fieldErrors[`nameL10n.${lang.code}`] && <p className="text-xs text-rose-600">{fieldErrors[`nameL10n.${lang.code}`]}</p>}
                <textarea
                  value={form.descriptionL10n[lang.code] || ''}
                  onChange={(e) => setForm({
                    ...form,
                    descriptionL10n: { ...form.descriptionL10n, [lang.code]: e.target.value }
                  })}
                  placeholder="Short description"
                  rows="2"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-gold-400 dark:border-slate-600 dark:bg-slate-800"
                />
                <textarea
                  value={form.detailsL10n[lang.code] || ''}
                  onChange={(e) => setForm({
                    ...form,
                    detailsL10n: { ...form.detailsL10n, [lang.code]: e.target.value }
                  })}
                  placeholder="Detailed information / Trade info"
                  rows="3"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-gold-400 dark:border-slate-600 dark:bg-slate-800"
                />
              </div>
            ))}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-gold-400 px-4 py-2 font-semibold text-slate-900 hover:bg-gold-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingId ? 'Update Country' : 'Create Country'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                className="rounded-lg border border-slate-300 px-4 py-2 font-medium hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Countries List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold">Countries List</h2>
        {countries.length === 0 ? (
          <p className="text-slate-500">No countries yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Name (EN)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {countries.map((country) => {
                  const nameL10n = typeof country.nameL10n === 'string' ? JSON.parse(country.nameL10n) : country.nameL10n;
                  return (
                    <tr key={country.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="px-4 py-3 font-mono font-medium">{country.code}</td>
                      <td className="px-4 py-3">{nameL10n?.en || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${country.published ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'}`}>
                          {country.published ? 'Published' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            disabled={actionLoading !== null}
                            onClick={() => toggleVisibility(country.id)}
                            className="text-slate-500 hover:text-slate-700 disabled:opacity-50 dark:hover:text-slate-300"
                            title={country.published ? 'Hide' : 'Show'}
                          >
                            {country.published ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <button
                            disabled={actionLoading !== null}
                            onClick={() => handleEdit(country)}
                            className="text-slate-500 hover:text-gold-600 disabled:opacity-50 dark:hover:text-gold-400"
                          >
                            Edit
                          </button>
                          <button
                            disabled={actionLoading !== null}
                            onClick={() => handleDelete(country.id)}
                            className="text-slate-500 hover:text-rose-600 disabled:opacity-50 dark:hover:text-rose-400"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
