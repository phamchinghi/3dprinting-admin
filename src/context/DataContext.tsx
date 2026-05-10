import { createContext, useContext, useState, type ReactNode } from 'react';
import { mockProducts, mockBlogPosts } from '../data/mock';
import type { Product, BlogPost } from '../types';

// NOTE: `users` đã chuyển sang gọi BE thật qua `api/adminUser.ts` —
// xem `pages/Users.tsx`, `pages/UserEdit.tsx`, `pages/Dashboard.tsx`.
// Products và BlogPosts vẫn mock chờ BE module P1-5 / P1-7.

interface DataCtx {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  posts: BlogPost[];
  setPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
}

const DataContext = createContext<DataCtx | null>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [posts, setPosts]       = useState<BlogPost[]>(mockBlogPosts);

  return (
    <DataContext.Provider value={{ products, setProducts, posts, setPosts }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataCtx => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
