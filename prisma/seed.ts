import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

type SeedVariant = { nameAr: string; sku: string; priceKwd: number; discountPriceKwd?: number; stock: number; isDefault?: boolean };

type SeedProduct = {
  nameAr: string;
  nameEn: string;
  slug: string;
  sku: string;
  categorySlug: string;
  shortDescAr: string;
  fullDescAr: string;
  basePriceKwd: number;
  discountPriceKwd?: number;
  images: string[];
  topNotesAr?: string;
  heartNotesAr?: string;
  baseNotesAr?: string;
  fragranceFamilyAr?: string;
  longevity?: number;
  sillage?: number;
  gender?: string;
  season?: string;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isSpecialOffer?: boolean;
  isFeatured?: boolean;
  lowStockThreshold?: number;
  variants: SeedVariant[];
};

const products: SeedProduct[] = [
  {
    nameAr: "عطر كسيرات الملكي - فخامة العود",
    nameEn: "Kseerat Royal Oud",
    slug: "kseerat-royal-oud",
    sku: "KSR-PRF-001",
    categorySlug: "perfumes",
    shortDescAr: "عطر شرقي فاخر يمزج العود الكمبودي بالعنبر والمسك الأبيض.",
    fullDescAr:
      "عطر كسيرات الملكي هو توقيع عطري لا يُنسى. يفتتح بلمسات من الزعفران والورد الطائفي، ليكشف عن قلبٍ من العود الكمبودي المعتق والعنبر، ويستقر على قاعدة من المسك الأبيض وخشب الصندل. عطر مصمم لمن يبحث عن الفخامة الهادئة والحضور الملكي.",
    basePriceKwd: 42.0,
    discountPriceKwd: 29.5,
    images: [img("photo-1541643600914-78b084683601"), img("photo-1592945403244-b3fbafd7f539"), img("photo-1615634260167-c8cdede054de")],
    topNotesAr: "زعفران، ورد طائفي، برغموت",
    heartNotesAr: "عود كمبودي، عنبر، ياسمين",
    baseNotesAr: "مسك أبيض، خشب الصندل، فانيلا",
    fragranceFamilyAr: "شرقي خشبي",
    longevity: 5,
    sillage: 5,
    gender: "للجنسين",
    season: "جميع الفصول",
    isBestSeller: true,
    isFeatured: true,
    isSpecialOffer: true,
    lowStockThreshold: 6,
    variants: [
      { nameAr: "50 مل", sku: "KSR-PRF-001-50", priceKwd: 42.0, discountPriceKwd: 29.5, stock: 24, isDefault: true },
      { nameAr: "100 مل", sku: "KSR-PRF-001-100", priceKwd: 68.0, discountPriceKwd: 52.0, stock: 15 },
    ],
  },
  {
    nameAr: "دهن عود كمبودي ملكي",
    nameEn: "Royal Cambodian Oud Oil",
    slug: "royal-cambodian-oud-oil",
    sku: "KSR-OUD-002",
    categorySlug: "oud-bakhoor",
    shortDescAr: "دهن عود كمبودي أصلي معتق لعشر سنوات، نفحة ملكية نادرة.",
    fullDescAr:
      "من قلب الغابات الكمبودية، نختار أجود أنواع خشب العود ليُقطّر بعناية فائقة ويُعتّق عشر سنوات. دهن عود كمبودي ملكي يمنحك ثباتاً استثنائياً وفوحاناً يلفت الأنظار، ليكون توقيعك الخاص في المناسبات الكبرى.",
    basePriceKwd: 85.0,
    discountPriceKwd: 68.0,
    images: [img("photo-1594035910387-fea47794261f"), img("photo-1587017539504-67cfbddac569")],
    topNotesAr: "عود رطب، خشب مدخن",
    heartNotesAr: "عود كمبودي معتق، صندل",
    baseNotesAr: "مسك، عنبر، دخون",
    fragranceFamilyAr: "عودي مدخن",
    longevity: 5,
    sillage: 4,
    gender: "للجنسين",
    season: "شتوي",
    isBestSeller: true,
    isFeatured: true,
    lowStockThreshold: 4,
    variants: [
      { nameAr: "تولة (12 مل)", sku: "KSR-OUD-002-T", priceKwd: 85.0, discountPriceKwd: 68.0, stock: 10, isDefault: true },
      { nameAr: "أوقية (30 مل)", sku: "KSR-OUD-002-O", priceKwd: 190.0, discountPriceKwd: 165.0, stock: 4 },
    ],
  },
  {
    nameAr: "مبسوس كسيرات الملكي",
    nameEn: "Kseerat Royal Mabsoos",
    slug: "kseerat-royal-mabsoos",
    sku: "KSR-BKH-003",
    categorySlug: "oud-bakhoor",
    shortDescAr: "مبسوس فاخر بخلطة العود والعنبر والورد، لتعطير المجالس.",
    fullDescAr:
      "خلطة مبسوس كسيرات الملكي مصنوعة يدوياً من رقائق العود الفاخرة والعنبر والورد الطائفي ودهن العود. يُستخدم لتعطير المجالس والمناسبات، ويترك أثراً عطرياً يدوم لساعات طويلة.",
    basePriceKwd: 8.5,
    discountPriceKwd: 4.25,
    images: [img("photo-1608528577891-eb055944f2e7"), img("photo-1523293182086-7651a899d37f")],
    topNotesAr: "ورد، زعفران",
    heartNotesAr: "عود، عنبر",
    baseNotesAr: "مسك، صندل",
    fragranceFamilyAr: "بخور شرقي",
    longevity: 4,
    sillage: 5,
    gender: "للجنسين",
    season: "جميع الفصول",
    isBestSeller: true,
    isSpecialOffer: true,
    lowStockThreshold: 10,
    variants: [
      { nameAr: "28 جم", sku: "KSR-BKH-003-28", priceKwd: 8.5, discountPriceKwd: 4.25, stock: 60, isDefault: true },
      { nameAr: "50 جم", sku: "KSR-BKH-003-50", priceKwd: 14.0, discountPriceKwd: 9.5, stock: 35 },
      { nameAr: "100 جم", sku: "KSR-BKH-003-100", priceKwd: 24.0, discountPriceKwd: 18.0, stock: 18 },
    ],
  },
  {
    nameAr: "عطر ورد الطائف",
    nameEn: "Taif Rose Perfume",
    slug: "taif-rose-perfume",
    sku: "KSR-PRF-004",
    categorySlug: "perfumes",
    shortDescAr: "ورد طائفي ناعم بلمسة من المسك، أنوثة راقية.",
    fullDescAr:
      "عطر ورد الطائف يحتفي بأنقى أنواع الورد الطائفي، مع لمسات من المسك الأبيض وخشب الصندل. عطر نسائي راقٍ يناسب النهار والمساء، ويمنحك إحساساً بالنعومة والأناقة.",
    basePriceKwd: 36.0,
    discountPriceKwd: 27.0,
    images: [img("photo-1595425970377-c9703cf48b6d"), img("photo-1610461888750-10bfc601b874")],
    topNotesAr: "ورد طائفي، ليتشي",
    heartNotesAr: "ورد، فreesia، ياسمين",
    baseNotesAr: "مسك أبيض، صندل",
    fragranceFamilyAr: "زهري",
    longevity: 4,
    sillage: 3,
    gender: "نسائي",
    season: "جميع الفصول",
    isFeatured: true,
    lowStockThreshold: 5,
    variants: [
      { nameAr: "50 مل", sku: "KSR-PRF-004-50", priceKwd: 36.0, discountPriceKwd: 27.0, stock: 20, isDefault: true },
      { nameAr: "100 مل", sku: "KSR-PRF-004-100", priceKwd: 58.0, discountPriceKwd: 44.0, stock: 12 },
    ],
  },
  {
    nameAr: "مسك أبيض فاخر",
    nameEn: "Luxury White Musk",
    slug: "luxury-white-musk",
    sku: "KSR-OIL-005",
    categorySlug: "essential-oils",
    shortDescAr: "زيت مسك أبيض مركّز، نعومة وإشراقة تدوم.",
    fullDescAr:
      "زيت المسك الأبيض الفاخر، مركّز عالي الجودة يُستخدم منفرداً أو مع العطور الأخرى. يمنح البشرة نعومةً ورائحة نظيفة تدوم طوال اليوم.",
    basePriceKwd: 22.0,
    discountPriceKwd: 15.5,
    images: [img("photo-1547887538-e3a2f32cb1cc"), img("photo-1619994403073-2cec844b8e63")],
    fragranceFamilyAr: "مسكي",
    longevity: 4,
    sillage: 4,
    gender: "للجنسين",
    season: "جميع الفصول",
    isSpecialOffer: true,
    lowStockThreshold: 8,
    variants: [
      { nameAr: "6 مل", sku: "KSR-OIL-005-6", priceKwd: 22.0, discountPriceKwd: 15.5, stock: 40, isDefault: true },
      { nameAr: "12 مل", sku: "KSR-OIL-005-12", priceKwd: 38.0, discountPriceKwd: 29.0, stock: 25 },
    ],
  },
  {
    nameAr: "بخور العود المعتق",
    nameEn: "Aged Oud Bakhoor",
    slug: "aged-oud-bakhoor",
    sku: "KSR-BKH-006",
    categorySlug: "oud-bakhoor",
    shortDescAr: "بخور عود معتق برائحة دافئة تغمر المكان بالفخامة.",
    fullDescAr:
      "بخور العود المعتق، خليط من رقائق العود الطبيعية والزيوت العطرية الفاخرة. يمنح منزلك أو مجلسك رائحة دافئة وعميقة تدوم لساعات.",
    basePriceKwd: 24.0,
    images: [img("photo-1616949755610-8c9bbc08f138"), img("photo-1541108564883-b1e0d2d8d0a1")],
    topNotesAr: "عود، بهارات",
    heartNotesAr: "عنبر، مسك",
    baseNotesAr: "خشب مدخن",
    fragranceFamilyAr: "عودي",
    longevity: 5,
    sillage: 4,
    gender: "للجنسين",
    season: "شتوي",
    isNewArrival: true,
    lowStockThreshold: 6,
    variants: [
      { nameAr: "40 جم", sku: "KSR-BKH-006-40", priceKwd: 24.0, stock: 30, isDefault: true },
      { nameAr: "80 جم", sku: "KSR-BKH-006-80", priceKwd: 42.0, stock: 16 },
    ],
  },
  {
    nameAr: "طقم هدايا كسيرات الفاخر",
    nameEn: "Kseerat Luxury Gift Set",
    slug: "kseerat-luxury-gift-set",
    sku: "KSR-GFT-007",
    categorySlug: "gifts-sets",
    shortDescAr: "علبة هدايا فاخرة تضم عطراً ودهن عود وبخوراً.",
    fullDescAr:
      "طقم هدايا كسيرات الفاخر، صندوق مخملي أنيق يضم عطر كسيرات الملكي 50 مل، دهن عود كمبودي تولة، ومبسوس ملكي 28 جم. الهدية المثالية لمن تحب في المناسبات الخاصة.",
    basePriceKwd: 48.0,
    discountPriceKwd: 39.0,
    images: [img("photo-1563170351-be82bc888aa4"), img("photo-1588405748880-12d1d2a59f75")],
    fragranceFamilyAr: "مجموعة شرقية",
    longevity: 5,
    sillage: 4,
    gender: "للجنسين",
    season: "جميع الفصول",
    isFeatured: true,
    isSpecialOffer: true,
    lowStockThreshold: 4,
    variants: [
      { nameAr: "الطقم الكامل", sku: "KSR-GFT-007-F", priceKwd: 48.0, discountPriceKwd: 39.0, stock: 14, isDefault: true },
      { nameAr: "الطقم + تغليف فاخر", sku: "KSR-GFT-007-P", priceKwd: 58.0, discountPriceKwd: 49.0, stock: 8 },
    ],
  },
  {
    nameAr: "عطر عنبر خليجي",
    nameEn: "Gulf Amber Perfume",
    slug: "gulf-amber-perfume",
    sku: "KSR-PRF-008",
    categorySlug: "perfumes",
    shortDescAr: "عنبر خليجي دافئ بلمسات من الأخشاب الثمينة.",
    fullDescAr:
      "عطر عنبر خليجي يعكس دفء الصحراء وفخامة الشرق. يفتتح بالبهارات، ليكشف عن قلبٍ من العنبر واللبان، ويستقر على قاعدة من خشب العود والمسك. عطر يحمل هوية الخليج.",
    basePriceKwd: 39.0,
    images: [img("photo-1590156562742-8a0d3a1e2b1b"), img("photo-1541643600914-78b084683601")],
    topNotesAr: "بهارات، برغموت",
    heartNotesAr: "عنبر، لبان",
    baseNotesAr: "عود، مسك",
    fragranceFamilyAr: "عنبري شرقي",
    longevity: 4,
    sillage: 4,
    gender: "رجالي",
    season: "شتوي",
    isNewArrival: true,
    lowStockThreshold: 5,
    variants: [
      { nameAr: "50 مل", sku: "KSR-PRF-008-50", priceKwd: 39.0, stock: 22, isDefault: true },
      { nameAr: "100 مل", sku: "KSR-PRF-008-100", priceKwd: 65.0, stock: 10 },
    ],
  },
  {
    nameAr: "زيت العود الهندي النقي",
    nameEn: "Pure Indian Oud Oil",
    slug: "pure-indian-oud-oil",
    sku: "KSR-OIL-009",
    categorySlug: "essential-oils",
    shortDescAr: "زيت عود هندي نقي، عبق الأصالة والثبات العالي.",
    fullDescAr:
      "زيت العود الهندي النقي، مستخلص من أجود أنواع خشب العود الهندي. رائحة ترابية خشبية عميقة، تُستخدم بقطرة واحدة لثبات يدوم لأيام.",
    basePriceKwd: 55.0,
    images: [img("photo-1592945403244-b3fbafd7f539"), img("photo-1594035910387-fea47794261f")],
    fragranceFamilyAr: "عودي ترابي",
    longevity: 5,
    sillage: 4,
    gender: "للجنسين",
    season: "جميع الفصول",
    isBestSeller: true,
    lowStockThreshold: 3,
    variants: [
      { nameAr: "تولة (12 مل)", sku: "KSR-OIL-009-T", priceKwd: 55.0, stock: 12, isDefault: true },
      { nameAr: "نصف أوقية (15 مل)", sku: "KSR-OIL-009-H", priceKwd: 78.0, stock: 6 },
    ],
  },
  {
    nameAr: "معطر جو كسيرات - عود",
    nameEn: "Kseerat Oud Home Spray",
    slug: "kseerat-oud-home-spray",
    sku: "KSR-HOM-010",
    categorySlug: "home-fresheners",
    shortDescAr: "معطر أجواء فاخر برائحة العود، لتعطير المنزل والمكتب.",
    fullDescAr:
      "معطر جو كسيرات برائحة العود الملكي، يمنح منزلك أو مكتبك أجواءً فاخرة تدوم. تركيبة مركزة عالية الجودة، خالية من البقع، ومناسبة لجميع أقمشة المنزل.",
    basePriceKwd: 6.5,
    images: [img("photo-1608528577891-eb055944f2e7"), img("photo-1610461888750-10bfc601b874")],
    fragranceFamilyAr: "عودي منعش",
    longevity: 3,
    sillage: 4,
    gender: "للجنسين",
    season: "جميع الفصول",
    lowStockThreshold: 10,
    variants: [
      { nameAr: "300 مل", sku: "KSR-HOM-010-300", priceKwd: 6.5, stock: 50, isDefault: true },
      { nameAr: "500 مل", sku: "KSR-HOM-010-500", priceKwd: 9.5, stock: 35 },
    ],
  },
  {
    nameAr: "مجموعة العناية الذهبية",
    nameEn: "Golden Care Collection",
    slug: "golden-care-collection",
    sku: "KSR-CAR-011",
    categorySlug: "personal-care",
    shortDescAr: "مجموعة عناية فاخرة بخلاصة الذهب والعود.",
    fullDescAr:
      "مجموعة العناية الذهبية تضم صابوناً فاخراً بخلاصة الذهب، لوشن جسم بزيت العود، وبلسم شفاه مرطب. تجربة عناية كاملة تمنح بشرتك نعومة وإشراقة.",
    basePriceKwd: 18.0,
    discountPriceKwd: 13.5,
    images: [img("photo-1547887538-e3a2f32cb1cc"), img("photo-1619994403073-2cec844b8e63")],
    fragranceFamilyAr: "عناية معطرة",
    gender: "نسائي",
    season: "جميع الفصول",
    isNewArrival: true,
    isSpecialOffer: true,
    lowStockThreshold: 5,
    variants: [
      { nameAr: "المجموعة الكاملة", sku: "KSR-CAR-011-F", priceKwd: 18.0, discountPriceKwd: 13.5, stock: 26, isDefault: true },
    ],
  },
  {
    nameAr: "عطر مسك الغزال",
    nameEn: "Gazelle Musk Perfume",
    slug: "gazelle-musk-perfume",
    sku: "KSR-PRF-012",
    categorySlug: "perfumes",
    shortDescAr: "مسك الغزال بلمسة من الفانيلا، عطر أنثوي ساحر.",
    fullDescAr:
      "عطر مسك الغزال، مزيج ساحر من المسك الناعم والفانيلا والورد. عطر نسائي يمنحك حضوراً أنثوياً هادئاً وجاذباً، مثالي للاستخدام اليومي.",
    basePriceKwd: 32.0,
    images: [img("photo-1587017539504-67cfbddac569"), img("photo-1595425970377-c9703cf48b6d")],
    topNotesAr: "فانيلا، برغموت",
    heartNotesAr: "مسك الغزال، ورد",
    baseNotesAr: "صندل، مسك أبيض",
    fragranceFamilyAr: "مسكي زهري",
    longevity: 4,
    sillage: 3,
    gender: "نسائي",
    season: "جميع الفصول",
    isNewArrival: true,
    lowStockThreshold: 6,
    variants: [
      { nameAr: "50 مل", sku: "KSR-PRF-012-50", priceKwd: 32.0, stock: 28, isDefault: true },
      { nameAr: "100 مل", sku: "KSR-PRF-012-100", priceKwd: 52.0, stock: 14 },
    ],
  },
  {
    nameAr: "مبسوس العنبر الملكي",
    nameEn: "Royal Amber Mabsoos",
    slug: "royal-amber-mabsoos",
    sku: "KSR-BKH-013",
    categorySlug: "oud-bakhoor",
    shortDescAr: "مبسوس عنبر ملكي بخلطة شرقية غنية.",
    fullDescAr:
      "مبسوس العنبر الملكي، خلطة فاخرة من العنبر والمسك والعود، تُبخر بها المجالس لتترك أثراً عطرياً ملكياً يدوم.",
    basePriceKwd: 12.0,
    discountPriceKwd: 9.0,
    images: [img("photo-1523293182086-7651a899d37f"), img("photo-1608528577891-eb055944f2e7")],
    topNotesAr: "عنبر، بهارات",
    heartNotesAr: "مسك، ورد",
    baseNotesAr: "عود، صندل",
    fragranceFamilyAr: "بخور عنبري",
    longevity: 4,
    sillage: 4,
    gender: "للجنسين",
    season: "شتوي",
    isSpecialOffer: true,
    lowStockThreshold: 8,
    variants: [
      { nameAr: "40 جم", sku: "KSR-BKH-013-40", priceKwd: 12.0, discountPriceKwd: 9.0, stock: 32, isDefault: true },
      { nameAr: "80 جم", sku: "KSR-BKH-013-80", priceKwd: 20.0, discountPriceKwd: 16.0, stock: 18 },
    ],
  },
  {
    nameAr: "طقم هدايا العيد",
    nameEn: "Eid Gift Box",
    slug: "eid-gift-box",
    sku: "KSR-GFT-014",
    categorySlug: "gifts-sets",
    shortDescAr: "هدية العيد المثالية: عطر، بخور، ودهن عود في صندوق فاخر.",
    fullDescAr:
      "طقم هدايا العيد، صندوق فاخر بتصميم مستوحى من التراث الخليجي، يضم عطر عنبر خليجي 50 مل، مبسوس ملكي 28 جم، ودهن عود هندي تولة. هدية تليق بأرقى المناسبات.",
    basePriceKwd: 65.0,
    discountPriceKwd: 55.0,
    images: [img("photo-1588405748880-12d1d2a59f75"), img("photo-1563170351-be82bc888aa4")],
    fragranceFamilyAr: "مجموعة شرقية",
    longevity: 5,
    sillage: 4,
    gender: "للجنسين",
    season: "جميع الفصول",
    isFeatured: true,
    isSpecialOffer: true,
    lowStockThreshold: 4,
    variants: [
      { nameAr: "الطقم الكامل", sku: "KSR-GFT-014-F", priceKwd: 65.0, discountPriceKwd: 55.0, stock: 11, isDefault: true },
    ],
  },
  {
    nameAr: "عطر ليالي الكويت",
    nameEn: "Kuwait Nights Perfume",
    slug: "kuwait-nights-perfume",
    sku: "KSR-PRF-015",
    categorySlug: "perfumes",
    shortDescAr: "عطر ليلي فاخر يجمع العود والزعفران والعنبر.",
    fullDescAr:
      "عطر ليالي الكويت، تحية لمدينة لا تنام. مزيج من الزعفران والعود والعنبر، يعكس سحر الليل الخليجي وفخامته. عطر يليق بالمناسبات المسائية الخاصة.",
    basePriceKwd: 44.0,
    discountPriceKwd: 33.0,
    images: [img("photo-1615634260167-c8cdede054de"), img("photo-1616949755610-8c9bbc08f138")],
    topNotesAr: "زعفران، ورد",
    heartNotesAr: "عود، عنبر",
    baseNotesAr: "مسك، فانيلا",
    fragranceFamilyAr: "شرقي خشبي",
    longevity: 5,
    sillage: 5,
    gender: "للجنسين",
    season: "شتوي",
    isFeatured: true,
    isBestSeller: true,
    isSpecialOffer: true,
    lowStockThreshold: 5,
    variants: [
      { nameAr: "50 مل", sku: "KSR-PRF-015-50", priceKwd: 44.0, discountPriceKwd: 33.0, stock: 19, isDefault: true },
      { nameAr: "100 مل", sku: "KSR-PRF-015-100", priceKwd: 72.0, discountPriceKwd: 59.0, stock: 9 },
    ],
  },
  {
    nameAr: "زيت الورد الطائفي",
    nameEn: "Taif Rose Oil",
    slug: "taif-rose-oil",
    sku: "KSR-OIL-016",
    categorySlug: "essential-oils",
    shortDescAr: "زيت ورد طائفي نقي، نفحة زهرية راقية.",
    fullDescAr:
      "زيت الورد الطائفي النقي، مستخلص من ورود الطائف في موسمها الأول. رائحة زهرية غنية وناعمة، تُستخدم للعطور والعناية بالبشرة.",
    basePriceKwd: 28.0,
    images: [img("photo-1619994403073-2cec844b8e63"), img("photo-1547887538-e3a2f32cb1cc")],
    fragranceFamilyAr: "زهري",
    longevity: 4,
    sillage: 3,
    gender: "نسائي",
    season: "جميع الفصول",
    isNewArrival: true,
    lowStockThreshold: 5,
    variants: [
      { nameAr: "6 مل", sku: "KSR-OIL-016-6", priceKwd: 28.0, stock: 24, isDefault: true },
      { nameAr: "12 مل", sku: "KSR-OIL-016-12", priceKwd: 46.0, stock: 13 },
    ],
  },
];

