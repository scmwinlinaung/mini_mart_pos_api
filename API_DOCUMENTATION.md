# Mini Mart POS API Documentation

Complete API reference for the Mini Mart POS Backend System.

## Base URL

```
http://localhost:3000/api
```

## Authentication

Most endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

## Standard Response Format

### Success Response

```typescript
{
  success: true,
  data: any,
  message?: string,
  pagination?: {
    page: number,
    limit: number,
    total: number,
    totalPages: number
  }
}
```

### Error Response

```typescript
{
  success: false,
  error: string,
  details?: any
}
```

---

## API Endpoints

### 1. Authentication (`/api/auth`)

#### 1.1 Login
```http
POST /api/auth/login
```

**Rate Limit:** 5 requests per 15 minutes

**Request Body:**
```json
{
  "username": "string (3-50 alphanumeric characters, required)",
  "password": "string (min 6 characters, required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": number,
      "username": "string",
      "fullName": "string",
      "roleId": number,
      "isActive": boolean
    },
    "tokens": {
      "accessToken": "string",
      "refreshToken": "string"
    }
  },
  "message": "Login successful"
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

---

#### 1.2 Refresh Token
```http
POST /api/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "string",
    "refreshToken": "string"
  },
  "message": "Token refreshed successfully"
}
```

---

#### 1.3 Logout
```http
POST /api/auth/logout
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

#### 1.4 Get Current User
```http
GET /api/auth/me
```

**Authentication Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": number,
    "username": "string",
    "fullName": "string",
    "roleId": number,
    "isActive": boolean,
    "role": {
      "id": number,
      "roleName": "string"
    }
  },
  "message": "User retrieved successfully"
}
```

---

#### 1.5 Change Password
```http
POST /api/auth/change-password
```

**Authentication Required:** Yes

**Request Body:**
```json
{
  "oldPassword": "string (min 6 characters, required)",
  "newPassword": "string (min 6 characters, required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 2. Categories (`/api/categories`)

#### 2.1 Get All Categories
```http
GET /api/categories
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page, max 100 (default: 20) |
| search | string | No | Search in category name |
| isActive | boolean | No | Filter by active status |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "categoryName": "string",
      "description": "string",
      "isActive": boolean,
      "createdAt": "date",
      "updatedAt": "date"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

#### 2.2 Get Category by ID
```http
GET /api/categories/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": number,
    "categoryName": "string",
    "description": "string",
    "isActive": boolean,
    "createdAt": "date",
    "updatedAt": "date"
  }
}
```

---

#### 2.3 Create Category
```http
POST /api/categories
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_CATEGORIES`

**Request Body:**
```json
{
  "categoryName": "string (1-100 characters, required)",
  "description": "string (optional)",
  "isActive": "boolean (optional)"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": number,
    "categoryName": "string",
    "description": "string",
    "isActive": boolean
  },
  "message": "Category created successfully"
}
```

---

#### 2.4 Update Category
```http
PUT /api/categories/:id
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_CATEGORIES`

**Request Body (at least one field required):**
```json
{
  "categoryName": "string (1-100 characters, optional)",
  "description": "string (optional)",
  "isActive": "boolean (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": number,
    "categoryName": "string",
    "description": "string",
    "isActive": boolean
  },
  "message": "Category updated successfully"
}
```

---

#### 2.5 Delete Category
```http
DELETE /api/categories/:id
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_CATEGORIES`

**Response (200):**
```json
{
  "success": true,
  "message": "Category deleted successfully"
}
```

---

### 3. Unit Types (`/api/unit-types`)

#### 3.1 Get All Unit Types
```http
GET /api/unit-types
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page, max 100 (default: 20) |
| search | string | No | Search in unit code/name |
| isActive | boolean | No | Filter by active status |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "unitCode": "string",
      "unitName": "string",
      "isWeighted": boolean,
      "isActive": boolean,
      "createdAt": "date",
      "updatedAt": "date"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

---

#### 3.2 Get Unit Type by ID
```http
GET /api/unit-types/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": number,
    "unitCode": "string",
    "unitName": "string",
    "isWeighted": boolean,
    "isActive": boolean
  }
}
```

