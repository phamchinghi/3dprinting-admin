import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoryApi, type Category, type UpdateCategoryRequest } from '../api/category';

export const CategoryEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [original, setOriginal] = useState<Category | null>(null);
  const [form, setForm]         = useState<UpdateCategoryRequest>({});
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    categoryApi.list()
      .then((list) => {
        if (cancelled) return;
        const c = list.find((x) => x.id === id);
        if (!c) {
          setError('Không tìm thấy danh mục');
          return;
        }
        setOriginal(c);
        setForm({
          nameVi: c.nameVi,
          nameEn: c.nameEn,
          iconEmoji: c.iconEmoji ?? '',
          descriptionVi: c.descriptionVi ?? '',
          descriptionEn: c.descriptionEn ?? '',
          sortOrder: c.sortOrder,
        });
      })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Lỗi tải danh mục'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id]);

  const set = <K extends keyof UpdateCategoryRequest>(key: K, value: UpdateCategoryRequest[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!original) return;
    setSaving(true);
    try {
      await categoryApi.update(original.id, form);
      navigate('/categories');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Không cập nhật được');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="adm-muted">Đang tải...</p>;
  if (error || !original) {
    return (
      <div>
        <p className="adm-muted" style={{ marginBottom: '1rem' }}>{error ?? 'Không tìm thấy.'}</p>
        <button className="adm-btn adm-btn-ghost" onClick={() => navigate('/categories')}>← Quay lại</button>
      </div>
    );
  }

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-edit-back-title">
          <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => navigate('/categories')}>← Quay lại</button>
          <div>
            <h2>Chỉnh sửa danh mục</h2>
            <p className="adm-page-sub">{original.nameVi} <code style={{ marginLeft: '.5rem' }}>{original.slug}</code></p>
          </div>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
        </button>
      </div>

      <div className="adm-edit-single">
        <div className="adm-card" style={{ marginBottom: '1.25rem' }}>
          <div className="adm-card-header">
            <h3>Thông tin cơ bản</h3>
            <span className="adm-muted adm-small">Slug không sửa được — tạo danh mục mới nếu cần đổi</span>
          </div>
          <div className="adm-edit-form-body">
            <div className="adm-form-grid">
              <div className="adm-form-field full">
                <label>Slug</label>
                <input value={original.slug} disabled className="adm-input-readonly" />
              </div>
              <div className="adm-form-field">
                <label>Tên (VI) *</label>
                <input value={form.nameVi ?? ''} onChange={(e) => set('nameVi', e.target.value)} />
              </div>
              <div className="adm-form-field">
                <label>Tên (EN) *</label>
                <input value={form.nameEn ?? ''} onChange={(e) => set('nameEn', e.target.value)} />
              </div>
              <div className="adm-form-field">
                <label>Icon emoji</label>
                <input value={form.iconEmoji ?? ''} onChange={(e) => set('iconEmoji', e.target.value)} placeholder="🎎" />
              </div>
              <div className="adm-form-field">
                <label>Sort order</label>
                <input
                  type="number"
                  value={form.sortOrder ?? 0}
                  onChange={(e) => set('sortOrder', Number(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-header"><h3>Mô tả</h3></div>
          <div className="adm-edit-form-body">
            <div className="adm-form-grid">
              <div className="adm-form-field full">
                <label>Mô tả (VI)</label>
                <textarea
                  rows={3}
                  value={form.descriptionVi ?? ''}
                  onChange={(e) => set('descriptionVi', e.target.value)}
                />
              </div>
              <div className="adm-form-field full">
                <label>Mô tả (EN)</label>
                <textarea
                  rows={3}
                  value={form.descriptionEn ?? ''}
                  onChange={(e) => set('descriptionEn', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
