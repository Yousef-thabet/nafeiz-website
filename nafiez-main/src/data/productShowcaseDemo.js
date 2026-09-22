import showcaseImage from '@/assets/hero-bg.jpg';

const demoNames = [
  ['Commercial Lighting System', 'نظام إضاءة تجاري', '商用照明系统', 'Коммерческая система освещения'],
  ['Medical Equipment Set', 'مجموعة معدات طبية', '医疗设备套装', 'Комплект медицинского оборудования'],
  ['Warehouse Storage Tools', 'أدوات تخزين المستودعات', '仓储工具', 'Инструменты для складского хранения'],
  ['Modern Home Furniture', 'أثاث منزلي عصري', '现代家居家具', 'Современная мебель для дома'],
  ['Industrial Safety Gear', 'معدات السلامة الصناعية', '工业安全用品', 'Средства промышленной безопасности'],
  ['Smart Retail Display', 'شاشة عرض ذكية للمتاجر', '智能零售展示设备', 'Умный дисплей для магазинов'],
  ['Packaging Line Equipment', 'معدات خطوط التعبئة والتغليف', '包装生产线设备', 'Оборудование упаковочной линии'],
  ['Agricultural Fertilizer Supply', 'أسمدة زراعية', '农业肥料', 'Сельскохозяйственные удобрения'],
  ['Professional Footwear Range', 'مجموعة أحذية احترافية', '专业鞋类', 'Профессиональная обувь'],
  ['Office Stationery Range', 'مستلزمات مكتبية', '办公文具系列', 'Канцелярские товары для офиса'],
  ['Children’s Learning Toys', 'ألعاب تعليمية للأطفال', '儿童益智玩具', 'Развивающие игрушки для детей'],
  ['Premium Textile Collection', 'مجموعة منسوجات مميزة', '优质纺织品系列', 'Коллекция качественного текстиля'],
];

const demoCategories = [
  'lighting', 'medical-supplies', 'household-tools', 'home-supplies', 'health-supplies', 'electronics',
  'production-lines', 'agricultural-fertilizers', 'footwear', 'stationery', 'toys', 'clothing-textiles',
];

export const productShowcaseDemo = demoCategories.map((category, index) => ({
  id: `demo-product-${index + 1}`,
  slug: `demo-${category}-${index + 1}`,
  category,
  featured: true,
  published: true,
  demo: true,
  nameL10n: { ar: demoNames[index][1], en: demoNames[index][0], zh: demoNames[index][2], ru: demoNames[index][3] },
  shortDescL10n: {
    ar: 'منتج تجريبي لمعاينة معرض المنتجات.',
    en: 'Demo product for previewing the showcase gallery.',
    zh: '用于预览产品展示区的演示产品。',
    ru: 'Демонстрационный товар для просмотра витрины.',
  },
  images: [showcaseImage],
}));
