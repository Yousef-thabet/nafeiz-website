import { cn } from '@/lib/utils';

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-navy-50 text-navy-700 dark:bg-navy-800 dark:text-navy-200',
    gold: 'bg-gold-50 text-gold-600 dark:bg-gold-400/15 dark:text-gold-300',
    navy: 'bg-navy-800 text-white',
    outline: 'border border-navy-200 text-navy-700 dark:border-white/15 dark:text-navy-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
