import { useEffect, useState } from 'react';
import { X, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { apiGet, apiPost, apiPut, apiDelete, apiPatch } from '@/services/api';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { getApiErrorMessage, getApiFieldErrors, getValidationErrors } from '@/lib/formErrors';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [form, setForm] = useState({
    slug: '',
    category: 'electronics',
    featured: false,
    published: true,
    nameL10n: Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, ''])),
    shortDescL10n: Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, ''])),
    descriptionL10n: Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, ''])),
    images: [],
  });

  const [imageInputs, setImageInputs] = useState(['']);

  const categories = [
    { id: 'electronics', label: 'Electronics' },
    { id: 'textiles', label: 'Textiles' },
    { id: 'machinery', label: 'Machinery' },
    { id: 'construction', label: 'Construction' },
    { id: 'home', label: 'Home & Goods' },
    { id: 'packaging', label: 'Packaging' },
  ];

  const loadProducts = async (options = {}) => {
    const { silent = false } = options;

    if (!silent) {
      setPageLoading(true);
    }

    try {
      const response = await apiGet('/products');
      setProducts(response?.data?.products || []);
      setPageError('');
    } catch (err) {
      setPageError(getApiErrorMessage(err, 'Failed to load products'));
      setProducts([]);
    } finally {
      if (!silent) {
        setPageLoading(false);
      }
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const resetForm = () => {
    setForm({
      slug: '',
      category: 'electronics',
      featured: false,
      published: true,
      nameL10n: Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, ''])),
      shortDescL10n: Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, ''])),
      descriptionL10n: Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, ''])),
      images: [],
    });
    setImageInputs(['']);
    setEditingId(null);
  };

  const handleImageUrlChange = (index, value) => {
    const newInputs = [...imageInputs];
    newInputs[index] = value;
    setImageInputs(newInputs);
  };

  const addImageInput = () => {
    setImageInputs([...imageInputs, '']);
  };

  const removeImageInput = (index) => {
    setImageInputs(imageInputs.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setFieldErrors({});
    const validationErrors = getValidationErrors(form, ['slug', 'nameL10n.en', 'nameL10n.ar', 'nameL10n.zh', 'descriptionL10n.en', 'descriptionL10n.ar', 'descriptionL10n.zh']);
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      return;
    }
    setLoading(true);

    try {
      // Filter out empty image URLs
      const images = imageInputs
        .filter(url => url.trim())
        .map((url, idx) => ({ url: url.trim(), order: idx }));

      const payload = {
        ...form,
        images,
      };

      if (editingId) {
        const response = await apiPut(`/products/${editingId}`, payload);
        setMessage(response?.message || 'Product updated successfully');
      } else {
        const response = await apiPost('/products', payload);
        setMessage(response?.message || 'Product created successfully');
      }

      resetForm();
      setShowForm(false);
      await loadProducts();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to save product'));
      setFieldErrors(getApiFieldErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    // Parse JSON strings back to objects
    const nameL10n = typeof product.nameL10n === 'string' ? JSON.parse(product.nameL10n) : product.nameL10n;
    const descriptionL10n = typeof product.descriptionL10n === 'string' ? JSON.parse(product.descriptionL10n) : product.descriptionL10n;
    const shortDescL10n = product.shortDescL10n ? (typeof product.shortDescL10n === 'string' ? JSON.parse(product.shortDescL10n) : product.shortDescL10n) : Object.fromEntries(SUPPORTED_LANGUAGES.map(l => [l.code, '']));

    setForm({
      slug: product.slug,
      category: product.category,
      featured: product.featured,
      published: product.published,
      nameL10n,
      shortDescL10n,
      descriptionL10n,
      images: product.images || [],
    });
    setImageInputs((product.images || []).map(img => img.url));
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      setError('');
      setMessage('');
      setActionLoading(`delete:${id}`);
      const response = await apiDelete(`/products/${id}`);
      setMessage(response?.message || 'Product deleted');
      await loadProducts();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete product'));
    } finally {
      setActionLoading(null);
    }
  };

  const toggleVisibility = async (id) => {
    try {
      setError('');
      setMessage('');
      setActionLoading(`visibility:${id}`);
      const response = await apiPatch(`/products/${id}/toggle-visibility`, {});
      setMessage(response?.message || 'Visibility updated');
      await loadProducts();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update visibility'));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products Management</h1>
        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-gold-400 px-4 py-2 font-medium text-slate-900 hover:bg-gold-500"
          >
            <Plus size={18} />
            New Product
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
      {pageError && !showForm && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-rose-800 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200">
          <div className="flex items-center justify-between gap-3">
            <span>{pageError}</span>
            <button
              type="button"
              onClick={() => loadProducts()}
              className="rounded-lg border border-rose-300 px-3 py-1.5 text-sm font-medium hover:bg-rose-100 dark:border-rose-700 dark:hover:bg-rose-900/30"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{editingId ? 'Edit' : 'Create'} Product</h2>
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

          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-700 dark:bg-rose-900/20 dark:text-rose-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Fields */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="Product slug (e.g., industrial-led-lighting)"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-gold-400 dark:border-slate-600 dark:bg-slate-800"
                  required
                />
                {fieldErrors.slug && <p className="mt-1 text-xs text-rose-600">{fieldErrors.slug}</p>}
              </div>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-gold-400 dark:border-slate-600 dark:bg-slate-800"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>

            {/* Checkboxes */}
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  className="rounded"
                />
                <span>Featured</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="rounded"
                />
                <span>Published</span>
              </label>
            </div>

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
                  placeholder="Product name"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-gold-400 dark:border-slate-600 dark:bg-slate-800"
                  required
                />
                {fieldErrors[`nameL10n.${lang.code}`] && <p className="text-xs text-rose-600">{fieldErrors[`nameL10n.${lang.code}`]}</p>}
                <input
                  type="text"
                  value={form.shortDescL10n[lang.code] || ''}
                  onChange={(e) => setForm({
                    ...form,
                    shortDescL10n: { ...form.shortDescL10n, [lang.code]: e.target.value }
                  })}
                  placeholder="Short description"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-gold-400 dark:border-slate-600 dark:bg-slate-800"
                />
                <textarea
                  value={form.descriptionL10n[lang.code] || ''}
                  onChange={(e) => setForm({
                    ...form,
                    descriptionL10n: { ...form.descriptionL10n, [lang.code]: e.target.value }
                  })}
                  placeholder="Full description"
                  rows="4"
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-gold-400 dark:border-slate-600 dark:bg-slate-800"
                  required
                />
                {fieldErrors[`descriptionL10n.${lang.code}`] && <p className="text-xs text-rose-600">{fieldErrors[`descriptionL10n.${lang.code}`]}</p>}
              </div>
            ))}

            {/* Image URLs */}
            <div className="space-y-3">
              <label className="block font-semibold">Product Images</label>
              {imageInputs.map((url, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                    placeholder="Image URL"
                    className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:border-gold-400 dark:border-slate-600 dark:bg-slate-800"
                  />
                  {imageInputs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageInput(idx)}
                      className="rounded-lg border border-rose-300 text-rose-600 p-2 hover:bg-rose-50 dark:border-rose-700 dark:hover:bg-rose-900/20"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addImageInput}
                className="flex items-center gap-2 text-sm font-medium text-gold-600 hover:text-gold-700 dark:text-gold-400"
              >
                <Plus size={16} />
                Add Another Image
              </button>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-lg bg-gold-400 px-4 py-2 font-semibold text-slate-900 hover:bg-gold-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
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

      {/* Products List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-4 text-lg font-semibold">Products List</h2>
        {pageLoading ? (
          <div className="flex min-h-[120px] items-center justify-center text-slate-500">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gold-400 border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-slate-500">No products yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-700">
                <tr>
                  <th className="px-4 py-3">Name (EN)</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Featured</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => {
                  const nameL10n = typeof product.nameL10n === 'string' ? JSON.parse(product.nameL10n) : product.nameL10n;
                  return (
                    <tr key={product.id} className="border-b border-slate-100 dark:border-slate-800">
                      <td className="px-4 py-3 font-medium">{nameL10n?.en || 'N/A'}</td>
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{product.category}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${product.published ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200' : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'}`}>
                          {product.published ? 'Published' : 'Hidden'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {product.featured && <span className="text-xs font-semibold text-gold-600 dark:text-gold-400">★</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button
                            disabled={actionLoading !== null}
                            onClick={() => toggleVisibility(product.id)}
                            className="text-slate-500 hover:text-slate-700 disabled:opacity-50 dark:hover:text-slate-300"
                            title={product.published ? 'Hide' : 'Show'}
                          >
                            {product.published ? <Eye size={16} /> : <EyeOff size={16} />}
                          </button>
                          <button
                            disabled={actionLoading !== null}
                            onClick={() => handleEdit(product)}
                            className="text-slate-500 hover:text-gold-600 disabled:opacity-50 dark:hover:text-gold-400"
                          >
                            Edit
                          </button>
                          <button
                            disabled={actionLoading !== null}
                            onClick={() => handleDelete(product.id)}
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
