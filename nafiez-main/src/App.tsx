import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Navigate, Routes, Route, Outlet, useLocation, useParams } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ScrollToTop } from '@/components/common/ScrollToTop';
import { PageTransition } from '@/components/common/PageTransition';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import ProtectedRoute from '@/components/admin/ProtectedRoute';
import AdminLayout from '@/components/admin/AdminLayout';
import i18n, { getLanguageFromPath, getSupportedLanguage, SUPPORTED_LANGUAGES } from '@/lib/i18n';

const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Services = lazy(() => import('@/pages/Services'));
const Products = lazy(() => import('@/pages/Products'));
const ProductDetails = lazy(() => import('@/pages/ProductDetails'));
const Testimonials = lazy(() => import('@/pages/Testimonials'));
const Contact = lazy(() => import('@/pages/Contact'));
const Shipping = lazy(() => import('@/pages/Shipping'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Articles = lazy(() => import('@/pages/Articles'));
const ArticleDetails = lazy(() => import('@/pages/ArticleDetails'));
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const MessagesPage = lazy(() => import('@/pages/MessagesPage'));
const EmployeesPage = lazy(() => import('@/pages/EmployeesPage'));
const ProductsPage = lazy(() => import('@/pages/ProductsPage'));
const CountriesPage = lazy(() => import('@/pages/CountriesPage'));
const TestimonialsPage = lazy(() => import('@/pages/TestimonialsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const ArticlesPage = lazy(() => import('@/pages/ArticlesPage'));
const ServicesPage = lazy(() => import('@/pages/ServicesPage'));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoadingSpinner size={32} />
    </div>
  );
}

function LocalizedRootRedirect() {
  const location = useLocation();
  const locale = getSupportedLanguage(i18n.resolvedLanguage || i18n.language);

  return <Navigate to={{ pathname: `/${locale}`, search: location.search, hash: location.hash }} replace />;
}

function LocaleLayout() {
  const { locale } = useParams();
  const location = useLocation();

  useEffect(() => {
    if (SUPPORTED_LANGUAGES.some((language) => language.code === locale) && i18n.language !== locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale, location.pathname]);

  if (!SUPPORTED_LANGUAGES.some((language) => language.code === locale)) {
    return <NotFound />;
  }

  return <Outlet />;
}

function LegacyCountriesRedirect() {
  const { locale } = useParams();
  return <Navigate to={`/${locale}#markets`} replace />;
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
            <Route path="/" element={<LocalizedRootRedirect />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:slug" element={<ProductDetails />} />
            <Route path="/countries" element={<Navigate to="/#markets" replace />} />
            <Route path="/testimonials" element={<Testimonials />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/articles" element={<Articles />} />
            <Route path="/articles/:slug" element={<ArticleDetails />} />

            <Route path="/:locale" element={<LocaleLayout />}>
              <Route index element={<Home />} />
              <Route path="about" element={<About />} />
              <Route path="services" element={<Services />} />
              <Route path="products" element={<Products />} />
              <Route path="products/:slug" element={<ProductDetails />} />
              <Route path="countries" element={<LegacyCountriesRedirect />} />
              <Route path="testimonials" element={<Testimonials />} />
              <Route path="contact" element={<Contact />} />
              <Route path="shipping" element={<Shipping />} />
              <Route path="articles" element={<Articles />} />
              <Route path="articles/:slug" element={<ArticleDetails />} />
            </Route>

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<ProtectedRoute allowedRoles={['admin', 'employee']} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<DashboardPage />} />
                <Route path="/admin/messages" element={<MessagesPage />} />
                <Route path="/admin/profile" element={<ProfilePage />} />
                <Route path="/admin/articles" element={<ArticlesPage />} />
                <Route path="/admin/services" element={<ServicesPage />} />
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
