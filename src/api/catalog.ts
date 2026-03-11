import { API_BASE_URL, requestJson } from './client';

export type BackendCategoryNode = {
  id: number;
  slug: string;
  parent: number | null;
  order: number;
  name: string | null;
  children: BackendCategoryNode[];
};

export type BackendBrand = {
  id: number;
  slug: string;
  name: string | null;
};

export type BackendProductListItem = {
  id: number;
  slug: string;
  category: number;
  brand: number | null;
  is_active: boolean;
  min_price: string | number | null;
  name: string | null;
  description: string | null;
  main_image: { id: number; image: string; alt: string | null; is_main: boolean; order: number; variant_id: number | null } | null;

  // Added on backend (we'll support if present)
  category_slug?: string | null;
  category_name?: string | null;
  brand_slug?: string | null;
  brand_name?: string | null;
};

export type BackendPaginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type BackendProductDetail = BackendProductListItem & {
  variants: Array<{
    id: number;
    sku: string;
    price: string | number;
    old_price: string | number | null;
    stock: number;
    is_active: boolean;
    is_default: boolean;
    attributes: Array<{
      attribute_slug: string;
      attribute_id: number;
      value_id: number;
      value: string | number | boolean | null;
      value_name: string | null;
    }>;
    images: Array<{ id: number; image: string; alt: string | null; is_main: boolean; order: number; variant_id: number | null }>;
  }>;
  images: Array<{ id: number; image: string; alt: string | null; is_main: boolean; order: number; variant_id: number | null }>;
  created_at: string;
  updated_at: string;
};

export function withBaseUrl(urlOrPath: string | null | undefined): string | null {
  if (!urlOrPath) return null;
  if (/^https?:\/\//i.test(urlOrPath)) return urlOrPath;
  return `${API_BASE_URL}${urlOrPath.startsWith('/') ? '' : '/'}${urlOrPath}`;
}

export async function getCategoryTree(params?: { lang?: string }): Promise<BackendCategoryNode[]> {
  const lang = params?.lang ?? 'ru';
  return requestJson<BackendCategoryNode[]>(`/api/v1/categories/?lang=${encodeURIComponent(lang)}`);
}

export async function getBrands(params?: { lang?: string; limit?: number; offset?: number }): Promise<BackendPaginated<BackendBrand>> {
  const lang = params?.lang ?? 'ru';
  const limit = params?.limit ?? 100;
  const offset = params?.offset ?? 0;
  return requestJson<BackendPaginated<BackendBrand>>(
    `/api/v1/brands/?lang=${encodeURIComponent(lang)}&limit=${encodeURIComponent(String(limit))}&offset=${encodeURIComponent(String(offset))}`,
  );
}

export async function getAllBrands(params?: { lang?: string; limit?: number }): Promise<BackendBrand[]> {
  const lang = params?.lang ?? 'ru';
  const pageSize = Math.min(Math.max(params?.limit ?? 100, 1), 100);

  let offset = 0;
  const all: BackendBrand[] = [];
  for (let guard = 0; guard < 50; guard++) {
    const page = await getBrands({ lang, limit: pageSize, offset });
    all.push(...page.results);
    offset += page.results.length;
    if (!page.next || page.results.length === 0) break;
  }
  return all;
}

export type GetProductsParams = {
  lang?: string;
  limit?: number;
  offset?: number;
  search?: string;
  category?: string; // slug
  brand?: string; // slug
  priceMin?: string | number;
  priceMax?: string | number;
  ordering?: string;
};

export async function getProducts(params?: GetProductsParams): Promise<BackendPaginated<BackendProductListItem>> {
  const lang = params?.lang ?? 'ru';
  const limit = params?.limit ?? 40;
  const offset = params?.offset ?? 0;

  const qp = new URLSearchParams();
  qp.set('lang', lang);
  qp.set('limit', String(limit));
  qp.set('offset', String(offset));

  if (params?.search?.trim()) qp.set('search', params.search.trim());
  if (params?.category?.trim()) qp.set('category', params.category.trim());
  if (params?.brand?.trim()) qp.set('brand', params.brand.trim());
  if (params?.ordering?.trim()) qp.set('ordering', params.ordering.trim());

  if (params?.priceMin !== undefined && String(params.priceMin).trim()) qp.set('price[min]', String(params.priceMin).trim());
  if (params?.priceMax !== undefined && String(params.priceMax).trim()) qp.set('price[max]', String(params.priceMax).trim());

  return requestJson<BackendPaginated<BackendProductListItem>>(`/api/v1/products/?${qp.toString()}`);
}

export async function getProductDetail(slug: string, params?: { lang?: string }): Promise<BackendProductDetail> {
  const lang = params?.lang ?? 'ru';
  return requestJson<BackendProductDetail>(`/api/v1/products/${encodeURIComponent(slug)}/?lang=${encodeURIComponent(lang)}`);
}
