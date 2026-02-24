# 📊 Phân Tích Chi Tiết Source Code BetaWatch Backend

## 🎯 Tổng Quan Hệ Thống

**BetaWatch Backend** là một hệ thống E-commerce backend cho cửa hàng đồng hồ cao cấp, được xây dựng với:

| Công nghệ         | Version | Mục đích                     |
| ----------------- | ------- | ---------------------------- |
| **NestJS**        | 11.x    | Framework backend            |
| **MongoDB**       | -       | Database (Mongoose ODM)      |
| **JWT**           | -       | Authentication               |
| **Cloudflare R2** | -       | File storage (S3-compatible) |
| **Swagger**       | 11.x    | API Documentation            |

---

## 🏗️ Kiến Trúc Module

```
src/
├── auth/           # 🔐 Xác thực (JWT, Passport)
├── users/          # 👤 Quản lý người dùng
├── products/       # ⌚ Sản phẩm (đồng hồ)
├── cart/           # 🛒 Giỏ hàng
├── orders/         # 📦 Đơn hàng
├── admin/          # 👑 Quản trị viên
├── upload/         # 📁 Upload ảnh (Cloudflare R2)
├── database/       # 🌱 Seeder dữ liệu mẫu
├── common/         # 🔧 Shared utilities
├── app.module.ts   # Root module
└── main.ts         # Entry point
```

---

## 📋 Chi Tiết Từng Module

### 1. 🔐 Auth Module (`/src/auth/`)

**Chức năng**: Xác thực và phân quyền người dùng

| Thành phần           | Mô tả                                     |
| -------------------- | ----------------------------------------- |
| `auth.service.ts`    | Logic xác thực: login, register, validate |
| `auth.controller.ts` | API endpoints cho auth                    |
| `strategies/`        | Passport JWT strategy                     |
| `guards/`            | JwtAuthGuard, RolesGuard                  |
| `decorators/`        | @Roles, @CurrentUser                      |

**API Endpoints:**

- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập

**Flow hoạt động:**

1. User register → Hash password → Lưu DB → Generate JWT token
2. User login → Validate password → Generate JWT token với payload (email, userId, role)
3. Các route protected sử dụng `JwtAuthGuard` để verify token
4. `RolesGuard` kiểm tra role (user/admin) cho các API admin

---

### 2. 👤 Users Module (`/src/users/`)

**Chức năng**: Quản lý profile người dùng

| API Endpoint    | Method | Mô tả                |
| --------------- | ------ | -------------------- |
| `/api/users/me` | GET    | Lấy profile hiện tại |
| `/api/users/me` | PUT    | Cập nhật profile     |
| `/api/users/me` | DELETE | Xóa tài khoản        |

**Collection Schema:**

```typescript
{
  firstName: string,      // Tên
  lastName: string,       // Họ
  email: string,          // Email (unique, lowercase)
  password: string,       // Đã hash bằng bcrypt
  phone?: string,         // SĐT
  avatar?: string,        // URL avatar
  role: 'user' | 'admin', // Vai trò
  isActive: boolean       // Trạng thái kích hoạt
}
```

---

### 3. ⌚ Products Module (`/src/products/`)

**Chức năng**: CRUD và quản lý sản phẩm đồng hồ

| API Endpoint                  | Method | Mô tả                                      |
| ----------------------------- | ------ | ------------------------------------------ |
| `/api/products`               | GET    | Danh sách sản phẩm (có filter, pagination) |
| `/api/products/:id`           | GET    | Chi tiết sản phẩm                          |
| `/api/products/latest`        | GET    | Sản phẩm mới nhất                          |
| `/api/products/featured`      | GET    | Sản phẩm nổi bật                           |
| `/api/products/search`        | GET    | Tìm kiếm sản phẩm                          |
| `/api/products/brands`        | GET    | Danh sách thương hiệu                      |
| `/api/products/category/:cat` | GET    | Lọc theo danh mục                          |
| `/api/products`               | POST   | Tạo sản phẩm (Admin)                       |
| `/api/products/:id`           | PUT    | Cập nhật (Admin)                           |
| `/api/products/:id`           | DELETE | Soft delete (Admin)                        |

**Query Parameters hỗ trợ:**

- `page`, `limit` - Phân trang
- `search` - Tìm kiếm theo name, brand, description
- `category` - Lọc theo category
- `minPrice`, `maxPrice` - Lọc theo giá
- `brand` - Lọc theo thương hiệu (hỗ trợ nhiều brand)
- `sort` - Sắp xếp (price_asc, price_desc, name_asc, name_desc, newest)

**Categories có sẵn:**

- `luxury`, `sport`, `classic`, `limited-edition`, `diving`, `chronograph`

---

### 4. 🛒 Cart Module (`/src/cart/`)

