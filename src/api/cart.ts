export type BackendCartItem = {
  id: number;
  variant_id: number;
  sku: string;
  price: string;
  old_price: string | null;
  stock: number;
  variant_is_active: boolean;
  product_id: number;
  product_slug: string;
  quantity: number;
  total_price: string;
  added_at: string;
};

export type BackendCart = {
  id: number;
  items: BackendCartItem[];
  total_items: number;
  total_quantity: number;
  total_price: string;
  created_at: string;
  updated_at: string;
};

export type AuthedRequest = <T>(path: string, init?: RequestInit) => Promise<T>;

export async function getCart(request: AuthedRequest): Promise<BackendCart> {
  return request<BackendCart>('/api/auth/cart/', { method: 'GET' });
}

export async function clearCart(request: AuthedRequest): Promise<BackendCart> {
  return request<BackendCart>('/api/auth/cart/clear/', { method: 'DELETE' });
}

export async function bulkAddToCart(
  request: AuthedRequest,
  items: Array<{ variant_id: number; quantity: number }>,
): Promise<BackendCart> {
  return request<BackendCart>('/api/auth/cart/items/bulk-add/', {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}
