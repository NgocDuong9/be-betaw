# 📦 BetaWatch Database Documentation

## 🔧 Tổng quan

- **Database**: MongoDB (sử dụng Mongoose ODM)
- **Framework**: NestJS
- **Số lượng Collections**: 4 (Users, Products, Carts, Orders)

---

## 📊 Database Schema Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           BETAWATCH DATABASE                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────┐         ┌──────────────┐         ┌──────────────┐    │
│  │    USERS     │         │   PRODUCTS   │         │    ORDERS    │    │
│  ├──────────────┤         ├──────────────┤         ├──────────────┤    │
│  │ _id          │◄───┐    │ _id          │◄───┐    │ _id          │    │
│  │ firstName    │    │    │ name         │    │    │ userId ──────────┐│
│  │ lastName     │    │    │ brand        │    │    │ items[]      │   ││
│  │ email        │    │    │ price        │    │    │ shippingAddr │   ││
│  │ password     │    │    │ originalPrice│    │    │ subtotal     │   ││
│  │ phone        │    │    │ description  │    │    │ tax          │   ││
│  │ avatar       │    │    │ shortDesc    │    │    │ shipping     │   ││
│  │ role         │    │    │ images[]     │    │    │ total        │   ││
│  │ isActive     │    │    │ category     │    │    │ status       │   ││
│  │ createdAt    │    │    │ specifications    │ │ paymentStatus│   ││
│  │ updatedAt    │    │    │ stock        │    │    │ paymentMethod│   ││
│  └──────────────┘    │    │ isNew        │    │    │ notes        │   ││
│         │            │    │ isFeatured   │    │    │ createdAt    │   ││
│         │            │    │ isActive     │    │    │ updatedAt    │   ││
│         │            │    │ createdAt    │    │    └──────────────┘   ││
│         │            │    │ updatedAt    │    │            ▲          ││
│         │            │    └──────────────┘    │            │          ││
│         │            │            ▲           │            │          ││
│         │            │            │           │            │          ││
│         ▼            │            │           │            │          ││
│  ┌──────────────┐    │    ┌──────────────────────────────────┘       ││
│  │    CARTS     │    │    │ OrderItem:                                ││
│  ├──────────────┤    │    │  - productId (ref Product)                ││
│  │ _id          │    │    │  - productName                            ││
│  │ userId ──────────┘│    │  - productImage                           ││
│  │ items[]      │         │  - price                                  ││
│  │ updatedAt    │         │  - quantity                               ││
│  └──────────────┘         └───────────────────────────────────────────┘│
│         │                                                               │
│         │                                                               │
│         ▼                                                               │
│  ┌─────────────────────┐                                                │
│  │ CartItem:           │                                                │
│  │  - productId (ref)  │                                                │
│  │  - quantity         │                                                │
│  │  - addedAt          │                                                │
│  └─────────────────────┘                                                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Chi tiết Collections

### 1. 👤 Users Collection

**File**: `src/users/schemas/user.schema.ts`

| Field       | Type     | Required    | Default | Description                |
| ----------- | -------- | ----------- | ------- | -------------------------- |
| `_id`       | ObjectId | Auto        | -       | MongoDB ID                 |
| `firstName` | String   | ✅          | -       | Tên người dùng             |
| `lastName`  | String   | ✅          | -       | Họ người dùng              |
| `email`     | String   | ✅ (unique) | -       | Email (lowercase)          |
| `password`  | String   | ✅          | -       | Mật khẩu đã hash           |
| `phone`     | String   | ❌          | -       | Số điện thoại              |
| `avatar`    | String   | ❌          | -       | URL avatar                 |
| `role`      | Enum     | ✅          | `user`  | Vai trò: `user` \| `admin` |
| `isActive`  | Boolean  | ❌          | `true`  | Trạng thái hoạt động       |
| `createdAt` | Date     | Auto        | -       | Thời gian tạo              |
| `updatedAt` | Date     | Auto        | -       | Thời gian cập nhật         |

**Enums:**

```typescript
enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}
```

**Virtuals:**

- `fullName`: Kết hợp `firstName` + `lastName`

---

### 2. ⌚ Products Collection

**File**: `src/products/schemas/product.schema.ts`

