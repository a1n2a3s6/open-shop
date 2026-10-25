export type ShopVariant = {
  id: string;
  nameAr: string;
  nameEn?: string | null;
  sku?: string | null;
  stock: number;
  priceKwd: number;
  discountPriceKwd: number | null;
  currencyPricesJson: string;
  isDefault: boolean;
};

export type ShopProduct = {
  id: string;
  nameAr: string;
  nameEn: string | null;
  slug: string;
  sku: string;
  basePriceKwd: number;
  discountPriceKwd: number | null;
  currencyPricesJson: string;
  stock: number;
  imagesJson: string;
  isBestSeller: boolean;
  isNewArrival: boolean;
  isSpecialOffer: boolean;
  isFeatured: boolean;
  variants: ShopVariant[];
};

export type ShopCategory = {
  id: number;
  nameAr: string;
  nameEn: string | null;
  slug: string;
  descriptionAr: string | null;
  imageUrl: string | null;
};
