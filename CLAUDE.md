# CLAUDE.md – TuNi 3D Admin Dashboard

> Companion admin panel for **TuNi 3D Store** (`../3dprinting_ui`).
> Legend: ✅ Done · ⚠️ Partial · ❌ Pending

---

# 🎯 PROJECT CONTEXT

| Field | Value |
|---|---|
| Project | TuNi 3D Admin Dashboard |
| Port | **5174** (`npm run dev`) |
| Stack | **Vite 5 + React 18 + TypeScript (strict)** |
| Routing | react-router-dom v6 |
| Styling | Single global CSS (`src/admin.css`) with CSS custom properties |
| Palette | Same brand palette as main site — `#34526F` · `#7EAED0` · `#A0D4FF` |
| Auth | Admin-only: `admin` / `admin123` → localStorage key `tuni-admin-auth` |
| Data | **Users** + **Auth** từ BE thật (port 8081). Products/Orders/Blog/Dashboard-stats còn mock chờ BE P1-5..P1-8 |
| State | `DataContext` (products · posts) — `users` đã gỡ, gọi API trực tiếp trong từng page |

---

# 🗺️ ROUTES

| Route | Page | Description |
|---|---|---|
| `/login` | Login | Admin authentication — wired to `POST /api/admin/auth/login` |
| `/` | Dashboard | Stats cards + recent orders + category chart |
| `/products` | Products | List + Add + Delete; ✏️ Sửa → `/products/:id/edit` |
| `/products/:id/edit` | ProductEdit | **Full edit page** — tất cả trường + live preview |
| `/categories` | Categories | List + Add modal + Delete; ✏️ Sửa → `/categories/:id/edit` ✅ Real API |
| `/categories/:id/edit` | CategoryEdit | **Full edit page** — slug read-only, tên VI/EN + icon + sort + mô tả ✅ Real API |
| `/orders` | Orders | Manage orders from localStorage `tuni-orders`, update status |
| `/users` | Users | List + toggle status + Delete; ✏️ Sửa → `/users/:id/edit` |
| `/users/:id/edit` | UserEdit | **Full edit page** — thông tin cá nhân + tài khoản |
| `/blog` | Blog | List + Add + Delete; ✏️ Sửa → `/blog/:id/edit` |
| `/blog/:id/edit` | BlogEdit | **Full edit page** — tất cả trường + live preview |

---

# 🏗️ PROJECT STRUCTURE

```
src/
 ├── api/
 │    ├── client.ts             HTTP engine · token mgmt · authApi (adminLogin/refresh/logout) · api (protected)
 │    ├── adminUser.ts          adminUserApi: list/getById/updateStatus/delete → /api/admin/users
 │    └── category.ts           categoryApi: list/getBySlug/create/update/delete → /api/categories + /api/admin/categories
 ├── types/
 │    └── index.ts             Product · BlogPost · Order · AdminUser types
 ├── data/
 │    └── mock.ts              8 products · 6 blog posts · 5 mock users · formatPrice · getOrders/saveOrders
 ├── context/
 │    ├── AdminAuthContext.tsx  Admin auth: real API login/logout/auto-refresh; access token in memory
 │    └── DataContext.tsx       Shared state: products · posts · users (initialized from mock.ts)
 ├── components/
 │    ├── AdminLayout.tsx       Sidebar + Topbar + Outlet (protected); breadcrumb aware of edit routes
 │    ├── Sidebar.tsx           Collapsible sidebar nav (260px / 68px)
 │    ├── Topbar.tsx            Hamburger toggle + breadcrumb + admin avatar
 │    └── Modal.tsx             Generic modal (sm/md/lg sizes)
 ├── pages/
 │    ├── Login.tsx             Login form, demo: admin/admin123
 │    ├── Dashboard.tsx         Stat cards + recent orders table + CSS bar chart
 │    ├── Products.tsx          Products table + Add modal + Delete modal; Sửa → navigate
 │    ├── ProductEdit.tsx       Full edit page: basic info + tech details + live preview sidebar
 │    ├── Categories.tsx        Categories table + Add modal + Delete modal; Sửa → navigate (BE thật)
 │    ├── CategoryEdit.tsx      Full edit page: slug readonly + tên VI/EN + icon + sort + mô tả VI/EN
 │    ├── Orders.tsx            Orders from localStorage + status update + delete
 │    ├── Users.tsx             Users table + toggle status + Delete modal; Sửa → navigate
 │    ├── UserEdit.tsx          Full edit page: user banner + personal info + account details
 │    ├── Blog.tsx              Blog posts table + Add modal + Delete modal; Sửa → navigate
 │    └── BlogEdit.tsx          Full edit page: all blog fields + live preview sidebar
 ├── App.tsx                    Route table (9 routes — /login outside AdminLayout)
 ├── main.tsx                   Root: BrowserRouter > AdminAuthProvider > DataProvider > App
 └── admin.css                  ALL styles (CSS variables, sidebar, table, modal, forms, edit pages)
```

