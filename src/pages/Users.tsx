import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/Modal';
import { adminUserApi, type AdminUserProfile, type UserProvider } from '../api/adminUser';

const PROVIDER_LABEL: Record<UserProvider, string> = {
  GOOGLE:   '🔵 Google',
  FACEBOOK: '🔷 Facebook',
  PHONE:    '📱 SĐT',
  EMAIL:    '✉️ Email',
};

const PAGE_SIZE = 20;

export const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers]       = useState<AdminUserProfile[]>([]);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage]         = useState(1);
  const [deleteItem, setDelete] = useState<AdminUserProfile | null>(null);

  // Debounce search → server round-trip
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when search changes
  useEffect(() => { setPage(1); }, [debounced]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminUserApi.list({ page, size: PAGE_SIZE, search: debounced || undefined });
      setUsers(res.items);
      setTotal(res.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh sách người dùng');
      setUsers([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, debounced]);

  useEffect(() => { reload(); }, [reload]);

  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;

  const toggleStatus = async (u: AdminUserProfile) => {
    const next = u.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      const updated = await adminUserApi.updateStatus(u.id, { status: next });
      setUsers((prev) => prev.map((x) => (x.id === u.id ? updated : x)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không cập nhật được trạng thái');
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await adminUserApi.delete(deleteItem.id);
      setDelete(null);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không xóa được người dùng');
    }
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h2>Người dùng</h2>
          <p className="adm-page-sub">
            Tổng <strong>{total}</strong> người dùng · {activeCount} đang hoạt động (trang hiện tại)
          </p>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <input
            className="adm-search"
            placeholder="🔍 Tìm tên, email hoặc số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="adm-count">
            {loading ? 'Đang tải...' : `Trang ${page} · ${users.length} / ${total}`}
          </span>
        </div>

        {error && (
          <div className="adm-alert adm-alert-error" style={{ margin: '0 1rem 1rem' }}>
            ⚠️ {error}
          </div>
        )}

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Người dùng</th>
                <th>Liên hệ</th>
                <th>Đăng nhập qua</th>
                <th>Đơn hàng</th>
                <th>Ngày tham gia</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!loading && users.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--adm-muted)' }}>
                  Không có người dùng phù hợp.
                </td></tr>
              )}
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="adm-user-cell">
                      <div className="adm-user-avatar">{u.name.charAt(0)}</div>
                      <strong>{u.name}</strong>
                    </div>
                  </td>
                  <td>
                    {u.email && <div>{u.email}</div>}
                    {u.phone && <div className="adm-muted">{u.phone}</div>}
                  </td>
                  <td>{PROVIDER_LABEL[u.provider]}</td>
                  <td><span className="adm-badge badge-info">{u.orderCount} đơn</span></td>
                  <td className="adm-muted">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <button
                      className={`adm-badge adm-badge-btn ${u.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}
                      onClick={() => toggleStatus(u)}
                      title="Click để thay đổi trạng thái"
                    >
                      {u.status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu'}
                    </button>
                  </td>
                  <td>
                    <div className="adm-actions">
                      <button
                        className="adm-btn adm-btn-sm adm-btn-ghost"
                        onClick={() => navigate(`/users/${u.id}/edit`)}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        className="adm-btn adm-btn-sm adm-btn-danger-ghost"
                        onClick={() => setDelete(u)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > PAGE_SIZE && (
          <div className="adm-toolbar" style={{ justifyContent: 'flex-end', gap: '.5rem' }}>
            <button
              className="adm-btn adm-btn-sm adm-btn-ghost"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Trước
            </button>
            <span className="adm-muted adm-small">
              {page} / {Math.max(1, Math.ceil(total / PAGE_SIZE))}
            </span>
            <button
              className="adm-btn adm-btn-sm adm-btn-ghost"
              disabled={page >= Math.ceil(total / PAGE_SIZE) || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Sau →
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteItem}
        onClose={() => setDelete(null)}
        title="Xác nhận xóa người dùng"
        size="sm"
        footer={
          <div className="modal-footer-actions">
            <button className="adm-btn adm-btn-ghost" onClick={() => setDelete(null)}>Hủy</button>
            <button className="adm-btn adm-btn-danger" onClick={handleDelete}>Xóa người dùng</button>
          </div>
        }
      >
        <p>Bạn có chắc muốn xóa người dùng <strong>{deleteItem?.name}</strong>?</p>
        <p className="adm-muted">Đơn hàng được giữ lại (user_id set NULL). Thao tác không thể hoàn tác.</p>
      </Modal>
    </div>
  );
};
