import { useSEO } from '@/hooks/useSEO';
import { ProductsSection } from '@/sections/Products/ProductsSection';

export default function Products() {
  useSEO('products');
  return (
    <>
      <div className="h-16 lg:h-20" />
      <ProductsSection />
    </>
  );
}