---

#### 3.3 Create Unit Type
```http
POST /api/unit-types
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_UNIT_TYPES`

**Request Body:**
```json
{
  "unitCode": "string (1-50 characters, required)",
  "unitName": "string (1-50 characters, required)",
  "isWeighted": "boolean (optional)",
  "isActive": "boolean (optional)"
}
```

---

#### 3.4 Update Unit Type
```http
PUT /api/unit-types/:id
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_UNIT_TYPES`

**Request Body (at least one field required):**
```json
{
  "unitCode": "string (1-50 characters, optional)",
  "unitName": "string (1-50 characters, optional)",
  "isWeighted": "boolean (optional)",
  "isActive": "boolean (optional)"
}
```

---

#### 3.5 Delete Unit Type
```http
DELETE /api/unit-types/:id
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_UNIT_TYPES`

---

### 4. Suppliers (`/api/suppliers`)

#### 4.1 Get All Suppliers
```http
GET /api/suppliers
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page, max 100 (default: 20) |
| search | string | No | Search in company name |
| isActive | boolean | No | Filter by active status |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "companyName": "string",
      "contactName": "string",
      "phoneNumber": "string",
      "email": "string",
      "address": "string",
      "isActive": boolean,
      "createdAt": "date",
      "updatedAt": "date"
    }
  ],
  "pagination": { ... }
}
```

---

#### 4.2 Get Supplier by ID
```http
GET /api/suppliers/:id
```

---

#### 4.3 Create Supplier
```http
POST /api/suppliers
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_SUPPLIERS`

**Request Body:**
```json
{
  "companyName": "string (1-50 characters, required)",
  "contactName": "string (max 50 characters, optional)",
  "phoneNumber": "string (max 15 characters, optional)",
  "email": "string (valid email, optional)",
  "address": "string (optional)",
  "isActive": "boolean (optional)"
}
```

---

#### 4.4 Update Supplier
```http
PUT /api/suppliers/:id
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_SUPPLIERS`

**Request Body (at least one field required):**
```json
{
  "companyName": "string (1-50 characters, optional)",
  "contactName": "string (max 50 characters, optional)",
  "phoneNumber": "string (max 15 characters, optional)",
  "email": "string (valid email, optional)",
  "address": "string (optional)",
  "isActive": "boolean (optional)"
}
```

---

#### 4.5 Delete Supplier
```http
DELETE /api/suppliers/:id
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_SUPPLIERS`

---

### 5. Products (`/api/products`)

#### 5.1 Get All Products
```http
GET /api/products
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page, max 100 (default: 20) |
| search | string | No | Search in product name/barcode |
| categoryId | number | No | Filter by category ID |
| supplierId | number | No | Filter by supplier ID |
| isActive | boolean | No | Filter by active status |
| lowStock | boolean | No | Filter for low stock items |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "barcode": "string",
      "productName": "string",
      "description": "string",
      "categoryId": number,
      "supplierId": number,
      "unitTypeId": number,
      "costPrice": "number",
      "sellPrice": "number",
      "stockQuantity": "number",
      "reorderLevel": "number",
      "isActive": boolean,
      "category": { "id": number, "categoryName": "string" },
      "supplier": { "id": number, "companyName": "string" },
      "unitType": { "id": number, "unitCode": "string", "unitName": "string" }
    }
  ],
  "pagination": { ... }
}
```

---

#### 5.2 Get Low Stock Products
```http
GET /api/products/low-stock
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_PRODUCTS`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "productName": "string",
      "barcode": "string",
      "stockQuantity": number,
      "reorderLevel": number
    }
  ],
  "message": "Low stock products retrieved successfully"
}
```

---

#### 5.3 Get Inventory Summary
```http
GET /api/products/summary
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_PRODUCTS`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalProducts": "number",
    "outOfStock": "number",
    "lowStock": "number",
    "activeProducts": "number"
  },
  "message": "Inventory summary retrieved successfully"
}
```

**Field Descriptions:**
| Field | Description |
|-------|-------------|
| totalProducts | Total count of all products in inventory |
| outOfStock | Count of products with stock quantity <= 0 |
| lowStock | Count of products with stock quantity > 0 but <= reorder level |
| activeProducts | Count of products where is_active = true |