| Field              | Type     | Required | Default | Description               |
| ------------------ | -------- | -------- | ------- | ------------------------- |
| `_id`              | ObjectId | Auto     | -       | MongoDB ID                |
| `name`             | String   | ✅       | -       | Tên sản phẩm              |
| `brand`            | String   | ✅       | -       | Thương hiệu               |
| `price`            | Number   | ✅       | -       | Giá hiện tại              |
| `originalPrice`    | Number   | ❌       | -       | Giá gốc (nếu có giảm giá) |
| `description`      | String   | ✅       | -       | Mô tả chi tiết            |
| `shortDescription` | String   | ❌       | -       | Mô tả ngắn                |
| `images`           | String[] | ❌       | `[]`    | Mảng URL hình ảnh         |
| `category`         | Enum     | ✅       | -       | Danh mục sản phẩm         |
| `specifications`   | Object   | ✅       | -       | Thông số kỹ thuật         |
| `stock`            | Number   | ✅       | `0`     | Số lượng tồn kho          |
| `isNew`            | Boolean  | ❌       | `false` | Sản phẩm mới              |
| `isFeatured`       | Boolean  | ❌       | `false` | Sản phẩm nổi bật          |
| `isActive`         | Boolean  | ❌       | `true`  | Trạng thái hiển thị       |
| `createdAt`        | Date     | Auto     | -       | Thời gian tạo             |
| `updatedAt`        | Date     | Auto     | -       | Thời gian cập nhật        |

**Enums:**

```typescript
enum ProductCategory {
  LUXURY = 'luxury',
  SPORT = 'sport',
  CLASSIC = 'classic',
  LIMITED_EDITION = 'limited-edition',
  DIVING = 'diving',
  CHRONOGRAPH = 'chronograph',
}
```

**Embedded Document - ProductSpecification:**

| Field             | Type     | Required | Description        |
| ----------------- | -------- | -------- | ------------------ |
| `caseMaterial`    | String   | ✅       | Chất liệu vỏ       |
| `caseSize`        | String   | ✅       | Kích thước vỏ      |
| `dialColor`       | String   | ✅       | Màu mặt số         |
| `movement`        | String   | ✅       | Loại bộ máy        |
| `waterResistance` | String   | ✅       | Khả năng chịu nước |
| `strapMaterial`   | String   | ✅       | Chất liệu dây      |
| `strapColor`      | String   | ✅       | Màu dây            |
| `crystal`         | String   | ✅       | Loại kính          |
| `powerReserve`    | String   | ❌       | Dự trữ năng lượng  |
| `features`        | String[] | ❌       | Tính năng đặc biệt |

**Indexes:**

- Text index trên: `name`, `brand`, `description` (hỗ trợ tìm kiếm)

---

### 3. 🛒 Carts Collection

**File**: `src/cart/schemas/cart.schema.ts`

| Field       | Type       | Required               | Default | Description                  |
| ----------- | ---------- | ---------------------- | ------- | ---------------------------- |
| `_id`       | ObjectId   | Auto                   | -       | MongoDB ID                   |
| `userId`    | ObjectId   | ✅ (ref: User, unique) | -       | Reference đến User           |
| `items`     | CartItem[] | ❌                     | `[]`    | Danh sách sản phẩm trong giỏ |
| `updatedAt` | Date       | Auto                   | -       | Thời gian cập nhật           |
| `createdAt` | Date       | Auto                   | -       | Thời gian tạo                |

**Embedded Document - CartItem:**

| Field       | Type     | Required          | Description            |
| ----------- | -------- | ----------------- | ---------------------- |
| `productId` | ObjectId | ✅ (ref: Product) | Reference đến Product  |
| `quantity`  | Number   | ✅ (min: 1)       | Số lượng               |
| `addedAt`   | Date     | ❌                | Thời gian thêm vào giỏ |

**Relationships:**

- `userId` → `Users._id` (One-to-One)
- `items[].productId` → `Products._id` (Many-to-Many)

---

### 4. 📦 Orders Collection

**File**: `src/orders/schemas/order.schema.ts`

