import { useSEO } from '@/hooks/useSEO';
import { CountriesSection } from '@/sections/Countries/CountriesSection';

export default function Countries() {
  useSEO('countries');
  return (
    <>
      <div className="h-16 lg:h-20" />
      <CountriesSection />
    </>
  );
}
