import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';
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
import { normalizeProductCategory } from '@/data/products';

function normalizeSearchText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
    .replace(/ـ/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ');
}

function getLanguageCode(language) {
  return String(language || 'en').split('-')[0].toLowerCase();
}

export function ProductsSection({ featuredOnly = false, limit }) {
  const { t, i18n } = useTranslation();
  const lang = getLanguageCode(i18n.language);
  const { settings = {} } = useSettings() || {};
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load products from backend
  useEffect(() => {
    async function load() {
      try {
        const response = await getProducts();
        if (response.ok && response.data.products) {
          setProducts(response.data.products);
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
    const normalizedQuery = normalizeSearchText(search);
    const searchTerms = normalizedQuery ? normalizedQuery.split(' ') : [];
    let list = [...products];

    if (featuredOnly) {
      list = list.filter((p) => p.featured);
    }

    if (searchTerms.length > 0) {
      list = list.filter(
        (p) => {
          const searchableText = normalizeSearchText([
            getLocalizedField(p.nameL10n, lang),
            getLocalizedField(p.shortDescL10n, lang),
            getLocalizedField(p.descriptionL10n, lang),
            getLocalizedField(p.name, lang),
            getLocalizedField(p.shortDescription, lang),
            getLocalizedField(p.description, lang),
            p.slug,
          ].join(' '));

          return searchTerms.every((term) => searchableText.includes(term));
        }
      );
    }
    if (limit) list = list.slice(0, limit);
    return list;
  }, [search, featuredOnly, limit, lang, products]);

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
          label={featuredOnly ? t('products.featuredLabel') : t('products.label')}
          title={featuredOnly ? t('products.featuredTitle') : getLocalizedSetting(settings, 'productsTitle', lang, t('products.title'))}
          subtitle={featuredOnly ? t('products.featuredSubtitle') : getLocalizedSetting(settings, 'productsDescription', lang, t('products.subtitle'))}
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
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.div key="all-products" initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.3 }}>
              {filtered.length === 0 ? (
          <div className="mt-10">
            <EmptyState title={t('products.noResults')} description={t('products.noResultsText')} />
          </div>
        ) : (
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5">
            {filtered.map((product) => {
              const firstImage = product.images?.[0]?.url || product.images?.[0] || '';
              const category = normalizeProductCategory(product.category);
              return (
                <StaggerItem key={product.id}>
                  <div className="group flex h-full flex-col overflow-hidden rounded-xl border border-navy-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-soft dark:border-white/10 dark:bg-navy-900">
                    <div className="relative aspect-[16/10] overflow-hidden bg-navy-100 dark:bg-navy-800">
                      {firstImage ? (
                        <img
                          src={firstImage}
                          alt={getLocalizedField(product.nameL10n, lang)}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.hidden = true;
                            event.currentTarget.nextElementSibling?.removeAttribute('hidden');
                          }}
                        />
                      ) : null}
                      <div hidden={Boolean(firstImage)} className="flex h-full items-center justify-center text-sm text-navy-400">{t('products.noImage')}</div>
                      {product.featured && (
                        <span className="absolute start-3 top-3 rounded-full bg-gold-400 px-2.5 py-1 text-xs font-semibold text-navy-900">
                          {t('products.featured')}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-xs font-semibold text-gold-700 dark:text-gold-300">{t(`products.categories.${category}`)}</p>
                      <h3 className="mt-1 line-clamp-2 min-h-12 text-base font-bold leading-6 text-navy-800 dark:text-white">
                        {getLocalizedField(product.nameL10n, lang)}
                      </h3>
                      <p className="mt-1 line-clamp-2 min-h-10 text-[13px] leading-5 text-navy-500 dark:text-navy-300">
                        {getLocalizedField(product.shortDescL10n, lang)}
                      </p>
                      <Button
                        to={`/products/${product.slug}`}
                        variant="ghost"
                        size="sm"
                        className="mt-auto p-0 pt-3 hover:bg-transparent"
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

          </motion.div>
        </AnimatePresence>

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