---

#### 5.4 Search Products (Paginated)
```http
GET /api/products/search
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | Yes | Search query for product name or barcode |
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page, max 100 (default: 20) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "barcode": "string",
      "productName": "string",
      "description": "string",
      "categoryId": number,
      "supplierId": number,
      "unitTypeId": number,
      "costPrice": "number",
      "sellPrice": "number",
      "stockQuantity": "number",
      "reorderLevel": "number",
      "isActive": boolean,
      "category": { "id": number, "categoryName": "string" },
      "supplier": { "id": number, "companyName": "string" },
      "unitType": { "id": number, "unitCode": "string", "unitName": "string" }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 15,
    "totalPages": 1
  }
}
```

---

#### 5.5 Get Low Stock Products (Paginated)
```http
GET /api/products/low-stock-paginated
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_PRODUCTS`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page, max 100 (default: 20) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "productName": "string",
      "barcode": "string",
      "stockQuantity": number,
      "reorderLevel": number,
      "category": { "id": number, "categoryName": "string" },
      "supplier": { "id": number, "companyName": "string" }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Note:** Returns products where stock quantity is greater than 0 but less than or equal to reorder level, ordered by stock quantity (ascending).

---

#### 5.6 Get Out of Stock Products (Paginated)
```http
GET /api/products/out-of-stock
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_PRODUCTS`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page, max 100 (default: 20) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "productName": "string",
      "barcode": "string",
      "stockQuantity": 0,
      "reorderLevel": number,
      "category": { "id": number, "categoryName": "string" },
      "supplier": { "id": number, "companyName": "string" }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 8,
    "totalPages": 1
  }
}
```

**Note:** Returns products with stock quantity less than or equal to 0, ordered by product name (ascending).

---

#### 5.7 Get Product by ID
```http
GET /api/products/:id
```

---

#### 5.8 Get Product by Barcode
```http
GET /api/products/barcode/:barcode
```

---

#### 5.9 Create Product
```http
POST /api/products
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_PRODUCTS`

**Request Body:**
```json
{
  "barcode": "string (1-50 characters, required)",
  "productName": "string (1-50 characters, required)",
  "description": "string (optional)",
  "categoryId": "number (positive integer, required)",
  "supplierId": "number (positive integer, required)",
  "unitTypeId": "number (positive integer, required)",
  "costPrice": "number (min 0, required)",
  "sellPrice": "number (min 0, required)",
  "stockQuantity": "number (integer, min 0, optional)",
  "reorderLevel": "number (integer, min 0, optional)",
  "isActive": "boolean (optional)"
}
```

---

#### 5.10 Update Product
```http
PUT /api/products/:id
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_PRODUCTS`

**Request Body (at least one field required):**
```json
{
  "barcode": "string (1-50 characters, optional)",
  "productName": "string (1-50 characters, optional)",
  "description": "string (optional)",
  "categoryId": "number (positive integer, optional)",
  "supplierId": "number (positive integer, optional)",
  "unitTypeId": "number (positive integer, optional)",
  "costPrice": "number (min 0, optional)",
  "sellPrice": "number (min 0, optional)",
  "stockQuantity": "number (integer, min 0, optional)",
  "reorderLevel": "number (integer, min 0, optional)",
  "isActive": "boolean (optional)"
}
```

---

#### 5.11 Delete Product
```http
DELETE /api/products/:id
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_PRODUCTS`

---

#### 5.12 Get Stock Movement History
```http
GET /api/products/:id/stock-movements
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_PRODUCTS`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | number | No | Maximum number of records to return (default: 100) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "movementId": number,
      "productId": number,
      "userId": number,
      "movementType": "SALE | PURCHASE | RETURN | ADJUSTMENT",
      "quantity": number,
      "notes": "string",
      "isActive": boolean,
      "createdAt": "date",
      "updatedAt": "date",
      "user": {
        "userId": number,
        "username": "string",
        "fullName": "string"
      }
    }
  ],
  "message": "Stock movement history retrieved successfully"
}
```

**Note:** Returns stock movement history for a specific product, ordered by creation date (descending, most recent first). Includes user information for each movement.

