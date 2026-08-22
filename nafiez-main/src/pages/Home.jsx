import { useSEO } from '@/hooks/useSEO';
import { Hero } from '@/sections/Hero/Hero';
import { About, VisionMission } from '@/sections/About/About';
import { Services } from '@/sections/Services/Services';
import { ProductsSection } from '@/sections/Products/ProductsSection';
import { CountriesSection } from '@/sections/Countries/CountriesSection';
import { WhyNafeiz } from '@/sections/WhyNafeiz/WhyNafeiz';
import { HowItWorks } from '@/sections/HowItWorks/HowItWorks';
import { TestimonialsSection } from '@/sections/Testimonials/TestimonialsSection';
import { HomeContactCTA } from '@/sections/Contact/HomeContactCTA';

export default function Home() {
  useSEO('home');
  return (
    <>
      <Hero />
      <About />
      <VisionMission />
      <Services />
      <ProductsSection featuredOnly limit={4} />
      <CountriesSection limit={4} />
      <WhyNafeiz />
      <HowItWorks />
      <TestimonialsSection />
      <HomeContactCTA />
    </>
  );
}
