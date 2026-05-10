import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { formatPrice } from '../data/mock';
import type { Product, ProductCategory } from '../types';

const CATEGORIES: { value: ProductCategory; label: string }[] = [
  { value: 'model',     label: 'Mô hình' },
  { value: 'accessory', label: 'Phụ kiện' },
  { value: 'filament',  label: 'Vật liệu' },
  { value: 'service',   label: 'Dịch vụ' },
];

export const ProductEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products, setProducts } = useData();

  const original = products.find((p) => p.id === id);
  const [form, setForm] = useState<Product | null>(original ? { ...original } : null);

  if (!form) {
    return (
      <div>
        <p className="adm-muted" style={{ marginBottom: '1rem' }}>Không tìm thấy sản phẩm.</p>
        <button className="adm-btn adm-btn-ghost" onClick={() => navigate('/products')}>← Quay lại</button>
      </div>
    );
  }

  const set = <K extends keyof Product>(field: K, value: Product[K]) =>
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));

  const handleSave = () => {
    setProducts((prev) => prev.map((p) => (p.id === form.id ? form : p)));
    navigate('/products');
  };

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-edit-back-title">
          <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => navigate('/products')}>← Quay lại</button>
          <div>
            <h2>Chỉnh sửa sản phẩm</h2>
            <p className="adm-page-sub">{original?.name}</p>
          </div>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={handleSave}>💾 Lưu thay đổi</button>
      </div>

      <div className="adm-edit-grid">
        {/* Left: form cards */}
        <div className="adm-edit-main">
          {/* Basic info */}
          <div className="adm-card" style={{ marginBottom: '1.25rem' }}>
            <div className="adm-card-header"><h3>Thông tin cơ bản</h3></div>
            <div className="adm-edit-form-body">
              <div className="adm-form-grid">
                <div className="adm-form-field full">
                  <label>Tên sản phẩm *</label>
                  <input value={form.name} onChange={(e) => set('name', e.target.value)} />
                </div>
                <div className="adm-form-field">
                  <label>Emoji</label>
                  <input value={form.emoji} onChange={(e) => set('emoji', e.target.value)} />
                </div>
                <div className="adm-form-field">
                  <label>Danh mục</label>
                  <select
                    value={form.category}
                    onChange={(e) => {
                      const cat = CATEGORIES.find((c) => c.value === e.target.value);
                      setForm((prev) =>
                        prev
                          ? { ...prev, category: e.target.value as ProductCategory, categoryLabel: cat?.label ?? '' }
                          : prev
                      );
                    }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="adm-form-field">
                  <label>Giá bán (VND) *</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => set('price', Number(e.target.value))}
                  />
                </div>
                <div className="adm-form-field">
                  <label>Giá gốc (VND)</label>
                  <input
                    type="number"
                    value={form.oldPrice ?? ''}
                    onChange={(e) => set('oldPrice', e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="Để trống nếu không có"
                  />
                </div>
                <div className="adm-form-field">
                  <label>Badge</label>
                  <select
                    value={form.badge ?? ''}
                    onChange={(e) => set('badge', (e.target.value || undefined) as Product['badge'])}
                  >
                    <option value="">Không có</option>
                    <option value="new">New</option>
                    <option value="hot">Hot</option>
                    <option value="sale">Sale</option>
                  </select>
                </div>
                <div className="adm-form-field">
                  <label>Tình trạng</label>
                  <select
                    value={form.inStock ? 'true' : 'false'}
                    onChange={(e) => set('inStock', e.target.value === 'true')}
                  >
                    <option value="true">Còn hàng</option>
                    <option value="false">Hết hàng</option>
                  </select>
                </div>
                <div className="adm-form-field full">
                  <label>Mô tả</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Technical details */}
          <div className="adm-card">
            <div className="adm-card-header"><h3>Chi tiết kỹ thuật</h3></div>
            <div className="adm-edit-form-body">
              <div className="adm-form-grid">
                <div className="adm-form-field full">
                  <label>Chất liệu</label>
                  <input
                    value={form.material ?? ''}
                    onChange={(e) => set('material', e.target.value || undefined)}
                    placeholder="VD: PLA 1.75mm"
                  />
                </div>
                <div className="adm-form-field full">
                  <label>Kích thước</label>
                  <input
                    value={form.dimensions ?? ''}
                    onChange={(e) => set('dimensions', e.target.value || undefined)}
                    placeholder="VD: 15 × 20 × 25 cm"
                  />
                </div>
                <div className="adm-form-field">
                  <label>Đánh giá (0 – 5)</label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    step={0.1}
                    value={form.rating}
                    onChange={(e) => set('rating', Number(e.target.value))}
                  />
                </div>
                <div className="adm-form-field">
                  <label>Số lượt đánh giá</label>
                  <input
                    type="number"
                    min={0}
                    value={form.reviewCount}
                    onChange={(e) => set('reviewCount', Number(e.target.value))}
                  />
                </div>
                <div className="adm-form-field full">
                  <label>Tags (phân cách bằng dấu phẩy)</label>
                  <input
                    value={form.tags.join(', ')}
                    onChange={(e) =>
                      set('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))
                    }
                    placeholder="best-seller, fantasy, new-arrivals..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: live preview */}
        <div className="adm-edit-sidebar">
          <div className="adm-card adm-edit-preview-card">
            <div className="adm-card-header"><h3>Xem trước</h3></div>
            <div className="adm-edit-preview-body">
              <span className="adm-edit-preview-emoji">{form.emoji}</span>
              <h4 className="adm-edit-preview-name">{form.name || '—'}</h4>
              <div className="adm-edit-preview-badges">
                <span className="adm-tag">{form.categoryLabel}</span>
                {form.badge && (
                  <span className={`adm-badge badge-${form.badge}`}>{form.badge.toUpperCase()}</span>
                )}
                <span className={`adm-badge ${form.inStock ? 'badge-success' : 'badge-danger'}`}>
                  {form.inStock ? 'Còn hàng' : 'Hết hàng'}
                </span>
              </div>
              <p className="adm-edit-preview-price">{form.price ? formatPrice(form.price) : '—'}</p>
              {form.oldPrice && (
                <p className="adm-old-price adm-edit-preview-oldprice">{formatPrice(form.oldPrice)}</p>
              )}
              {form.description && (
                <p className="adm-muted adm-small adm-edit-preview-desc">{form.description}</p>
              )}
              {form.material && (
                <p className="adm-small"><strong>Vật liệu:</strong> {form.material}</p>
              )}
              {form.dimensions && (
                <p className="adm-small"><strong>Kích thước:</strong> {form.dimensions}</p>
              )}
              <p className="adm-small">⭐ {form.rating} ({form.reviewCount} đánh giá)</p>
              {form.tags.length > 0 && (
                <div className="adm-edit-preview-tags">
                  {form.tags.map((t) => (
                    <span key={t} className="adm-tag">{t}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