---

### 6. Customers (`/api/customers`)

#### 6.1 Get All Customers
```http
GET /api/customers
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page, max 100 (default: 20) |
| search | string | No | Search in name/phone |
| isActive | boolean | No | Filter by active status |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "phoneNumber": "string",
      "fullName": "string",
      "address": "string",
      "loyaltyPoints": "number",
      "isActive": boolean,
      "createdAt": "date",
      "updatedAt": "date"
    }
  ],
  "pagination": { ... }
}
```

---

#### 6.2 Get Customer by Phone Number
```http
GET /api/customers/phone/:phoneNumber
```

---

#### 6.3 Get Customer by ID
```http
GET /api/customers/:id
```

---

#### 6.4 Create Customer
```http
POST /api/customers
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_CUSTOMERS`

**Request Body:**
```json
{
  "phoneNumber": "string (max 15 characters, optional)",
  "fullName": "string (max 50 characters, optional)",
  "address": "string (optional)",
  "loyaltyPoints": "number (integer, min 0, optional)",
  "isActive": "boolean (optional)"
}
```

---

#### 6.5 Update Customer
```http
PUT /api/customers/:id
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_CUSTOMERS`

**Request Body (at least one field required):**
```json
{
  "phoneNumber": "string (max 15 characters, optional)",
  "fullName": "string (max 50 characters, optional)",
  "address": "string (optional)",
  "loyaltyPoints": "number (integer, min 0, optional)",
  "isActive": "boolean (optional)"
}
```

---

#### 6.6 Delete Customer
```http
DELETE /api/customers/:id
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_CUSTOMERS`

---

### 7. Sales (`/api/sales`)

#### 7.1 Get All Sales
```http
GET /api/sales
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page, max 100 (default: 20) |
| startDate | date | No | Filter by start date |
| endDate | date | No | Filter by end date |
| invoiceNo | string | No | Filter by invoice number |
| customerId | number | No | Filter by customer ID |
| productId | number | No | Filter by product ID |
| paymentStatus | string | No | PAID, PENDING, or REFUNDED |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "invoiceNo": "string",
      "customerId": "number",
      "productId": "number",
      "unitTypeId": "number",
      "barcode": "string",
      "productName": "string",
      "quantity": "number",
      "unitPrice": "number",
      "totalPrice": "number",
      "taxAmount": "number",
      "discountAmount": "number",
      "subTotal": "number",
      "grandTotal": "number",
      "paymentMethod": "string",
      "paymentStatus": "string",
      "createdAt": "date",
      "customer": { ... },
      "product": { ... }
    }
  ],
  "pagination": { ... }
}
```

---

#### 7.2 Get Today's Sales
```http
GET /api/sales/today
```