**Chức năng**: Quản lý giỏ hàng người dùng

| API Endpoint                  | Method | Mô tả                    |
| ----------------------------- | ------ | ------------------------ |
| `/api/cart`                   | GET    | Lấy giỏ hàng hiện tại    |
| `/api/cart/add`               | POST   | Thêm sản phẩm            |
| `/api/cart/update`            | PUT    | Cập nhật số lượng        |
| `/api/cart/remove/:productId` | DELETE | Xóa sản phẩm             |
| `/api/cart/clear`             | DELETE | Xóa toàn bộ giỏ          |
| `/api/cart/sync`              | POST   | Đồng bộ từ local storage |

**Đặc điểm:**

- **One-to-One với User**: Mỗi user chỉ có 1 cart
- **Auto-create**: Tự động tạo cart khi user truy cập lần đầu
- **Sync Cart**: Cho phép merge giỏ hàng từ localStorage (guest) vào server khi login
- **Response bao gồm**: Items với thông tin product, itemCount, subtotal

---

### 5. 📦 Orders Module (`/src/orders/`)

**Chức năng**: Quản lý đơn hàng

| API Endpoint             | Method | Mô tả                       |
| ------------------------ | ------ | --------------------------- |
| `/api/orders`            | POST   | Tạo đơn hàng                |
| `/api/orders`            | GET    | Danh sách đơn hàng của user |
| `/api/orders/:id`        | GET    | Chi tiết đơn hàng           |
| `/api/orders/:id/cancel` | PUT    | Hủy đơn hàng                |
| `/api/orders/stats`      | GET    | Thống kê đơn hàng           |

**Flow tạo đơn hàng:**

1. Validate từng product có tồn tại và đủ stock
2. Tính toán: subtotal, tax (10%), shipping (free nếu > $5000)
3. Tạo order với **snapshot** thông tin sản phẩm (tên, giá, ảnh)
4. **Giảm stock** tự động từng sản phẩm

**Order Status Flow:**

```
pending → confirmed → processing → shipped → delivered
                ↓
           cancelled
```

**Payment Status:**

```
pending → paid → failed → refunded
```

---

### 6. 👑 Admin Module (`/src/admin/`)

**Chức năng**: Quản trị hệ thống (yêu cầu role `admin`)

| API Endpoint                         | Method | Mô tả                            |
| ------------------------------------ | ------ | -------------------------------- |
| `/api/admin/dashboard`               | GET    | Thống kê tổng quan               |
| `/api/admin/users`                   | GET    | Danh sách users                  |
| `/api/admin/users/:id`               | GET    | Chi tiết user                    |
| `/api/admin/users/:id/toggle-active` | PUT    | Kích hoạt/vô hiệu hóa user       |
| `/api/admin/users/:id/role`          | PUT    | Thay đổi role                    |
| `/api/admin/users/:id/orders`        | GET    | Xem orders của user              |
| `/api/admin/orders`                  | GET    | Tất cả orders                    |
| `/api/admin/orders/:id/status`       | PUT    | Cập nhật trạng thái order        |
| `/api/admin/products`                | GET    | Tất cả products (kể cả inactive) |
| `/api/admin/products/stats`          | GET    | Thống kê sản phẩm                |

---

### 7. 📁 Upload Module (`/src/upload/`)

**Chức năng**: Upload ảnh lên Cloudflare R2 (S3-compatible)

| API Endpoint           | Method | Mô tả              |
| ---------------------- | ------ | ------------------ |
| `/api/upload`          | POST   | Upload 1 file      |
| `/api/upload/multiple` | POST   | Upload nhiều files |

**Features:**

- Upload lên **Cloudflare R2** (thay vì AWS S3)
- Sanitize filename tự động
- Trả về public URL
- Hỗ trợ signed URL cho private files

---

### 8. 🌱 Database Module (`/src/database/`)

**Chức năng**: Seeder dữ liệu mẫu cho development

**Dữ liệu seed:**

- **1 Admin account**: `admin@betawatch.com` / `Admin@123`
- **26 sản phẩm đồng hồ** mẫu từ các thương hiệu: Rolex, Omega, Patek Philippe, Audemars Piguet, TAG Heuer, IWC, Breitling, Tudor, Cartier...

---

## 🔗 Quan Hệ Giữa Các Collection

