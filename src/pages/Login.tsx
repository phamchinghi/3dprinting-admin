import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export const Login = () => {
  const { isAuthenticated, login } = useAdminAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const ok = await login(username, password);
    if (!ok) setError('Tên đăng nhập hoặc mật khẩu không đúng');
    setLoading(false);
  };

  return (
    <div className="adm-login-page">
      <div className="adm-login-card">
        <div className="adm-login-brand">
          <span className="brand-icon-lg">🖨️</span>
          <h1>
            <span className="brand-tuni">TuNi</span> 3D Admin
          </h1>
          <p>Quản trị hệ thống TuNi 3D Store</p>
        </div>

        <form onSubmit={handleSubmit} className="adm-login-form">
          <div className="adm-form-field">
            <label>Tên đăng nhập</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              required
              autoFocus
            />
          </div>
          <div className="adm-form-field">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="adm-error">{error}</p>}
          <button type="submit" className="adm-btn adm-btn-primary adm-btn-block" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="adm-login-hint">
          <span>💡 Demo:</span> admin / admin123
        </div>
      </div>
    </div>
  );
};
