import { Link } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import lightLogo from '@/assets/Nafeiz Logo_Nafeiz Mark Light.png';
import darkLogo from '@/assets/Nafeiz Logo_Nafeiz Mark Dark.png';

export function Logo({ light = false }) {
  const { theme } = useTheme();
  const useDarkSurfaceLogo = light || theme === 'dark';
  const logo = useDarkSurfaceLogo ? lightLogo : darkLogo;

  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="NAFEIZ">
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
