import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext';
import type { BlogPost } from '../types';

export const BlogEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { posts, setPosts } = useData();

  const original = posts.find((p) => p.id === id);
  const [form, setForm] = useState<BlogPost | null>(original ? { ...original } : null);

  if (!form) {
    return (
      <div>
        <p className="adm-muted" style={{ marginBottom: '1rem' }}>Không tìm thấy bài viết.</p>
        <button className="adm-btn adm-btn-ghost" onClick={() => navigate('/blog')}>← Quay lại</button>
      </div>
    );
  }

  const set = <K extends keyof BlogPost>(field: K, value: BlogPost[K]) =>
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev));

  const handleSave = () => {
    setPosts((prev) => prev.map((p) => (p.id === form.id ? form : p)));
    navigate('/blog');
  };

  return (
    <div>
      <div className="adm-page-header">
        <div className="adm-edit-back-title">
          <button className="adm-btn adm-btn-ghost adm-btn-sm" onClick={() => navigate('/blog')}>← Quay lại</button>
          <div>
            <h2>Chỉnh sửa bài viết</h2>
            <p className="adm-page-sub">{original?.title}</p>
          </div>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={handleSave}>💾 Lưu thay đổi</button>
      </div>

      <div className="adm-edit-grid">
        {/* Left: form */}
        <div className="adm-edit-main">
          <div className="adm-card">
            <div className="adm-card-header"><h3>Thông tin bài viết</h3></div>
            <div className="adm-edit-form-body">
              <div className="adm-form-grid">
                <div className="adm-form-field full">
                  <label>Tiêu đề *</label>
                  <input value={form.title} onChange={(e) => set('title', e.target.value)} />
                </div>
                <div className="adm-form-field">
                  <label>Emoji</label>
                  <input value={form.emoji} onChange={(e) => set('emoji', e.target.value)} />
                </div>
                <div className="adm-form-field">
                  <label>Danh mục</label>
                  <input
                    value={form.category}
                    onChange={(e) => set('category', e.target.value)}
                    placeholder="Hướng dẫn, Mẹo hay, Kiến thức..."
                  />
                </div>
                <div className="adm-form-field">
                  <label>Tác giả</label>
                  <input value={form.author} onChange={(e) => set('author', e.target.value)} />
                </div>
                <div className="adm-form-field">
                  <label>Ngày đăng</label>
                  <input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
                </div>
                <div className="adm-form-field full">
                  <label>Tóm tắt</label>
                  <textarea
                    rows={4}
                    value={form.excerpt}
                    onChange={(e) => set('excerpt', e.target.value)}
                    placeholder="Mô tả ngắn bài viết..."
                  />
                </div>
                <div className="adm-form-field full">
                  <label>Slug (URL)</label>
                  <input value={form.slug} onChange={(e) => set('slug', e.target.value)} />
                  <span className="adm-muted adm-small">/blog/{form.slug}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: preview */}
        <div className="adm-edit-sidebar">
          <div className="adm-card adm-edit-preview-card">
            <div className="adm-card-header"><h3>Xem trước</h3></div>
            <div className="adm-edit-preview-body">
              <span className="adm-edit-preview-emoji">{form.emoji}</span>
              <h4 className="adm-edit-preview-name">{form.title || '—'}</h4>
              <div className="adm-edit-preview-badges">
                {form.category && <span className="adm-tag">{form.category}</span>}
              </div>
              {form.excerpt && (
                <p className="adm-muted adm-small adm-edit-preview-desc">{form.excerpt}</p>
              )}
              <div style={{ marginTop: '.75rem', display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
                <p className="adm-small"><strong>Tác giả:</strong> {form.author || '—'}</p>
                <p className="adm-small">
                  <strong>Ngày đăng:</strong>{' '}
                  {form.date ? new Date(form.date).toLocaleDateString('vi-VN') : '—'}
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