---

# 🔐 AUTH

- Credentials validated via `POST /api/admin/auth/login` (seed: `admin` / `admin123`)
- **Access token** — in memory only (module-level var in `apiClient.ts`)
- **Refresh token** — `localStorage` key `tuni-admin-refresh-token` (7-day TTL, rotated on use)
- Legacy key `tuni-admin-auth` kept for name display only (not security-relevant)
- Protected: all routes except `/login` redirect if not authenticated via `AdminLayout`
- Auto-restore: on mount `AdminAuthProvider` silently calls `/api/auth/refresh` if refresh token exists

---

# 📊 DATA FLOW

| Data | Source | Write | Status |
|---|---|---|---|
| **Auth** | `POST /api/admin/auth/login` · `/api/auth/refresh` · `/api/auth/logout` | — | ✅ Real API |
| **Users** | `GET /api/admin/users` (paginated · search) · `GET /api/admin/users/{id}` | `PUT /api/admin/users/{id}/status` · `DELETE /api/admin/users/{id}` | ✅ Real API |
| **Categories** | `GET /api/categories` (sorted) · find-by-id thực hiện client-side trên list (BE chỉ có by-slug) | `POST/PUT/DELETE /api/admin/categories` | ✅ Real API |
| **Dashboard — user count** | `GET /api/admin/users?page=1&size=1` → `totalElements` | — | ✅ Real API |
| Products | `DataContext` (init from `mock.ts`) | Add/Delete modal; Edit page | ⚠️ Mock — chờ BE **P1-5** |
| Orders | `localStorage: tuni-orders` (shared với storefront) | Status update + delete localStorage | ⚠️ Mock — chờ BE **P1-6** |
| Blog | `DataContext` (init from `mock.ts`) | Add/Delete modal; Edit page | ⚠️ Mock — chờ BE **P1-7** |
| Dashboard — orders/revenue/products | localStorage + mock | — | ⚠️ Mock — chờ BE **P1-5/P1-6/P1-8** |

> **Note về quyền sửa user:** BE chỉ expose `PUT /api/admin/users/{id}/status` cho admin (không có endpoint sửa name/email/phone từ admin panel — đó là self-service qua `/api/users/me`). Vì vậy `UserEdit.tsx` để các trường name/email/phone read-only, chỉ status sửa được.

---

# ✏️ EDIT PAGE PATTERN

All three edit pages follow the same UX pattern:

1. **Header** — `← Quay lại` button + page title + `💾 Lưu thay đổi` button
2. **Breadcrumb** — parent page / "Chỉnh sửa …" (handled by `AdminLayout.getPageMeta`)
3. **Layout** — `adm-edit-grid`: left col (form cards) + right col sticky preview
   - Products & Blog: 2-col grid `1fr 320px` with live preview
   - Users: single col `max-width: 740px` (user banner + form cards)
