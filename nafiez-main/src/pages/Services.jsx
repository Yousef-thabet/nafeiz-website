import { useSEO } from '@/hooks/useSEO';
import { Services as ServicesSection } from '@/sections/Services/Services';

export default function Services() {
  useSEO('services');
  return (
    <>
      <div className="h-16 lg:h-20" />
      <ServicesSection showAll />
    </>
  );
}
