import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../components/Modal';
import {
  blogApi,
  type AdminBlogPost,
  type CreateBlogPostRequest,
  type ApiBlogCategory,
} from '../api/blog';
import { ApiError } from '../api/client';

const PAGE_SIZE = 20;
const SLUG_RE = /^[a-z0-9-]+$/;

const EMPTY_FORM: CreateBlogPostRequest & { categoryId: string } = {
  slug: '',
  title: '',
  excerpt: '',
  content: '',
  emoji: '📝',
  categoryId: '',
  isPublished: false,
};

const fmt = (iso: string | null) => iso ? new Date(iso).toLocaleDateString('vi-VN') : '—';

export const Blog = () => {
  const navigate = useNavigate();

  const [items, setItems] = useState<AdminBlogPost[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState('');
  const [filterPublished, setFilterPublished] = useState<'all' | 'true' | 'false'>('all');

  const [categories, setCategories] = useState<ApiBlogCategory[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const [deleteItem, setDeleteItem] = useState<AdminBlogPost | null>(null);
  const [busy, setBusy] = useState(false);

  const [addOpen, setAddOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    blogApi.listCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const reload = () => {
    setLoading(true); setError(null);
    const isPublished = filterPublished === 'all' ? undefined : filterPublished === 'true';
    blogApi.list({ page, size: PAGE_SIZE, isPublished })
      .then((res) => {
        setItems(res.items);
        setTotalElements(res.totalElements);
        setTotalPages(Math.max(1, res.totalPages));
      })
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'Không tải được danh sách bài viết');
        setItems([]); setTotalElements(0); setTotalPages(1);
      })
      .finally(() => setLoading(false));
  };

  useEffect(reload, [page, filterPublished]);

  // Client-side search (BE chưa có /search cho blog)
  const filtered = items.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return p.title.toLowerCase().includes(q) || (p.categoryName?.toLowerCase().includes(q) ?? false);
  });

  const handleTogglePublish = async (p: AdminBlogPost) => {
    setBusy(true); setError(null);
    try {
      const updated = await blogApi.setPublish(p.id, !p.isPublished);
      setItems((prev) => prev.map((it) => it.id === p.id ? updated : it));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Đổi trạng thái publish thất bại');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setBusy(true); setError(null);
    try {
      await blogApi.delete(deleteItem.id);
      setDeleteItem(null);
      if (items.length === 1 && page > 1) setPage((p) => p - 1);
      else reload();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Xóa bài thất bại');
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = async () => {
    if (!form.slug || !SLUG_RE.test(form.slug)) { setFormError('Slug phải khớp ^[a-z0-9-]+$'); return; }
    if (!form.title?.trim()) { setFormError('Tiêu đề bắt buộc'); return; }
    setBusy(true); setFormError(null);
    try {
      await blogApi.create({
        slug: form.slug,
        title: form.title,
        excerpt: form.excerpt || undefined,
        content: form.content || undefined,
        emoji: form.emoji || undefined,
        categoryId: form.categoryId || undefined,
        isPublished: form.isPublished,
      });
      setAddOpen(false);
      setForm(EMPTY_FORM);
      setPage(1);
      reload();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Tạo bài thất bại');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h2>Bài viết Blog</h2>
          <p className="adm-page-sub">{totalElements} bài viết (bao gồm draft)</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={() => { setForm(EMPTY_FORM); setFormError(null); setAddOpen(true); }}>
          + Thêm bài viết
        </button>
      </div>

      {error && <div className="adm-alert adm-alert-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}

      <div className="adm-card">
        <div className="adm-toolbar">
          <input
            className="adm-search"
            placeholder="🔍 Tìm tiêu đề hoặc danh mục (client-side)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="adm-select"
            value={filterPublished}
            onChange={(e) => { setFilterPublished(e.target.value as 'all' | 'true' | 'false'); setPage(1); }}
          >
            <option value="all">Tất cả</option>
            <option value="true">Đã publish</option>
            <option value="false">Draft</option>
          </select>
          <span className="adm-count">{filtered.length} / {totalElements}</span>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Bài viết</th>
                <th>Danh mục</th>
                <th>Tác giả</th>
                <th>Trạng thái</th>
                <th>Ngày đăng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={6} className="adm-muted" style={{ textAlign: 'center', padding: '2rem' }}>⏳ Đang tải...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={6} className="adm-muted" style={{ textAlign: 'center', padding: '2rem' }}>Không có bài viết</td></tr>
              )}
              {!loading && filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="adm-blog-cell">
                      <span className="adm-emoji">{p.emoji ?? '📝'}</span>
                      <div>
                        <strong>{p.title}</strong>
                        {p.excerpt && <p className="adm-muted adm-small adm-excerpt">{p.excerpt}</p>}
                        <div className="adm-muted adm-small">/blog/{p.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className="adm-tag">{p.categoryName ?? '—'}</span></td>
                  <td className="adm-muted">{p.authorName ?? '—'}</td>
                  <td>
                    <button
                      className={`adm-badge ${p.isPublished ? 'badge-success' : 'badge-warning'}`}
                      onClick={() => handleTogglePublish(p)}
                      disabled={busy}
                      style={{ cursor: 'pointer', border: 0 }}
                      title="Click để toggle publish"
                    >
                      {p.isPublished ? '✓ Published' : '○ Draft'}
                    </button>
                  </td>
                  <td className="adm-muted">{fmt(p.publishedAt ?? p.createdAt)}</td>
                  <td>
                    <div className="adm-actions">
                      <button
                        className="adm-btn adm-btn-sm adm-btn-ghost"
                        onClick={() => navigate(`/blog/${p.id}/edit`)}
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
          <div style={{ display: 'flex', justifyContent: 'center', gap: '.5rem', padding: '1rem' }}>
            <button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</button>
            <span className="adm-muted" style={{ alignSelf: 'center' }}>Trang {page} / {totalPages}</span>
            <button className="adm-btn adm-btn-ghost adm-btn-sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>›</button>
          </div>
        )}
      </div>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteItem}
        onClose={() => !busy && setDeleteItem(null)}
        title="Xác nhận xóa bài viết"
        size="sm"
        footer={
          <div className="modal-footer-actions">
            <button className="adm-btn adm-btn-ghost" onClick={() => setDeleteItem(null)} disabled={busy}>Hủy</button>
            <button className="adm-btn adm-btn-danger" onClick={handleDelete} disabled={busy}>
              {busy ? 'Đang xóa...' : 'Xóa bài viết'}
            </button>
          </div>
        }
      >
        <p>Bạn có chắc muốn xóa bài <strong>{deleteItem?.title}</strong>?</p>
        <p className="adm-muted">Thao tác này không thể hoàn tác.</p>
      </Modal>

      {/* Add Modal */}
      <Modal
        open={addOpen}
        onClose={() => !busy && setAddOpen(false)}
        title="Thêm bài viết mới"
        size="md"
        closeOnOverlayClick={false}
        footer={
          <div className="modal-footer-actions">
            <button className="adm-btn adm-btn-ghost" onClick={() => setAddOpen(false)} disabled={busy}>Hủy</button>
            <button className="adm-btn adm-btn-primary" onClick={handleAdd} disabled={busy}>
              {busy ? 'Đang lưu...' : 'Thêm bài viết'}
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
              placeholder="bai-viet-vi-du"
            />
          </div>
          <div className="adm-form-field">
            <label>Emoji</label>
            <input
              value={form.emoji ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
              placeholder="📝"
            />
          </div>
          <div className="adm-form-field full">
            <label>Tiêu đề *</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Tiêu đề bài viết..."
            />
          </div>
          <div className="adm-form-field full">
            <label>Tóm tắt</label>
            <textarea
              rows={2}
              value={form.excerpt ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              placeholder="Mô tả ngắn..."
            />
          </div>
          <div className="adm-form-field">
            <label>Danh mục</label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
            >
              <option value="">— Không gán —</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="adm-form-field">
            <label>Publish ngay</label>
            <select
              value={form.isPublished ? 'true' : 'false'}
              onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.value === 'true' }))}
            >
              <option value="false">Lưu draft</option>
              <option value="true">Publish ngay</option>
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
};
