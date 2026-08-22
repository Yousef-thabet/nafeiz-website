import { useTranslation } from 'react-i18next';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-[70vh] items-center pt-20">
      <Container className="text-center">
        <p className="font-serif text-8xl font-bold text-navy-100 dark:text-navy-800 lg:text-9xl">
          404
        </p>
        <h1 className="mt-4 text-2xl font-bold text-navy-800 dark:text-white">
          {t('common.pageNotFound')}
        </h1>
        <p className="mt-3 text-navy-500 dark:text-navy-300">
          {t('common.pageNotFoundText')}
        </p>
        <Button to="/" variant="primary" className="mt-8">
          {t('common.goHome')}
        </Button>
      </Container>
    </div>
  );
}