4. **State** — local `useState` initialized from `DataContext`; saved back to context on submit
5. **Navigate** — returns to list page after save

---

# 🔧 DEV COMMANDS

```bash
npm run dev      # http://localhost:5174
npm run build    # tsc + vite build
npx tsc -b       # Type check only
```

---

# 📋 CHANGE LOG

| Date | Change | Files |
|---|---|---|
| 2026-04-26 | Initial build — Login, Dashboard, Products, Orders, Users, Blog + full CSS | All |
| 2026-04-26 | **Edit pages** — thay modal edit bằng trang riêng `/products/:id/edit`, `/blog/:id/edit`, `/users/:id/edit` | ProductEdit · BlogEdit · UserEdit (NEW) |
| 2026-04-26 | **DataContext** — shared in-memory state cho products/posts/users thay vì local state từng page | DataContext.tsx (NEW) · main.tsx |
| 2026-04-26 | **Products/Blog/Users** — loại bỏ edit modal, nút Sửa dùng `useNavigate` | Products · Blog · Users |
| 2026-04-26 | **AdminLayout breadcrumb** — `getPageMeta()` nhận diện route `/*/edit` hiển thị đúng breadcrumb | AdminLayout.tsx |
| 2026-04-26 | **App.tsx** — thêm 3 edit routes mới; tổng 9 routes | App.tsx |
| 2026-04-26 | **admin.css** — thêm `.adm-edit-grid`, `.adm-edit-sidebar`, `.adm-edit-preview-*`, `.adm-edit-user-*`, `.adm-input-readonly` | admin.css |
| 2026-04-26 | **Database** — `database/` folder tạo cùng cấp ui+admin; PostgreSQL 15+ chọn làm DB chính; `01_ddl.sql` + `02_dml.sql` seed đầy đủ 10 bảng | `../database/` (NEW) |
| 2026-04-27 | **Backend API Integration — Auth** — `apiClient.ts` tạo mới (fetch wrapper, token mgmt, auto-refresh on 401). `AdminAuthContext` wired to `POST /api/admin/auth/login` + `POST /api/auth/logout` + auto-restore session on mount. `login()` → async `Promise<boolean>`. `Login.tsx` dùng `await login()`. | `utils/apiClient.ts` (NEW) · `context/AdminAuthContext.tsx` · `pages/Login.tsx` |
| 2026-05-05 | **Centralized API Layer** — Đổi `utils/apiClient.ts` → `api/client.ts`. Thêm `api/adminUser.ts` expose `GET /api/admin/users` (list + search + pagination) · `GET /api/admin/users/{id}` · `PUT /api/admin/users/{id}/status` · `DELETE /api/admin/users/{id}`. `AdminAuthContext` cập nhật import từ `api/client`. Xóa `utils/`. 0 tsc errors. | `api/client.ts` (MOVED) · `api/adminUser.ts` (NEW) · `context/AdminAuthContext.tsx` |
| 2026-05-10 | **API Wiring — User module gọi BE thật** — từng điểm khác trước: (1) `api/adminUser.ts` sửa `AdminUserProfile` đúng shape BE: `provider` UPPERCASE enum, `status: 'ACTIVE' \| 'INACTIVE'` (trước là `'active' \| 'banned'` sai), thêm `avatarUrl` + `orderCount`, bỏ field `role` thừa; `PageResponse` dùng `totalElements/totalPages` khớp `com.tuni3d.common.response.PageResponse`. (2) `pages/Users.tsx`: thay toàn bộ `useData()/setUsers()` (mock) bằng `useEffect` gọi `adminUserApi.list({page, size, search})` với search debounce 300ms + pagination server-side; `toggleStatus` gọi `adminUserApi.updateStatus()`; `handleDelete` gọi `adminUserApi.delete()` rồi reload; thêm loading/error/empty states. (3) `pages/UserEdit.tsx`: `useEffect` fetch `adminUserApi.getById(id)`; chỉ status sửa được (BE không có endpoint admin sửa name/email/phone — read-only kèm note "Chỉ user tự sửa qua /api/users/me"); save gọi `updateStatus`. (4) `pages/Dashboard.tsx`: stat card "Người dùng" thay `mockUsers.length` bằng `adminUserApi.list({page:1,size:1}).totalElements`. (5) `context/DataContext.tsx`: gỡ `users/setUsers` (không còn dùng); chỉ giữ `products/posts` chờ BE P1-5/P1-7. **0 tsc errors**. Vẫn mock: Products, Orders, Blog, Dashboard's order/revenue (chờ BE P1-5/P1-6/P1-7/P1-8). | `api/adminUser.ts` · `pages/Users.tsx` · `pages/UserEdit.tsx` · `pages/Dashboard.tsx` · `context/DataContext.tsx` |
| 2026-05-10 | **API Wiring — P1-4 Category Module (CRUD đầy đủ)** — admin trước không có trang quản lý danh mục; thêm mới hoàn toàn: (1) `api/category.ts` (NEW) — interface `Category`, `CreateCategoryRequest`, `UpdateCategoryRequest` mirror BE DTOs; `categoryApi.list/getBySlug/create/update/delete` qua `api` client (Bearer ignored cho public read). Chú thích lý do dùng list+find thay vì getById: BE chỉ expose by-slug (public), không có by-id (admin) — find client-side với dataset nhỏ chấp nhận được. (2) `pages/Categories.tsx` (NEW) — list table (icon/slug/tên VI/EN/sort), search VI/EN/slug client-side, Add modal validate slug regex `^[a-z0-9-]+$` + nameVi/En NotBlank trước khi POST, Delete confirm hiển thị note về `CATEGORY_HAS_PRODUCTS`. (3) `pages/CategoryEdit.tsx` (NEW) — load qua `list().find(by id)`, slug read-only (BE từ chối update), edit nameVi/En + icon + sort + mô tả VI/En, save gọi `categoryApi.update()`. (4) `App.tsx` thêm 2 route mới (tổng 9 → **11 routes**). (5) `Sidebar.tsx` thêm menu item `🗂️ Danh mục` chèn giữa Sản phẩm và Đơn hàng. (6) `AdminLayout.tsx` mở rộng `PAGE_TITLES` + `getPageMeta()` cho `/categories` và `/categories/:id/edit` breadcrumb. **0 tsc errors**. | `api/category.ts` (NEW) · `pages/Categories.tsx` (NEW) · `pages/CategoryEdit.tsx` (NEW) · `App.tsx` · `components/Sidebar.tsx` · `components/AdminLayout.tsx` |
| 2026-05-10 | **P1-3 User Module audit — admin đã wire đầy đủ, không có gap** — kiểm tra mapping với 4 admin endpoint của BE P1-3, xác nhận đầy đủ: `GET /api/admin/users` được `pages/Users.tsx::reload()` + `pages/Dashboard.tsx` (user count card) gọi qua `adminUserApi.list()`; `GET /api/admin/users/{id}` được `pages/UserEdit.tsx::useEffect` gọi qua `adminUserApi.getById()`; `PUT /api/admin/users/{id}/status` được `Users.tsx::toggleStatus()` + `UserEdit.tsx::handleSave()` gọi qua `adminUserApi.updateStatus()`; `DELETE /api/admin/users/{id}` được `Users.tsx::handleDelete()` gọi qua `adminUserApi.delete()`. **Không phải sửa code admin** — đã đầy đủ từ commit "API Wiring — User module" cùng ngày. Self-service `/api/users/me*` không thuộc admin scope — đã được storefront `3dprinting_ui` cover qua trang `/profile` mới. | — (audit pass) |
