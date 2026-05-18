import { api } from './client';

// Mirrors com.tini3d.module.blog.dto.BlogCategoryResponse
export interface ApiBlogCategory {
  id: string;
  slug: string;
  name: string;
}

// Mirrors com.tini3d.module.blog.dto.BlogPostResponse
export interface AdminBlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  emoji: string | null;
  categoryId: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  authorId: string | null;
  authorName: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Mirrors com.tini3d.common.response.PageResponse — items field
export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Mirrors com.tini3d.module.blog.dto.CreateBlogPostRequest — BE validates slug regex ^[a-z0-9-]+$
export interface CreateBlogPostRequest {
  slug: string;
  title: string;
  excerpt?: string;
  content?: string;
  emoji?: string;
  categoryId?: string;
  isPublished?: boolean;
}

// Mirrors UpdateBlogPostRequest — partial; BE rejects `slug` if present
export interface UpdateBlogPostRequest {
  title?: string;
  excerpt?: string;
  content?: string;
  emoji?: string;
  categoryId?: string;
}

export interface ListPostsParams {
  page?: number;
  size?: number;
  isPublished?: boolean;
}

const buildQs = (params: Record<string, string | number | boolean | undefined | null>) => {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') sp.set(k, String(v));
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
};

export const blogApi = {
  // Admin list — bao gồm cả draft. BE: GET /api/admin/blog
  list: (p: ListPostsParams = {}) =>
    api.get<PageResponse<AdminBlogPost>>(`/api/admin/blog${buildQs(p as Record<string, string | number | boolean | undefined | null>)}`),

  getById: (id: string) =>
    api.get<AdminBlogPost>(`/api/admin/blog/${id}`),

  create: (body: CreateBlogPostRequest) =>
    api.post<AdminBlogPost>('/api/admin/blog', body),

  update: (id: string, body: UpdateBlogPostRequest) =>
    api.put<AdminBlogPost>(`/api/admin/blog/${id}`, body),

  setPublish: (id: string, isPublished: boolean) =>
    api.put<AdminBlogPost>(`/api/admin/blog/${id}/publish`, { isPublished }),

  delete: (id: string) =>
    api.delete<null>(`/api/admin/blog/${id}`),

  // Categories từ public endpoint — admin đã login, Bearer thừa nhưng vô hại (giống pattern category.ts)
  listCategories: () =>
    api.get<ApiBlogCategory[]>('/api/blog/categories'),
};
