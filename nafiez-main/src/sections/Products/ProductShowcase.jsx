import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Boxes, Building2, Dumbbell, Factory, Home, LampCeiling, Package, Palette, Pencil, Shirt, ShoppingBag, Smile, Stethoscope, Tractor, Wrench } from 'lucide-react';
import { motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getProducts } from '@/services/api';
import { getLocalizedField } from '@/lib/utils';
import { getLocalizedPath } from '@/lib/i18n';
import { normalizeProductCategory, productCategories } from '@/data/products';
import { productShowcaseDemo } from '@/data/productShowcaseDemo';

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

function ProductTile({ product, language, t, index }) {
  const image = product.images?.[0]?.url || product.images?.[0] || '';
  const category = normalizeProductCategory(product.category);
  const name = getLocalizedField(product.nameL10n, language);
  const shortDescription = getLocalizedField(product.shortDescL10n, language);
  const detailsPath = product.demo ? getLocalizedPath('/products', language) : getLocalizedPath(`/products/${product.slug}`, language);

  return (
    <motion.article initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }} transition={{ duration: 0.45, delay: index * 0.055 }} className="product-tile group">
      <Link
        to={detailsPath}
        aria-label={`${t('products.viewDetails')}: ${name}`}
        className="product-tile-link relative block aspect-[4/3] overflow-hidden rounded-xl border border-navy-100 bg-navy-100 outline-none transition dark:border-white/10 dark:bg-navy-800"
      >
        {image ? <img src={image} alt={name} className="product-tile-image h-full w-full object-cover" loading="lazy" /> : <div className="flex h-full items-center justify-center text-sm text-navy-400">{t('products.noImage')}</div>}
        <div className="product-tile-overlay absolute inset-0 bg-gradient-to-t from-navy-950/95 via-navy-950/35 to-transparent">
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-gold-300">{t(`products.categories.${category}`)}</p>
            <h3 className="mt-1 line-clamp-2 text-base font-bold">{name}</h3>
            {shortDescription && <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-navy-100">{shortDescription}</p>}
            <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-gold-300">{t('products.viewDetails')} <ArrowRight size={14} className="rtl:rotate-180" /></span>
          </div>
        </div>
      </Link>
      <Link to={detailsPath} className="product-tile-mobile-caption flex items-center justify-between gap-2 px-1 pt-2 text-sm font-semibold text-navy-800 outline-none focus-visible:ring-2 focus-visible:ring-gold-400 dark:text-white">
        <span className="line-clamp-1">{name}</span><ArrowRight size={14} className="shrink-0 rtl:rotate-180" />
      </Link>
    </motion.article>
  );
}

export function ProductShowcase() {
  const { t, i18n } = useTranslation();
  const language = String(i18n.language || 'en').split('-')[0].toLowerCase();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getProducts().then((response) => {
      if (!active) return;
      if (response.ok) {
        const apiProducts = response.data.products || [];
        const demoProducts = import.meta.env.DEV ? productShowcaseDemo : [];
        const apiCategories = response.data.categories || [];
        const demoCategories = import.meta.env.DEV ? productCategories : [];
        setProducts([...apiProducts, ...demoProducts]);
        setCategories([...apiCategories, ...demoCategories.filter((category) => !apiCategories.some((item) => item.id === category.id))]);
      } else {
        setError(response.message || t('products.error'));
      }
    }).catch(() => {
      if (active) setError(t('products.error'));
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [t]);

  const featuredProducts = useMemo(() => products.filter((product) => product.published !== false && product.featured === true), [products]);

  return (
    <section id="product-showcase" className="section-pad bg-brand-bg dark:bg-navy-950">
      <Container>
        <div className="flex flex-col gap-5 border-b border-navy-200/80 pb-7 sm:flex-row sm:items-end sm:justify-between dark:border-white/10">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-gold-600 dark:text-gold-300">{t('products.label')}</p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-navy-800 dark:text-white sm:text-4xl">{t('products.showcaseTitle')}</h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-navy-500 dark:text-navy-300">{t('products.showcaseSubtitle')}</p>
          </div>
          <span className="hidden shrink-0 border-s border-gold-400/70 ps-4 text-xs font-semibold uppercase tracking-[0.18em] text-navy-500 sm:block dark:text-navy-300">{t('products.featuredLabel')}</span>
        </div>

        {loading ? (
          <div className="flex min-h-48 items-center justify-center"><LoadingSpinner size={36} /></div>
        ) : error ? (
          <p className="mt-6 text-sm text-rose-600">{error}</p>
        ) : (
          <>
            <div className="mt-7 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5" aria-label={t('products.categoriesLabel')}>
              {categories.map((category, index) => {
                const Icon = categoryIcons[category.id] || Package;
                return (
                  <motion.div key={category.id} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: index * 0.03 }} className="product-category-tile flex min-h-16 items-center gap-2 rounded-lg border border-navy-100 bg-white px-3 py-2.5 text-sm font-semibold text-navy-800 transition duration-200 hover:-translate-y-0.5 hover:border-gold-300 hover:shadow-soft dark:border-white/10 dark:bg-navy-900 dark:text-white">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-navy-800 text-gold-300 dark:bg-navy-800"><Icon size={16} strokeWidth={1.8} /></span>
                    <span className="leading-snug">{t(`products.categories.${category.id}`)}</span>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-10 flex items-center justify-between gap-4 border-b border-navy-200/80 pb-3 dark:border-white/10">
              <h3 className="text-xl font-bold text-navy-800 dark:text-white">{t('products.featuredTitle')}</h3>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gold-600 dark:text-gold-300">{t('products.featuredLabel')}</span>
            </div>

            {featuredProducts.length === 0 ? (
              <div className="mt-5"><EmptyState title={t('products.featuredEmpty')} description={t('products.featuredEmptyText')} /></div>
            ) : (
              <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
                {featuredProducts.map((product, index) => <ProductTile key={product.id} product={product} language={language} t={t} index={index} />)}
              </div>
            )}

            <div className="mt-8 text-center"><Link to={getLocalizedPath('/products', language)} className="inline-flex items-center gap-2 rounded-full border border-navy-800/20 px-5 py-2.5 text-sm font-semibold text-navy-800 transition hover:border-gold-400 hover:bg-navy-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 dark:border-white/20 dark:text-white dark:hover:bg-white dark:hover:text-navy-900">{t('products.viewAllProducts')} <ArrowRight size={16} className="rtl:rotate-180" /></Link></div>
          </>
        )}
      </Container>
    </section>
  );
}
