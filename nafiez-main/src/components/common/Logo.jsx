import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import lightLogo from '@/assets/Nafeiz Logo_Nafeiz Mark Light.png';
import darkLogo from '@/assets/Nafeiz Logo_Nafeiz Mark Dark.png';
import { getLocalizedPath } from '@/lib/i18n';

export function Logo({ light = false }) {
  const { i18n } = useTranslation();
  const { theme } = useTheme();
  const useDarkSurfaceLogo = light || theme === 'dark';
  const logo = useDarkSurfaceLogo ? lightLogo : darkLogo;

  return (
    <Link to={getLocalizedPath('/', i18n.language)} className="flex items-center gap-2.5" aria-label="NAFEIZ">
      <img
        src={logo}
        alt="NAFEIZ logo"
        className="h-10 w-10 object-contain"
        width="40"
        height="40"
      />
      <span className={`font-serif text-lg font-bold tracking-wide ${light ? 'text-white' : 'text-navy-800 dark:text-white'}`}>
        NAFEIZ
      </span>
    </Link>
  );
}
