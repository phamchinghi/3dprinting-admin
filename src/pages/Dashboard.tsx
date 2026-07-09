import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../data/mock';
import { productApi, type AdminProduct } from '../api/product';
import type { AdminOrder, ApiOrderStatus, ApiPaymentMethod } from '../api/order';
import { dashboardApi, type DashboardStats, type OrdersByStatus } from '../api/dashboard';

const STATUS_LABEL: Record<ApiOrderStatus, string> = {
  PENDING: 'Chờ xác nhận', CONFIRMED: 'Đã xác nhận',
  SHIPPED: 'Đang giao',     DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};
const STATUS_CLS: Record<ApiOrderStatus, string> = {
  PENDING: 'badge-warning', CONFIRMED: 'badge-info',
  SHIPPED: 'badge-primary', DELIVERED: 'badge-success',
  CANCELLED: 'badge-danger',
};
const PAY_LABEL: Record<ApiPaymentMethod, string> = { COD: 'COD', BANK: 'Chuyển khoản', EWALLET: 'Ví điện tử' };
const STATUS_ORDER: ApiOrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<AdminOrder[]>([]);
  const [byStatus, setByStatus] = useState<OrdersByStatus | null>(null);
  const [productSample, setProductSample] = useState<AdminProduct[]>([]);

  // 3 endpoints dashboard mới (P1-8) + 1 product fetch để vẫn build chart "Sản phẩm theo danh mục"
  // (BE P1-8 chỉ aggregate count, không expose breakdown theo category — giữ FE-side aggregate).
  useEffect(() => {
    let cancelled = false;
    Promise.all([
      dashboardApi.stats(),
      dashboardApi.recentOrders(5),
      dashboardApi.ordersByStatus(),
    ])
      .then(([s, r, bs]) => {
        if (cancelled) return;
        setStats(s); setRecent(r); setByStatus(bs);
      })
      .catch(() => { if (!cancelled) { setStats(null); setRecent([]); setByStatus(null); } });

    productApi.list({ page: 1, size: 100 })
      .then((res) => { if (!cancelled) setProductSample(res.items); })
      .catch(() => { if (!cancelled) setProductSample([]); });

    return () => { cancelled = true; };
  }, []);

  // Doanh thu pay-method breakdown: BE chưa expose riêng → vẫn aggregate từ recent (5 mẫu, đủ cho overview)
  const recentByPayment = (m: ApiPaymentMethod) => recent.filter((o) => o.paymentMethod === m).length;

  const categoryCounts = productSample.reduce<Record<string, number>>((acc, p) => {
    acc[p.categoryNameVi] = (acc[p.categoryNameVi] ?? 0) + 1;
    return acc;
  }, {});
  const maxCat = Math.max(1, ...Object.values(categoryCounts));

  return (
    <div>
      {/* Stat cards */}
      <div className="adm-stat-grid">
        <div className="adm-stat-card" style={{ '--accent': 'var(--adm-primary)' } as React.CSSProperties}>
          <div className="stat-icon">📦</div>
          <div className="stat-body">
            <p className="stat-label">Tổng sản phẩm</p>
            <p className="stat-value">{stats?.totalProducts ?? '—'}</p>
            <p className="stat-sub">{Object.keys(categoryCounts).length} danh mục (DB thật)</p>
          </div>
        </div>
        <div className="adm-stat-card" style={{ '--accent': '#f59e0b' } as React.CSSProperties}>
          <div className="stat-icon">🛍️</div>
          <div className="stat-body">
            <p className="stat-label">Đơn chờ xử lý</p>
            <p className="stat-value">{stats?.pendingOrders ?? '—'}</p>
            <p className="stat-sub">{stats?.totalOrders ?? '—'} tổng đơn</p>
          </div>
        </div>
        <div className="adm-stat-card" style={{ '--accent': '#2faa6b' } as React.CSSProperties}>
          <div className="stat-icon">👥</div>
          <div className="stat-body">
            <p className="stat-label">Người dùng</p>
            <p className="stat-value">{stats?.totalUsers ?? '—'}</p>
            <p className="stat-sub">Tổng đăng ký (DB thật)</p>
          </div>
        </div>
        <div className="adm-stat-card" style={{ '--accent': '#3b82f6' } as React.CSSProperties}>
          <div className="stat-icon">💰</div>
          <div className="stat-body">
            <p className="stat-label">Doanh thu</p>
            <p className="stat-value">{stats ? formatPrice(stats.totalRevenue) : '—'}</p>
            <p className="stat-sub">Trừ đơn đã hủy (BE compute)</p>
          </div>
        </div>
      </div>

      <div className="adm-dash-grid">
        {/* Recent orders */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3>Đơn hàng gần đây</h3>
            <Link to="/orders" className="adm-link">Xem tất cả →</Link>
          </div>
          {recent.length === 0 ? (
            <div className="adm-empty">
              <span>📭</span>
              <p>Chưa có đơn hàng nào. Hãy đặt thử trên website chính!</p>
            </div>
          ) : (
            <div className="adm-table-wrap">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Khách hàng</th>
                    <th>Tổng tiền</th>
                    <th>Trạng thái</th>
                    <th>Ngày đặt</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => (
                    <tr key={o.id}>
                      <td><code>{o.orderNumber}</code></td>
                      <td>{o.shipping.firstName} {o.shipping.lastName}</td>
                      <td><strong>{formatPrice(o.total)}</strong></td>
                      <td><span className={`adm-badge ${STATUS_CLS[o.status]}`}>{STATUS_LABEL[o.status]}</span></td>
                      <td>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Category breakdown + status summary */}
        <div className="adm-card">
          <div className="adm-card-header">
            <h3>Sản phẩm theo danh mục</h3>
            <Link to="/products" className="adm-link">Quản lý →</Link>
          </div>
          <div className="adm-bar-chart">
            {Object.entries(categoryCounts).map(([label, count]) => (
              <div key={label} className="bar-row">
                <span className="bar-label">{label}</span>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${(count / maxCat) * 100}%` }} />
                </div>
                <span className="bar-count">{count}</span>
              </div>
            ))}
          </div>

          <div className="adm-card-header" style={{ marginTop: '1.5rem' }}>
            <h3>Đơn hàng theo trạng thái</h3>
          </div>
          <div className="adm-status-summary">
            {STATUS_ORDER.map((s) => {
              const count = byStatus?.[s] ?? 0;
              return (
                <div key={s} className="status-row">
                  <span className={`adm-badge ${STATUS_CLS[s]}`}>{STATUS_LABEL[s]}</span>
                  <span className="status-count">{count} đơn</span>
                </div>
              );
            })}
            <div className="status-row" style={{ marginTop: '.5rem', borderTop: '1px solid var(--adm-border)', paddingTop: '.5rem' }}>
              <span style={{ fontSize: '.85rem', color: 'var(--adm-text-muted)' }}>Thanh toán (5 đơn gần đây)</span>
            </div>
            {(['COD', 'BANK', 'EWALLET'] as const).map((p) => (
              <div key={p} className="status-row">
                <span style={{ fontSize: '.875rem' }}>{PAY_LABEL[p]}</span>
                <span className="status-count">{recentByPayment(p)} đơn</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
