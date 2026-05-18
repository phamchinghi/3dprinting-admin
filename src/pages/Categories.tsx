import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/Modal';
import { categoryApi, type Category, type CreateCategoryRequest } from '../api/category';

const SLUG_REGEX = /^[a-z0-9-]+$/;

export const Categories = () => {
  const navigate = useNavigate();
  const [items, setItems]       = useState<Category[]>([]);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [search, setSearch]     = useState('');
  const [addOpen, setAddOpen]   = useState(false);
  const [deleteItem, setDelete] = useState<Category | null>(null);

  // Add form state
  const [form, setForm] = useState<CreateCategoryRequest>({
    slug: '', nameVi: '', nameEn: '', iconEmoji: '', sortOrder: 0,
  });
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await categoryApi.list();
      setItems(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh mục');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const filtered = items.filter((c) => {
    const q = search.toLowerCase();
    return c.slug.toLowerCase().includes(q)
        || c.nameVi.toLowerCase().includes(q)
        || c.nameEn.toLowerCase().includes(q);
  });

  const handleAdd = async () => {
    setFormError(null);
    if (!form.slug || !SLUG_REGEX.test(form.slug)) {
      setFormError('Slug chỉ chứa chữ thường, số và dấu gạch ngang'); return;
    }
    if (!form.nameVi.trim() || !form.nameEn.trim()) {
      setFormError('Tên VI và EN bắt buộc'); return;
    }
    setAdding(true);
    try {
      await categoryApi.create({
        slug: form.slug.trim(),
        nameVi: form.nameVi.trim(),
        nameEn: form.nameEn.trim(),
        iconEmoji: form.iconEmoji?.trim() || undefined,
        sortOrder: form.sortOrder ?? 0,
      });
      setAddOpen(false);
      setForm({ slug: '', nameVi: '', nameEn: '', iconEmoji: '', sortOrder: 0 });
      reload();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Không tạo được danh mục');
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await categoryApi.delete(deleteItem.id);
      setDelete(null);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không xóa được danh mục');
    }
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h2>Danh mục</h2>
          <p className="adm-page-sub">{items.length} danh mục — sắp xếp theo `sort_order`</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={() => setAddOpen(true)}>
          + Thêm danh mục
        </button>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <input
            className="adm-search"
            placeholder="🔍 Tìm theo slug, tên VI hoặc EN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="adm-count">
            {loading ? 'Đang tải...' : `${filtered.length} / ${items.length}`}
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
                <th>#</th>
                <th>Icon</th>
                <th>Slug</th>
                <th>Tên (VI)</th>
                <th>Tên (EN)</th>
                <th>Sort</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--adm-muted)' }}>
                  Chưa có danh mục nào.
                </td></tr>
              )}
              {filtered.map((c, idx) => (
                <tr key={c.id}>
                  <td className="adm-muted">{idx + 1}</td>
                  <td style={{ fontSize: '1.4rem' }}>{c.iconEmoji ?? '—'}</td>
                  <td><code>{c.slug}</code></td>
                  <td><strong>{c.nameVi}</strong></td>
                  <td>{c.nameEn}</td>
                  <td>{c.sortOrder}</td>
                  <td>
                    <div className="adm-actions">
                      <button
                        className="adm-btn adm-btn-sm adm-btn-ghost"
                        onClick={() => navigate(`/categories/${c.id}/edit`)}
                      >
                        ✏️ Sửa
                      </button>
                      <button
                        className="adm-btn adm-btn-sm adm-btn-danger-ghost"
                        onClick={() => setDelete(c)}
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

      {/* Add modal */}
      <Modal
        open={addOpen}
        onClose={() => { setAddOpen(false); setFormError(null); }}
        title="Thêm danh mục mới"
        size="md"
        closeOnOverlayClick={false}
        footer={
          <div className="modal-footer-actions">
            <button className="adm-btn adm-btn-ghost" onClick={() => { setAddOpen(false); setFormError(null); }}>Hủy</button>
            <button className="adm-btn adm-btn-primary" onClick={handleAdd} disabled={adding}>
              {adding ? 'Đang tạo...' : 'Tạo'}
            </button>
          </div>
        }
      >
        <div className="adm-form-grid">
          <div className="adm-form-field full">
            <label>Slug * (chữ thường, số, dấu gạch ngang)</label>
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="model · accessory · filament"
            />
          </div>
          <div className="adm-form-field">
            <label>Tên (VI) *</label>
            <input value={form.nameVi} onChange={(e) => setForm({ ...form, nameVi: e.target.value })} />
          </div>
          <div className="adm-form-field">
            <label>Tên (EN) *</label>
            <input value={form.nameEn} onChange={(e) => setForm({ ...form, nameEn: e.target.value })} />
          </div>
          <div className="adm-form-field">
            <label>Icon emoji</label>
            <input value={form.iconEmoji ?? ''} onChange={(e) => setForm({ ...form, iconEmoji: e.target.value })} placeholder="🎎" />
          </div>
          <div className="adm-form-field">
            <label>Sort order</label>
            <input
              type="number"
              value={form.sortOrder ?? 0}
              onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) || 0 })}
            />
          </div>
        </div>
        {formError && <p className="adm-alert adm-alert-error" style={{ marginTop: '1rem' }}>⚠️ {formError}</p>}
      </Modal>

      {/* Delete confirm */}
      <Modal
        open={!!deleteItem}
        onClose={() => setDelete(null)}
        title="Xác nhận xóa danh mục"
        size="sm"
        footer={
          <div className="modal-footer-actions">
            <button className="adm-btn adm-btn-ghost" onClick={() => setDelete(null)}>Hủy</button>
            <button className="adm-btn adm-btn-danger" onClick={handleDelete}>Xóa</button>
          </div>
        }
      >
        <p>Xóa danh mục <strong>{deleteItem?.nameVi}</strong>?</p>
        <p className="adm-muted">BE sẽ từ chối nếu còn product reference (lỗi 409 CATEGORY_HAS_PRODUCTS).</p>
      </Modal>
    </div>
  );
};
