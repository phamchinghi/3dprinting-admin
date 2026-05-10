import { useAdminAuth } from '../context/AdminAuthContext';

interface TopbarProps {
  collapsed: boolean;
  onToggle: () => void;
  title: string;
  breadcrumb?: string;
}

export const Topbar = ({ collapsed, onToggle, title, breadcrumb }: TopbarProps) => {
  const { adminName } = useAdminAuth();
  const initials = adminName.split(' ').slice(-2).map((w) => w[0]).join('').toUpperCase();

  return (
    <header className={`adm-topbar${collapsed ? ' collapsed' : ''}`}>
      <div className="adm-topbar-left">
        <button className="adm-collapse-btn" onClick={onToggle} aria-label="Toggle sidebar">
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
        <div className="adm-breadcrumb">
          {breadcrumb && <span className="adm-breadcrumb-parent">{breadcrumb} /</span>}
          <span className="adm-breadcrumb-current">{title}</span>
        </div>
      </div>
      <div className="adm-topbar-right">
        <div className="adm-admin-badge">
          <div className="adm-admin-avatar">{initials}</div>
          <span className="adm-admin-name">{adminName}</span>
        </div>
      </div>
    </header>
  );
};
