import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { getLocalizedPath } from '@/lib/i18n';

const variants = {
  primary: 'btn-primary',
  gold: 'btn-gold',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
};

const sizes = {
  sm: 'px-5 py-2 text-sm',
  md: 'px-7 py-3 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  to,
  href,
  type = 'button',
  className = '',
  ...props
}) {
  const { i18n } = useTranslation();
  const classes = cn(variants[variant], sizes[size], className);

  if (to) {
    return (
      <Link to={getLocalizedPath(to, i18n.language)} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
