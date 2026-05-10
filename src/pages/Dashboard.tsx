import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, formatPrice } from '../data/mock';
import { adminUserApi } from '../api/adminUser';
import { productApi, type AdminProduct } from '../api/product';
import type { Order } from '../types';

const STATUS_LABEL: Record<string, string> = {
  pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
  shipped: 'Đang giao', delivered: 'Đã giao',
};
const STATUS_CLS: Record<string, string> = {
  pending: 'badge-warning', confirmed: 'badge-info',
  shipped: 'badge-primary', delivered: 'badge-success',
};
const PAY_LABEL: Record<string, string> = { cod: 'COD', bank: 'Chuyển khoản', ewallet: 'Ví điện tử' };

export const Dashboard = () => {
  const orders: Order[] = useMemo(() => getOrders(), []);
  const [userTotal, setUserTotal]       = useState<number | null>(null);
  const [productTotal, setProductTotal] = useState<number | null>(null);
  const [productSample, setProductSample] = useState<AdminProduct[]>([]);

  useEffect(() => {
    let cancelled = false;
    adminUserApi.list({ page: 1, size: 1 })
      .then((res) => { if (!cancelled) setUserTotal(res.totalElements); })
      .catch(() => { if (!cancelled) setUserTotal(0); });
    // Single fetch: dùng size=100 để đủ data cho chart + lấy totalElements
    productApi.list({ page: 1, size: 100 })
      .then((res) => {
        if (cancelled) return;
        setProductTotal(res.totalElements);
        setProductSample(res.items);
      })
      .catch(() => { if (!cancelled) { setProductTotal(0); setProductSample([]); } });
    return () => { cancelled = true; };
  }, []);

  const revenue     = orders.reduce((s, o) => s + o.total, 0);
  const pending     = orders.filter((o) => o.status === 'pending').length;
  const recentOrders = orders.slice(0, 5);

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
            <p className="stat-value">{productTotal ?? '—'}</p>
            <p className="stat-sub">{Object.keys(categoryCounts).length} danh mục (DB thật)</p>
          </div>
        </div>
        <div className="adm-stat-card" style={{ '--accent': '#f59e0b' } as React.CSSProperties}>
          <div className="stat-icon">🛍️</div>
          <div className="stat-body">
            <p className="stat-label">Đơn chờ xử lý</p>
            <p className="stat-value">{pending}</p>
            <p className="stat-sub">{orders.length} tổng đơn</p>
          </div>
        </div>
        <div className="adm-stat-card" style={{ '--accent': '#2faa6b' } as React.CSSProperties}>
          <div className="stat-icon">👥</div>
          <div className="stat-body">
            <p className="stat-label">Người dùng</p>
            <p className="stat-value">{userTotal ?? '—'}</p>
            <p className="stat-sub">Tổng đăng ký (DB thật)</p>
          </div>
        </div>
        <div className="adm-stat-card" style={{ '--accent': '#3b82f6' } as React.CSSProperties}>
          <div className="stat-icon">💰</div>
          <div className="stat-body">
            <p className="stat-label">Doanh thu</p>
            <p className="stat-value">{orders.length > 0 ? formatPrice(revenue) : '—'}</p>
            <p className="stat-sub">Từ tất cả đơn hàng</p>
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
          {recentOrders.length === 0 ? (
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
                  {recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td><code>{o.id}</code></td>
                      <td>{o.customer.firstName} {o.customer.lastName}</td>
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

        {/* Category breakdown */}
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
            {(['pending', 'confirmed', 'shipped', 'delivered'] as const).map((s) => {
              const count = orders.filter((o) => o.status === s).length;
              return (
                <div key={s} className="status-row">
                  <span className={`adm-badge ${STATUS_CLS[s]}`}>{STATUS_LABEL[s]}</span>
                  <span className="status-count">{count} đơn</span>
                </div>
              );
            })}
            <div className="status-row" style={{ marginTop: '.5rem', borderTop: '1px solid var(--adm-border)', paddingTop: '.5rem' }}>
              <span style={{ fontSize: '.85rem', color: 'var(--adm-text-muted)' }}>Thanh toán</span>
            </div>
            {(['cod', 'bank', 'ewallet'] as const).map((p) => {
              const count = orders.filter((o) => o.paymentMethod === p).length;
              return (
                <div key={p} className="status-row">
                  <span style={{ fontSize: '.875rem' }}>{PAY_LABEL[p]}</span>
                  <span className="status-count">{count} đơn</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
