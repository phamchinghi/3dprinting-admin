import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { formatPrice } from '../data/mock';
import {
  productApi,
  type AdminProduct,
  type UpdateProductRequest,
  type ProductBadge,
} from '../api/product';
import { categoryApi, type Category } from '../api/category';
import { uploadApi, UPLOAD_LIMITS } from '../api/upload';
import { ApiError } from '../api/client';

export const ProductEdit = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [original, setOriginal] = useState<AdminProduct | null>(null);
  const [form, setForm] = useState<AdminProduct | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [tagBusy, setTagBusy]   = useState<string | null>(null); // tag name in flight
  const [videoUploading, setVideoUploading] = useState(false);

  // Load product + categories
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setLoading(true); setError(null);
    Promise.all([productApi.getBySlug(slug), categoryApi.list()])
      .then(([p, cats]) => {
        if (cancelled) return;
        setOriginal(p);
        setForm(p);
        setCategories(cats);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof ApiError ? err.message : 'Không tải được sản phẩm');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) return <p className="adm-muted">⏳ Đang tải...</p>;

  if (!form || !original) {
    return (
      <div>
        <p className="adm-muted" style={{ marginBottom: '1rem' }}>{error ?? 'Không tìm thấy sản phẩm.'}</p>
        <button className="adm-btn adm-btn-ghost" onClick={() => navigate('/products')}>← Quay lại</button>
      </div>
    );
  }

  const set = <K extends keyof AdminProduct>(field: K, value: AdminProduct[K]) =>
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));

  // Build partial diff vs original to send minimal payload
  const buildPatch = (): UpdateProductRequest => {
    const patch: UpdateProductRequest = {};
    if (form.name !== original.name)                 patch.name = form.name;
    if (form.categoryId !== original.categoryId)     patch.categoryId = form.categoryId;
    if (form.price !== original.price)               patch.price = form.price;
    if (form.oldPrice !== original.oldPrice)         patch.oldPrice = form.oldPrice;
    if (form.emoji !== original.emoji)               patch.emoji = form.emoji;
    if (form.badge !== original.badge)               patch.badge = form.badge;
    if (form.description !== original.description)   patch.description = form.description;
    if (form.longDescription !== original.longDescription) patch.longDescription = form.longDescription ?? '';
    if (form.material !== original.material)         patch.material = form.material ?? '';
    if (form.dimensions !== original.dimensions)     patch.dimensions = form.dimensions ?? '';
    if (form.inStock !== original.inStock)           patch.inStock = form.inStock;
    if (form.videoUrl !== original.videoUrl)         patch.videoUrl = form.videoUrl ?? '';
    if (form.isActive !== original.isActive)         patch.isActive = form.isActive;
    return patch;
  };

  const handleSave = async () => {
    const patch = buildPatch();
    if (Object.keys(patch).length === 0) {
      navigate('/products');
      return;
    }
    setSaving(true); setError(null);
    try {
      const updated = await productApi.update(form.id, patch);
      setOriginal(updated);
      setForm(updated);
      navigate('/products');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = async () => {
    const tag = tagInput.trim();
    if (!tag) return;
    setTagBusy(tag); setError(null);
    try {
      const updated = await productApi.addTag(form.id, tag);
      setOriginal(updated);
      setForm((prev) => prev ? { ...prev, tags: updated.tags } : prev);
      setTagInput('');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Thêm tag thất bại');
    } finally {
      setTagBusy(null);
    }
  };

  const handleDeleteTag = async (tag: string) => {
    setTagBusy(tag); setError(null);
    try {
      const updated = await productApi.deleteTag(form.id, tag);
      setOriginal(updated);
      setForm((prev) => prev ? { ...prev, tags: updated.tags } : prev);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Xóa tag thất bại');
    } finally {
      setTagBusy(null);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';   // reset input để pick lại cùng file vẫn fire
    if (!file) return;
    // Client-side size check trước khi gửi (BE cũng check, đây là UX sớm)
    if (file.size > UPLOAD_LIMITS.video.maxBytes) {
      setError(`Video vượt giới hạn ${UPLOAD_LIMITS.video.maxLabel}`);
      return;
    }
    setVideoUploading(true); setError(null);
    try {
      const res = await uploadApi.video(file);
      set('videoUrl', res.url);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload video thất bại');
    } finally {
      setVideoUploading(false);
    }
  };

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-edit-back-title">
          <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => navigate('/products')}>← Quay lại</button>
          <div>
            <h2>Chỉnh sửa sản phẩm</h2>
            <p className="adm-page-sub">{original.name}</p>
          </div>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Đang lưu...' : '💾 Lưu thay đổi'}
        </button>
      </div>

      {error && <div className="adm-alert adm-alert-error" style={{ marginBottom: '1rem' }}>⚠️ {error}</div>}

      <div className="adm-edit-grid">
        <div className="adm-edit-main">
          {/* Basic info */}
          <div className="adm-card" style={{ marginBottom: '1.25rem' }}>
            <div className="adm-card-header"><h3>Thông tin cơ bản</h3></div>
            <div className="adm-edit-form-body">
              <div className="adm-form-grid">
                <div className="adm-form-field">
                  <label>Slug <span className="adm-muted adm-small">(không sửa được — BE từ chối)</span></label>
                  <input className="adm-input-readonly" value={form.slug} readOnly />
                </div>
                <div className="adm-form-field">
                  <label>Emoji</label>
                  <input value={form.emoji} onChange={(e) => set('emoji', e.target.value)} />
                </div>
                <div className="adm-form-field full">
                  <label>Tên sản phẩm *</label>
                  <input value={form.name} onChange={(e) => set('name', e.target.value)} />
                </div>
                <div className="adm-form-field">
                  <label>Danh mục *</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => {
                      const cat = categories.find((c) => c.id === e.target.value);
                      setForm((prev) => prev ? {
                        ...prev,
                        categoryId: e.target.value,
                        categorySlug:    cat?.slug   ?? prev.categorySlug,
                        categoryNameVi:  cat?.nameVi ?? prev.categoryNameVi,
                        categoryNameEn:  cat?.nameEn ?? prev.categoryNameEn,
                      } : prev);
                    }}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.iconEmoji ?? ''} {c.nameVi}</option>
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
                    onChange={(e) => set('oldPrice', e.target.value ? Number(e.target.value) : null)}
                    placeholder="Để trống nếu không có"
                  />
                </div>
                <div className="adm-form-field">
                  <label>Badge</label>
                  <select
                    value={form.badge ?? ''}
                    onChange={(e) => set('badge', (e.target.value || null) as ProductBadge | null)}
                  >
                    <option value="">Không có</option>
                    <option value="NEW">NEW</option>
                    <option value="HOT">HOT</option>
                    <option value="SALE">SALE</option>
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
                <div className="adm-form-field">
                  <label>Hiển thị (isActive)</label>
                  <select
                    value={form.isActive ? 'true' : 'false'}
                    onChange={(e) => set('isActive', e.target.value === 'true')}
                  >
                    <option value="true">Public</option>
                    <option value="false">Ẩn</option>
                  </select>
                </div>
                <div className="adm-form-field full">
                  <label>Mô tả ngắn</label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                  />
                </div>
                <div className="adm-form-field full">
                  <label>Mô tả dài</label>
                  <textarea
                    rows={4}
                    value={form.longDescription ?? ''}
                    onChange={(e) => set('longDescription', e.target.value || null)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Technical details */}
          <div className="adm-card" style={{ marginBottom: '1.25rem' }}>
            <div className="adm-card-header"><h3>Chi tiết kỹ thuật</h3></div>
            <div className="adm-edit-form-body">
              <div className="adm-form-grid">
                <div className="adm-form-field full">
                  <label>Chất liệu</label>
                  <input
                    value={form.material ?? ''}
                    onChange={(e) => set('material', e.target.value || null)}
                    placeholder="VD: PLA 1.75mm"
                  />
                </div>
                <div className="adm-form-field full">
                  <label>Kích thước</label>
                  <input
                    value={form.dimensions ?? ''}
                    onChange={(e) => set('dimensions', e.target.value || null)}
                    placeholder="VD: 15 × 20 × 25 cm"
                  />
                </div>
                <div className="adm-form-field full">
                  <label>Video URL <span className="adm-muted adm-small">(hoặc upload mp4/webm ≤ {UPLOAD_LIMITS.video.maxLabel})</span></label>
                  <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                    <input
                      style={{ flex: 1 }}
                      value={form.videoUrl ?? ''}
                      onChange={(e) => set('videoUrl', e.target.value || null)}
                      placeholder="https://..."
                    />
                    <label
                      className="adm-btn adm-btn-ghost adm-btn-sm"
                      style={{ cursor: videoUploading ? 'wait' : 'pointer', whiteSpace: 'nowrap' }}
                    >
                      {videoUploading ? '⏳ Đang upload...' : '📤 Upload'}
                      <input
                        type="file"
                        accept={UPLOAD_LIMITS.video.accept}
                        hidden
                        disabled={videoUploading}
                        onChange={handleVideoUpload}
                      />
                    </label>
                  </div>
                </div>
                <div className="adm-form-field">
                  <label>Đánh giá <span className="adm-muted adm-small">(read-only — tính từ reviews)</span></label>
                  <input className="adm-input-readonly" value={Number(form.rating).toFixed(1)} readOnly />
                </div>
                <div className="adm-form-field">
                  <label>Số lượt đánh giá <span className="adm-muted adm-small">(read-only)</span></label>
                  <input className="adm-input-readonly" value={form.reviewCount} readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="adm-card">
            <div className="adm-card-header"><h3>Tags</h3></div>
            <div className="adm-edit-form-body">
              <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                {form.tags.length === 0 && <span className="adm-muted adm-small">Chưa có tag nào.</span>}
                {form.tags.map((tag) => (
                  <span key={tag} className="adm-tag" style={{ display: 'inline-flex', gap: '.4rem', alignItems: 'center' }}>
                    {tag}
                    <button
                      type="button"
                      className="adm-btn adm-btn-sm adm-btn-danger-ghost"
                      onClick={() => handleDeleteTag(tag)}
                      disabled={tagBusy === tag}
                      style={{ padding: '0 .35rem', lineHeight: 1 }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '.5rem' }}>
                <input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="best-seller, fantasy, new-arrivals..."
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                  style={{ flex: 1 }}
                />
                <button
                  className="adm-btn adm-btn-primary adm-btn-sm"
                  onClick={handleAddTag}
                  disabled={!tagInput.trim() || tagBusy !== null}
                >
                  {tagBusy === tagInput.trim() ? 'Đang thêm...' : '+ Thêm tag'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live preview */}
        <div className="adm-edit-sidebar">
          <div className="adm-card adm-edit-preview-card">
            <div className="adm-card-header"><h3>Xem trước</h3></div>
            <div className="adm-edit-preview-body">
              <span className="adm-edit-preview-emoji">{form.emoji}</span>
              <h4 className="adm-edit-preview-name">{form.name || '—'}</h4>
              <div className="adm-edit-preview-badges">
                <span className="adm-tag">{form.categoryNameVi}</span>
                {form.badge && (
                  <span className={`adm-badge badge-${form.badge.toLowerCase()}`}>{form.badge}</span>
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
              <p className="adm-small">⭐ {Number(form.rating).toFixed(1)} ({form.reviewCount} đánh giá)</p>
              {form.tags.length > 0 && (
                <div className="adm-edit-preview-tags">
                  {form.tags.map((t) => <span key={t} className="adm-tag">{t}</span>)}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
