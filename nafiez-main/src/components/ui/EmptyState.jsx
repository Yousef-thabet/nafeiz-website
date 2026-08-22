import { PackageSearch } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function EmptyState({ icon: Icon = PackageSearch, title, description, action }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-navy-50 dark:bg-navy-800">
        <Icon className="text-navy-400 dark:text-navy-300" size={36} />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-navy-800 dark:text-white">
        {typeof title === 'string' ? t(title) : title}
      </h3>
      {description && (
        <p className="max-w-md text-sm text-navy-500 dark:text-navy-300">
          {typeof description === 'string' ? t(description) : description}
        </p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
