import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { ProductEdit } from './pages/ProductEdit';
import { Categories } from './pages/Categories';
import { CategoryEdit } from './pages/CategoryEdit';
import { Orders } from './pages/Orders';
import { Users } from './pages/Users';
import { UserEdit } from './pages/UserEdit';
import { Blog } from './pages/Blog';
import { BlogEdit } from './pages/BlogEdit';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<AdminLayout />}>
        <Route path="/"                      element={<Dashboard />} />
        <Route path="/products"              element={<Products />} />
        <Route path="/products/:id/edit"     element={<ProductEdit />} />
        <Route path="/categories"            element={<Categories />} />
        <Route path="/categories/:id/edit"   element={<CategoryEdit />} />
        <Route path="/orders"                element={<Orders />} />
        <Route path="/users"                 element={<Users />} />
        <Route path="/users/:id/edit"        element={<UserEdit />} />
        <Route path="/blog"                  element={<Blog />} />
        <Route path="/blog/:id/edit"         element={<BlogEdit />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
