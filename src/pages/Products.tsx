import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatPrice } from '../data/mock';
import { Modal } from '../components/Modal';
import { productApi, type AdminProduct, type CreateProductRequest, type ProductBadge } from '../api/product';
import { categoryApi, type Category } from '../api/category';
import { ApiError } from '../api/client';

const PAGE_SIZE = 20;
const SLUG_RE = /^[a-z0-9-]+$/;

const EMPTY_FORM: CreateProductRequest = {
  slug: '',
  name: '',
  categoryId: '',
  price: 0,
  emoji: '📦',
  description: '',
  inStock: true,
  isActive: true,
};

export const Products = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState<AdminProduct[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);

  const [deleteItem, setDeleteItem] = useState<AdminProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState<CreateProductRequest>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Debounce search 300ms
  useEffect(() => {
    const id = setTimeout(() => { setDebouncedSearch(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(id);
  }, [search]);

  // Load categories once (for Add dropdown)
  useEffect(() => {
    categoryApi.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  const reload = () => {
    setLoading(true); setError(null);
    const fetcher = debouncedSearch
      ? productApi.search(debouncedSearch, page, PAGE_SIZE)
      : productApi.list({ page, size: PAGE_SIZE });
    fetcher
      .then((res) => {
        setItems(res.items);
        setTotalElements(res.totalElements);
        setTotalPages(Math.max(1, res.totalPages));
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Không tải được danh sách sản phẩm');
        setItems([]); setTotalElements(0); setTotalPages(1);
      })
      .finally(() => setLoading(false));
  };

  useEffect(reload, [debouncedSearch, page]);

  const handleDelete = async () => {
    if (!deleteItem) return;
    setDeleting(true);
    try {
      await productApi.delete(deleteItem.id);
      setDeleteItem(null);
      // Nếu xóa hàng cuối của trang cuối → lùi về trang trước
      if (items.length === 1 && page > 1) setPage((p) => p - 1);
      else reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Xóa thất bại');
    } finally {
      setDeleting(false);
    }
  };

  const validateForm = (): string | null => {
    if (!form.slug || !SLUG_RE.test(form.slug)) return 'Slug phải khớp ^[a-z0-9-]+$';
    if (!form.name?.trim())                     return 'Tên sản phẩm bắt buộc';
    if (!form.categoryId)                       return 'Chọn danh mục';
    if (!form.price || form.price <= 0)         return 'Giá phải > 0';
    return null;
  };

  const handleAdd = async () => {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setSubmitting(true); setFormError(null);
    try {
      await productApi.create(form);
      setAddOpen(false);
      setForm(EMPTY_FORM);
      setPage(1);
      reload();
    } catch (e) {
      setFormError(e instanceof ApiError ? e.message : 'Tạo sản phẩm thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h2>Sản phẩm</h2>
          <p className="adm-page-sub">{totalElements} sản phẩm đang active trong hệ thống</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={() => { setForm(EMPTY_FORM); setFormError(null); setAddOpen(true); }}>
          + Thêm sản phẩm
        </button>
      </div>

      {error && <div className="adm-alert adm-alert-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}

      <div className="adm-card">
        <div className="adm-toolbar">
          <input
            className="adm-search"
            placeholder="🔍 Tìm theo tên hoặc mô tả (server-side ILIKE)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="adm-count">{items.length} / {totalElements}</span>
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
              {loading && (
                <tr><td colSpan={6} className="adm-muted" style={{ textAlign: 'center', padding: '2rem' }}>⏳ Đang tải...</td></tr>
              )}
              {!loading && items.length === 0 && (
                <tr><td colSpan={6} className="adm-muted" style={{ textAlign: 'center', padding: '2rem' }}>Không có sản phẩm nào</td></tr>
              )}
              {!loading && items.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="adm-product-cell">
                      <span className="adm-emoji">{p.emoji}</span>
                      <div>
                        <strong>{p.name}</strong>
                        {p.badge && (
                          <span className={`adm-badge badge-${p.badge.toLowerCase()} ml-sm`}>{p.badge}</span>
                        )}
                        <div className="adm-muted adm-small">/{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="adm-tag">{p.categoryNameVi}</span></td>
                  <td>
                    <div>
                      <strong>{formatPrice(p.price)}</strong>
                      {p.oldPrice && <div className="adm-old-price">{formatPrice(p.oldPrice)}</div>}
                    </div>
                  </td>
                  <td>⭐ {Number(p.rating).toFixed(1)} <span className="adm-muted">({p.reviewCount})</span></td>
                  <td>
                    <span className={`adm-badge ${p.inStock ? 'badge-success' : 'badge-danger'}`}>
                      {p.inStock ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                  </td>
                  <td>
                    <div className="adm-actions">
                      <button
                        className="adm-btn adm-btn-sm adm-btn-ghost"
                        onClick={() => navigate(`/products/${encodeURIComponent(p.slug)}/edit`)}
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

        {totalPages > 1 && (
          <div className="adm-pagination" style={{ display: 'flex', justifyContent: 'center', gap: '.5rem', padding: '1rem' }}>
            <button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</button>
            <span className="adm-muted" style={{ alignSelf: 'center' }}>Trang {page} / {totalPages}</span>
            <button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteItem}
        onClose={() => !deleting && setDeleteItem(null)}
        title="Xác nhận xóa"
        size="sm"
        footer={
          <div className="modal-footer-actions">
            <button className="adm-btn adm-btn-ghost" onClick={() => setDeleteItem(null)} disabled={deleting}>Hủy</button>
            <button className="adm-btn adm-btn-danger" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Đang xóa...' : 'Xóa sản phẩm'}
            </button>
          </div>
        }
      >
        <p>Bạn có chắc muốn xóa sản phẩm <strong>{deleteItem?.name}</strong>?</p>
        <p className="adm-muted">Thao tác này không thể hoàn tác. Hệ thống thực thi hard-delete trên BE.</p>
      </Modal>

      {/* Add Modal */}
      <Modal
        open={addOpen}
        onClose={() => !submitting && setAddOpen(false)}
        title="Thêm sản phẩm mới"
        size="md"
        footer={
          <div className="modal-footer-actions">
            <button className="adm-btn adm-btn-ghost" onClick={() => setAddOpen(false)} disabled={submitting}>Hủy</button>
            <button className="adm-btn adm-btn-primary" onClick={handleAdd} disabled={submitting}>
              {submitting ? 'Đang lưu...' : 'Thêm sản phẩm'}
            </button>
          </div>
        }
      >
        {formError && <div className="adm-alert adm-alert-error" style={{ marginBottom: '1rem' }}>⚠️ {formError}</div>}
        <div className="adm-form-grid">
          <div className="adm-form-field">
            <label>Slug * <span className="adm-muted adm-small">(không sửa được sau khi tạo)</span></label>
            <input
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="product-slug-vi-du"
            />
          </div>
          <div className="adm-form-field">
            <label>Emoji</label>
            <input
              value={form.emoji ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
              placeholder="📦"
            />
          </div>
          <div className="adm-form-field full">
            <label>Tên sản phẩm *</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Tên sản phẩm..."
            />
          </div>
          <div className="adm-form-field">
            <label>Danh mục *</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            >
              <option value="">— Chọn —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.iconEmoji ?? ''} {c.nameVi}</option>
              ))}
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
          <div className="adm-form-field">
            <label>Giá gốc (VND)</label>
            <input
              type="number"
              value={form.oldPrice ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, oldPrice: e.target.value ? Number(e.target.value) : undefined }))}
              placeholder="(tùy chọn)"
            />
          </div>
          <div className="adm-form-field">
            <label>Badge</label>
            <select
              value={form.badge ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, badge: (e.target.value || undefined) as ProductBadge | undefined }))}
            >
              <option value="">Không có</option>
              <option value="NEW">NEW</option>
              <option value="HOT">HOT</option>
              <option value="SALE">SALE</option>
            </select>
          </div>
          <div className="adm-form-field full">
            <label>Mô tả</label>
            <textarea
              rows={2}
              value={form.description ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Mô tả ngắn..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