**Authentication Required:** Yes

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "invoiceNo": "string",
      "productName": "string",
      "grandTotal": "number",
      "paymentMethod": "string",
      "createdAt": "date"
    }
  ],
  "message": "Today sales retrieved successfully"
}
```

---

#### 7.3 Get Sales Summary
```http
GET /api/sales/summary
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | Yes | Start date |
| endDate | date | Yes | End date |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalSales": "number",
    "totalRevenue": "number",
    "averageSale": "number",
    "paymentMethods": { "CASH": "number", "CARD": "number", "QR": "number", "CREDIT": "number" }
  },
  "message": "Sales summary retrieved successfully"
}
```

---

#### 7.4 Get Sale by ID
```http
GET /api/sales/:id
```

---

#### 7.5 Create Sale
```http
POST /api/sales
```

**Authentication Required:** Yes
**Feature Flag:** `FF_SALES`

**Request Body:**
```json
{
  "invoiceNo": "string (1-50 characters, required)",
  "customerId": "number (positive integer, nullable, optional)",
  "productId": "number (positive integer, required)",
  "unitTypeId": "number (positive integer, required)",
  "barcode": "string (1-50 characters, required)",
  "productName": "string (1-50 characters, required)",
  "quantity": "number (integer, min 1, required)",
  "unitPrice": "number (min 0, required)",
  "totalPrice": "number (min 0, required)",
  "taxAmount": "number (min 0, optional)",
  "discountAmount": "number (min 0, optional)",
  "subTotal": "number (min 0, optional)",
  "grandTotal": "number (min 0, required)",
  "paymentMethod": "string (CASH, CARD, QR, or CREDIT, required)",
  "paymentStatus": "string (PAID, PENDING, or REFUNDED, optional)"
}
```

---

#### 7.6 Refund Sale
```http
POST /api/sales/:id/refund
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_SALES`

**Request Body:**
```json
{
  "refundAmount": "number (min 0, required)",
  "reason": "string (optional)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Sale refunded successfully"
}
```

---

### 8. Purchases (`/api/purchases`)

#### 8.1 Get All Purchases
```http
GET /api/purchases
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page, max 100 (default: 20) |
| startDate | date | No | Filter by start date |
| endDate | date | No | Filter by end date |
| supplierId | number | No | Filter by supplier ID |
| status | string | No | PENDING or RECEIVED |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "supplierId": number,
      "supplierInvoiceNo": "string",
      "purchaseDate": "date",
      "totalAmount": "number",
      "status": "string",
      "supplier": { "id": number, "companyName": "string" },
      "items": [
        {
          "id": number,
          "productId": number,
          "quantity": number,
          "buyPrice": number,
          "expiryDate": "date",
          "product": { ... }
        }
      ]
    }
  ],
  "pagination": { ... }
}
```

---

#### 8.2 Get Purchase by ID
```http
GET /api/purchases/:id
```

---

#### 8.3 Create Purchase
```http
POST /api/purchases
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_PURCHASES`

**Request Body:**
```json
{
  "supplierId": "number (positive integer, required)",
  "supplierInvoiceNo": "string (max 50 characters, optional)",
  "purchaseDate": "date (optional)",
  "totalAmount": "number (min 0, optional)",
  "status": "string (PENDING or RECEIVED, optional)",
  "items": [
    {
      "productId": "number (positive integer, required)",
      "quantity": "number (positive integer, required)",
      "buyPrice": "number (min 0, required)",
      "expiryDate": "date (optional)"
    }
  ],
  "items": "array (min 1 item, required)"
}
```

---

#### 8.4 Update Purchase
```http
PUT /api/purchases/:id
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_PURCHASES`

**Request Body (at least one field required):**
```json
{
  "supplierId": "number (positive integer, optional)",
  "supplierInvoiceNo": "string (max 50 characters, optional)",
  "totalAmount": "number (min 0, optional)",
  "status": "string (PENDING or RECEIVED, optional)"
}
```

---

#### 8.5 Delete Purchase
```http
DELETE /api/purchases/:id
```

**Authentication Required:** Yes (Admin)
**Feature Flag:** `FF_PURCHASES`

---

### 9. Expenses (`/api/expenses`)

#### 9.1 Get All Expenses
```http
GET /api/expenses
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page, max 100 (default: 20) |
| search | string | No | Search in title, description, or category name |
| startDate | date | No | Filter by start date |
| endDate | date | No | Filter by end date |
| categoryId | number | No | Filter by category ID |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "categoryId": number,
      "title": "string",
      "description": "string",
      "amount": "number",
      "expenseDate": "date",
      "createdAt": "date",
      "category": { "id": number, "categoryName": "string" }
    }
  ],
  "pagination": { ... }
}
```

---

#### 9.2 Get Expense Categories
```http
GET /api/expenses/categories
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": number, "categoryName": "string" }
  ],
  "message": "Expense categories retrieved successfully"
}
```

---

#### 9.3 Get Expenses Summary
```http
GET /api/expenses/summary
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_EXPENSES`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | Yes | Start date |
| endDate | date | Yes | End date |

---

#### 9.4 Get Expense by ID
```http
GET /api/expenses/:id
```

---

#### 9.5 Create Expense
```http
POST /api/expenses
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_EXPENSES`

**Request Body:**
```json
{
  "categoryId": "number (positive integer, required)",
  "title": "string (required)",
  "description": "string (optional)",
  "amount": "number (positive, required)",
  "expenseDate": "date (optional)"
}
```

---

#### 9.6 Update Expense
```http
PUT /api/expenses/:id
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_EXPENSES`

**Request Body (at least one field required):**
```json
{
  "categoryId": "number (positive integer, optional)",
  "title": "string (optional)",
  "description": "string (optional)",
  "amount": "number (positive, optional)",
  "expenseDate": "date (optional)"
}
```

---

#### 9.7 Delete Expense
```http
DELETE /api/expenses/:id
```

**Authentication Required:** Yes (Admin)
**Feature Flag:** `FF_EXPENSES`

---

### 10. Dashboard (`/api/dashboard`)

#### 10.1 Get Dashboard Summary
```http
GET /api/dashboard/summary
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| year | number | No | Year for summary (default: current year) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalSales": "number",
    "totalRevenue": "number",
    "totalPurchases": "number",
    "totalExpenses": "number",
    "totalProducts": "number",
    "lowStockCount": "number",
    "totalCustomers": "number",
    "totalSuppliers": "number"
  },
  "message": "Dashboard summary retrieved successfully"
}
```

---

#### 10.2 Get Monthly Data
```http
GET /api/dashboard/monthly
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| year | number | Yes | Year to get data for |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "months": [
      {
        "month": "number",
        "sales": "number",
        "purchases": "number",
        "expenses": "number",
        "profit": "number"
      }
    ]
  },
  "message": "Monthly data retrieved successfully"
}
```

---

#### 10.3 Get Yearly Data
```http
GET /api/dashboard/yearly
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "years": [
      {
        "year": "number",
        "sales": "number",
        "purchases": "number",
        "expenses": "number",
        "profit": "number"
      }
    ]
  },
  "message": "Yearly data retrieved successfully"
}
```

---

#### 10.4 Get Low Stock Products
```http
GET /api/dashboard/low-stock
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "productName": "string",
      "barcode": "string",
      "stockQuantity": number,
      "reorderLevel": number
    }
  ],
  "message": "Low stock products retrieved successfully"
}
```

---

#### 10.5 Get Recent Sales
```http
GET /api/dashboard/recent-sales
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | number | No | Number of records (default: 10) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "invoiceNo": "string",
      "productName": "string",
      "grandTotal": "number",
      "paymentMethod": "string",
      "createdAt": "date"
    }
  ],
  "message": "Recent sales retrieved successfully"
}
```

---

### 11. Users (`/api/users`)

#### 11.1 Get All Users
```http
GET /api/users
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_USERS`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| page | number | No | Page number (default: 1) |
| limit | number | No | Items per page, max 100 (default: 20) |
| search | string | No | Search in username/full name |
| isActive | boolean | No | Filter by active status |
| roleId | number | No | Filter by role ID |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": number,
      "username": "string",
      "fullName": "string",
      "roleId": number,
      "isActive": boolean,
      "role": {
        "id": number,
        "roleName": "string"
      },
      "createdAt": "date",
      "updatedAt": "date"
    }
  ],
  "pagination": { ... }
}
```

