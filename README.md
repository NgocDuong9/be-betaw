# BetaWatch Backend API

Backend API for the BetaWatch Luxury Watches E-commerce platform, built with NestJS, MongoDB, and TypeScript.

## 🚀 Features

- **Authentication**: JWT-based authentication with Passport.js
- **Products**: Full CRUD with filtering, pagination, and search
- **Orders**: Order management with stock tracking
- **Users**: User profile management
- **Swagger**: API documentation at `/api/docs`
- **Database Seeding**: Auto-seed sample products in development

## 📋 Prerequisites

- Node.js 18+
- MongoDB (local or MongoDB Atlas)

## 🛠️ Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your MongoDB URI
```

## ⚙️ Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/betawatch
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 🏃 Running the app

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## 📚 API Documentation

Once the app is running, visit:

- **Swagger UI**: http://localhost:3000/api/docs
- **API Base URL**: http://localhost:3000/api

## 🔗 API Endpoints

### Auth

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login`    | Login             |

### Users

| Method | Endpoint        | Description              |
| ------ | --------------- | ------------------------ |
| GET    | `/api/users/me` | Get current user profile |
| PUT    | `/api/users/me` | Update profile           |
| DELETE | `/api/users/me` | Delete account           |

### Products

| Method | Endpoint                           | Description                     |
| ------ | ---------------------------------- | ------------------------------- |
| GET    | `/api/products`                    | Get all products (with filters) |
| GET    | `/api/products/latest`             | Get latest products             |
| GET    | `/api/products/featured`           | Get featured products           |
| GET    | `/api/products/search?q=query`     | Search products                 |
| GET    | `/api/products/brands`             | Get all brands                  |
| GET    | `/api/products/category/:category` | Get by category                 |
| GET    | `/api/products/:id`                | Get product by ID               |
| POST   | `/api/products`                    | Create product (Auth)           |
| PUT    | `/api/products/:id`                | Update product (Auth)           |
| DELETE | `/api/products/:id`                | Delete product (Auth)           |

### Orders

| Method | Endpoint                 | Description            |
| ------ | ------------------------ | ---------------------- |
| POST   | `/api/orders`            | Create order (Auth)    |
| GET    | `/api/orders`            | Get user orders (Auth) |
| GET    | `/api/orders/stats`      | Get order stats (Auth) |
| GET    | `/api/orders/:id`        | Get order by ID (Auth) |
| PUT    | `/api/orders/:id/cancel` | Cancel order (Auth)    |

## 🏗️ Project Structure

```
src/
├── auth/           # Authentication module
├── users/          # Users module
├── products/       # Products module
├── orders/         # Orders module
├── database/       # Database seeder
├── common/         # Shared DTOs, interfaces
├── app.module.ts   # Root module
└── main.ts         # Entry point
```

## 🔐 Authentication

The API uses JWT Bearer tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-access-token>
```

## 📦 Product Categories

- `luxury`
- `sport`
- `classic`
- `limited-edition`
- `diving`
- `chronograph`

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

## 📄 License

MIT
