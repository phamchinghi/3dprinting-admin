import { useState } from 'react';
import { getOrders, saveOrders, formatPrice } from '../data/mock';
import { Modal } from '../components/Modal';
import type { Order, OrderStatus } from '../types';

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận', confirmed: 'Đã xác nhận',
  shipped: 'Đang giao', delivered: 'Đã giao',
};
const STATUS_CLS: Record<OrderStatus, string> = {
  pending: 'badge-warning', confirmed: 'badge-info',
  shipped: 'badge-primary', delivered: 'badge-success',
};
const PAY_LABEL: Record<string, string> = { cod: 'COD', bank: 'Chuyển khoản', ewallet: 'Ví điện tử' };
const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'shipped', 'delivered'];

export const Orders = () => {
  const [orders, setOrders]     = useState<Order[]>(() => getOrders());
  const [search, setSearch]     = useState('');
  const [filterStatus, setFilter] = useState<string>('all');
  const [viewItem, setViewItem] = useState<Order | null>(null);
  const [deleteItem, setDelete] = useState<Order | null>(null);

  const filtered = orders.filter((o) => {
    const name = `${o.customer.firstName} ${o.customer.lastName}`.toLowerCase();
    const matchSearch = o.id.toLowerCase().includes(search.toLowerCase()) || name.includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = (id: string, status: OrderStatus) => {
    const updated = orders.map((o) => o.id === id ? { ...o, status } : o);
    setOrders(updated);
    saveOrders(updated);
    if (viewItem?.id === id) setViewItem((prev) => prev ? { ...prev, status } : prev);
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    const updated = orders.filter((o) => o.id !== deleteItem.id);
    setOrders(updated);
    saveOrders(updated);
    setDelete(null);
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h2>Đơn hàng</h2>
          <p className="adm-page-sub">{orders.length} đơn từ website · Dữ liệu thực từ localStorage</p>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <input
            className="adm-search"
            placeholder="🔍 Tìm mã đơn hoặc tên khách..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="adm-select" value={filterStatus} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Tất cả trạng thái</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <span className="adm-count">{filtered.length} / {orders.length}</span>
        </div>

        {orders.length === 0 ? (
          <div className="adm-empty">
            <span>📭</span>
            <p>Chưa có đơn hàng. Thử đặt hàng trên website TiNi 3D Store trước!</p>
          </div>
        ) : (
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Tổng tiền</th>
                  <th>Thanh toán</th>
                  <th>Trạng thái</th>
                  <th>Ngày đặt</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((o) => (
                  <tr key={o.id}>
                    <td><code className="adm-code">{o.id}</code></td>
                    <td>
                      <strong>{o.customer.firstName} {o.customer.lastName}</strong>
                      <div className="adm-muted adm-small">{o.customer.phone}</div>
                    </td>
                    <td>
                      <span className="adm-tag">{o.items.length} sp</span>
                    </td>
                    <td><strong>{formatPrice(o.total)}</strong></td>
                    <td>{PAY_LABEL[o.paymentMethod]}</td>
                    <td>
                      <select
                        className={`adm-status-select ${STATUS_CLS[o.status]}`}
                        value={o.status}
                        onChange={(e) => handleStatusChange(o.id, e.target.value as OrderStatus)}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                      </select>
                    </td>
                    <td className="adm-muted">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <div className="adm-actions">
                        <button className="adm-btn adm-btn-sm adm-btn-ghost" onClick={() => setViewItem(o)}>👁️ Chi tiết</button>
                        <button className="adm-btn adm-btn-sm adm-btn-danger-ghost" onClick={() => setDelete(o)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title={`Chi tiết đơn hàng — ${viewItem?.id ?? ''}`}
        size="lg"
      >
        {viewItem && (
          <div>
            <div className="adm-detail-grid">
              <div>
                <p className="adm-detail-label">Khách hàng</p>
                <p><strong>{viewItem.customer.firstName} {viewItem.customer.lastName}</strong></p>
                <p className="adm-muted">{viewItem.customer.phone}</p>
                <p className="adm-muted">{viewItem.customer.email}</p>
              </div>
              <div>
                <p className="adm-detail-label">Địa chỉ giao hàng</p>
                <p>{viewItem.customer.address}</p>
                <p className="adm-muted">{viewItem.customer.district}, {viewItem.customer.province}</p>
              </div>
              <div>
                <p className="adm-detail-label">Thanh toán</p>
                <p><strong>{PAY_LABEL[viewItem.paymentMethod]}</strong></p>
                <p className="adm-muted">Ngày đặt: {new Date(viewItem.createdAt).toLocaleString('vi-VN')}</p>
              </div>
              <div>
                <p className="adm-detail-label">Trạng thái</p>
                <select
                  className={`adm-status-select ${STATUS_CLS[viewItem.status]}`}
                  value={viewItem.status}
                  onChange={(e) => handleStatusChange(viewItem.id, e.target.value as OrderStatus)}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
            </div>

            <div className="adm-detail-items">
              <p className="adm-detail-label">Sản phẩm</p>
              {viewItem.items.map(({ product, quantity }) => (
                <div key={product.id} className="adm-order-item-row">
                  <span>{product.emoji}</span>
                  <span className="flex-1">{product.name}</span>
                  <span className="adm-muted">× {quantity}</span>
                  <strong>{formatPrice(product.price * quantity)}</strong>
                </div>
              ))}
              <div className="adm-order-totals">
                <div className="total-row"><span>Tạm tính</span><span>{formatPrice(viewItem.subtotal)}</span></div>
                <div className="total-row"><span>Phí vận chuyển</span><span>{formatPrice(viewItem.shipping)}</span></div>
                <div className="total-row total-final"><span>Tổng cộng</span><strong>{formatPrice(viewItem.total)}</strong></div>
              </div>
            </div>
            {viewItem.customer.note && (
              <div className="adm-note"><strong>Ghi chú:</strong> {viewItem.customer.note}</div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteItem}
        onClose={() => setDelete(null)}
        title="Xác nhận xóa đơn hàng"
        size="sm"
        footer={
          <div className="modal-footer-actions">
            <button className="adm-btn adm-btn-ghost" onClick={() => setDelete(null)}>Hủy</button>
            <button className="adm-btn adm-btn-danger" onClick={handleDelete}>Xóa đơn hàng</button>
          </div>
        }
      >
        <p>Bạn có chắc muốn xóa đơn hàng <strong>{deleteItem?.id}</strong>?</p>
        <p className="adm-muted">Thao tác này không thể hoàn tác và sẽ xóa dữ liệu khỏi localStorage.</p>
      </Modal>
    </div>
  );
};
