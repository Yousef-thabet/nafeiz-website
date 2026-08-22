import { useEffect, useState } from 'react';
import { apiGet, apiPut } from '@/services/api';
import { getApiErrorMessage } from '@/lib/formErrors';

const STATUS_OPTIONS = ['new', 'contacted', 'closed'];

const QUALIFICATION_LABELS = {
  SOURCING: 'Product Sourcing',
  QUALITY_INSPECTION: 'Quality Inspection',
  LOGISTICS: 'Logistics / Shipping',
  FINDING_SUPPLIERS: 'Finding Suppliers',
  OTHER: 'Other',
  SMALL: 'Small / Trial Order',
  MEDIUM: 'Medium Order',
  LARGE: 'Large Order',
  NOT_SURE: 'Not Sure Yet',
  IMMEDIATELY: 'Immediately',
  WITHIN_1_MONTH: 'Within 1 Month',
  WITHIN_3_MONTHS: 'Within 3 Months',
  JUST_EXPLORING: 'Just Exploring',
  EXACTLY_KNOW: 'Yes, I know exactly what I need',
  NEEDS_HELP: 'I have an idea but need help',
  STILL_EXPLORING: 'I am still exploring',
};

function formatLeadValue(value) {
  if (value === null || value === undefined || value === '') return '—';
  if (Array.isArray(value)) return value.join(', ') || '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return QUALIFICATION_LABELS[value] || value;
}

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function MessagesPage() {
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 0, page: 1, limit: 10 });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadMessages = async (pageNumber = 1) => {
    try {
      setLoading(true);
      const response = await apiGet(`/messages?page=${pageNumber}&limit=10&search=${encodeURIComponent(search)}&status=${encodeURIComponent(status)}`);
      setMessages(response?.data?.contacts || []);
      setPagination(response?.data?.pagination || { total: 0, pages: 0, page: 1, limit: 10 });
      setPage(pageNumber);
      setError('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load messages.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages(1);
  }, [search, status]);

  const updateStatus = async (messageId, nextStatus) => {
    try {
      setLoading(true);
      setError('');
      setMessage('');
      await apiPut(`/messages/${messageId}/status`, { status: nextStatus });
      setMessage('Message status updated successfully.');
      setMessages((current) => current.map((message) => (message.id === messageId ? { ...message, status: nextStatus } : message)));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage((current) => (current ? { ...current, status: nextStatus } : current));
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update the status.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Messages</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Search, filter, and track incoming conversations.</p>
        </div>

        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 outline-none focus:border-gold-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-800 outline-none focus:border-gold-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
      {message && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{message}</p>}

      <div className="space-y-4">
        {messages.map((message) => (
          <article key={message.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">{message.name}</h3>
                  {message.companyName && (
                    <span className="text-sm text-slate-500 dark:text-slate-400">• {message.companyName}</span>
                  )}
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                    {message.status}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300">
                  <span dir="ltr" className="bidi-isolate">{message.email || '—'}</span>
                  <span dir="ltr" className="bidi-isolate">{message.phone || [message.dialCode, message.phoneNumber].filter(Boolean).join(' ') || '—'}</span>
                  <span>{message.country || '—'}</span>
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{message.message || '—'}</p>
              </div>

              <div className="flex flex-col items-start gap-3 lg:items-end">
                <span className="text-xs text-slate-500 dark:text-slate-400">{formatDate(message.createdAt)}</span>
                <button
                  type="button"
                  onClick={() => setSelectedMessage(message)}
                  className="rounded-xl border border-gold-500 bg-gold-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-gold-600"
                >
                  View Details
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500 dark:text-slate-400">Page {pagination.page} of {pagination.pages || 1}</p>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-full border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => loadMessages(page - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            className="rounded-full border border-slate-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            disabled={page >= (pagination.pages || 1)}
            onClick={() => loadMessages(page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-700">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Message Details</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{selectedMessage.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="rounded-full border border-slate-300 px-3 py-1.5 text-sm text-slate-700 dark:border-slate-600 dark:text-slate-200"
              >
                Close
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto p-6">
              <div className="grid gap-6 md:grid-cols-2">
                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Contact Information</h4>
                  <dl className="space-y-3 text-sm">
                    <div><dt className="text-slate-500 dark:text-slate-400">Full Name</dt><dd className="font-medium text-slate-900 dark:text-white">{selectedMessage.name || '—'}</dd></div>
                    <div><dt className="text-slate-500 dark:text-slate-400">Company Name</dt><dd className="font-medium text-slate-900 dark:text-white">{selectedMessage.companyName || '—'}</dd></div>
                    <div><dt className="text-slate-500 dark:text-slate-400">Email</dt><dd dir="ltr" className="bidi-isolate font-medium text-slate-900 dark:text-white">{selectedMessage.email || '—'}</dd></div>
                    <div><dt className="text-slate-500 dark:text-slate-400">Country</dt><dd className="font-medium text-slate-900 dark:text-white">{selectedMessage.country || '—'}</dd></div>
                    <div><dt className="text-slate-500 dark:text-slate-400">Country Code</dt><dd className="font-medium text-slate-900 dark:text-white">{selectedMessage.countryCode || '—'}</dd></div>
                    <div><dt className="text-slate-500 dark:text-slate-400">Phone Number</dt><dd dir="ltr" className="bidi-isolate font-medium text-slate-900 dark:text-white">{selectedMessage.phone || [selectedMessage.dialCode, selectedMessage.phoneNumber].filter(Boolean).join(' ') || '—'}</dd></div>
                  </dl>
                </section>

                <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
                  <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Lead Qualification</h4>
                  <dl className="space-y-3 text-sm">
                    <div><dt className="text-slate-500 dark:text-slate-400">Visited China</dt><dd className="font-medium text-slate-900 dark:text-white">{formatLeadValue(selectedMessage.visitedChina)}</dd></div>
                    <div><dt className="text-slate-500 dark:text-slate-400">Services Interested In</dt><dd className="font-medium text-slate-900 dark:text-white">{formatLeadValue(selectedMessage.interests)}</dd></div>
                    <div><dt className="text-slate-500 dark:text-slate-400">Estimated Order Quantity</dt><dd className="font-medium text-slate-900 dark:text-white">{formatLeadValue(selectedMessage.estimatedOrderQuantity)}</dd></div>
                    <div><dt className="text-slate-500 dark:text-slate-400">Planned Start Timeline</dt><dd className="font-medium text-slate-900 dark:text-white">{formatLeadValue(selectedMessage.startTimeline)}</dd></div>
                    <div><dt className="text-slate-500 dark:text-slate-400">Product Readiness</dt><dd className="font-medium text-slate-900 dark:text-white">{formatLeadValue(selectedMessage.productReadiness)}</dd></div>
                  </dl>
                </section>
              </div>

              <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Customer Message</h4>
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-200">{selectedMessage.message || '—'}</p>
              </section>

              <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
                <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Message Metadata</h4>
                <div className="grid gap-3 text-sm md:grid-cols-3">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Submitted</p>
                    <p className="font-medium text-slate-900 dark:text-white">{formatDate(selectedMessage.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Status</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedMessage.status || '—'}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 dark:text-slate-400">Assigned Employee</p>
                    <p className="font-medium text-slate-900 dark:text-white">{selectedMessage.assignedEmployee?.name || 'Unassigned'}</p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
