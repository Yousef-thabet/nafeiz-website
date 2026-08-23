const prisma = require('../src/config/db');

const products = [
  {
    slug: 'smart-led-display',
    category: 'electronics',
    featured: true,
    nameL10n: {
      ar: 'شاشة LED ذكية',
      en: 'Smart LED Display',
      zh: '智能LED显示屏',
      ru: 'Умный LED-дисплей',
    },
    shortDescL10n: {
      ar: 'شاشة LED ذكية من حلول الإلكترونيات للاستخدام التجاري والإعلاني.',
      en: 'Smart LED display solutions for commercial and advertising use.',
      zh: '适用于商业和广告场景的智能LED显示屏。',
      ru: 'Умные LED-дисплеи для коммерческого и рекламного использования.',
    },
    descriptionL10n: {
      ar: 'شاشة LED عالية السطوع مع تحكم موثوق وخيارات مقاسات متعددة للمشاريع التجارية.',
      en: 'High-brightness LED display with reliable control and multiple size options for commercial projects.',
      zh: '高亮度LED显示屏，控制稳定，提供多种尺寸，适合商业项目。',
      ru: 'Яркий LED-дисплей с надежным управлением и вариантами разных размеров для коммерческих проектов.',
    },
  },
  {
    slug: 'industrial-mobile-phone',
    category: 'electronics',
    featured: false,
    nameL10n: {
      ar: 'هاتف محمول صناعي',
      en: 'Industrial Mobile Phone',
      zh: '工业手机',
      ru: 'Промышленный мобильный телефон',
    },
    shortDescL10n: {
      ar: 'هاتف متين من الإلكترونيات المخصصة للبيئات الصناعية والميدانية.',
      en: 'Rugged mobile phone built for industrial and field environments.',
      zh: '适用于工业和户外环境的坚固型手机。',
      ru: 'Защищенный мобильный телефон для промышленных и полевых условий.',
    },
    descriptionL10n: {
      ar: 'هاتف صناعي متين ببطارية طويلة العمر وحماية مناسبة للاستخدام الميداني الشاق.',
      en: 'Durable industrial phone with long battery life and protection for demanding field work.',
      zh: '坚固耐用的工业手机，续航时间长，适合严苛的户外工作环境。',
      ru: 'Надежный промышленный телефон с длительной автономностью и защитой для сложных полевых работ.',
    },
  },
  {
    slug: 'premium-cotton-fabric',
    category: 'textiles',
    featured: true,
    nameL10n: {
      ar: 'أقمشة قطنية عالية الجودة',
      en: 'Premium Cotton Fabric',
      zh: '高品质棉布',
      ru: 'Премиальная хлопковая ткань',
    },
    shortDescL10n: {
      ar: 'أقمشة قطنية ناعمة مناسبة للملابس والمنسوجات المنزلية.',
      en: 'Soft cotton fabric for apparel and home textile production.',
      zh: '适用于服装和家纺生产的柔软棉布。',
      ru: 'Мягкая хлопковая ткань для одежды и домашнего текстиля.',
    },
    descriptionL10n: {
      ar: 'خامة قطنية مختارة بجودة ثابتة وألوان متعددة لتلبية احتياجات المصانع والعلامات التجارية.',
      en: 'Consistent-quality cotton material available in multiple colors for factories and brands.',
      zh: '品质稳定的棉质材料，提供多种颜色，适合工厂和品牌采购。',
      ru: 'Хлопковый материал стабильного качества в разных цветах для фабрик и брендов.',
    },
  },
  {
    slug: 'industrial-packaging-machine',
    category: 'machinery',
    featured: true,
    nameL10n: {
      ar: 'ماكينة تغليف صناعية',
      en: 'Industrial Packaging Machine',
      zh: '工业包装机',
      ru: 'Промышленная упаковочная машина',
    },
    shortDescL10n: {
      ar: 'ماكينة تغليف آلية لخطوط الإنتاج والتعبئة.',
      en: 'Industrial packaging machine for automated production lines.',
      zh: '用于自动化生产线的工业包装机。',
      ru: 'Промышленная упаковочная машина для автоматизированных линий.',
    },
    descriptionL10n: {
      ar: 'حل تغليف صناعي قابل للتخصيص لتحسين سرعة التعبئة وثبات جودة الإنتاج.',
      en: 'Customizable industrial packaging solution that improves packing speed and production consistency.',
      zh: '可定制的工业包装方案，可提高包装速度和生产稳定性。',
      ru: 'Настраиваемое промышленное упаковочное решение для повышения скорости и стабильности производства.',
    },
  },
  {
    slug: 'construction-materials',
    category: 'construction',
    featured: false,
    nameL10n: {
      ar: 'مواد بناء',
      en: 'Construction Materials',
      zh: '建筑材料',
      ru: 'Строительные материалы',
    },
    shortDescL10n: {
      ar: 'مواد بناء موثوقة للمشاريع التجارية والسكنية.',
      en: 'Reliable construction materials for commercial and residential projects.',
      zh: '适用于商业和住宅项目的可靠建筑材料。',
      ru: 'Надежные строительные материалы для коммерческих и жилых проектов.',
    },
    descriptionL10n: {
      ar: 'مجموعة عملية من مواد البناء المختارة للمشاريع التي تتطلب جودة وتوريدًا مستقرًا.',
      en: 'A practical range of construction materials selected for projects requiring dependable quality and supply.',
      zh: '为需要稳定质量和供应的项目精选的实用建筑材料系列。',
      ru: 'Практичный ассортимент строительных материалов для проектов, требующих стабильного качества и поставок.',
    },
  },
  {
    slug: 'modern-home-supplies',
    category: 'home',
    featured: false,
    nameL10n: {
      ar: 'مستلزمات منزلية حديثة',
      en: 'Modern Home Supplies',
      zh: '现代家居用品',
      ru: 'Современные товары для дома',
    },
    shortDescL10n: {
      ar: 'مستلزمات منزلية عملية بتصميم عصري.',
      en: 'Practical home supplies with modern designs.',
      zh: '设计现代、实用的家居用品。',
      ru: 'Практичные товары для дома в современном дизайне.',
    },
    descriptionL10n: {
      ar: 'منتجات منزلية مختارة تجمع بين الاستخدام اليومي والتصميم العصري لتجار التجزئة والموزعين.',
      en: 'Curated home products combining everyday function and modern design for retailers and distributors.',
      zh: '精选家居产品兼具日常功能和现代设计，适合零售商和分销商。',
      ru: 'Подборка товаров для дома, сочетающих практичность и современный дизайн для розницы и дистрибьюторов.',
    },
  },
  {
    slug: 'food-packaging-boxes',
    category: 'packaging',
    featured: false,
    nameL10n: {
      ar: 'علب تغليف المواد الغذائية',
      en: 'Food Packaging Boxes',
      zh: '食品包装盒',
      ru: 'Коробки для пищевой упаковки',
    },
    shortDescL10n: {
      ar: 'علب تغليف غذائي قابلة للتخصيص للمنتجات الجاهزة.',
      en: 'Customizable food packaging boxes for ready-to-sell products.',
      zh: '适用于成品的可定制食品包装盒。',
      ru: 'Настраиваемые коробки для упаковки готовых пищевых продуктов.',
    },
    descriptionL10n: {
      ar: 'علب تغليف غذائي بأحجام وخامات متعددة، مناسبة للعلامات التجارية والمطاعم والمصانع.',
      en: 'Food packaging boxes in multiple sizes and materials for brands, restaurants, and manufacturers.',
      zh: '提供多种尺寸和材质的食品包装盒，适合品牌、餐厅和生产商。',
      ru: 'Коробки для пищевой упаковки разных размеров и материалов для брендов, ресторанов и производителей.',
    },
  },
];

async function main() {
  for (const product of products) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        category: product.category,
        featured: product.featured,
        published: true,
        nameL10n: JSON.stringify(product.nameL10n),
        shortDescL10n: JSON.stringify(product.shortDescL10n),
        descriptionL10n: JSON.stringify(product.descriptionL10n),
      },
      create: {
        slug: product.slug,
        category: product.category,
        featured: product.featured,
        published: true,
        nameL10n: JSON.stringify(product.nameL10n),
        shortDescL10n: JSON.stringify(product.shortDescL10n),
        descriptionL10n: JSON.stringify(product.descriptionL10n),
      },
    });
  }

  console.log(`Seeded ${products.length} products.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
