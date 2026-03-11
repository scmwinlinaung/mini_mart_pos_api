# Mini Mart POS Backend

Express.js TypeScript backend API for the Mini Mart POS system.

## Technology Stack

- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Sequelize
- **Database**: PostgreSQL
- **Authentication**: JWT (access + refresh tokens)
- **Validation**: Joi
- **Security**: Helmet, CORS, rate limiting, bcrypt

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

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Authentication (FF_AUTH)
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password

### Categories (FF_CATEGORIES)
- `GET /api/categories` - Get all categories (with pagination & search)
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category (Admin/Manager)
- `PUT /api/categories/:id` - Update category (Admin/Manager)
- `DELETE /api/categories/:id` - Delete category (Admin/Manager)

### Unit Types (FF_UNIT_TYPES)
- `GET /api/unit-types` - Get all unit types (with pagination & search)
- `GET /api/unit-types/:id` - Get unit type by ID
- `POST /api/unit-types` - Create new unit type (Admin/Manager)
- `PUT /api/unit-types/:id` - Update unit type (Admin/Manager)
- `DELETE /api/unit-types/:id` - Delete unit type (Admin/Manager)

### Suppliers (FF_SUPPLIERS)
- `GET /api/suppliers` - Get all suppliers (with pagination & search)
- `GET /api/suppliers/:id` - Get supplier by ID
- `POST /api/suppliers` - Create new supplier (Admin/Manager)
- `PUT /api/suppliers/:id` - Update supplier (Admin/Manager)
- `DELETE /api/suppliers/:id` - Delete supplier (Admin/Manager)

### Products (FF_PRODUCTS)
- `GET /api/products` - Get all products (with pagination & search)
- `GET /api/products/low-stock` - Get low stock products (Admin/Manager)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/barcode/:barcode` - Get product by barcode
- `POST /api/products` - Create new product (Admin/Manager)
- `PUT /api/products/:id` - Update product (Admin/Manager)
- `DELETE /api/products/:id` - Delete product (Admin/Manager)

### Customers (FF_CUSTOMERS)
- `GET /api/customers` - Get all customers (with pagination & search)
- `GET /api/customers/phone/:phoneNumber` - Get customer by phone number
- `GET /api/customers/:id` - Get customer by ID
- `POST /api/customers` - Create new customer (Admin/Manager)
- `PUT /api/customers/:id` - Update customer (Admin/Manager)
- `DELETE /api/customers/:id` - Delete customer (Admin/Manager)

### Sales (FF_SALES)
- `GET /api/sales` - Get all sales (with pagination & filters)
- `GET /api/sales/today` - Get today's sales
- `GET /api/sales/summary` - Get sales summary (Admin/Manager)
- `GET /api/sales/:id` - Get sale by ID
- `POST /api/sales` - Create new sale
- `POST /api/sales/:id/refund` - Refund sale (Admin/Manager)

### Purchases (FF_PURCHASES)
- `GET /api/purchases` - Get all purchases (with pagination & filters)
- `GET /api/purchases/:id` - Get purchase by ID
- `POST /api/purchases` - Create new purchase (Admin/Manager)
- `PUT /api/purchases/:id` - Update purchase (Admin/Manager)
- `DELETE /api/purchases/:id` - Delete purchase (Admin)

### Expenses (FF_EXPENSES)
- `GET /api/expenses` - Get all expenses (with pagination & filters)
- `GET /api/expenses/categories` - Get expense categories
- `GET /api/expenses/summary` - Get expenses summary (Admin/Manager)
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses` - Create new expense (Admin/Manager)
- `PUT /api/expenses/:id` - Update expense (Admin/Manager)
- `DELETE /api/expenses/:id` - Delete expense (Admin)

### Dashboard (FF_DASHBOARD)
- `GET /api/dashboard/summary` - Get dashboard summary
- `GET /api/dashboard/monthly` - Get monthly data
- `GET /api/dashboard/yearly` - Get yearly data
- `GET /api/dashboard/low-stock` - Get low stock products
- `GET /api/dashboard/recent-sales` - Get recent sales

### Users (FF_USERS)
- `GET /api/users` - Get all users (Admin/Manager)
- `GET /api/users/roles` - Get available roles (Admin/Manager)
- `GET /api/users/:id` - Get user by ID (Admin/Manager)
- `POST /api/users` - Create new user (Admin)
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)
- `POST /api/users/change-password` - Change own password

### Reports (FF_REPORTS)
- `GET /api/reports/sales` - Get sales report (Admin/Manager)
- `GET /api/reports/profit-loss` - Get profit & loss report (Admin/Manager)
- `GET /api/reports/inventory` - Get inventory report (Admin/Manager)
- `GET /api/reports/purchases` - Get purchase report (Admin/Manager)
- `GET /api/reports/expenses` - Get expense report (Admin/Manager)
- `GET /api/reports/all` - Get all reports (Admin/Manager)

## Feature Flags

The API uses feature flags for gradual migration from direct database access:

- `FF_AUTH` - Authentication endpoints
- `FF_CATEGORIES` - Category management
- `FF_UNIT_TYPES` - Unit type management
- `FF_SUPPLIERS` - Supplier management
- `FF_PRODUCTS` - Product management
- `FF_CUSTOMERS` - Customer management
- `FF_SALES` - Sales/POS
- `FF_PURCHASES` - Purchase management
- `FF_EXPENSES` - Expense management
- `FF_DASHBOARD` - Dashboard statistics
- `FF_USERS` - User management
- `FF_REPORTS` - Reporting

When a feature flag is disabled, the API returns a 503 response instructing the client to use direct database connection.

## Development

### Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Express middleware
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
└── package.json
```

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Run production server
- `npm test` - Run tests

### Environment Variables

See `.env.example` for all available configuration options.

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT tokens for authentication
- Rate limiting on all endpoints
- CORS protection
- Helmet security headers
- Input validation with Joi

## License

ISC
