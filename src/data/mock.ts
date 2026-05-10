import type { Product, BlogPost, AdminUser } from '../types';

export const mockProducts: Product[] = [
  { id: 'p001', slug: 'mo-hinh-rong-phun-lua', name: 'Mô hình Rồng Phun Lửa', category: 'model', categoryLabel: 'Mô hình', price: 450000, oldPrice: 550000, rating: 4.8, reviewCount: 42, emoji: '🐉', badge: 'hot', description: 'Mô hình rồng chi tiết cao, phù hợp trưng bày.', material: 'Nhựa Resin cao cấp', dimensions: '15 × 20 × 25 cm', inStock: true, tags: ['best-seller', 'fantasy'] },
  { id: 'p002', slug: 'gia-do-dien-thoai-mech', name: 'Giá đỡ điện thoại Mech', category: 'accessory', categoryLabel: 'Phụ kiện', price: 180000, rating: 4.6, reviewCount: 87, emoji: '📱', badge: 'new', description: 'Giá đỡ thiết kế phong cách mecha, chắc chắn.', material: 'PLA bền cao', dimensions: '10 × 8 × 12 cm', inStock: true, tags: ['new-arrivals', 'desk'] },
  { id: 'p003', slug: 'chau-cay-hinh-hoc', name: 'Chậu cây hình học Low-poly', category: 'accessory', categoryLabel: 'Phụ kiện', price: 120000, rating: 4.9, reviewCount: 156, emoji: '🪴', description: 'Chậu cây low-poly hiện đại cho bàn làm việc.', material: 'PETG thân thiện môi trường', dimensions: '8 × 8 × 10 cm', inStock: true, tags: ['best-seller', 'home'] },
  { id: 'p004', slug: 'filament-pla-xanh', name: 'Filament PLA TiNi Blue', category: 'filament', categoryLabel: 'Vật liệu', price: 320000, oldPrice: 380000, rating: 4.7, reviewCount: 203, emoji: '🧵', badge: 'sale', description: 'Cuộn 1kg PLA chất lượng cao, màu signature TiNi.', material: 'PLA 1.75mm', dimensions: 'Cuộn 1kg', inStock: true, tags: ['hot-sales'] },
  { id: 'p005', slug: 'mo-hinh-kien-truc-tuy-chinh', name: 'Dịch vụ in mô hình kiến trúc', category: 'service', categoryLabel: 'Dịch vụ', price: 1500000, rating: 5.0, reviewCount: 28, emoji: '🏛️', description: 'In mô hình kiến trúc theo file STL của bạn.', material: 'Tùy chọn', dimensions: 'Tùy dự án', inStock: true, tags: ['custom'] },
  { id: 'p006', slug: 'tuong-anime-waifu', name: 'Tượng Anime Waifu 20cm', category: 'model', categoryLabel: 'Mô hình', price: 680000, rating: 4.9, reviewCount: 94, emoji: '🎎', badge: 'hot', description: 'Tượng anime chi tiết cao, sơn tay.', material: 'Resin + sơn acrylic', dimensions: '10 × 12 × 20 cm', inStock: true, tags: ['hot-sales', 'anime'] },
  { id: 'p007', slug: 'keychain-logo-tuy-chinh', name: 'Móc khóa logo tùy chỉnh', category: 'service', categoryLabel: 'Dịch vụ', price: 45000, rating: 4.5, reviewCount: 312, emoji: '🔑', badge: 'new', description: 'In móc khóa theo logo hoặc tên bạn.', material: 'PLA đa màu', dimensions: '5 × 3 cm', inStock: true, tags: ['new-arrivals', 'custom'] },
  { id: 'p008', slug: 'filament-petg-trong-suot', name: 'Filament PETG trong suốt', category: 'filament', categoryLabel: 'Vật liệu', price: 380000, rating: 4.8, reviewCount: 145, emoji: '💠', description: 'PETG trong suốt, bền và chống va đập.', material: 'PETG 1.75mm', dimensions: 'Cuộn 1kg', inStock: true, tags: ['best-seller'] },
];

export const mockBlogPosts: BlogPost[] = [
  { id: 'b001', slug: 'cach-chon-may-in-3d-dau-tien', title: 'Cách chọn máy in 3D đầu tiên cho người mới', excerpt: 'Hướng dẫn chi tiết giúp bạn chọn máy in 3D phù hợp với nhu cầu và ngân sách.', date: '2026-04-10', author: 'TiNi Team', category: 'Hướng dẫn', emoji: '🖨️' },
  { id: 'b002', slug: 'so-sanh-pla-petg-abs', title: 'So sánh PLA, PETG và ABS: Chọn vật liệu nào?', excerpt: 'Ưu nhược điểm từng loại filament phổ biến, khi nào nên dùng loại nào.', date: '2026-04-02', author: 'TiNi Team', category: 'Kiến thức', emoji: '🧵' },
  { id: 'b003', slug: 'toi-uu-slicer-cura', title: '10 thiết lập Cura giúp bản in đẹp hơn', excerpt: 'Tip & tricks tối ưu slicer để có chất lượng in tốt nhất.', date: '2026-03-20', author: 'TiNi Team', category: 'Mẹo hay', emoji: '⚙️' },
  { id: 'b004', slug: 'in-3d-anime-figure', title: 'In 3D figure anime: từ file STL đến thành phẩm', excerpt: 'Quy trình đầy đủ để tạo ra một figure anime chất lượng phòng trưng bày.', date: '2026-03-08', author: 'TiNi Team', category: 'Hướng dẫn', emoji: '🎎' },
  { id: 'b005', slug: 'in-3d-kien-truc', title: 'Ứng dụng in 3D trong mô hình kiến trúc', excerpt: 'Làm sao in 3D giúp kiến trúc sư trình bày ý tưởng hiệu quả hơn.', date: '2026-02-25', author: 'TiNi Team', category: 'Ứng dụng', emoji: '🏛️' },
  { id: 'b006', slug: 'bao-duong-may-in-3d', title: 'Bảo dưỡng máy in 3D: checklist hàng tuần', excerpt: 'Checklist đơn giản giúp máy in của bạn luôn ở trạng thái tốt nhất.', date: '2026-02-10', author: 'TiNi Team', category: 'Bảo dưỡng', emoji: '🔧' },
];

export const mockUsers: AdminUser[] = [
  { id: 'u001', name: 'Nguyễn Văn An', email: 'an.nguyen@gmail.com', provider: 'google', joinDate: '2026-01-15', orderCount: 3, status: 'active' },
  { id: 'u002', name: 'Trần Thị Bình', phone: '0912345678', provider: 'phone', joinDate: '2026-02-03', orderCount: 1, status: 'active' },
  { id: 'u003', name: 'Lê Minh Cường', email: 'cuong.le@example.com', provider: 'email', joinDate: '2026-02-20', orderCount: 5, status: 'active' },
  { id: 'u004', name: 'Phạm Thị Dung', phone: '0923456789', provider: 'facebook', joinDate: '2026-03-10', orderCount: 2, status: 'active' },
  { id: 'u005', name: 'Hoàng Văn Em', email: 'em.hoang@gmail.com', provider: 'google', joinDate: '2026-04-01', orderCount: 0, status: 'inactive' },
];

export const formatPrice = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export const ORDERS_KEY = 'tini-orders';

export const getOrders = () => {
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

export const saveOrders = (orders: unknown[]) => {
  try { localStorage.setItem(ORDERS_KEY, JSON.stringify(orders)); } catch { /* ignore */ }
};
