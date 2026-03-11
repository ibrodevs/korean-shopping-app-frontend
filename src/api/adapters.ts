import { Category, Product, StockStatus } from '../types/models';
import {
  BackendBrand,
  BackendCategoryNode,
  BackendProductDetail,
  BackendProductListItem,
  withBaseUrl,
} from './catalog';

const CATEGORY_ICON_BY_SLUG: Record<string, string> = {
  cosmetics: 'sparkles-outline',
  skincare: 'water-outline',
  snacks: 'restaurant-outline',
  fashion: 'shirt-outline',
  accessories: 'watch-outline',
  stationery: 'create-outline',
  home: 'home-outline',
  wellness: 'leaf-outline',
};

export function flattenCategoryTree(nodes: BackendCategoryNode[]): BackendCategoryNode[] {
  const out: BackendCategoryNode[] = [];
  const walk = (items: BackendCategoryNode[]) => {
    for (const item of items) {
      out.push(item);
      if (item.children?.length) walk(item.children);
    }
  };
  walk(nodes);
  return out;
}

export function mapBackendCategoryToUiCategory(node: BackendCategoryNode): Category {
  return {
    id: node.slug,
    title: node.name ?? node.slug,
    iconName: CATEGORY_ICON_BY_SLUG[node.slug] ?? 'apps-outline',
  };
}

export function buildCategoryIdToSlugMap(nodes: BackendCategoryNode[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const node of flattenCategoryTree(nodes)) {
    map.set(node.id, node.slug);
  }
  return map;
}

export function buildCategoryIdToNameMap(nodes: BackendCategoryNode[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const node of flattenCategoryTree(nodes)) {
    map.set(node.id, node.name ?? node.slug);
  }
  return map;
}

export function buildBrandIdToNameMap(brands: BackendBrand[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const b of brands) {
    map.set(b.id, b.name ?? b.slug);
  }
  return map;
}

function toNumber(value: string | number | null | undefined): number {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function inferStockStatus(detail?: BackendProductDetail): StockStatus {
  if (!detail?.variants?.length) return 'in_stock';
  const totalStock = detail.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0);
  if (totalStock <= 0) return 'out_of_stock';
  if (totalStock <= 5) return 'low_stock';
  return 'in_stock';
}

export function mapBackendProductListItemToUiProduct(params: {
  item: BackendProductListItem;
  categoryIdToSlug?: Map<number, string>;
  brandIdToName?: Map<number, string>;
}): Product {
  const { item, categoryIdToSlug, brandIdToName } = params;

  const imageUrl = withBaseUrl(item.main_image?.image) ?? 'https://picsum.photos/seed/placeholder/900/900';
  const categorySlug =
    item.category_slug ??
    (typeof item.category === 'number' ? categoryIdToSlug?.get(item.category) : undefined) ??
    String(item.category ?? '');

  const brandName =
    item.brand_name ??
    (item.brand != null ? brandIdToName?.get(item.brand) : undefined) ??
    item.brand_slug ??
    (item.brand ? String(item.brand) : '') ??
    'Brand';

  return {
    id: item.slug,
    title: item.name ?? item.slug,
    brand: brandName,
    price: toNumber(item.min_price),
    oldPrice: undefined,
    rating: 0,
    reviewCount: 0,
    images: [imageUrl],
    tags: [],
    categoryId: categorySlug || 'all',
    isNew: false,
    isSale: false,
    stockStatus: 'in_stock',
  };
}

export function mapBackendProductDetailToUiProduct(params: {
  item: BackendProductDetail;
  categoryIdToSlug?: Map<number, string>;
  brandIdToName?: Map<number, string>;
}): Product {
  const base = mapBackendProductListItemToUiProduct(params);

  const gallery = [
    ...params.item.images.map((img) => withBaseUrl(img.image)).filter(Boolean),
    ...params.item.variants.flatMap((v) => v.images.map((img) => withBaseUrl(img.image)).filter(Boolean)),
  ].filter((x): x is string => typeof x === 'string');

  const stockStatus = inferStockStatus(params.item);

  const defaultVariant = params.item.variants.find((v) => v.is_default) ?? params.item.variants[0];
  const variantPrice = defaultVariant ? toNumber(defaultVariant.price) : base.price;
  const variantOldPrice = defaultVariant?.old_price ? toNumber(defaultVariant.old_price) : undefined;

  return {
    ...base,
    price: variantPrice,
    oldPrice: variantOldPrice,
    images: gallery.length ? gallery : base.images,
    stockStatus,
    isSale: Boolean(variantOldPrice && variantOldPrice > variantPrice),
  };
}