async function main() {
  console.log("🌱 Seeding Kseerat store...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.heroSlide.deleteMany();
  await prisma.shippingCompany.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.pushSubscription.deleteMany();
  await prisma.otpVerification.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();
  await prisma.currency.deleteMany();
  await prisma.siteSettings.deleteMany();

  await prisma.siteSettings.create({
    data: {
      id: 1,
      storeNameAr: "كسيرات",
      storeNameEn: "Kseerat",
      logoUrl: "",
      primaryColor: "#B39A7B",
      announcementAr: "شحن مجاني لجميع دول الخليج للطلبات فوق الحد الأدنى • عطور ودهن عود فاخر من قلب الكويت",
      storyTitleAr: "حكايتنا مع العطر",
      storyQuoteAr: "في كسيرات، نؤمن أن العطر قصةٌ تُعاش، وذكرى تبقى، وإرثٌ يمتد عبر الأجيال.",
      storySignatureAr: "عائلة كسيرات . المؤسسون",
      heritageFooterNote: "بكل فخر... صُنع في الكويت ويُشحن لجميع دول الخليج",
      trust1TitleAr: "تغطية خليجية شاملة",
      trust1DescAr: "شحن سريع من المقر الرئيسي بالكويت لجميع دول الخليج.",
      trust2TitleAr: "تواصل معنا",
      trust2DescAr: "خدمة عملاء 965 2222 8888 · الأحد – الخميس 8:00 ص – 10:00 م",
      trust3TitleAr: "شحن مجاني",
      trust3DescAr: "على الطلبات التي تتجاوز الحد الأدنى حسب الدولة والعملة المختارة.",
      phone: "+965 2222 8888",
      workingHoursAr: "الأحد – الخميس 8:00 ص – 10:00 م",
      whatsapp: "96550001234",
      commercialRegistration: "س.ت 123456789",
      taxNumber: "الرقم الضريبي 987654321",
      instagram: "https://instagram.com/kseerat",
      twitter: "https://x.com/kseerat",
      snapchat: "https://snapchat.com/add/kseerat",
      tiktok: "https://tiktok.com/@kseerat",
      facebook: "https://facebook.com/kseerat",
      youtube: "https://youtube.com/@kseerat",
      showPaymentIcons: true,
      loyaltyTitleAr: "انضم الآن، واستمتع بمزايا حصرية",
      loyaltySubtitleAr: "اكسب نقاط ولاء . اكتشف الجديد . احفظ منتجاتك المفضلة",
      myfatoorahMode: "MOCK",
      myfatoorahBaseUrl: "https://apitest.myfatoorah.com",
    },
  });

  const currencies = [
    { code: "KWD", nameAr: "دينار كويتي", countryAr: "الكويت", flag: "🇰🇼", symbolAr: "د.ك", exchangeRateFromKwd: 1, decimals: 3, freeShippingThreshold: 15, defaultShippingCost: 2.0, estimatedDeliveryAr: "التوصيل خلال 24 ساعة", sortOrder: 1 },
    { code: "SAR", nameAr: "ريال سعودي", countryAr: "السعودية", flag: "🇸🇦", symbolAr: "ر.س", exchangeRateFromKwd: 12.2, decimals: 2, freeShippingThreshold: 183, defaultShippingCost: 24.4, estimatedDeliveryAr: "التوصيل خلال 2-3 أيام عمل", sortOrder: 2 },
    { code: "AED", nameAr: "درهم إماراتي", countryAr: "الإمارات", flag: "🇦🇪", symbolAr: "د.إ", exchangeRateFromKwd: 11.95, decimals: 2, freeShippingThreshold: 179, defaultShippingCost: 23.9, estimatedDeliveryAr: "التوصيل خلال 2-3 أيام عمل", sortOrder: 3 },
    { code: "QAR", nameAr: "ريال قطري", countryAr: "قطر", flag: "🇶🇦", symbolAr: "ر.ق", exchangeRateFromKwd: 11.86, decimals: 2, freeShippingThreshold: 178, defaultShippingCost: 23.7, estimatedDeliveryAr: "التوصيل خلال 2-3 أيام عمل", sortOrder: 4 },
    { code: "BHD", nameAr: "دينار بحريني", countryAr: "البحرين", flag: "🇧🇭", symbolAr: "د.ب", exchangeRateFromKwd: 1.23, decimals: 3, freeShippingThreshold: 18.5, defaultShippingCost: 2.46, estimatedDeliveryAr: "التوصيل خلال 2-4 أيام عمل", sortOrder: 5 },
    { code: "OMR", nameAr: "ريال عماني", countryAr: "سلطنة عمان", flag: "🇴🇲", symbolAr: "ر.ع", exchangeRateFromKwd: 1.25, decimals: 3, freeShippingThreshold: 18.8, defaultShippingCost: 2.5, estimatedDeliveryAr: "التوصيل خلال 2-4 أيام عمل", sortOrder: 6 },
  ];
  for (const c of currencies) await prisma.currency.create({ data: c });

  await prisma.heroSlide.createMany({
    data: [
      {
        titleAr: "فخامة العود الملكي",
        titleEn: "The Luxury of Royal Oud",
        subtitleAr: "اكتشف مجموعتنا الحصرية من دهن العود الكمبودي والعطور الشرقية الفاخرة",
        subtitleEn: "Discover our exclusive collection of Cambodian oud and luxury oriental perfumes",
        buttonTextAr: "تسوق الآن",
        buttonTextEn: "Shop Now",
        buttonLink: "/category/oud-bakhoor",
        imageUrl: img("photo-1615634260167-c8cdede054de"),
        sortOrder: 1,
        isActive: true,
      },
      {
        titleAr: "مجموعة الهدايا الفاخرة",
        titleEn: "Luxury Gift Collection",
        subtitleAr: "هدايا تُعبّر عن أرقى المشاعر، بتغليف فاخر يليق بمن تحب",
        subtitleEn: "Gifts that express the finest feelings, with luxury packaging",
        buttonTextAr: "اكتشف المجموعة",
        buttonTextEn: "Explore",
        buttonLink: "/category/gifts-sets",
        imageUrl: img("photo-1547887538-e3a2f32cb1cc"),
        sortOrder: 2,
        isActive: true,
      },
      {
        titleAr: "خصومات تصل إلى 50%",
        titleEn: "Up to 50% Off",
        subtitleAr: "عروض حصرية على مختارات كسيرات لأوقات محدودة",
        subtitleEn: "Exclusive offers on selected Kseerat pieces for a limited time",
        buttonTextAr: "تسوق العروض",
        buttonTextEn: "Shop Offers",
        buttonLink: "/category/offers",
        imageUrl: img("photo-1592945403244-b3fbafd7f539"),
        sortOrder: 3,
        isActive: true,
      },
    ],
  });

  const categories = [
    { nameAr: "الأكثر مبيعًا", nameEn: "Best Sellers", slug: "best-sellers", descriptionAr: "القطع الأكثر حباً من عملاء كسيرات", imageUrl: img("photo-1541643600914-78b084683601"), sortOrder: 1, showInNavbar: true },
    { nameAr: "عطور", nameEn: "Perfumes", slug: "perfumes", descriptionAr: "عطور شرقية وغربية فاخرة", imageUrl: img("photo-1592945403244-b3fbafd7f539"), sortOrder: 2, showInNavbar: true },
    { nameAr: "عود وبخور", nameEn: "Oud & Bakhoor", slug: "oud-bakhoor", descriptionAr: "دهن عود أصلي ومبسوس فاخر", imageUrl: img("photo-1594035910387-fea47794261f"), sortOrder: 3, showInNavbar: true },
    { nameAr: "الزيوت العطرية", nameEn: "Essential Oils", slug: "essential-oils", descriptionAr: "زيوت عطرية مركزة ونقية", imageUrl: img("photo-1587017539504-67cfbddac569"), sortOrder: 4, showInNavbar: true },
    { nameAr: "الهدايا والمجموعات", nameEn: "Gifts & Sets", slug: "gifts-sets", descriptionAr: "أطقم هدايا فاخرة لكل مناسبة", imageUrl: img("photo-1563170351-be82bc888aa4"), sortOrder: 5, showInNavbar: true },
    { nameAr: "المعطرات", nameEn: "Home Fresheners", slug: "home-fresheners", descriptionAr: "معطرات جو وأجواء فاخرة", imageUrl: img("photo-1608528577891-eb055944f2e7"), sortOrder: 6, showInNavbar: true },
    { nameAr: "العناية الشخصية", nameEn: "Personal Care", slug: "personal-care", descriptionAr: "مجموعات عناية فاخرة", imageUrl: img("photo-1619994403073-2cec844b8e63"), sortOrder: 7, showInNavbar: true },
    { nameAr: "العروض", nameEn: "Special Offers", slug: "offers", descriptionAr: "عروض حصرية لفترة محدودة", imageUrl: img("photo-1595425970377-c9703cf48b6d"), sortOrder: 8, showInNavbar: true },
  ];
  for (const c of categories) await prisma.category.create({ data: c });

  const cats = await prisma.category.findMany();
  const catBySlug = new Map(cats.map((c) => [c.slug, c.id]));

  for (const p of products) {
    const defaultVariant = p.variants.find((v) => v.isDefault) ?? p.variants[0];
    const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
    await prisma.product.create({
      data: {
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        slug: p.slug,
        sku: p.sku,
        shortDescAr: p.shortDescAr,
        fullDescAr: p.fullDescAr,
        categoryId: catBySlug.get(p.categorySlug)!,
        basePriceKwd: p.basePriceKwd,
        discountPriceKwd: p.discountPriceKwd,
        currencyPricesJson: "{}",
        stock: totalStock,
        lowStockThreshold: p.lowStockThreshold ?? 5,
        weightGrams: 250,
        imagesJson: JSON.stringify(p.images),
        topNotesAr: p.topNotesAr,
        heartNotesAr: p.heartNotesAr,
        baseNotesAr: p.baseNotesAr,
        fragranceFamilyAr: p.fragranceFamilyAr,
        longevity: p.longevity ?? 3,
        sillage: p.sillage ?? 3,
        gender: p.gender ?? "للجنسين",
        season: p.season ?? "جميع الفصول",
        isBestSeller: !!p.isBestSeller,
        isNewArrival: !!p.isNewArrival,
        isSpecialOffer: !!p.isSpecialOffer,
        isFeatured: !!p.isFeatured,
        isActive: true,
        variants: {
          create: p.variants.map((v) => ({
            nameAr: v.nameAr,
            sku: v.sku,
            stock: v.stock,
            priceKwd: v.priceKwd,
            discountPriceKwd: v.discountPriceKwd,
            currencyPricesJson: "{}",
            isDefault: v.nameAr === defaultVariant.nameAr,
          })),
        },
      },
    });
  }

  await prisma.shippingCompany.createMany({
    data: [
      { nameAr: "الشحن و التوصيل السريع", deliveryTimeAr: "التوصيل خلال 24 ساعة داخل الكويت", logoUrl: "", baseCostKwd: 2.0, supportedCountriesJson: JSON.stringify(["KWD", "SAR", "AED", "QAR", "BHD", "OMR"]), isActive: true },
      { nameAr: "التوصيل السريع VIP", deliveryTimeAr: "التوصيل خلال 12 ساعة (الكويت فقط)", logoUrl: "", baseCostKwd: 4.5, supportedCountriesJson: JSON.stringify(["KWD"]), isActive: true },
      { nameAr: "الشحن الخليجي الموحّد", deliveryTimeAr: "التوصيل خلال 2-4 أيام عمل لدول الخليج", logoUrl: "", baseCostKwd: 3.5, supportedCountriesJson: JSON.stringify(["SAR", "AED", "QAR", "BHD", "OMR"]), isActive: true },
    ],
  });

  await prisma.coupon.createMany({
    data: [
      { code: "WELCOME10", discountType: "PERCENTAGE", discountValue: 10, minOrderKwd: 10, maxUses: 1000, usedCount: 0, isActive: true },
      { code: "KSEERAT20", discountType: "PERCENTAGE", discountValue: 20, minOrderKwd: 30, maxUses: 500, usedCount: 0, isActive: true },
      { code: "OUD5", discountType: "FIXED_KWD", discountValue: 5, minOrderKwd: 20, maxUses: 200, usedCount: 0, isActive: true },
    ],
  });

  const admin = await prisma.user.create({
    data: {
      firstName: "مدير",
      lastName: "كسيرات",
      email: "admin@kseerat.com",
      phoneCountryCode: "+965",
      phoneNumber: "50000000",
      role: "ADMIN",
      loyaltyPoints: 0,
    },
  });

  await prisma.user.create({
    data: {
      firstName: "سارة",
      lastName: "العلي",
      email: "sara@example.com",
      phoneCountryCode: "+965",
      phoneNumber: "55512345",
      role: "CUSTOMER",
      loyaltyPoints: 240,
    },
  });

  console.log(`✅ Seeded ${products.length} products, 8 categories, 3 hero slides, 6 currencies.`);
  console.log(`👑 Admin login email: ${admin.email} (use Email OTP, code shown on screen)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
