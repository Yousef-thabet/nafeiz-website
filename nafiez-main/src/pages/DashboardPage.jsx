import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiGet } from '@/services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({ messages: 0, newMessages: 0, employees: 0, testimonials: 0 });
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [messagesResponse, newMessagesResponse, employeesResponse, testimonialsResponse] = await Promise.all([
          apiGet('/messages?page=1&limit=5'),
          apiGet('/messages?page=1&limit=1&status=new'),
          apiGet('/auth/employees'),
          apiGet('/testimonials/admin/all'),
        ]);

        const messages = messagesResponse?.data?.contacts || [];
        setStats({
          messages: messagesResponse?.data?.pagination?.total || 0,
          newMessages: newMessagesResponse?.data?.pagination?.total || 0,
          employees: employeesResponse?.data?.employees?.length || 0,
          testimonials: testimonialsResponse?.data?.testimonials?.length || 0,
        });
        setRecentMessages(messages);
      } catch (error) {
        setError(error.message || 'Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total Messages', stats.messages],
          ['New Messages', stats.newMessages],
          ['Employees', stats.employees],
          ['Testimonials', stats.testimonials],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-semibold">{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Recent Messages</h2>
          <Link to="/admin/messages" className="text-sm font-medium text-gold-600 dark:text-gold-300">Open inbox</Link>
        </div>

        <div className="mt-4 space-y-3">
          {recentMessages.length ? (
            recentMessages.map((message) => (
              <div key={message.id} className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 dark:border-slate-700">
                <div>
                  <p className="font-medium">{message.name}</p>
                  <p dir="ltr" className="bidi-isolate text-sm text-slate-500 dark:text-slate-400">{message.email || '—'}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {message.status}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">No messages yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
