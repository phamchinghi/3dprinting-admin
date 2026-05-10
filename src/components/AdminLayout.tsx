import { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAdminAuth } from '../context/AdminAuthContext';

const PAGE_TITLES: Record<string, { title: string; breadcrumb?: string }> = {
  '/':           { title: 'Dashboard' },
  '/products':   { title: 'Sản phẩm',    breadcrumb: 'Quản lý' },
  '/categories': { title: 'Danh mục',    breadcrumb: 'Quản lý' },
  '/orders':     { title: 'Đơn hàng',    breadcrumb: 'Quản lý' },
  '/users':      { title: 'Người dùng',  breadcrumb: 'Quản lý' },
  '/blog':       { title: 'Blog',        breadcrumb: 'Quản lý' },
};

const getPageMeta = (pathname: string): { title: string; breadcrumb?: string } => {
  if (pathname.startsWith('/products/') && pathname.endsWith('/edit'))
    return { title: 'Chỉnh sửa sản phẩm', breadcrumb: 'Sản phẩm' };
  if (pathname.startsWith('/categories/') && pathname.endsWith('/edit'))
    return { title: 'Chỉnh sửa danh mục', breadcrumb: 'Danh mục' };
  if (pathname.startsWith('/blog/') && pathname.endsWith('/edit'))
    return { title: 'Chỉnh sửa bài viết', breadcrumb: 'Blog' };
  if (pathname.startsWith('/users/') && pathname.endsWith('/edit'))
    return { title: 'Chỉnh sửa người dùng', breadcrumb: 'Người dùng' };
  return PAGE_TITLES[pathname] ?? { title: 'Admin' };
};

export const AdminLayout = () => {
  const { isAuthenticated } = useAdminAuth();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const meta = getPageMeta(location.pathname);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className={`adm-layout${collapsed ? ' sidebar-collapsed' : ''}`}>
      <Sidebar collapsed={collapsed} />
      <div className="adm-main">
        <Topbar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          title={meta.title}
          breadcrumb={meta.breadcrumb}
        />
        <main className="adm-page">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
