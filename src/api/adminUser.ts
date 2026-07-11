import { api } from './client';

// BE enums — UPPERCASE (UserResponse.java)
export type UserProvider   = 'GOOGLE' | 'FACEBOOK' | 'PHONE' | 'EMAIL';
export type AccountStatus  = 'ACTIVE' | 'INACTIVE';

// Mirrors com.tuni3d.module.user.dto.UserResponse
export interface AdminUserProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatarUrl: string | null;
  provider: UserProvider;
  status: AccountStatus;
  orderCount: number;
  createdAt: string;            // ISO timestamp
}

// Mirrors com.tuni3d.common.response.PageResponse
export interface PageResponse<T> {
  items: T[];
  page: number;                 // 1-based
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface UpdateUserStatusRequest {
  status: AccountStatus;
}

export const adminUserApi = {
  list: (params: { page?: number; size?: number; search?: string } = {}) => {
    const q = new URLSearchParams();
    if (params.page  !== undefined) q.set('page',   String(params.page));
    if (params.size  !== undefined) q.set('size',   String(params.size));
    if (params.search)              q.set('search', params.search);
    const qs = q.toString();
    return api.get<PageResponse<AdminUserProfile>>(`/api/admin/users${qs ? '?' + qs : ''}`);
  },

  getById: (id: string) =>
    api.get<AdminUserProfile>(`/api/admin/users/${id}`),

  updateStatus: (id: string, body: UpdateUserStatusRequest) =>
    api.put<AdminUserProfile>(`/api/admin/users/${id}/status`, body),

  delete: (id: string) =>
    api.delete<null>(`/api/admin/users/${id}`),
};
