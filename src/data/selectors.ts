import { categories, products } from './mockData';

export const getCategoryById = (id?: string | null) =>
  categories.find((category) => category.id === id);

export const getProductById = (id: string) => products.find((product) => product.id === id);

export const hotDeals = products.filter((p) => p.isSale).slice(0, 8);
export const newArrivals = products.filter((p) => p.isNew).slice(0, 10);
