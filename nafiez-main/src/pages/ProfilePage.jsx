import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiPut } from '@/services/api';

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const save = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const response = await apiPut('/auth/profile', { name });
      const updatedUser = { ...(user || {}), name: response?.data?.user?.name || name };
      localStorage.setItem('nafeiz_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setMessage(response?.message || 'Profile updated successfully');
    } catch (err) {
      setError(err.message || 'Unable to update profile');
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-xl font-semibold">Profile</h2>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Manage your basic profile information.</p>

      <form onSubmit={save} className="mt-6 max-w-xl space-y-4">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          <span className="mb-2 block">Full name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-gold-500 dark:border-slate-700 dark:bg-slate-800"
            required
          />
        </label>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800/60">
          <p className="text-slate-500 dark:text-slate-400">Email</p>
          <p dir="ltr" className="bidi-isolate mt-1 font-medium">{user?.email || '-'}</p>
        </div>

        <button type="submit" className="rounded-full bg-gold-400 px-4 py-3 font-semibold text-slate-900">
          Save profile
        </button>
      </form>

      {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
      {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
