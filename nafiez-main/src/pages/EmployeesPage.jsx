import { useEffect, useState } from 'react';
import { apiGet, apiPost, apiPut, apiDelete } from '@/services/api';
import { getApiErrorMessage, getApiFieldErrors, getValidationErrors } from '@/lib/formErrors';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const loadEmployees = async () => {
    try {
      const response = await apiGet('/auth/employees');
      setEmployees(response?.data?.employees || []);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to load employees.'));
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setFieldErrors({});
    const validationErrors = getValidationErrors(form, ['name', 'email', 'password']);
    if (Object.keys(validationErrors).length) {
      setFieldErrors(validationErrors);
      return;
    }
    setLoading(true);

    try {
      const response = await apiPost('/auth/employees', form);
      setMessage(response?.message || 'Employee created successfully');
      setForm({ name: '', email: '', password: '', role: 'employee' });
      await loadEmployees();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to create employee.'));
      setFieldErrors(getApiFieldErrors(err));
    } finally {
      setLoading(false);
    }
  };

  const updateEmployee = async (employee) => {
    setError('');
    setMessage('');
    setActionLoading(`update:${employee.id}`);
    try {
      await apiPut(`/auth/employees/${employee.id}`, {
        name: employee.name,
        email: employee.email,
        ...(employee.password ? { password: employee.password } : {}),
        role: employee.role,
        isActive: employee.isActive,
      });
      setMessage('Employee updated successfully');
      await loadEmployees();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to update employee.'));
    } finally {
      setActionLoading(null);
    }
  };

  const deleteEmployee = async (employee) => {
    if (!window.confirm(`Delete ${employee.name}?`)) return;
    setError('');
    setMessage('');
    setActionLoading(`delete:${employee.id}`);
    try {
      await apiDelete(`/auth/employees/${employee.id}`);
      setMessage('Employee deleted successfully');
      await loadEmployees();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Unable to delete employee.'));
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">Create Employee</h2>
        <form onSubmit={submit} className="mt-4 grid gap-4 md:grid-cols-2">
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            placeholder="Name"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-gold-500 dark:border-slate-700 dark:bg-slate-800"
            required
          />
          {fieldErrors.name && <p className="text-xs text-rose-600">{fieldErrors.name}</p>}
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            placeholder="Email"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-gold-500 dark:border-slate-700 dark:bg-slate-800"
            required
          />
          {fieldErrors.email && <p className="text-xs text-rose-600">{fieldErrors.email}</p>}
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            placeholder="Password"
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-gold-500 dark:border-slate-700 dark:bg-slate-800 md:col-span-2"
            required
          />
          {fieldErrors.password && <p className="text-xs text-rose-600 md:col-span-2">{fieldErrors.password}</p>}
          <select
            value={form.role}
            onChange={(event) => setForm({ ...form, role: event.target.value })}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-gold-500 dark:border-slate-700 dark:bg-slate-800 md:col-span-2"
          >
            <option value="employee">Employee</option>
            <option value="admin">Admin</option>
          </select>

          <button type="submit" disabled={loading} className="rounded-full bg-gold-400 px-4 py-3 font-semibold text-slate-900 disabled:opacity-50 md:col-span-2">
            Create employee
          </button>
        </form>

        {message && <p className="mt-4 text-sm text-emerald-600">{message}</p>}
        {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="text-xl font-semibold">Employees</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <tr>
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Email</th>
                <th className="px-3 py-3">Role</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee) => (
                <tr key={employee.id} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="px-3 py-3">
                    <input
                      value={employee.name}
                      onChange={(event) => setEmployees((current) => current.map((item) => item.id === employee.id ? { ...item, name: event.target.value } : item))}
                      className="w-40 rounded-lg border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
                      minLength="2"
                    />
                  </td>
                  <td dir="ltr" className="bidi-isolate px-3 py-3">
                    <input
                      type="email"
                      value={employee.email}
                      onChange={(event) => setEmployees((current) => current.map((item) => item.id === employee.id ? { ...item, email: event.target.value } : item))}
                      className="w-52 rounded-lg border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </td>
                  <td className="px-3 py-3">
                    <select
                      value={employee.role}
                      onChange={(event) => setEmployees((current) => current.map((item) => item.id === employee.id ? { ...item, role: event.target.value } : item))}
                      className="rounded-lg border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
                    >
                      <option value="employee">Employee</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={employee.isActive}
                        onChange={(event) => setEmployees((current) => current.map((item) => item.id === employee.id ? { ...item, isActive: event.target.checked } : item))}
                      />
                      {employee.isActive ? 'Active' : 'Inactive'}
                    </label>
                  </td>
                  <td className="px-3 py-3">
                    <input
                      type="password"
                      value={employee.password || ''}
                      onChange={(event) => setEmployees((current) => current.map((item) => item.id === employee.id ? { ...item, password: event.target.value } : item))}
                      placeholder="New password"
                      minLength="6"
                      className="w-32 rounded-lg border border-slate-300 bg-white px-2 py-1 dark:border-slate-700 dark:bg-slate-800"
                    />
                  </td>
                  <td className="flex gap-2 px-3 py-3">
                    <button type="button" disabled={actionLoading !== null} onClick={() => updateEmployee(employee)} className="text-gold-600 hover:text-gold-700 disabled:opacity-50">{actionLoading === `update:${employee.id}` ? 'Saving...' : 'Save'}</button>
                    <button type="button" disabled={actionLoading !== null} onClick={() => deleteEmployee(employee)} className="text-rose-600 hover:text-rose-700 disabled:opacity-50">{actionLoading === `delete:${employee.id}` ? 'Deleting...' : 'Delete'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
