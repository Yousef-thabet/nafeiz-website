import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { Stagger, StaggerItem } from '@/components/ui/Reveal';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { getProducts } from '@/services/api';
import { getLocalizedField } from '@/lib/utils';
import { getLocalizedSetting } from '@/lib/utils';
import { useSettings } from '@/context/SettingsContext';

export function ProductsSection({ featuredOnly = false, limit }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const { settings = {} } = useSettings() || {};
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryNames, setCategoryNames] = useState({});

  // Load products from backend
  useEffect(() => {
    async function load() {
      try {
        const response = await getProducts();
        if (response.ok && response.data.products) {
          setProducts(response.data.products);
          setCategories(response.data.categories || []);
          setCategoryNames(response.data.categoryNames || {});
        } else {
          setError('Failed to load products');
        }
      } catch (err) {
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = featuredOnly ? products.filter((p) => p.featured) : [...products];
    if (category !== 'all') {
      const selectedCategory = category.trim().toLowerCase();
      list = list.filter((p) => String(p.category || '').trim().toLowerCase() === selectedCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          getLocalizedField(p.nameL10n, lang).toLowerCase().includes(q) ||
          getLocalizedField(p.shortDescL10n, lang).toLowerCase().includes(q)
      );
    }
    if (limit) list = list.slice(0, limit);
    return list;
  }, [search, category, featuredOnly, limit, lang, products]);

  if (loading) {
    return (
      <section className="section-pad bg-brand-bg dark:bg-navy-950">
        <Container>
          <div className="flex min-h-96 items-center justify-center">
            <LoadingSpinner size={40} />
          </div>
        </Container>
      </section>
    );
  }

  if (error) {
    return (
      <section className="section-pad bg-brand-bg dark:bg-navy-950">
        <Container>
          <ErrorState title={t('products.error')} description={error} />
        </Container>
      </section>
    );
  }

  return (
    <section className="section-pad bg-brand-bg dark:bg-navy-950">
      <Container>
        <SectionHeading
          label={t('products.label')}
          title={getLocalizedSetting(settings, 'productsTitle', lang, t('products.title'))}
          subtitle={getLocalizedSetting(settings, 'productsDescription', lang, t('products.subtitle'))}
        />

        {!featuredOnly && (
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-center">
            <div className="relative w-full sm:max-w-xs">
              <Search
                size={18}
                className="absolute start-3.5 top-1/2 -translate-y-1/2 text-navy-400"
              />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('products.searchPlaceholder')}
                className="input-base ps-10"
                aria-label={t('products.searchPlaceholder')}
              />
            </div>
            <div className="relative w-full sm:w-auto">
              <SlidersHorizontal
                size={18}
                className="pointer-events-none absolute end-3.5 top-1/2 -translate-y-1/2 text-navy-400"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-base appearance-none pe-10 sm:w-48"
                aria-label={t('products.allCategories')}
              >
                <option value="all">{t('products.allCategories')}</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {categoryNames[cat.id]?.[lang] || categoryNames[cat.id]?.en || cat.id}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {filtered.length === 0 ? (
          <div className="mt-10">
            <EmptyState title={t('products.noResults')} description={t('products.noResultsText')} />
          </div>
        ) : (
          <Stagger className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => {
              const firstImage = product.images?.[0]?.url || product.images?.[0] || '';
              return (
                <StaggerItem key={product.id}>
                  <div className="group h-full overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card dark:border-white/10 dark:bg-navy-900">
                    <div className="relative aspect-[4/3] overflow-hidden bg-navy-100 dark:bg-navy-800">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={getLocalizedField(product.nameL10n, lang)}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-navy-400">{t('products.noImage')}</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/30 to-transparent" />
                      {product.featured && (
                        <span className="absolute start-3 top-3 rounded-full bg-gold-400 px-2.5 py-1 text-xs font-semibold text-navy-900">
                          {t('products.featured')}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <span className="text-xs font-medium uppercase tracking-wider text-gold-500 dark:text-gold-300">
                        {categoryNames[product.category]?.[lang] || categoryNames[product.category]?.en || product.category}
                      </span>
                      <h3 className="mt-1.5 text-base font-bold text-navy-800 dark:text-white">
                        {getLocalizedField(product.nameL10n, lang)}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-navy-500 dark:text-navy-300 line-clamp-2">
                        {getLocalizedField(product.shortDescL10n, lang)}
                      </p>
                      <Button
                        to={`/products/${product.slug}`}
                        variant="ghost"
                        size="sm"
                        className="mt-4 p-0 hover:bg-transparent"
                      >
                        {t('products.viewDetails')}
                        <ArrowRight size={16} className="rtl:rotate-180" />
                      </Button>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        )}

        {featuredOnly && (
          <div className="mt-12 text-center">
            <Button to="/products" variant="outline">
              {t('common.viewAll')}
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}
