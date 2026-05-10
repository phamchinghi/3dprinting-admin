import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminUserApi, type AdminUserProfile, type AccountStatus, type UserProvider } from '../api/adminUser';

const PROVIDER_LABEL: Record<UserProvider, string> = {
  GOOGLE:   '🔵 Google',
  FACEBOOK: '🔷 Facebook',
  PHONE:    '📱 Số điện thoại',
  EMAIL:    '✉️ Email',
};

export const UserEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [user, setUser]       = useState<AdminUserProfile | null>(null);
  const [status, setStatus]   = useState<AccountStatus>('ACTIVE');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    adminUserApi.getById(id)
      .then((u) => {
        if (cancelled) return;
        setUser(u);
        setStatus(u.status);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Không tải được thông tin người dùng');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const handleSave = async () => {
    if (!user || status === user.status) {
      navigate('/users');
      return;
    }
    setSaving(true);
    try {
      await adminUserApi.updateStatus(user.id, { status });
      navigate('/users');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không cập nhật được trạng thái');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="adm-muted">Đang tải...</p>;
  }

  if (error || !user) {
    return (
      <div>
        <p className="adm-muted" style={{ marginBottom: '1rem' }}>
          {error ?? 'Không tìm thấy người dùng.'}
        </p>
        <button className="adm-btn adm-btn-ghost" onClick={() => navigate('/users')}>← Quay lại</button>
      </div>
    );
  }

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-edit-back-title">
          <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => navigate('/users')}>← Quay lại</button>
          <div>
            <h2>Chỉnh sửa người dùng</h2>
            <p className="adm-page-sub">{user.name}</p>
          </div>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
        </button>
      </div>

      <div className="adm-edit-single">
        {/* User banner */}
        <div className="adm-card" style={{ marginBottom: '1.25rem' }}>
          <div className="adm-edit-user-banner">
            <div className="adm-edit-user-avatar">
              {user.avatarUrl
                ? <img src={user.avatarUrl} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'inherit' }} />
                : user.name.charAt(0)}
            </div>
            <div>
              <h3>{user.name}</h3>
              <p className="adm-muted adm-small">
                {PROVIDER_LABEL[user.provider]} · Tham gia {new Date(user.createdAt).toLocaleDateString('vi-VN')}
              </p>
            </div>
            <span className={`adm-badge ${status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
              {status === 'ACTIVE' ? 'Hoạt động' : 'Vô hiệu'}
            </span>
          </div>
        </div>

        {/* Personal info — read-only: only the user can edit via /api/users/me */}
        <div className="adm-card" style={{ marginBottom: '1.25rem' }}>
          <div className="adm-card-header">
            <h3>Thông tin cá nhân</h3>
            <span className="adm-muted adm-small">Chỉ user tự sửa được qua /api/users/me</span>
          </div>
          <div className="adm-edit-form-body">
            <div className="adm-form-grid">
              <div className="adm-form-field full">
                <label>Họ và tên</label>
                <input value={user.name} disabled className="adm-input-readonly" />
              </div>
              <div className="adm-form-field">
                <label>Email</label>
                <input value={user.email ?? '—'} disabled className="adm-input-readonly" />
              </div>
              <div className="adm-form-field">
                <label>Số điện thoại</label>
                <input value={user.phone ?? '—'} disabled className="adm-input-readonly" />
              </div>
            </div>
          </div>
        </div>

        {/* Account details — only status is admin-editable */}
        <div className="adm-card">
          <div className="adm-card-header"><h3>Tài khoản</h3></div>
          <div className="adm-edit-form-body">
            <div className="adm-form-grid">
              <div className="adm-form-field">
                <label>Phương thức đăng nhập</label>
                <input
                  value={PROVIDER_LABEL[user.provider]}
                  disabled
                  className="adm-input-readonly"
                />
              </div>
              <div className="adm-form-field">
                <label>Ngày tham gia</label>
                <input
                  value={new Date(user.createdAt).toLocaleDateString('vi-VN')}
                  disabled
                  className="adm-input-readonly"
                />
              </div>
              <div className="adm-form-field">
                <label>Số đơn hàng</label>
                <input
                  type="number"
                  value={user.orderCount}
                  disabled
                  className="adm-input-readonly"
                />
              </div>
              <div className="adm-form-field">
                <label>Trạng thái tài khoản *</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AccountStatus)}
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="INACTIVE">Vô hiệu</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