| Field             | Type        | Required       | Default   | Description                |
| ----------------- | ----------- | -------------- | --------- | -------------------------- |
| `_id`             | ObjectId    | Auto           | -         | MongoDB ID                 |
| `userId`          | ObjectId    | ✅ (ref: User) | -         | Reference đến User         |
| `items`           | OrderItem[] | ✅             | -         | Danh sách sản phẩm đặt mua |
| `shippingAddress` | Object      | ✅             | -         | Địa chỉ giao hàng          |
| `subtotal`        | Number      | ✅             | -         | Tổng tiền hàng             |
| `tax`             | Number      | ✅             | -         | Thuế                       |
| `shipping`        | Number      | ✅             | -         | Phí vận chuyển             |
| `total`           | Number      | ✅             | -         | Tổng thanh toán            |
| `status`          | Enum        | ✅             | `pending` | Trạng thái đơn hàng        |
| `paymentStatus`   | Enum        | ✅             | `pending` | Trạng thái thanh toán      |
| `paymentMethod`   | String      | ❌             | -         | Phương thức thanh toán     |
| `notes`           | String      | ❌             | -         | Ghi chú đơn hàng           |
| `createdAt`       | Date        | Auto           | -         | Thời gian tạo              |
| `updatedAt`       | Date        | Auto           | -         | Thời gian cập nhật         |

**Enums:**

```typescript
enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}
```

**Embedded Document - OrderItem:**

| Field          | Type     | Required          | Description                      |
| -------------- | -------- | ----------------- | -------------------------------- |
| `productId`    | ObjectId | ✅ (ref: Product) | Reference đến Product            |
| `productName`  | String   | ✅                | Tên sản phẩm (lưu snapshot)      |
| `productImage` | String   | ✅                | Hình ảnh sản phẩm (lưu snapshot) |
| `price`        | Number   | ✅                | Giá tại thời điểm đặt hàng       |
| `quantity`     | Number   | ✅ (min: 1)       | Số lượng                         |

**Embedded Document - ShippingAddress:**

| Field       | Type   | Required | Description    |
| ----------- | ------ | -------- | -------------- |
| `firstName` | String | ✅       | Tên người nhận |
| `lastName`  | String | ✅       | Họ người nhận  |
| `address`   | String | ✅       | Địa chỉ        |
| `city`      | String | ✅       | Thành phố      |
| `state`     | String | ✅       | Tỉnh/Bang      |
| `zipCode`   | String | ✅       | Mã bưu điện    |
| `country`   | String | ✅       | Quốc gia       |
| `phone`     | String | ✅       | Số điện thoại  |

---

## 🔗 Relationships Diagram

```
Users (1) ──────────────── (1) Carts
  │                              │
  │                              │ items[]
  │                              ▼
  │                        ┌─────────┐
  │                        │ Products│
  │                        └─────────┘
  │                              ▲
  │                              │ items[]
  │                              │
  └──────────────────── (N) Orders
```

**Mô tả quan hệ:**

- **User ↔ Cart**: One-to-One (mỗi user có 1 cart)
- **User ↔ Order**: One-to-Many (1 user có nhiều đơn hàng)
- **Cart ↔ Product**: Many-to-Many thông qua CartItem
- **Order ↔ Product**: Many-to-Many thông qua OrderItem (snapshot)

---

## 🌱 Seed Data

**File**: `src/database/seeder.service.ts`

Dữ liệu mẫu được tạo tự động trong môi trường development:

### Default Admin User:

- **Email**: `admin@betawatch.com`
- **Password**: `Admin@123`
- **Role**: `admin`

### Sample Products (26 sản phẩm):

| Category        | Số lượng | Brands                                               |
| --------------- | -------- | ---------------------------------------------------- |
| Luxury          | 4        | Audemars Piguet, Patek Philippe, Vacheron Constantin |
| Diving          | 5        | Rolex, Omega, Tudor, TAG Heuer                       |
| Chronograph     | 5        | Omega, Rolex, TAG Heuer, IWC, Breitling              |
| Sport           | 4        | Rolex, Tudor, Omega                                  |
| Classic         | 4        | Jaeger-LeCoultre, IWC, Cartier                       |
| Limited Edition | 4        | Hublot, Bell & Ross, Omega, Audemars Piguet          |

---

## 📝 Ghi chú kỹ thuật

1. **Timestamps**: Tất cả các schema đều có `timestamps: true`, tự động tạo `createdAt` và `updatedAt`

2. **JSON Transform**: Các schema đều có transform để:
   - Đổi `_id` thành `id`
   - Xóa `__v` (version key)
   - Xóa `password` (trong User)

3. **Indexes**:
   - `email` trong Users: unique
   - `userId` trong Carts: unique
   - Text index trong Products: `name`, `brand`, `description`

4. **Referential Integrity**: MongoDB không enforce foreign key constraints, cần xử lý ở application layer

5. **Snapshot Pattern**: OrderItem lưu thông tin sản phẩm tại thời điểm đặt hàng để tránh thay đổi khi product được update

---
