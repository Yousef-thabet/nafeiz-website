import { useSEO } from '@/hooks/useSEO';
import { Hero } from '@/sections/Hero/Hero';
import { ShippingDestinations } from '@/sections/Shipping/ShippingDestinations';
import { About } from '@/sections/About/About';
import { Services } from '@/sections/Services/Services';
import { ProductShowcase } from '@/sections/Products/ProductShowcase';
import { CountriesSection } from '@/sections/Countries/CountriesSection';
import { WhyNafeiz } from '@/sections/WhyNafeiz/WhyNafeiz';
import { HowItWorks } from '@/sections/HowItWorks/HowItWorks';
import { ArticlesSection } from '@/sections/Articles/ArticlesSection';
import { TestimonialsSection } from '@/sections/Testimonials/TestimonialsSection';
import { HomeContactCTA } from '@/sections/Contact/HomeContactCTA';

export default function Home() {
  useSEO('home');
  return (
    <>
      <Hero />
      <ShippingDestinations compact />
      <About />
      <Services />
      <ProductShowcase />
      <CountriesSection />
      <WhyNafeiz />
      <HowItWorks />
      <ArticlesSection />
      <TestimonialsSection />
      <HomeContactCTA />
    </>
  );
}
