export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface Product {
  id: string;
  title: string;
  brand: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  tags: string[];
  categoryId: string;
  isNew: boolean;
  isSale: boolean;
  stockStatus: StockStatus;
}

export interface Category {
  id: string;
  title: string;
  iconName: string;
}

export interface CartItem {
  productId: string;
  qty: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface OrderLineItem {
  id?: string;
  productId?: string;
  productName?: string;
  sku?: string;
  qty: number;
  price: number;
  lineTotal?: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  items: OrderLineItem[];
  totalItems?: number;
  total: number;
  status: 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  discount?: number;
  deliveryFee?: number;
  couponCode?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  deliveryMethod?: string;
}
