import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { ChevronRight, Check, ArrowRight, Mail } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorState } from '@/components/ui/ErrorState';
import { Reveal } from '@/components/ui/Reveal';
import { categoryNames } from '@/data/products';
import { getProduct, getRelatedProducts } from '@/services/api';
import { getLocalizedField } from '@/lib/utils';

export default function ProductDetails() {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [related, setRelated] = useState([]);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(false);
    setActiveImage(0);
    Promise.all([getProduct(slug), getRelatedProducts(slug)])
      .then(([productResponse, relatedResponse]) => {
        if (cancelled) return;
        if (productResponse.ok && productResponse.data) {
          setProduct(productResponse.data);
          setRelated(relatedResponse.ok ? relatedResponse.data : []);
        } else {
          setError(true);
        }
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingSpinner size={32} />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pt-20">
        <Container>
          <ErrorState
            title={t('common.error')}
            description={t('products.error')}
            onRetry={() => window.location.reload()}
          />
        </Container>
      </div>
    );
  }

  const name = getLocalizedField(product.name, lang);
  const description = getLocalizedField(product.description, lang);
  const categoryName = categoryNames[product.category]?.[lang] || categoryNames[product.category]?.en;
  const images = product.images || [];

  return (
    <>
      <div className="h-16 lg:h-20" />
      <section className="bg-brand-bg py-8 dark:bg-navy-950 lg:py-12">
        <Container>
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-navy-500 dark:text-navy-300" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-navy-800 dark:hover:text-white">
              {t('nav.home')}
            </Link>
            <ChevronRight size={14} className="rtl:rotate-180" />
            <Link to="/products" className="hover:text-navy-800 dark:hover:text-white">
              {t('products.breadcrumb')}
            </Link>
            <ChevronRight size={14} className="rtl:rotate-180" />
            <span className="font-medium text-navy-800 dark:text-white">{name}</span>
          </nav>
        </Container>
      </section>

      <section className="bg-white pb-20 dark:bg-navy-950">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Gallery */}
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden rounded-2xl border border-navy-100 bg-navy-50 dark:border-white/10 dark:bg-navy-800"
              >
                <img
                  src={images[activeImage] || images[0]}
                  alt={name}
                  className="aspect-square w-full object-cover"
                />
              </motion.div>
              {images.length > 1 && (
                <div className="mt-4 flex gap-3">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      aria-label={`Image ${i + 1}`}
                      className={`h-20 w-20 overflow-hidden rounded-xl border-2 transition-all ${
                        i === activeImage
                          ? 'border-gold-400'
                          : 'border-navy-100 hover:border-navy-300 dark:border-white/10'
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <Badge variant="gold">{categoryName}</Badge>
              <h1 className="mt-3 text-3xl font-bold text-navy-800 dark:text-white lg:text-4xl">
                {name}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-navy-600 dark:text-navy-200">
                {description}
              </p>

              {/* Specifications */}
              <div className="mt-8">
                <h2 className="mb-4 text-lg font-bold text-navy-800 dark:text-white">
                  {t('products.specifications')}
                </h2>
                <dl className="divide-y divide-navy-100 dark:divide-white/10">
                  {product.specifications.map((spec, i) => (
                    <div key={i} className="flex items-center justify-between py-3">
                      <dt className="text-sm font-medium text-navy-500 dark:text-navy-300">
                        {getLocalizedField(spec.label, lang)}
                      </dt>
                      <dd className="text-sm font-semibold text-navy-800 dark:text-white">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* CTAs */}
              <div className="mt-8 rounded-2xl border border-navy-100 bg-brand-bg p-6 dark:border-white/10 dark:bg-navy-900">
                <p className="text-sm text-navy-600 dark:text-navy-200">
                  {t('products.requestQuoteText')}
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Button to="/contact" variant="gold" size="lg" className="flex-1">
                    {t('products.requestQuote')}
                    <ArrowRight size={18} className="rtl:rotate-180" />
                  </Button>
                  <Button to="/contact" variant="outline" size="lg" className="flex-1">
                    <Mail size={18} />
                    {t('products.contactUs')}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Related products */}
          {related.length > 0 && (
            <div className="mt-20">
              <h2 className="mb-8 text-2xl font-bold text-navy-800 dark:text-white">
                {t('products.relatedProducts')}
              </h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((rp) => (
                  <Reveal key={rp.id}>
                    <Link
                      to={`/products/${rp.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft transition-all hover:-translate-y-1 hover:shadow-card dark:border-white/10 dark:bg-navy-900"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-navy-100 dark:bg-navy-800">
                        <img
                          src={rp.images[0]}
                          alt={getLocalizedField(rp.name, lang)}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-5">
                        <h3 className="text-base font-bold text-navy-800 dark:text-white">
                          {getLocalizedField(rp.name, lang)}
                        </h3>
                        <p className="mt-1.5 text-sm text-navy-500 dark:text-navy-300 line-clamp-2">
                          {getLocalizedField(rp.shortDescription, lang)}
                        </p>
                      </div>
                    </Link>
                  </Reveal>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
