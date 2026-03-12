export type BackendOrderListItem = {
  id: number;
  uuid: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  delivery_method: string;
  total_amount: string;
  total_items: number;
  created_at: string;
};

export type BackendOrderItem = {
  id: number;
  product_name: string;
  sku: string;
  unit_price: string;
  quantity: number;
  line_total: string;
};

export type BackendOrderDetail = {
  id: number;
  uuid: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  delivery_method: string;

  customer_email: string;
  customer_phone: string;
  first_name: string;
  last_name: string;
  full_name: string;

  country: string;
  city: string;
  address_line1: string;
  address_line2: string;
  postal_code: string;
  full_address: string;
  delivery_comment: string;

  subtotal: string;
  shipping_cost: string;
  discount_amount: string;
  total_amount: string;

  notes: string;
  total_items: number;
  items: BackendOrderItem[];

  paid_at: string | null;
  confirmed_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  canceled_at: string | null;
  created_at: string;
  updated_at: string;
};

export type BackendPaginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type AuthedRequest = <T>(path: string, init?: RequestInit) => Promise<T>;

export async function listMyOrders(
  request: AuthedRequest,
  params?: { status?: string; payment_status?: string },
): Promise<BackendPaginated<BackendOrderListItem>> {
  const qp = new URLSearchParams();
  if (params?.status) qp.set('status', params.status);
  if (params?.payment_status) qp.set('payment_status', params.payment_status);
  const suffix = qp.toString() ? `?${qp.toString()}` : '';
  return request<BackendPaginated<BackendOrderListItem>>(`/api/v1/orders/${suffix}`, { method: 'GET' });
}

export async function getMyOrderDetail(request: AuthedRequest, orderId: number): Promise<BackendOrderDetail> {
  return request<BackendOrderDetail>(`/api/v1/orders/${encodeURIComponent(String(orderId))}/`, { method: 'GET' });
}

export async function cancelMyOrder(
  request: AuthedRequest,
  orderId: number,
  params?: { reason?: string },
): Promise<BackendOrderDetail> {
  return request<BackendOrderDetail>(`/api/v1/orders/${encodeURIComponent(String(orderId))}/cancel/`, {
    method: 'POST',
    body: JSON.stringify({ reason: params?.reason ?? '' }),
  });
}

export async function checkoutOrderFromCart(
  request: AuthedRequest,
  payload: {
    customer_phone: string;
    first_name: string;
    last_name?: string;
    city: string;
    address_line1: string;
    address_line2?: string;
    postal_code?: string;
    delivery_comment?: string;
    delivery_method: 'courier' | 'pickup';
    payment_method: 'cash' | 'card' | 'mbank' | 'elqr';
  },
): Promise<BackendOrderDetail> {
  return request<BackendOrderDetail>('/api/v1/orders/checkout/', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
