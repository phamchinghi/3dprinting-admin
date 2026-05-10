import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Modal } from '../components/Modal';
import type { BlogPost } from '../types';

export const Blog = () => {
  const navigate = useNavigate();
  const { posts, setPosts } = useData();
  const [search, setSearch]     = useState('');
  const [deleteItem, setDelete] = useState<BlogPost | null>(null);
  const [addOpen, setAddOpen]   = useState(false);
  const [form, setForm]         = useState({ title: '', excerpt: '', category: '', emoji: '📝', author: 'TiNi Team' });

  const filtered = posts.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (!deleteItem) return;
    setPosts((prev) => prev.filter((p) => p.id !== deleteItem.id));
    setDelete(null);
  };

  const handleAdd = () => {
    const newPost: BlogPost = {
      ...form,
      id:   'b' + Date.now(),
      slug: form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      date: new Date().toISOString().slice(0, 10),
    };
    setPosts((prev) => [newPost, ...prev]);
    setAddOpen(false);
    setForm({ title: '', excerpt: '', category: '', emoji: '📝', author: 'TiNi Team' });
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h2>Bài viết Blog</h2>
          <p className="adm-page-sub">{posts.length} bài viết</p>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={() => setAddOpen(true)}>
          + Thêm bài viết
        </button>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <input
            className="adm-search"
            placeholder="🔍 Tìm tiêu đề hoặc danh mục..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className="adm-count">{filtered.length} / {posts.length}</span>
        </div>

        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Bài viết</th>
                <th>Danh mục</th>
                <th>Tác giả</th>
                <th>Ngày đăng</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="adm-blog-cell">
                      <span className="adm-emoji">{p.emoji}</span>
                      <div>
                        <strong>{p.title}</strong>
                        <p className="adm-muted adm-small adm-excerpt">{p.excerpt}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="adm-tag">{p.category}</span></td>
                  <td className="adm-muted">{p.author}</td>
                  <td className="adm-muted">{new Date(p.date).toLocaleDateString('vi-VN')}</td>
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
                        onClick={() => setDelete(p)}
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

      {/* Delete Confirm */}
      <Modal
        open={!!deleteItem}
        onClose={() => setDelete(null)}
        title="Xác nhận xóa bài viết"
        size="sm"
        footer={
          <div className="modal-footer-actions">
            <button className="adm-btn adm-btn-ghost" onClick={() => setDelete(null)}>Hủy</button>
            <button className="adm-btn adm-btn-danger" onClick={handleDelete}>Xóa bài viết</button>
          </div>
        }
      >
        <p>Bạn có chắc muốn xóa bài viết <strong>{deleteItem?.title}</strong>?</p>
      </Modal>

      {/* Add Modal */}
      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Thêm bài viết mới"
        size="md"
        footer={
          <div className="modal-footer-actions">
            <button className="adm-btn adm-btn-ghost" onClick={() => setAddOpen(false)}>Hủy</button>
            <button
              className="adm-btn adm-btn-primary"
              onClick={handleAdd}
              disabled={!form.title}
            >
              Thêm bài viết
            </button>
          </div>
        }
      >
        <div className="adm-form-grid">
          <div className="adm-form-field full">
            <label>Tiêu đề *</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Tiêu đề bài viết..."
            />
          </div>
          <div className="adm-form-field">
            <label>Danh mục</label>
            <input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="Hướng dẫn..."
            />
          </div>
          <div className="adm-form-field">
            <label>Emoji</label>
            <input
              value={form.emoji}
              onChange={(e) => setForm((f) => ({ ...f, emoji: e.target.value }))}
              placeholder="📝"
            />
          </div>
          <div className="adm-form-field full">
            <label>Tóm tắt</label>
            <textarea
              rows={3}
              value={form.excerpt}
              onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
              placeholder="Mô tả ngắn bài viết..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
