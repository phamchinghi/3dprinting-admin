import { api } from './client';

// BE enums (UPPERCASE) — mirror com.tini3d.common.enums.ProductBadge
export type ProductBadge = 'NEW' | 'HOT' | 'SALE';
export type ProductSort  = 'price_asc' | 'price_desc' | 'rating_desc' | 'created_desc';

// Mirrors com.tini3d.module.product.dto.ProductResponse
export interface AdminProduct {
  id: string;
  slug: string;
  name: string;
  categoryId: string;
  categorySlug: string;
  categoryNameVi: string;
  categoryNameEn: string;
  price: number;
  oldPrice: number | null;
  badge: ProductBadge | null;
  description: string;
  longDescription: string | null;
  material: string | null;
  dimensions: string | null;
  inStock: boolean;
  rating: string;            // BigDecimal serialized as string
  reviewCount: number;
  images: string[];          // ordered list of image URLs
  videoUrl: string | null;
  isActive: boolean;
  tags: string[];
  createdAt: string;
}

// Mirrors com.tini3d.common.response.PageResponse — BE uses `items` (NOT `content`)
export interface PageResponse<T> {
  items: T[];
  page: number;              // 1-based
  size: number;
  totalElements: number;
  totalPages: number;
}

// Mirrors com.tini3d.module.product.dto.CreateProductRequest
// BE validates: slug ^[a-z0-9-]+$ · name NotBlank · categoryId NotNull · price Positive
export interface CreateProductRequest {
  slug: string;
  name: string;
  categoryId: string;
  price: number;
  oldPrice?: number;
  badge?: ProductBadge;
  description?: string;
  longDescription?: string;
  material?: string;
  dimensions?: string;
  inStock?: boolean;
  images?: string[];
  videoUrl?: string;
  isActive?: boolean;
}

// Mirrors UpdateProductRequest — partial; BE rejects `slug` if present
export interface UpdateProductRequest {
  name?: string;
  categoryId?: string;
  price?: number;
  oldPrice?: number | null;
  badge?: ProductBadge | null;
  description?: string;
  longDescription?: string;
  material?: string;
  dimensions?: string;
  inStock?: boolean;
  images?: string[];        // null=skip, []=clear, [...]=replace
  videoUrl?: string;
  isActive?: boolean;
}

export interface ListProductsParams {
  page?: number;
  size?: number;
  category?: string;
  badge?: ProductBadge;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
}

const buildQs = (params: Record<string, string | number | undefined | null>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
};

export const productApi = {
  // BE chỉ expose public list (active=true). Admin chấp nhận hạn chế này — chỉ
  // quản lý product đang active. Inactive product sẽ không hiện trên trang Products.
  list: (p: ListProductsParams = {}) =>
    api.get<PageResponse<AdminProduct>>(`/api/products${buildQs(p as Record<string, string | number | undefined | null>)}`),

  search: (q: string, page = 1, size = 20) =>
    api.get<PageResponse<AdminProduct>>(`/api/products/search${buildQs({ q, page, size })}`),

  // BE chỉ có by-slug (public). Admin không có by-id endpoint riêng — page Edit
  // load qua list rồi find by id (giống Categories.tsx).
  getBySlug: (slug: string) =>
    api.get<AdminProduct>(`/api/products/${encodeURIComponent(slug)}`),

  create: (body: CreateProductRequest) =>
    api.post<AdminProduct>('/api/admin/products', body),

  update: (id: string, body: UpdateProductRequest) =>
    api.put<AdminProduct>(`/api/admin/products/${id}`, body),

  delete: (id: string) =>
    api.delete<null>(`/api/admin/products/${id}`),

  addTag: (productId: string, tag: string) =>
    api.post<AdminProduct>(`/api/admin/products/${productId}/tags`, { tag }),

  deleteTag: (productId: string, tag: string) =>
    api.delete<AdminProduct>(`/api/admin/products/${productId}/tags/${encodeURIComponent(tag)}`),
};
