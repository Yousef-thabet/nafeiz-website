import { useEffect, useState } from 'react';
import { X, Plus, Eye, EyeOff } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { getApiErrorMessage, getApiFieldErrors, getValidationErrors } from '@/lib/formErrors';

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    nameL10n: Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, ''])),
    positionL10n: Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, ''])),
    reviewL10n: Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, ''])),
    rating: 5,
    isVisible: true,
  });

  const loadTestimonials = async () => {
    try {
      const response = await apiGet('/testimonials/admin/all');
      setTestimonials(response?.data?.testimonials || []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load testimonials'));
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const resetForm = () => {
    setForm({
      nameL10n: Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, ''])),
      positionL10n: Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, ''])),
      reviewL10n: Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, ''])),
      rating: 5,
      isVisible: true,
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setFieldErrors({});
    const validationErrors = getValidationErrors(form, ['nameL10n.en', 'nameL10n.ar', 'nameL10n.zh', 'reviewL10n.en', 'reviewL10n.ar', 'reviewL10n.zh']);
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      return;
    }
    setLoading(true);

    try {
      const normalizedForm = {
        ...form,
        name: form.nameL10n?.en || Object.values(form.nameL10n || {}).find(Boolean) || '',
        jobTitle: form.positionL10n?.en || Object.values(form.positionL10n || {}).find(Boolean) || '',
        comment: form.reviewL10n?.en || Object.values(form.reviewL10n || {}).find(Boolean) || '',
      };

      if (editingId) {
        const response = await apiPut(`/testimonials/${editingId}`, normalizedForm);
        setMessage(response?.message || 'Testimonial updated successfully');
      } else {
        const response = await apiPost('/testimonials', normalizedForm);
        setMessage(response?.message || 'Testimonial created successfully');
      }

      resetForm();
      setShowForm(false);
      await loadTestimonials();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save testimonial'));
      setFieldErrors(getApiFieldErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (testimonial) => {
    // Parse JSON strings back to objects
    const nameL10n = testimonial.nameL10n ? (typeof testimonial.nameL10n === 'string' ? JSON.parse(testimonial.nameL10n) : testimonial.nameL10n) : Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, '']));
    const positionL10n = testimonial.positionL10n ? (typeof testimonial.positionL10n === 'string' ? JSON.parse(testimonial.positionL10n) : testimonial.positionL10n) : Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, '']));
    const reviewL10n = testimonial.reviewL10n ? (typeof testimonial.reviewL10n === 'string' ? JSON.parse(testimonial.reviewL10n) : testimonial.reviewL10n) : Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, '']));

    // Fallback to old fields if new ones don't exist
    if (!nameL10n.en && testimonial.name) {
      Object.keys(nameL10n).forEach(key => {
        nameL10n[key] = testimonial.name;
      });
    }
    if (!positionL10n.en && testimonial.jobTitle) {
      Object.keys(positionL10n).forEach(key => {
        positionL10n[key] = testimonial.jobTitle;
      });
    }
    if (!reviewL10n.en && testimonial.comment) {
      Object.keys(reviewL10n).forEach(key => {
        reviewL10n[key] = testimonial.comment;
      });
    }

    setForm({
      nameL10n,
      positionL10n,
      reviewL10n,
      rating: testimonial.rating || 5,
      isVisible: testimonial.isVisible !== false,
    });
    setEditingId(testimonial.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;

    try {
      setError('');
      setMessage('');
      setActionLoading(`delete:${id}`);
      const response = await apiDelete(`/testimonials/${id}`);
      setMessage(response?.message || 'Testimonial deleted');
      await loadTestimonials();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete testimonial'));
    } finally {
      setActionLoading(null);
    }
  };

  const toggleVisibility = async (id, currentVisibility) => {
    try {
      setError('');
      setMessage('');
      setActionLoading(`visibility:${id}`);
      const response = await apiPut(`/testimonials/${id}`, { isVisible: !currentVisibility });
      setMessage(response?.message || 'Visibility updated');
      await loadTestimonials();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update visibility'));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Testimonials Management</h1>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2 font-medium text-slate-900 hover:bg-gold-500"
          >
            <Plus size={18} />
            New Testimonial
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
            <h2 className="text-lg font-semibold">{editingId ? 'Edit' : 'Create'} Testimonial</h2>
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
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium">Rating (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: parseInt(e.target.value) || 5 })}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-gold-400 dark:border-slate-600 dark:bg-slate-800"
              />
            </div>

            {/* Visible Checkbox */}
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.isVisible}
                onChange={(e) => setForm({ ...form, isVisible: e.target.checked })}
                className="rounded"
              />
              <span>Visible</span>
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
                  placeholder="Customer name"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-gold-400 dark:border-slate-600 dark:bg-slate-800"
                  required
                />
                {fieldErrors[`nameL10n.${lang.code}`] && <p className="text-xs text-rose-600">{fieldErrors[`nameL10n.${lang.code}`]}</p>}
                <input
                  type="text"
                  value={form.positionL10n[lang.code] || ''}
                  onChange={(e) => setForm({
                    ...form,
                    positionL10n: { ...form.positionL10n, [lang.code]: e.target.value }
                  })}
                  placeholder="Position/Company"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-gold-400 dark:border-slate-600 dark:bg-slate-800"
                />
                <textarea
                  value={form.reviewL10n[lang.code] || ''}
                  onChange={(e) => setForm({
                    ...form,
                    reviewL10n: { ...form.reviewL10n, [lang.code]: e.target.value }
                  })}
                  placeholder="Review text"
                  rows="4"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-gold-400 dark:border-slate-600 dark:bg-slate-800"
                  required
                />
                {fieldErrors[`reviewL10n.${lang.code}`] && <p className="text-xs text-rose-600">{fieldErrors[`reviewL10n.${lang.code}`]}</p>}
              </div>
            ))}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-gold-400 px-4 py-2 font-semibold text-slate-900 hover:bg-gold-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingId ? 'Update Testimonial' : 'Create Testimonial'}
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

      {/* Testimonials List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold">Testimonials List</h2>
        {testimonials.length === 0 ? (
          <p className="text-slate-500">No testimonials yet</p>
        ) : (
          <div className="space-y-3">
            {testimonials.map((testimonial) => {
              const nameL10n = testimonial.nameL10n ? (typeof testimonial.nameL10n === 'string' ? JSON.parse(testimonial.nameL10n) : testimonial.nameL10n) : { en: testimonial.name };
              return (
                <div key={testimonial.id} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                  <div className="flex-1">
                    <p className="font-semibold">{nameL10n.en || testimonial.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{testimonial.jobTitle || ''}</p>
                    <div className="mt-2 flex gap-1">
                      {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                        <span key={i} className="text-xs text-gold-500">★</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      disabled={actionLoading !== null}
                      onClick={() => toggleVisibility(testimonial.id, testimonial.isVisible)}
                      className="text-slate-500 hover:text-slate-700 disabled:opacity-50 dark:hover:text-slate-300"
                      title={testimonial.isVisible ? 'Hide' : 'Show'}
                    >
                      {testimonial.isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                    <button
                      disabled={actionLoading !== null}
                      onClick={() => handleEdit(testimonial)}
                      className="text-slate-500 hover:text-gold-600 disabled:opacity-50 dark:hover:text-gold-400"
                    >
                      Edit
                    </button>
                    <button
                      disabled={actionLoading !== null}
                      onClick={() => handleDelete(testimonial.id)}
                      className="text-slate-500 hover:text-rose-600 disabled:opacity-50 dark:hover:text-rose-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
