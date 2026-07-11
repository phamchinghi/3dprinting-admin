import { api } from './client';

// Mirrors com.tuni3d.module.category.dto.CategoryResponse
export interface Category {
  id: string;
  slug: string;
  nameVi: string;
  nameEn: string;
  iconEmoji: string | null;
  descriptionVi: string | null;
  descriptionEn: string | null;
  sortOrder: number;
  createdAt: string;
}

// Mirrors CreateCategoryRequest — slug regex enforced server-side
export interface CreateCategoryRequest {
  slug: string;
  nameVi: string;
  nameEn: string;
  iconEmoji?: string;
  descriptionVi?: string;
  descriptionEn?: string;
  sortOrder?: number;
}

// Mirrors UpdateCategoryRequest — partial update; slug intentionally absent
// (BE rejects if client sends slug)
export interface UpdateCategoryRequest {
  nameVi?: string;
  nameEn?: string;
  iconEmoji?: string;
  descriptionVi?: string;
  descriptionEn?: string;
  sortOrder?: number;
}

export const categoryApi = {
  // GET /api/categories — public on BE; admin đã login → gọi qua `api` (Bearer thừa nhưng vô hại)
  list:      ()              => api.get<Category[]>('/api/categories'),
  // BE chỉ expose lookup theo slug (public). Admin Edit page không có endpoint by-id riêng,
  // nên client load list rồi find by id (dataset categories rất nhỏ — không phải vấn đề perf).
  getBySlug: (slug: string)  => api.get<Category>(`/api/categories/${encodeURIComponent(slug)}`),

  create:    (body: CreateCategoryRequest)              => api.post<Category>('/api/admin/categories', body),
  update:    (id: string, body: UpdateCategoryRequest) => api.put<Category>(`/api/admin/categories/${id}`, body),
  delete:    (id: string)                               => api.delete<null>(`/api/admin/categories/${id}`),
};
