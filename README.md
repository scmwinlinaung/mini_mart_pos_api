# Mini Mart POS Backend API Documentation

Express.js TypeScript backend API for the Mini Mart POS system.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [API Overview](#api-overview)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Feature Flags](#feature-flags)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Security](#security)

---

## Technology Stack

- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Sequelize
- **Database**: PostgreSQL
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: Joi
- **Security**: Helmet, CORS, rate limiting, bcrypt

---

## Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 12
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Setup database:
```bash
# Run the schema.sql file to create tables
psql -U postgres -d mini_mart_pos -f schema.sql
```

4. Start development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
npm start
```

---

## API Overview

### Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

### Response Format

All API responses follow this standard format:

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success message"
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": { ... }
}
```

### Pagination

List endpoints support pagination using these query parameters:

| Parameter | Type | Default | Max | Description |
|-----------|------|---------|-----|-------------|
| page | integer | 1 | - | Page number |
| limit | integer | 20 | 100 | Items per page |

**Paginated Response:**
```json
{
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "limit": 20
  }
}
```

---

## Authentication

### Login

Obtain access and refresh tokens.

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "role": "admin",
      "isActive": true
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Refresh Token

Refresh an expired access token.

**Endpoint:** `POST /api/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response:**
```json
{
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Get Current User

Get authenticated user details.

**Endpoint:** `GET /api/auth/me`

**Headers:** `Authorization: Bearer <access_token>`

### Change Password

Change authenticated user's password.

**Endpoint:** `POST /api/auth/change-password`

**Headers:** `Authorization: Bearer <access_token>`

**Request Body:**
```json
{
  "oldPassword": "oldPass123",
  "newPassword": "newPass123"
}
```

### Logout

Invalidate refresh token.

**Endpoint:** `POST /api/auth/logout`

**Headers:** `Authorization: Bearer <access_token>`

---

## API Endpoints

### Health Check

Check API health status.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

### Categories

Manage product categories.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | No | Get all categories (paginated, searchable) |
| GET | `/api/categories/:id` | No | Get category by ID |
| POST | `/api/categories` | Admin/Manager | Create new category |
| PUT | `/api/categories/:id` | Admin/Manager | Update category |
| DELETE | `/api/categories/:id` | Admin/Manager | Delete category |

**Query Parameters (GET /api/categories):**
- `page` (integer) - Page number
- `limit` (integer) - Items per page
- `search` (string) - Search in name/description

**Create Category Request:**
```json
{
  "name": "Beverages",
  "description": "Soft drinks, juices, water"
}
```

---

### Unit Types

Manage product unit types (pieces, kg, liters, etc.).

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/unit-types` | No | Get all unit types (paginated, searchable) |
| GET | `/api/unit-types/:id` | No | Get unit type by ID |
| POST | `/api/unit-types` | Admin/Manager | Create new unit type |
| PUT | `/api/unit-types/:id` | Admin/Manager | Update unit type |
| DELETE | `/api/unit-types/:id` | Admin/Manager | Delete unit type |

**Create Unit Type Request:**
```json
{
  "name": "Piece",
  "abbreviation": "pcs"
}
```

---

### Suppliers

Manage product suppliers.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/suppliers` | No | Get all suppliers (paginated, searchable) |
| GET | `/api/suppliers/:id` | No | Get supplier by ID |
| POST | `/api/suppliers` | Admin/Manager | Create new supplier |
| PUT | `/api/suppliers/:id` | Admin/Manager | Update supplier |
| DELETE | `/api/suppliers/:id` | Admin/Manager | Delete supplier |

**Create Supplier Request:**
```json
{
  "name": "ABC Distributors",
  "contactPerson": "John Doe",
  "phone": "1234567890",
  "email": "john@abc.com",
  "address": "123 Main St"
}
```

---

### Products

Manage inventory products.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | No | Get all products (paginated, filterable) |
| GET | `/api/products/search` | No | Search products (paginated) |
| GET | `/api/products/:id` | No | Get product by ID |
| GET | `/api/products/barcode/:barcode` | No | Get product by barcode |
| GET | `/api/products/low-stock` | Admin/Manager | Get low stock products |
| GET | `/api/products/low-stock-paginated` | Admin/Manager | Get low stock products (paginated) |
| GET | `/api/products/out-of-stock` | Admin/Manager | Get out of stock products |
| GET | `/api/products/summary` | Admin/Manager | Get inventory summary |
| GET | `/api/products/:id/stock-movements` | Admin/Manager | Get stock movement history |
| POST | `/api/products` | Admin/Manager | Create new product |
| PUT | `/api/products/:id` | Admin/Manager | Update product |
| DELETE | `/api/products/:id` | Admin/Manager | Delete product |

**Query Parameters (GET /api/products):**
- `page` (integer)
- `limit` (integer)
- `search` (string) - Search in name/barcode/description
- `categoryId` (integer)
- `supplierId` (integer)
- `isActive` (boolean)
- `lowStock` (boolean)

**Create Product Request:**
```json
{
  "barcode": "8901234567890",
  "productName": "Coca Cola 500ml",
  "description": "Refreshing cola drink",
  "categoryId": 1,
  "supplierId": 1,
  "unitTypeId": 1,
  "costPrice": 25.00,
  "sellPrice": 35.00,
  "stockQuantity": 100,
  "reorderLevel": 20,
  "isActive": true
}
```

---

### Customers

Manage customer information.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/customers` | No | Get all customers (paginated, searchable) |
| GET | `/api/customers/:id` | No | Get customer by ID |
| GET | `/api/customers/phone/:phoneNumber` | No | Get customer by phone |
| POST | `/api/customers` | Admin/Manager | Create new customer |
| PUT | `/api/customers/:id` | Admin/Manager | Update customer |
| DELETE | `/api/customers/:id` | Admin/Manager | Delete customer |

**Create Customer Request:**
```json
{
  "name": "Jane Smith",
  "phone": "9876543210",
  "email": "jane@email.com",
  "address": "456 Oak Ave"
}
```

---

### Sales (POS)

Process sales transactions.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/sales` | Yes | Get all sales (paginated, filterable) |
| GET | `/api/sales/today` | Yes | Get today's sales |
| GET | `/api/sales/summary` | Admin/Manager | Get sales summary |
| GET | `/api/sales/:id` | Yes | Get sale by ID |
| POST | `/api/sales` | Yes | Create new sale |
| POST | `/api/sales/:id/refund` | Admin/Manager | Refund sale |

**Query Parameters (GET /api/sales):**
- `page` (integer)
- `limit` (integer)
- `startDate` (date)
- `endDate` (date)
- `invoiceNo` (string)
- `customerId` (integer)
- `productId` (integer)
- `paymentStatus` (string: PAID, PENDING, REFUNDED)

**Create Sale Request:**
```json
{
  "invoiceNo": "INV-2024-0001",
  "customerId": 1,
  "productId": 1,
  "unitTypeId": 1,
  "barcode": "8901234567890",
  "productName": "Coca Cola 500ml",
  "quantity": 2,
  "unitPrice": 35.00,
  "totalPrice": 70.00,
  "taxAmount": 0,
  "discountAmount": 0,
  "subTotal": 70.00,
  "grandTotal": 70.00,
  "paymentMethod": "CASH",
  "paymentStatus": "PAID"
}
```

**Refund Sale Request:**
```json
{
  "refundAmount": 35.00,
  "reason": "Product returned"
}
```

---

### Purchases

Manage supplier purchases.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/purchases` | Yes | Get all purchases (paginated, filterable) |
| GET | `/api/purchases/:id` | Yes | Get purchase by ID |
| POST | `/api/purchases` | Admin/Manager | Create new purchase |
| PUT | `/api/purchases/:id` | Admin/Manager | Update purchase |
| DELETE | `/api/purchases/:id` | Admin | Delete purchase |

**Query Parameters (GET /api/purchases):**
- `page` (integer)
- `limit` (integer)
- `startDate` (date)
- `endDate` (date)
- `supplierId` (integer)
- `status` (string: PENDING, RECEIVED)

**Create Purchase Request:**
```json
{
  "supplierId": 1,
  "supplierInvoiceNo": "PO-12345",
  "purchaseDate": "2024-01-01",
  "totalAmount": 1000.00,
  "status": "RECEIVED",
  "items": [
    {
      "productId": 1,
      "quantity": 50,
      "buyPrice": 20.00,
      "expiryDate": "2024-12-31"
    }
  ]
}
```

---

### Expenses

Track business expenses.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/expenses` | Yes | Get all expenses (paginated, filterable) |
| GET | `/api/expenses/categories` | Yes | Get expense categories |
| GET | `/api/expenses/summary` | Admin/Manager | Get expenses summary |
| GET | `/api/expenses/:id` | Yes | Get expense by ID |
| POST | `/api/expenses` | Admin/Manager | Create new expense |
| PUT | `/api/expenses/:id` | Admin/Manager | Update expense |
| DELETE | `/api/expenses/:id` | Admin | Delete expense |

**Query Parameters (GET /api/expenses):**
- `page` (integer)
- `limit` (integer)
- `search` (string)
- `startDate` (date)
- `endDate` (date)
- `categoryId` (integer)

**Create Expense Request:**
```json
{
  "categoryId": 1,
  "title": "Office Supplies",
  "description": "Printer paper and ink",
  "amount": 500.00,
  "expenseDate": "2024-01-01"
}
```

---

### Stock Movements

Track inventory stock movements.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/stock-movements` | Admin/Manager | Get all stock movements (paginated) |
| GET | `/api/stock-movements/summary` | Admin/Manager | Get stock movement summary |
| GET | `/api/stock-movements/loss-report` | Admin/Manager | Get loss report |
| GET | `/api/stock-movements/:id` | Admin/Manager | Get stock movement by ID |
| GET | `/api/stock-movements/product/:id` | Admin/Manager | Get movements by product |
| POST | `/api/stock-movements` | Admin/Manager | Create manual adjustment |

**Create Manual Adjustment Request:**
```json
{
  "productId": 1,
  "quantity": 5,
  "movementType": "DAMAGE",
  "notes": "Broken bottles during delivery"
}
```

---

### Dashboard

Get business analytics and statistics.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/summary` | Yes | Get dashboard summary |
| GET | `/api/dashboard/monthly` | Yes | Get monthly data |
| GET | `/api/dashboard/yearly` | Yes | Get yearly data |
| GET | `/api/dashboard/low-stock` | Yes | Get low stock products |
| GET | `/api/dashboard/recent-sales` | Yes | Get recent sales |

---

### Users

Manage system users.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | Admin/Manager | Get all users (paginated) |
| GET | `/api/users/roles` | Admin/Manager | Get available roles |
| GET | `/api/users/:id` | Admin/Manager | Get user by ID |
| POST | `/api/users` | Admin | Create new user |
| PUT | `/api/users/:id` | Admin | Update user |
| DELETE | `/api/users/:id` | Admin | Delete user |
| POST | `/api/users/change-password` | Yes | Change own password |

**Create User Request:**
```json
{
  "username": "cashier1",
  "password": "password123",
  "role": "cashier",
  "isActive": true
}
```

---

### Reports

Generate business reports.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reports/sales` | Admin/Manager | Get sales report |
| GET | `/api/reports/profit-loss` | Admin/Manager | Get profit & loss report |
| GET | `/api/reports/inventory` | Admin/Manager | Get inventory report |
| GET | `/api/reports/purchases` | Admin/Manager | Get purchase report |
| GET | `/api/reports/expenses` | Admin/Manager | Get expense report |
| GET | `/api/reports/all` | Admin/Manager | Get all reports |

---

## Data Models

### User Roles

| Role | Description |
|------|-------------|
| admin | Full system access |
| manager | Manage all operations except user management |
| cashier | POS operations only |

### Payment Methods

- `CASH` - Cash payment
- `CARD` - Credit/Debit card
- `QR` - QR code payment
- `CREDIT` - Credit/Customer account

### Payment Status

- `PAID` - Payment completed
- `PENDING` - Payment pending
- `REFUNDED` - Payment refunded

### Purchase Status

- `PENDING` - Order placed, not received
- `RECEIVED` - Stock received

### Stock Movement Types

- `SALE` - Stock sold
- `PURCHASE` - Stock purchased
- `RETURN` - Stock returned
- `ADJUSTMENT` - Manual adjustment (damage, expired, theft, loss, correction)

---

## Feature Flags

The API uses feature flags for gradual feature migration:

| Flag | Description |
|------|-------------|
| FF_AUTH | Authentication endpoints |
| FF_CATEGORIES | Category management |
| FF_UNIT_TYPES | Unit type management |
| FF_SUPPLIERS | Supplier management |
| FF_PRODUCTS | Product management |
| FF_CUSTOMERS | Customer management |
| FF_SALES | Sales/POS operations |
| FF_PURCHASES | Purchase management |
| FF_EXPENSES | Expense management |
| FF_DASHBOARD | Dashboard statistics |
| FF_USERS | User management |
| FF_REPORTS | Business reports |

When a feature flag is disabled, the API returns a 503 response.

---

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware (auth, validation)
│   ├── models/          # Sequelize models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── validators/      # Joi validation schemas
│   ├── constants/       # Constants and enums
│   ├── types/           # TypeScript types
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── tests/               # Test files
├── logs/                # Log files
├── dist/                # Compiled output
├── schema.sql           # Database schema
├── .env.example         # Environment variables template
└── package.json
```

---

## Environment Variables

Create a `.env` file from `.env.example`:

```bash
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mini_mart_pos
DB_USER=postgres
DB_PASSWORD=password

# JWT
JWT_ACCESS_SECRET=your_access_token_secret_change_this_in_production
JWT_REFRESH_SECRET=your_refresh_token_secret_change_this_in_production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Pagination
DEFAULT_PAGE_LIMIT=20
MAX_PAGE_LIMIT=100
```

---

## Security

- **Password Hashing**: bcrypt with 12 rounds
- **JWT Tokens**: Short-lived access tokens (15min) + long-lived refresh tokens (7 days)
- **Rate Limiting**: Applied to all endpoints
- **CORS Protection**: Configurable origin whitelist
- **Security Headers**: Helmet middleware
- **Input Validation**: Joi schema validation on all inputs
- **Role-Based Access Control**: Three-tier user role system

---

## License

ISC