```
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│      USERS (1) ────────────────── (1) CARTS                   │
│        │                                │                     │
│        │                                │ items[]             │
│        │                                ▼                     │
│        │                          ┌─────────┐                 │
│        │                          │PRODUCTS │                 │
│        │                          └─────────┘                 │
│        │                                ▲                     │
│        │                                │ items[] (snapshot)  │
│        └──────────────────── (N) ORDERS                       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚨 CẦN BỔ SUNG CHO PRODUCTION

### 🔴 **Bắt buộc (Critical)**

| #   | Vấn đề                                 | Đề xuất                                                                            |
| --- | -------------------------------------- | ---------------------------------------------------------------------------------- |
| 1   | **Secrets trong .env**                 | Di chuyển sang environment variables / secret manager (AWS Secrets Manager, Vault) |
| 2   | **JWT Secret yếu**                     | Thay bằng key mạnh, random 256-bit                                                 |
| 3   | **CORS mở rộng**                       | `origin: true` → Chỉ định domain cụ thể                                            |
| 4   | **MongoDB Atlas connection string lộ** | Di chuyển vào secret manager                                                       |
| 5   | **Rate Limiting**                      | Thêm `@nestjs/throttler` để chống DDoS, brute force                                |
| 6   | **Helmet**                             | Thêm `helmet` middleware cho security headers                                      |
| 7   | **Input validation strengthening**     | Thêm validation cho các trường như email, phone format                             |

### 🟡 **Nên có (Recommended)**

| #   | Vấn đề                  | Đề xuất                                     |
| --- | ----------------------- | ------------------------------------------- |
| 8   | **Logging**             | Thêm Winston/Pino logger với log levels     |
| 9   | **Health Check**        | Thêm `/health` endpoint cho load balancer   |
| 10  | **Error Tracking**      | Tích hợp Sentry để theo dõi lỗi             |
| 11  | **Payment Integration** | Tích hợp Stripe/VNPay cho thanh toán        |
| 12  | **Email Service**       | Gửi email xác nhận đơn hàng, reset password |
| 13  | **Caching Layer**       | Redis cache cho products, user sessions     |
| 14  | **Image Optimization**  | Resize/compress ảnh trước khi upload R2     |
| 15  | **API Versioning**      | Thêm versioning `/api/v1/...`               |

### 🟢 **Tùy chọn (Optional)**

| #   | Vấn đề                    | Đề xuất                                         |
| --- | ------------------------- | ----------------------------------------------- |
| 16  | **Unit Tests**            | Chưa có tests → Thêm Jest unit tests            |
| 17  | **E2E Tests**             | Thêm integration tests                          |
| 18  | **CI/CD**                 | Setup GitHub Actions cho auto deploy            |
| 19  | **Docker**                | Thêm Dockerfile và docker-compose               |
| 20  | **Soft Delete toàn bộ**   | Products đã có, nên áp dụng cho Orders, Users   |
| 21  | **Search Optimization**   | Sử dụng MongoDB Atlas Search hoặc Elasticsearch |
| 22  | **Webhook/Notifications** | Thông báo realtime khi có order mới             |
| 23  | **Audit Log**             | Ghi log các thao tác quan trọng của admin       |

---

## 📝 Cấu Hình Environment Variables Cần Thiết

```env
# === PRODUCTION REQUIRED ===
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=<managed-secret>

# JWT (Strong secret in production!)
JWT_SECRET=<256-bit-random-key>
JWT_EXPIRES_IN=7d

# CORS (Specific domains only)
FRONTEND_URL=https://yourdomain.com

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=<secret>
CLOUDFLARE_R2_ACCESS_KEY_ID=<secret>
CLOUDFLARE_R2_SECRET_ACCESS_KEY=<secret>
CLOUDFLARE_R2_BUCKET_NAME=betaw-image
CLOUDFLARE_R2_PUBLIC_URL=https://your-r2-public.r2.dev

# === RECOMMENDED FOR PRODUCTION ===
# Redis (optional)
REDIS_URL=redis://localhost:6379

# Sentry (optional)
SENTRY_DSN=<your-sentry-dsn>
```

---

## ✅ Tóm Tắt Đánh Giá

| Tiêu chí             | Đánh giá   | Ghi chú                                    |
| -------------------- | ---------- | ------------------------------------------ |
| **Code Structure**   | ⭐⭐⭐⭐⭐ | Clean, module hóa tốt theo NestJS patterns |
| **API Design**       | ⭐⭐⭐⭐   | RESTful, có Swagger docs                   |
| **Database Schema**  | ⭐⭐⭐⭐   | Tốt, có snapshot pattern cho orders        |
| **Authentication**   | ⭐⭐⭐⭐   | JWT + Passport, có roles                   |
| **Error Handling**   | ⭐⭐⭐     | Cơ bản, cần thêm global exception filter   |
| **Security**         | ⭐⭐       | Cần bổ sung rate limiting, helmet          |
| **Testing**          | ⭐         | Chưa có tests                              |
| **Production Ready** | ⭐⭐       | Cần fix secrets, thêm monitoring           |

---

**Kết luận**: Source code được viết tốt, theo chuẩn NestJS. Tuy nhiên, cần **bổ sung các tính năng bảo mật và monitoring** trước khi release production.

---

_Phân tích bởi AI Assistant - 19/01/2026_
