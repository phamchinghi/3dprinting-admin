import { api } from './client';
import type { AdminOrder, ApiOrderStatus } from './order';

// Mirrors com.tini3d.module.dashboard.dto.DashboardStatsResponse
export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;        // chỉ active products
  totalBlogPosts: number;       // bao gồm draft
  publishedBlogPosts: number;
}

// BE trả Map<OrderStatus, Long> — Jackson serialize thành { PENDING: 5, CONFIRMED: 3, ... }
export type OrdersByStatus = Record<ApiOrderStatus, number>;

export const dashboardApi = {
  stats: () =>
    api.get<DashboardStats>('/api/admin/dashboard/stats'),

  recentOrders: (limit = 5) =>
    api.get<AdminOrder[]>(`/api/admin/dashboard/recent-orders?limit=${limit}`),

  ordersByStatus: () =>
    api.get<OrdersByStatus>('/api/admin/dashboard/orders-by-status'),
};
