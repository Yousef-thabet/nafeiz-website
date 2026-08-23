import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation, useParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { PageTransition } from '@/components/common/PageTransition';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import AdminLogin from '@/pages/AdminLogin';
import DashboardPage from '@/pages/DashboardPage';
import MessagesPage from '@/pages/MessagesPage';
import EmployeesPage from '@/pages/EmployeesPage';
import ProductsPage from '@/pages/ProductsPage';
import CountriesPage from '@/pages/CountriesPage';
import TestimonialsPage from '@/pages/TestimonialsPage';
import SettingsPage from '@/pages/SettingsPage';
import ProfilePage from '@/pages/ProfilePage';
import i18n, { getLanguageFromPath, SUPPORTED_LANGUAGES } from '@/lib/i18n';

const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Services = lazy(() => import('@/pages/Services'));
const Products = lazy(() => import('@/pages/Products'));
const ProductDetails = lazy(() => import('@/pages/ProductDetails'));
const Countries = lazy(() => import('@/pages/Countries'));
const Testimonials = lazy(() => import('@/pages/Testimonials'));
const Contact = lazy(() => import('@/pages/Contact'));
const NotFound = lazy(() => import('@/pages/NotFound'));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingSpinner size={32} />
    </div>
  );
}

function LocaleLayout() {
  const { locale } = useParams();
  const location = useLocation();

  useEffect(() => {
    if (SUPPORTED_LANGUAGES.some((language) => language.code === locale) && getLanguageFromPath(location.pathname) !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale, location.pathname]);

  if (!SUPPORTED_LANGUAGES.some((language) => language.code === locale)) {
    return <NotFound />;
  }

  return <Outlet />;
}

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Navbar />}
      <PageTransition>
        <Suspense fallback={<PageFallback />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetails />} />
            <Route path="/countries" element={<Countries />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/contact" element={<Contact />} />

            <Route path="/:locale" element={<LocaleLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="services" element={<Services />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:slug" element={<ProductDetails />} />
              <Route path="countries" element={<Countries />} />
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="contact" element={<Contact />} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<ProtectedRoute allowedRoles={['admin', 'employee']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<DashboardPage />} />
                <Route path="/admin/messages" element={<MessagesPage />} />
                <Route path="/admin/profile" element={<ProfilePage />} />
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/admin/products" element={<ProductsPage />} />
                  <Route path="/admin/countries" element={<CountriesPage />} />
                  <Route path="/admin/employees" element={<EmployeesPage />} />
                  <Route path="/admin/testimonials" element={<TestimonialsPage />} />
                  <Route path="/admin/settings" element={<SettingsPage />} />
                </Route>
              </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </PageTransition>
      {!isAdminRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
