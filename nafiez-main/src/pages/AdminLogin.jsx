import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage, getApiFieldErrors } from '@/lib/formErrors';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, loading: authLoading } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (new URLSearchParams(location.search).get('reason') === 'session-expired') {
      setError('Your session has expired. Please sign in again.');
    }
  }, [location.search]);

  useEffect(() => {
    if (!authLoading && user) navigate('/admin', { replace: true });
  }, [authLoading, navigate, user]);

  if (authLoading || user) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-200"><div className="h-10 w-10 animate-spin rounded-full border-2 border-gold-400 border-t-transparent" /></div>;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});

    const nextFieldErrors = {};
    if (!form.email.trim()) nextFieldErrors.email = 'Email is required.';
    if (!form.password) nextFieldErrors.password = 'Password is required.';
    if (Object.keys(nextFieldErrors).length) {
      setFieldErrors(nextFieldErrors);
      setLoading(false);
      return;
    }

    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate('/admin');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed. Please check your credentials.'));
      setFieldErrors(getApiFieldErrors(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/60 backdrop-blur-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-gold-300">NAFEIZ CMS</p>
        <h1 className="mt-4 text-3xl font-semibold">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-400">Use your administrator credentials to continue.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <label className="block text-sm">
            <span className="mb-2 block text-slate-300">Email</span>
            <input
              type="email"
              dir="ltr"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none transition focus:border-gold-400"
              required
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-rose-400">{fieldErrors.email}</p>}
          </label>

          <label className="block text-sm">
            <span className="mb-2 block text-slate-300">Password</span>
            <input
              type="password"
              dir="ltr"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 outline-none transition focus:border-gold-400"
              required
            />
            {fieldErrors.password && <p className="mt-1 text-xs text-rose-400">{fieldErrors.password}</p>}
          </label>

          {error && (
            <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-gold-400 px-4 py-3 font-semibold text-slate-900 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
