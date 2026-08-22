import { useSEO } from '@/hooks/useSEO';
import { TestimonialsSection } from '@/sections/Testimonials/TestimonialsSection';

export default function Testimonials() {
  useSEO('testimonials');
  return (
    <>
      <div className="h-16 lg:h-20" />
      <TestimonialsSection />
    </>
  );
}
