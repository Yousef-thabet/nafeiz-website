import { AlertTriangle, RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';

export function ErrorState({ title, description, onRetry }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
        <AlertTriangle className="text-red-500" size={36} />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-navy-800 dark:text-white">
        {title || t('common.error')}
      </h3>
      {description && (
        <p className="max-w-md text-sm text-navy-500 dark:text-navy-300">{description}</p>
      )}
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-6" onClick={onRetry}>
          <RefreshCw size={16} />
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