---

#### 11.2 Get Roles
```http
GET /api/users/roles
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_USERS`

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": number, "roleName": "string" }
  ],
  "message": "Roles retrieved successfully"
}
```

---

#### 11.3 Get User by ID
```http
GET /api/users/:id
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_USERS`

---

#### 11.4 Create User
```http
POST /api/users
```

**Authentication Required:** Yes (Admin)
**Feature Flag:** `FF_USERS`

**Request Body:**
```json
{
  "username": "string (3-50 alphanumeric characters, required)",
  "password": "string (min 6 characters, required)",
  "fullName": "string (1-50 characters, required)",
  "roleId": "number (positive integer, required)",
  "isActive": "boolean (optional)"
}
```

---

#### 11.5 Update User
```http
PUT /api/users/:id
```

**Authentication Required:** Yes (Admin)
**Feature Flag:** `FF_USERS`

**Request Body (at least one field required):**
```json
{
  "username": "string (3-50 alphanumeric characters, optional)",
  "password": "string (min 6 characters, optional)",
  "fullName": "string (1-50 characters, optional)",
  "roleId": "number (positive integer, optional)",
  "isActive": "boolean (optional)"
}
```

---

#### 11.6 Delete User
```http
DELETE /api/users/:id
```

**Authentication Required:** Yes (Admin)
**Feature Flag:** `FF_USERS`

---

#### 11.7 Change Own Password
```http
POST /api/users/change-password
```

**Authentication Required:** Yes

**Request Body:**
```json
{
  "oldPassword": "string (min 6 characters, required)",
  "newPassword": "string (min 6 characters, required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### 12. Reports (`/api/reports`)

#### 12.1 Get Sales Report
```http
GET /api/reports/sales
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_REPORTS`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | Yes | Start date |
| endDate | date | Yes | End date |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalSales": "number",
    "totalRevenue": "number",
    "totalItemsSold": "number",
    "averageSaleValue": "number",
    "salesByPaymentMethod": { "CASH": "number", "CARD": "number", "QR": "number", "CREDIT": "number" },
    "topSellingProducts": [
      { "productName": "string", "totalSold": "number", "revenue": "number" }
    ]
  },
  "message": "Sales report retrieved successfully"
}
```

---

#### 12.2 Get Profit & Loss Report
```http
GET /api/reports/profit-loss
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_REPORTS`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | Yes | Start date |
| endDate | date | Yes | End date |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalRevenue": "number",
    "costOfGoodsSold": "number",
    "grossProfit": "number",
    "totalExpenses": "number",
    "netProfit": "number",
    "profitMargin": "number"
  },
  "message": "Profit & Loss report retrieved successfully"
}
```

