import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/ui/Container';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getArticles } from '@/services/api';
import { getLocalizedField, formatDate } from '@/lib/utils';
import { getLocalizedPath } from '@/lib/i18n';

export default function Articles() {
  const { t, i18n } = useTranslation(); const [articles, setArticles] = useState([]); const [loading, setLoading] = useState(true);
  useEffect(() => { getArticles().then((response) => setArticles(response?.data?.articles || [])).finally(() => setLoading(false)); }, []);
  return <main className="bg-brand-bg py-24 dark:bg-navy-950"><Container><h1 className="text-4xl font-bold text-navy-800 dark:text-white">{t('articles.title')}</h1><p className="mt-3 text-navy-500 dark:text-navy-300">{t('articles.subtitle')}</p>{loading ? <div className="flex min-h-64 items-center justify-center"><LoadingSpinner size={36} /></div> : <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{articles.map((article) => <Link key={article.id} to={getLocalizedPath(`/articles/${article.slug}`, i18n.language)} className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-soft transition hover:-translate-y-1 dark:border-white/10 dark:bg-navy-900"><div className="aspect-[16/9] bg-navy-100 dark:bg-navy-800">{article.featuredImageUrl && <img src={article.featuredImageUrl} alt={getLocalizedField(article.featuredImageAltL10n, i18n.language)} className="h-full w-full object-cover" loading="lazy" />}</div><div className="p-5"><time className="text-xs text-gold-600">{formatDate(article.publishedAt, i18n.language)}</time><h2 className="mt-2 text-xl font-bold text-navy-800 dark:text-white">{getLocalizedField(article.titleL10n, i18n.language)}</h2><p className="mt-2 line-clamp-3 text-sm text-navy-500 dark:text-navy-300">{getLocalizedField(article.descriptionL10n, i18n.language)}</p><span className="mt-4 inline-block text-sm font-semibold text-gold-600">{t('articles.readMore')}</span></div></Link>)}</div>}</Container></main>;
}