import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  blogApi,
  type AdminBlogPost,
  type ApiBlogCategory,
  type UpdateBlogPostRequest,
} from '../api/blog';
import { ApiError } from '../api/client';
import { useToast } from '../context/ToastContext';

export const BlogEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [original, setOriginal] = useState<AdminBlogPost | null>(null);
  const [form, setForm] = useState<AdminBlogPost | null>(null);
  const [categories, setCategories] = useState<ApiBlogCategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [publishBusy, setPublishBusy] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true); setLoadFailed(false);
    Promise.all([blogApi.getById(id), blogApi.listCategories()])
      .then(([p, cats]) => {
        if (cancelled) return;
        setOriginal(p);
        setForm(p);
        setCategories(cats);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadFailed(true);
        toast.error(err instanceof ApiError ? err.message : 'Không tải được bài viết');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, toast]);

  if (loading) return <p className="adm-muted">⏳ Đang tải...</p>;

  if (!form || !original) {
    return (
      <div>
        <p className="adm-muted" style={{ marginBottom: '1rem' }}>{loadFailed ? 'Không tải được bài viết.' : 'Không tìm thấy bài viết.'}</p>
        <button className="adm-btn adm-btn-ghost" onClick={() => navigate('/blog')}>← Quay lại</button>
      </div>
    );
  }

  const set = <K extends keyof AdminBlogPost>(field: K, value: AdminBlogPost[K]) =>
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));

  // Partial-patch diff vs original — chỉ gửi field đã đổi (giảm payload + né slug-immutable guard)
  const buildPatch = (): UpdateBlogPostRequest => {
    const patch: UpdateBlogPostRequest = {};
    if (form.title       !== original.title)       patch.title       = form.title;
    if (form.excerpt     !== original.excerpt)     patch.excerpt     = form.excerpt ?? '';
    if (form.content     !== original.content)     patch.content     = form.content ?? '';
    if (form.emoji       !== original.emoji)       patch.emoji       = form.emoji ?? '';
    if (form.categoryId  !== original.categoryId)  patch.categoryId  = form.categoryId ?? undefined;
    return patch;
  };

  const handleSave = async () => {
    const patch = buildPatch();
    if (Object.keys(patch).length === 0) { navigate('/blog'); return; }
    setSaving(true);
    try {
      const updated = await blogApi.update(form.id, patch);
      setOriginal(updated);
      setForm(updated);
      toast.success('Đã lưu thay đổi');
      navigate('/blog');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    setPublishBusy(true);
    try {
      const updated = await blogApi.setPublish(form.id, !form.isPublished);
      setOriginal(updated);
      setForm(updated);
      toast.success(updated.isPublished ? 'Đã publish bài viết' : 'Đã unpublish bài viết');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Đổi trạng thái publish thất bại');
    } finally {
      setPublishBusy(false);
    }
  };

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-edit-back-title">
          <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => navigate('/blog')}>← Quay lại</button>
          <div>
            <h2>Chỉnh sửa bài viết</h2>
            <p className="adm-page-sub">{original.title}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '.5rem' }}>
          <button
            className={`adm-btn ${form.isPublished ? 'adm-btn-ghost' : 'adm-btn-primary'}`}
            onClick={handleTogglePublish}
            disabled={publishBusy}
          >
            {publishBusy ? '...' : form.isPublished ? '○ Unpublish' : '✓ Publish'}
          </button>
          <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
          </button>
        </div>
      </div>

      <div className="adm-edit-grid">
        <div className="adm-edit-main">
          <div className="adm-card">
            <div className="adm-card-header"><h3>Thông tin bài viết</h3></div>
            <div className="adm-edit-form-body">
              <div className="adm-form-grid">
                <div className="adm-form-field full">
                  <label>Slug <span className="adm-muted adm-small">(không sửa được — BE từ chối)</span></label>
                  <input className="adm-input-readonly" value={form.slug} readOnly />
                  <span className="adm-muted adm-small">/blog/{form.slug}</span>
                </div>
                <div className="adm-form-field full">
                  <label>Tiêu đề *</label>
                  <input value={form.title} onChange={(e) => set('title', e.target.value)} />
                </div>
                <div className="adm-form-field">
                  <label>Emoji</label>
                  <input value={form.emoji ?? ''} onChange={(e) => set('emoji', e.target.value || null)} />
                </div>
                <div className="adm-form-field">
                  <label>Danh mục</label>
                  <select
                    value={form.categoryId ?? ''}
                    onChange={(e) => set('categoryId', e.target.value || null)}
                  >
                    <option value="">— Không gán —</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="adm-form-field full">
                  <label>Tóm tắt</label>
                  <textarea
                    rows={3}
                    value={form.excerpt ?? ''}
                    onChange={(e) => set('excerpt', e.target.value || null)}
                  />
                </div>
                <div className="adm-form-field full">
                  <label>Nội dung</label>
                  <textarea
                    rows={10}
                    value={form.content ?? ''}
                    onChange={(e) => set('content', e.target.value || null)}
                    placeholder="Nội dung bài viết..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="adm-edit-sidebar">
          <div className="adm-card adm-edit-preview-card">
            <div className="adm-card-header"><h3>Xem trước</h3></div>
            <div className="adm-edit-preview-body">
              <span className="adm-edit-preview-emoji">{form.emoji ?? '📝'}</span>
              <h4 className="adm-edit-preview-name">{form.title || '—'}</h4>
              <div className="adm-edit-preview-badges">
                {form.categoryName && <span className="adm-tag">{form.categoryName}</span>}
                <span className={`adm-badge ${form.isPublished ? 'badge-success' : 'badge-warning'}`}>
                  {form.isPublished ? '✓ Published' : '○ Draft'}
                </span>
              </div>
              {form.excerpt && (
                <p className="adm-muted adm-small adm-edit-preview-desc">{form.excerpt}</p>
              )}
              <div style={{ marginTop: '.75rem', display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
                <p className="adm-small"><strong>Tác giả:</strong> {form.authorName ?? '—'}</p>
                <p className="adm-small">
                  <strong>Publish:</strong>{' '}
                  {form.publishedAt ? new Date(form.publishedAt).toLocaleDateString('vi-VN') : '— (chưa publish)'}
                </p>
                <p className="adm-small adm-muted" style={{ wordBreak: 'break-all' }}>
                  /blog/{form.slug}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