---

#### 12.3 Get Inventory Report
```http
GET /api/reports/inventory
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_REPORTS`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalProducts": "number",
    "totalStockValue": "number",
    "lowStockProducts": "number",
    "outOfStockProducts": "number",
    "productsByCategory": [
      { "categoryName": "string", "productCount": "number", "stockValue": "number" }
    ]
  },
  "message": "Inventory report retrieved successfully"
}
```

---

#### 12.4 Get Purchase Report
```http
GET /api/reports/purchases
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_REPORTS`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | Yes | Start date |
| endDate | date | Yes | End date |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalPurchases": "number",
    "totalPurchaseAmount": "number",
    "averagePurchaseValue": "number",
    "purchasesBySupplier": [
      { "supplierName": "string", "purchaseCount": "number", "totalAmount": "number" }
    ]
  },
  "message": "Purchase report retrieved successfully"
}
```

---

#### 12.5 Get Expense Report
```http
GET /api/reports/expenses
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_REPORTS`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | Yes | Start date |
| endDate | date | Yes | End date |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalExpenses": "number",
    "expensesByCategory": [
      { "categoryName": "string", "totalAmount": "number", "percentage": "number" }
    ]
  },
  "message": "Expense report retrieved successfully"
}
```

---

#### 12.6 Get All Reports
```http
GET /api/reports/all
```

**Authentication Required:** Yes (Admin/Manager)
**Feature Flag:** `FF_REPORTS`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| startDate | date | Yes | Start date |
| endDate | date | Yes | End date |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "salesReport": { ... },
    "profitLossReport": { ... },
    "inventoryReport": { ... },
    "purchaseReport": { ... },
    "expenseReport": { ... }
  },
  "message": "All reports retrieved successfully"
}
```

---

## Health & Utility Endpoints

### Health Check
```http
GET /api/health
```

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "string"
}
```

---

### Feature Flags
```http
GET /api/features
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "FF_AUTH": "boolean",
    "FF_CATEGORIES": "boolean",
    "FF_UNIT_TYPES": "boolean",
    "FF_SUPPLIERS": "boolean",
    "FF_PRODUCTS": "boolean",
    "FF_CUSTOMERS": "boolean",
    "FF_SALES": "boolean",
    "FF_PURCHASES": "boolean",
    "FF_EXPENSES": "boolean",
    "FF_DASHBOARD": "boolean",
    "FF_USERS": "boolean",
    "FF_REPORTS": "boolean"
  }
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 400 | Bad Request - Validation error |
| 401 | Unauthorized - Invalid or missing token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |
| 503 | Service Unavailable - Feature flag disabled |

---

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Auth Login**: 5 requests per 15 minutes

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```
