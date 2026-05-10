import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { formatPrice } from '../data/mock';
import { Modal } from '../components/Modal';
import type { Product, ProductCategory } from '../types';

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'model',     label: 'Mô hình' },
  { value: 'accessory', label: 'Phụ kiện' },
  { value: 'filament',  label: 'Vật liệu' },
  { value: 'service',   label: 'Dịch vụ' },
];

const EMPTY_FORM = {
  name: '', emoji: '📦', category: 'model' as ProductCategory,
  categoryLabel: 'Mô hình', price: 0, description: '', inStock: true,
};

export const Products = () => {
  const navigate = useNavigate();
  const { products, setProducts } = useData();
  const [search, setSearch]         = useState('');
  const [deleteItem, setDeleteItem] = useState<Product | null>(null);
  const [addOpen, setAddOpen]       = useState(false);
  const [form, setForm]             = useState(EMPTY_FORM);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.categoryLabel.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (!deleteItem) return;
    setProducts((prev) => prev.filter((p) => p.id !== deleteItem.id));
    setDeleteItem(null);
  };

  const handleAdd = () => {
    const cat = CATEGORIES.find((c) => c.value === form.category);
    const newProduct: Product = {
      ...form,
      id: 'p' + Date.now(),
      slug: form.name.toLowerCase().replace(/\s+/g, '-'),
      categoryLabel: cat?.label ?? form.category,
      rating: 5.0, reviewCount: 0, tags: [],
    };
    setProducts((prev) => [newProduct, ...prev]);
    setAddOpen(false);
    setForm(EMPTY_FORM);
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h2>Sản phẩm</h2>
          <p className="adm-page-sub">{products.length} sản phẩm trong hệ thống</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={() => setAddOpen(true)}>
          + Thêm sản phẩm
        </button>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <input
            className="adm-search"
            placeholder="🔍 Tìm tên hoặc danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="adm-count">{filtered.length} / {products.length}</span>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Đánh giá</th>
                <th>Tình trạng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="adm-product-cell">
                      <span className="adm-emoji">{p.emoji}</span>
                      <div>
                        <strong>{p.name}</strong>
                        {p.badge && (
                          <span className={`adm-badge badge-${p.badge} ml-sm`}>{p.badge.toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td><span className="adm-tag">{p.categoryLabel}</span></td>
                  <td>
                    <div>
                      <strong>{formatPrice(p.price)}</strong>
                      {p.oldPrice && <div className="adm-old-price">{formatPrice(p.oldPrice)}</div>}
                    </div>
                  </td>
                  <td>⭐ {p.rating} <span className="adm-muted">({p.reviewCount})</span></td>
                  <td>
                    <span className={`adm-badge ${p.inStock ? 'badge-success' : 'badge-danger'}`}>
                      {p.inStock ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                  </td>
                  <td>
                    <div className="adm-actions">
                      <button
                        className="adm-btn adm-btn-sm adm-btn-ghost"
                        onClick={() => navigate(`/products/${p.id}/edit`)}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        className="adm-btn adm-btn-sm adm-btn-danger-ghost"
                        onClick={() => setDeleteItem(p)}
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
      </div>

      {/* Delete Confirm Modal */}
      <Modal
        open={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        title="Xác nhận xóa"
        size="sm"
        footer={
          <div className="modal-footer-actions">
            <button className="adm-btn adm-btn-ghost" onClick={() => setDeleteItem(null)}>Hủy</button>
            <button className="adm-btn adm-btn-danger" onClick={handleDelete}>Xóa sản phẩm</button>
          </div>
        }
      >
        <p>Bạn có chắc muốn xóa sản phẩm <strong>{deleteItem?.name}</strong>?</p>
        <p className="adm-muted">Thao tác này không thể hoàn tác.</p>
      </Modal>

      {/* Add Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Thêm sản phẩm mới"
        size="md"
        footer={
          <div className="modal-footer-actions">
            <button className="adm-btn adm-btn-ghost" onClick={() => setAddOpen(false)}>Hủy</button>
            <button
              className="adm-btn adm-btn-primary"
              onClick={handleAdd}
              disabled={!form.name || !form.price}
            >
              Thêm sản phẩm
            </button>
          </div>
        }
      >
        <div className="adm-form-grid">
          <div className="adm-form-field full">
            <label>Tên sản phẩm *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Tên sản phẩm..."
            />
          </div>
          <div className="adm-form-field">
            <label>Emoji</label>
            <input
              value={form.emoji}
              onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
              placeholder="📦"
            />
          </div>
          <div className="adm-form-field">
            <label>Danh mục</label>
            <select
              value={form.category}
              onChange={(e) => {
                const cat = CATEGORIES.find((c) => c.value === e.target.value);
                setForm((f) => ({ ...f, category: e.target.value as ProductCategory, categoryLabel: cat?.label ?? '' }));
              }}
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div className="adm-form-field">
            <label>Giá (VND) *</label>
            <input
              type="number"
              value={form.price || ''}
              onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
              placeholder="0"
            />
          </div>
          <div className="adm-form-field full">
            <label>Mô tả</label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Mô tả ngắn..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
