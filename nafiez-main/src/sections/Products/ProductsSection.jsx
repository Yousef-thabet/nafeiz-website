import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Boxes, Building2, Dumbbell, Factory, Home, LampCeiling, Package, Palette, Pencil, Search, Shirt, ShoppingBag, Smile, Stethoscope, Tractor, Wrench } from 'lucide-react';
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

function getProductCategory(product) {
  const category = product?.categoryId ?? product?.category;
  if (typeof category === 'object' && category !== null) {
    return category.id ?? category.key ?? category.slug ?? '';
  }
  const legacyCategories = {
    textiles: 'clothing-textiles',
    machinery: 'machinery-equipment',
    construction: 'building-materials',
    home: 'home-supplies',
    packaging: 'bags-accessories',
  };
  return legacyCategories[category] || category || '';
}

const categoryIcons = {
  electronics: Boxes,
  'production-lines': Factory,
  food: Package,
  'medical-supplies': Stethoscope,
  'health-supplies': Dumbbell,
  stationery: Pencil,
  toys: Smile,
  'machinery-equipment': Wrench,
  'clothing-textiles': Shirt,
  'building-materials': Building2,
  footwear: ShoppingBag,
  'agricultural-fertilizers': Tractor,
  'bags-accessories': ShoppingBag,
  'home-supplies': Home,
  lighting: LampCeiling,
  'household-tools': Wrench,
  decor: Palette,
};

export function ProductsSection({ featuredOnly = false, limit }) {
  const { t, i18n } = useTranslation();
  const lang = getLanguageCode(i18n.language);
  const { settings = {} } = useSettings() || {};
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryNames, setCategoryNames] = useState({});
  const [selectedCategory, setSelectedCategory] = useState(null);

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
    const normalizedQuery = normalizeSearchText(search);
    const searchTerms = normalizedQuery ? normalizedQuery.split(' ') : [];
    let list = [...products];

    if (featuredOnly) {
      list = list.filter((p) => p.featured);
    }

    const activeCategory = String(selectedCategory || category || '').trim().toLowerCase();
    if (activeCategory && activeCategory !== 'all') {
      list = list.filter((p) => String(getProductCategory(p)).trim().toLowerCase() === activeCategory);
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
  }, [search, category, selectedCategory, featuredOnly, limit, lang, products]);

  const categoryCards = useMemo(() => categories.map((item) => {
    const id = item.id;
    const Icon = categoryIcons[id] || Package;
    return { ...item, Icon };
  }).filter((item) => !search || normalizeSearchText(categoryNames[item.id]?.[lang] || categoryNames[item.id]?.en || item.id).includes(normalizeSearchText(search))), [categories, products, categoryNames, lang, search]);

  const activeCategoryName = selectedCategory ? (categoryNames[selectedCategory]?.[lang] || categoryNames[selectedCategory]?.en || selectedCategory) : '';

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

        {!featuredOnly && !selectedCategory && (
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

        {!featuredOnly && !selectedCategory ? (
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {categoryCards.map((item, index) => (
              <motion.button
                key={item.id}
                type="button"
                onClick={() => { setSelectedCategory(item.id); setCategory(item.id); setSearch(''); }}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden rounded-3xl border border-navy-100 bg-white p-6 text-start shadow-soft transition-shadow hover:shadow-card dark:border-white/10 dark:bg-navy-900"
              >
                <div className="absolute -end-10 -top-10 h-32 w-32 rounded-full bg-gold-400/10 transition-transform duration-500 group-hover:scale-150" />
                <div className="relative flex items-start justify-between">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-800 text-gold-300 shadow-lg shadow-navy-900/15 transition-colors group-hover:bg-gold-400 group-hover:text-navy-900 dark:bg-navy-800">
                    <item.Icon size={27} strokeWidth={1.8} />
                  </span>
                </div>
                <h3 className="relative mt-7 text-xl font-bold text-navy-800 dark:text-white">{categoryNames[item.id]?.[lang] || categoryNames[item.id]?.en || item.id}</h3>
                <span className="relative mt-3 inline-flex items-center gap-2 text-sm font-semibold text-gold-600 transition-all group-hover:gap-3 dark:text-gold-300">
                  {t('products.viewDetails')} <ArrowRight size={16} className="rtl:rotate-180" />
                </span>
              </motion.button>
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={selectedCategory || 'featured'} initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -18 }} transition={{ duration: 0.3 }}>
              {!featuredOnly && selectedCategory && <button type="button" onClick={() => { setSelectedCategory(null); setCategory('all'); setSearch(''); }} className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-gold-600 hover:text-gold-700 dark:text-gold-300"><ArrowLeft size={17} className="rtl:rotate-180" />{t('products.allCategories')}</button>}
              {selectedCategory && <div className="mt-8 flex flex-col gap-4 border-b border-navy-100 pb-6 sm:flex-row sm:items-end sm:justify-between dark:border-white/10"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600 dark:text-gold-300">{t('products.label')}</p><h2 className="mt-2 text-3xl font-bold text-navy-800 dark:text-white">{activeCategoryName}</h2></div><div className="relative w-full sm:max-w-xs"><Search size={18} className="absolute start-3.5 top-1/2 -translate-y-1/2 text-navy-400" /><input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('products.searchPlaceholder')} className="input-base ps-10" aria-label={t('products.searchPlaceholder')} /></div></div>}
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

              {selectedCategory && <div className="mt-12 flex justify-center"><button type="button" onClick={() => { setSelectedCategory(null); setCategory('all'); setSearch(''); }} className="inline-flex items-center gap-2 rounded-full border border-navy-200 px-5 py-2.5 text-sm font-semibold text-navy-700 transition hover:border-gold-400 hover:text-gold-600 dark:border-white/15 dark:text-navy-100"><ArrowLeft size={16} className="rtl:rotate-180" />{t('products.allCategories')}</button></div>}
            </motion.div>
          </AnimatePresence>
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
