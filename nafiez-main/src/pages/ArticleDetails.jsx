import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/ui/Container';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { getArticle } from '@/services/api';
import { formatDate, getLocalizedField } from '@/lib/utils';
import { useSEO } from '@/hooks/useSEO';

export default function ArticleDetails() {
  const { slug } = useParams(); const { i18n, t } = useTranslation(); const [article, setArticle] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { getArticle(slug).then((response) => setArticle(response?.data?.article || null)).finally(() => setLoading(false)); }, [slug]);
  const title = getLocalizedField(article?.titleL10n, i18n.language); const description = getLocalizedField(article?.metaDescriptionL10n, i18n.language) || getLocalizedField(article?.descriptionL10n, i18n.language); useSEO(article ? null : 'articles', article ? { title, description, image: article.featuredImageUrl, type: 'article', publishedAt: article.publishedAt } : null);
  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><LoadingSpinner size={36} /></div>;
  if (!article) return <Container><p className="py-24 text-center">{t('common.error')}</p></Container>;
  return <main className="bg-white py-24 dark:bg-navy-950"><Container><article className="mx-auto max-w-4xl" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}><time className="text-sm text-gold-600">{formatDate(article.publishedAt, i18n.language)}</time><h1 className="mt-3 text-4xl font-bold text-navy-800 dark:text-white">{title}</h1>{article.featuredImageUrl && <img src={article.featuredImageUrl} alt={getLocalizedField(article.featuredImageAltL10n, i18n.language)} className="mt-8 max-h-[30rem] w-full rounded-2xl object-cover" />}{article.author?.name && <p className="mt-4 text-sm text-navy-500">{article.author.name}</p>}<div className="article-content mt-10" dangerouslySetInnerHTML={{ __html: getLocalizedField(article.contentL10n, i18n.language) }} /></article></Container></main>;
}