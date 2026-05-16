import { api } from './client';

// BE enums (UPPERCASE) — mirror com.tini3d.common.enums.OrderStatus + PaymentMethod
export type ApiOrderStatus    = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type ApiPaymentMethod  = 'COD' | 'BANK' | 'EWALLET';

// Mirrors com.tini3d.module.order.dto.OrderShippingResponse
export interface ApiOrderShipping {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  address: string;
  district: string | null;
  province: string;
}

// Mirrors com.tini3d.module.order.dto.OrderItemResponse
export interface ApiOrderItem {
  id: string;
  productId: string | null;     // null nếu product đã bị xóa
  productName: string;
  productEmoji: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// Mirrors com.tini3d.module.order.dto.OrderResponse
export interface AdminOrder {
  id: string;
  orderNumber: string;
  userId: string | null;
  status: ApiOrderStatus;
  paymentMethod: ApiPaymentMethod;
  subtotal: number;
  shippingFee: number;
  total: number;
  note: string | null;
  shipping: ApiOrderShipping;
  items: ApiOrderItem[];
  createdAt: string;
}

// Mirrors com.tini3d.common.response.PageResponse — BE uses `items`
export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface ListOrdersParams {
  page?: number;
  size?: number;
  status?: ApiOrderStatus;
  fromDate?: string;        // ISO date yyyy-MM-dd
  toDate?: string;          // ISO date yyyy-MM-dd
}

const buildQs = (params: Record<string, string | number | undefined | null>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
};

export const orderApi = {
  list: (p: ListOrdersParams = {}) =>
    api.get<PageResponse<AdminOrder>>(`/api/admin/orders${buildQs(p as Record<string, string | number | undefined | null>)}`),

  getById: (id: string) =>
    api.get<AdminOrder>(`/api/admin/orders/${id}`),

  updateStatus: (id: string, status: ApiOrderStatus) =>
    api.put<AdminOrder>(`/api/admin/orders/${id}/status`, { status }),

  delete: (id: string) =>
    api.delete<null>(`/api/admin/orders/${id}`),
};
