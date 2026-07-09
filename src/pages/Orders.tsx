import { useEffect, useState } from 'react';
import { formatPrice } from '../data/mock';
import { Modal } from '../components/Modal';
import { orderApi, type AdminOrder, type ApiOrderStatus } from '../api/order';
import { ApiError } from '../api/client';
import { useToast } from '../context/ToastContext';

const PAGE_SIZE = 20;

const STATUS_LABEL: Record<ApiOrderStatus, string> = {
  PENDING:   'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  SHIPPED:   'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã hủy',
};
const STATUS_CLS: Record<ApiOrderStatus, string> = {
  PENDING:   'badge-warning',
  CONFIRMED: 'badge-info',
  SHIPPED:   'badge-primary',
  DELIVERED: 'badge-success',
  CANCELLED: 'badge-danger',
};
const PAY_LABEL: Record<string, string> = { COD: 'COD', BANK: 'Chuyển khoản', EWALLET: 'Ví điện tử' };
const STATUSES: ApiOrderStatus[] = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export const Orders = () => {
  const [items, setItems] = useState<AdminOrder[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [search, setSearch]     = useState('');                      // client-side filter (orderNumber/name)
  const [filterStatus, setFilterStatus] = useState<'all' | ApiOrderStatus>('all');

  const [loading, setLoading]   = useState(false);
  const toast = useToast();

  const [viewItem, setViewItem] = useState<AdminOrder | null>(null);
  const [deleteItem, setDeleteItem] = useState<AdminOrder | null>(null);
  const [busy, setBusy]         = useState(false);

  const reload = () => {
    setLoading(true);
    orderApi.list({
      page, size: PAGE_SIZE,
      status: filterStatus === 'all' ? undefined : filterStatus,
    })
      .then((res) => {
        setItems(res.items);
        setTotalElements(res.totalElements);
        setTotalPages(Math.max(1, res.totalPages));
      })
      .catch((err) => {
        toast.error(err instanceof ApiError ? err.message : 'Không tải được danh sách đơn');
        setItems([]); setTotalElements(0); setTotalPages(1);
      })
      .finally(() => setLoading(false));
  };

  useEffect(reload, [page, filterStatus]);

  // Client-side search lọc theo orderNumber + customer name (BE chưa có search endpoint cho orders)
  const filtered = items.filter((o) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = `${o.shipping.firstName} ${o.shipping.lastName}`.toLowerCase();
    return o.orderNumber.toLowerCase().includes(q) || name.includes(q);
  });

  const handleStatusChange = async (id: string, status: ApiOrderStatus) => {
    setBusy(true);
    try {
      const updated = await orderApi.updateStatus(id, status);
      setItems((prev) => prev.map((o) => o.id === id ? updated : o));
      if (viewItem?.id === id) setViewItem(updated);
      toast.success(`Đơn ${updated.orderNumber} → ${STATUS_LABEL[status]}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Cập nhật trạng thái thất bại');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    const num = deleteItem.orderNumber;
    setBusy(true);
    try {
      await orderApi.delete(deleteItem.id);
      setDeleteItem(null);
      toast.success(`Đã xóa đơn ${num}`);
      if (items.length === 1 && page > 1) setPage((p) => p - 1);
      else reload();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Xóa đơn thất bại');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h2>Đơn hàng</h2>
          <p className="adm-page-sub">{totalElements} đơn từ DB · Cập nhật trạng thái real-time</p>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <input
            className="adm-search"
            placeholder="🔍 Tìm orderNumber hoặc tên khách (client-side)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="adm-select"
            value={filterStatus}
            onChange={(e) => { setFilterStatus(e.target.value as 'all' | ApiOrderStatus); setPage(1); }}
          >
            <option value="all">Tất cả trạng thái</option>
            {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
          <span className="adm-count">{filtered.length} / {totalElements}</span>
        </div>

        {loading ? (
          <div className="adm-empty"><span>⏳</span><p>Đang tải...</p></div>
        ) : totalElements === 0 ? (
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
                    <td><code className="adm-code">{o.orderNumber}</code></td>
                    <td>
                      <strong>{o.shipping.firstName} {o.shipping.lastName}</strong>
                      <div className="adm-muted adm-small">{o.shipping.phone}</div>
                    </td>
                    <td><span className="adm-tag">{o.items.length} sp</span></td>
                    <td><strong>{formatPrice(o.total)}</strong></td>
                    <td>{PAY_LABEL[o.paymentMethod]}</td>
                    <td>
                      <select
                        className={`adm-status-select ${STATUS_CLS[o.status]}`}
                        value={o.status}
                        disabled={busy}
                        onChange={(e) => handleStatusChange(o.id, e.target.value as ApiOrderStatus)}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                      </select>
                    </td>
                    <td className="adm-muted">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td>
                      <div className="adm-actions">
                        <button className="adm-btn adm-btn-sm adm-btn-ghost" onClick={() => setViewItem(o)}>👁️ Chi tiết</button>
                        <button className="adm-btn adm-btn-sm adm-btn-danger-ghost" onClick={() => setDeleteItem(o)}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '.5rem', padding: '1rem' }}>
            <button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</button>
            <span className="adm-muted" style={{ alignSelf: 'center' }}>Trang {page} / {totalPages}</span>
            <button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title={`Chi tiết đơn hàng — ${viewItem?.orderNumber ?? ''}`}
        size="lg"
      >
        {viewItem && (
          <div>
            <div className="adm-detail-grid">
              <div>
                <p className="adm-detail-label">Khách hàng</p>
                <p><strong>{viewItem.shipping.firstName} {viewItem.shipping.lastName}</strong></p>
                <p className="adm-muted">{viewItem.shipping.phone}</p>
                {viewItem.shipping.email && <p className="adm-muted">{viewItem.shipping.email}</p>}
                {viewItem.userId
                  ? <p className="adm-small">User: <code>{viewItem.userId}</code></p>
                  : <p className="adm-small adm-muted">Guest checkout (no user)</p>}
              </div>
              <div>
                <p className="adm-detail-label">Địa chỉ giao hàng</p>
                <p>{viewItem.shipping.address}</p>
                <p className="adm-muted">{viewItem.shipping.district ? viewItem.shipping.district + ', ' : ''}{viewItem.shipping.province}</p>
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
                  disabled={busy}
                  onChange={(e) => handleStatusChange(viewItem.id, e.target.value as ApiOrderStatus)}
                >
                  {STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                </select>
              </div>
            </div>

            <div className="adm-detail-items">
              <p className="adm-detail-label">Sản phẩm</p>
              {viewItem.items.map((it) => (
                <div key={it.id} className="adm-order-item-row">
                  <span>{it.productEmoji ?? '📦'}</span>
                  <span className="flex-1">
                    {it.productName}
                    {!it.productId && <span className="adm-muted adm-small"> (đã xóa)</span>}
                  </span>
                  <span className="adm-muted">× {it.quantity}</span>
                  <strong>{formatPrice(it.subtotal)}</strong>
                </div>
              ))}
              <div className="adm-order-totals">
                <div className="total-row"><span>Tạm tính</span><span>{formatPrice(viewItem.subtotal)}</span></div>
                <div className="total-row"><span>Phí vận chuyển</span><span>{formatPrice(viewItem.shippingFee)}</span></div>
                <div className="total-row total-final"><span>Tổng cộng</span><strong>{formatPrice(viewItem.total)}</strong></div>
              </div>
            </div>
            {viewItem.note && (
              <div className="adm-note"><strong>Ghi chú:</strong> {viewItem.note}</div>
            )}
          </div>
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteItem}
        onClose={() => !busy && setDeleteItem(null)}
        title="Xác nhận xóa đơn hàng"
        size="sm"
        footer={
          <div className="modal-footer-actions">
            <button className="adm-btn adm-btn-ghost" onClick={() => setDeleteItem(null)} disabled={busy}>Hủy</button>
            <button className="adm-btn adm-btn-danger" onClick={handleDelete} disabled={busy}>
              {busy ? 'Đang xóa...' : 'Xóa đơn hàng'}
            </button>
          </div>
        }
      >
        <p>Bạn có chắc muốn xóa đơn hàng <strong>{deleteItem?.orderNumber}</strong>?</p>
        <p className="adm-muted">Thao tác này không thể hoàn tác. order_shipping + order_items CASCADE.</p>
      </Modal>
    </div>
  );
};
