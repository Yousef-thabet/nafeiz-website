import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getArticles } from '@/services/api';
import { formatDate, getLocalizedField } from '@/lib/utils';
import { getLocalizedPath } from '@/lib/i18n';

export function ArticlesSection() {
  const { t, i18n } = useTranslation();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getArticles('limit=3').then((response) => {
      if (active) setArticles(response?.data?.articles || []);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  return (
    <section className="section-pad bg-white dark:bg-navy-950">
      <Container>
        <SectionHeading label={t('articles.label')} title={t('articles.insightsTitle')} subtitle={t('articles.insightsSubtitle')} />
        {loading ? <div className="flex min-h-40 items-center justify-center"><LoadingSpinner size={32} /></div> : (
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {articles.map((article) => (
              <article key={article.id} className="overflow-hidden rounded-xl border border-navy-100 bg-brand-bg dark:border-white/10 dark:bg-navy-900">
                {article.featuredImageUrl && <img src={article.featuredImageUrl} alt={getLocalizedField(article.featuredImageAltL10n, i18n.language)} className="aspect-[16/9] w-full object-cover" loading="lazy" />}
                <div className="p-5">
                  <time className="text-xs font-semibold text-gold-600 dark:text-gold-300">{formatDate(article.publishedAt, i18n.language)}</time>
                  <h3 className="mt-2 text-lg font-bold text-navy-800 dark:text-white">{getLocalizedField(article.titleL10n, i18n.language)}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-navy-500 dark:text-navy-300">{getLocalizedField(article.descriptionL10n, i18n.language)}</p>
                  <Button to={`/articles/${article.slug}`} variant="ghost" size="sm" className="mt-3 p-0 hover:bg-transparent">{t('articles.readMore')} <ArrowRight size={16} className="rtl:rotate-180" /></Button>
                </div>
              </article>
            ))}
          </div>
        )}
        <div className="mt-10 text-center"><Button to="/articles" variant="outline">{t('articles.viewAll')} <ArrowRight size={17} className="rtl:rotate-180" /></Button></div>
      </Container>
    </section>
  );
}