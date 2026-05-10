import { createContext, useContext, useState, type ReactNode } from 'react';
import { mockBlogPosts } from '../data/mock';
import type { BlogPost } from '../types';

// NOTE: `users` đã chuyển sang gọi BE thật qua `api/adminUser.ts`.
// `products` đã chuyển sang gọi BE thật qua `api/product.ts` (P1-5).
// Chỉ còn BlogPosts mock — chờ BE module P1-7.

interface DataCtx {
  posts: BlogPost[];
  setPosts: React.Dispatch<React.SetStateAction<BlogPost[]>>;
}

const DataContext = createContext<DataCtx | null>(null);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<BlogPost[]>(mockBlogPosts);

  return (
    <DataContext.Provider value={{ posts, setPosts }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataCtx => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
};
