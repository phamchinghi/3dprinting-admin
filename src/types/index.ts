export type ProductCategory = 'model' | 'accessory' | 'filament' | 'service';

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  price: number;
  oldPrice?: number;
  rating: number;
  reviewCount: number;
  emoji: string;
  badge?: 'new' | 'sale' | 'hot';
  description: string;
  material?: string;
  dimensions?: string;
  inStock: boolean;
  tags: string[];
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  category: string;
  emoji: string;
}

export interface OrderCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  province: string;
  district: string;
  note: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered';
export type PaymentMethod = 'cod' | 'bank' | 'ewallet';

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  customer: OrderCustomer;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
}

export interface AdminUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  provider: 'google' | 'facebook' | 'phone' | 'email';
  joinDate: string;
  orderCount: number;
  status: 'active' | 'inactive';
}
