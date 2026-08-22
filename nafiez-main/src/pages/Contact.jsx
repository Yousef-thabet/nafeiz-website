import { useSEO } from '@/hooks/useSEO';
import { ContactSection } from '@/sections/Contact/ContactSection';

export default function Contact() {
  useSEO('contact');
  return (
    <>
      <div className="h-16 lg:h-20" />
      <ContactSection />
    </>
  );
}
