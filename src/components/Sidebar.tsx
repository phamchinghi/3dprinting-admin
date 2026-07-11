import { NavLink } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

interface NavItem {
  to: string;
  icon: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/',           icon: '📊', label: 'Dashboard' },
  { to: '/products',   icon: '📦', label: 'Sản phẩm' },
  { to: '/categories', icon: '🗂️', label: 'Danh mục' },
  { to: '/orders',     icon: '🛍️', label: 'Đơn hàng' },
  { to: '/users',    icon: '👥', label: 'Người dùng' },
  { to: '/blog',     icon: '📝', label: 'Blog' },
];

interface SidebarProps {
  collapsed: boolean;
}

export const Sidebar = ({ collapsed }: SidebarProps) => {
  const { logout } = useAdminAuth();

  return (
    <aside className={`adm-sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="adm-sidebar-brand">
        <span className="brand-icon">🖨️</span>
        {!collapsed && (
          <span className="brand-name">
            <span className="brand-tuni">TuNi</span> Admin
          </span>
        )}
      </div>

      <nav className="adm-sidebar-nav">
        <p className="adm-nav-section">{!collapsed && 'QUẢN LÝ'}</p>
        <ul>
          {NAV_ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) => `adm-nav-item${isActive ? ' active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <span className="nav-icon">{item.icon}</span>
                {!collapsed && <span className="nav-label">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="adm-sidebar-footer">
        <button
          className="adm-nav-item adm-logout-btn"
          onClick={logout}
          title={collapsed ? 'Đăng xuất' : undefined}
        >
          <span className="nav-icon">🚪</span>
          {!collapsed && <span className="nav-label">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};
