import { StockStatus } from './models';

export type CatalogSortOption = 'popular' | 'newest' | 'price_asc' | 'price_desc';

export type CatalogFilters = {
  minPrice: string;
  maxPrice: string;
  ratingMin: 0 | 3 | 4;
  tags: string[];
  inStockOnly: boolean;
  saleOnly: boolean;
};

export type SearchRecentItem = string;

export const defaultCatalogFilters: CatalogFilters = {
  minPrice: '',
  maxPrice: '',
  ratingMin: 0,
  tags: [],
  inStockOnly: false,
  saleOnly: false,
};

export const STOCK_FILTER_VALUES: StockStatus[] = ['in_stock', 'low_stock', 'out_of_stock'];
