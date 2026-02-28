import { CartItem, Product } from '../types/models';

export type CouponCode = 'SAVE5' | 'BEAUTY10' | null;

export const DELIVERY_FEE = 3000;
export const FREE_DELIVERY_THRESHOLD = 50000;

export function getCartLineKey(item: Pick<CartItem, 'productId' | 'selectedSize' | 'selectedColor'>): string {
  return [item.productId, item.selectedSize ?? '', item.selectedColor ?? ''].join('::');
}

export function calcSubtotal(cartItems: CartItem[], products: Product[]): number {
  return cartItems.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.productId);
    return sum + (product?.price ?? 0) * item.qty;
  }, 0);
}

export function calcDiscount(subtotal: number, coupon: CouponCode): number {
  if (!coupon) return 0;
  if (coupon === 'SAVE5') return Math.min(5000, Math.floor(subtotal * 0.05));
  if (coupon === 'BEAUTY10') return Math.min(10000, Math.floor(subtotal * 0.1));
  return 0;
}

export function calcDelivery(subtotal: number): number {
  return subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
}

export function calcTotal(subtotal: number, discount: number, delivery: number): number {
  return Math.max(0, subtotal - discount + delivery);
}
