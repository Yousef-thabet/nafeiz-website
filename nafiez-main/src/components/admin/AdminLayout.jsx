import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, LogOut, MessageSquareText, Settings, Star, Users, UserCircle, Menu, X, Package, Globe } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const adminLinks = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquareText },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/countries', label: 'Countries', icon: Globe },
  { to: '/admin/testimonials', label: 'Testimonials', icon: Star },
  { to: '/admin/employees', label: 'Employees', icon: Users },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
  { to: '/admin/profile', label: 'Profile', icon: UserCircle },
];

export default function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const visibleLinks = user?.role === 'admin' ? adminLinks : adminLinks.filter((link) => ['Overview', 'Messages', 'Profile'].includes(link.label));

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="bg-slate-900 text-slate-100 lg:w-72">
          <div className="flex items-center justify-between border-b border-slate-700 px-5 py-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-400">NAFEIZ</p>
              <h2 className="mt-1 text-lg font-semibold">Admin Portal</h2>
            </div>
            <button
              type="button"
              className="rounded-lg border border-slate-700 p-2 lg:hidden"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

          <nav className={`${mobileOpen ? 'block' : 'hidden'} space-y-1 px-3 py-4 lg:block`}>
            {visibleLinks.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? 'bg-gold-400/20 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              <LogOut size={18} />
              Logout
            </button>
          </nav>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-200 bg-white px-5 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Welcome back</p>
                <h1 className="text-xl font-semibold">{user?.name || 'Administrator'}</h1>
              </div>
              <Link to="/" className="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-gold-400 hover:text-gold-600 dark:border-slate-700 dark:text-slate-200">
                View site
              </Link>
            </div>
          </header>

          <main className="p-5 lg:p-7">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
