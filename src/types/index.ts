// Auth Types
export interface JwtPayload {
  userId: number;
  username: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// User Types
export interface UserCreateInput {
  username: string;
  password: string;
  fullName: string;
  roleId: number;
  isActive?: boolean;
}

export interface UserUpdateInput {
  password?: string;
  fullName?: string;
  roleId?: number;
  isActive?: boolean;
}

// Category Types
export interface CategoryCreateInput {
  categoryName: string;
  description?: string;
  isActive?: boolean;
}

export interface CategoryUpdateInput {
  categoryName?: string;
  description?: string;
  isActive?: boolean;
}

// Supplier Types
export interface SupplierCreateInput {
  companyName: string;
  contactName?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  isActive?: boolean;
}

export interface SupplierUpdateInput {
  companyName?: string;
  contactName?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  isActive?: boolean;
}

// Unit Type Types
export interface UnitTypeCreateInput {
  unitCode: string;
  unitName: string;
  isWeighted?: boolean;
  isActive?: boolean;
}

export interface UnitTypeUpdateInput {
  unitCode?: string;
  unitName?: string;
  isWeighted?: boolean;
  isActive?: boolean;
}

// Product Types
export interface ProductCreateInput {
  barcode: string;
  productName: string;
  description?: string;
  categoryId: number;
  supplierId: number;
  unitTypeId: number;
  costPrice: number;
  sellPrice: number;
  stockQuantity?: number;
  reorderLevel?: number;
  isActive?: boolean;
}

export interface ProductUpdateInput {
  barcode?: string;
  productName?: string;
  description?: string;
  categoryId?: number;
  supplierId?: number;
  unitTypeId?: number;
  costPrice?: number;
  sellPrice?: number;
  stockQuantity?: number;
  reorderLevel?: number;
  isActive?: boolean;
}

// Customer Types
export interface CustomerCreateInput {
  phoneNumber?: string;
  fullName?: string;
  address?: string;
  loyaltyPoints?: number;
  isActive?: boolean;
}

export interface CustomerUpdateInput {
  phoneNumber?: string;
  fullName?: string;
  address?: string;
  loyaltyPoints?: number;
  isActive?: boolean;
}

// Sale Types
export interface SaleCreateInput {
  invoiceNo: string;
  userId: number;
  customerId?: number;
  productId: number;
  unitTypeId: number;
  barcode: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  taxAmount?: number;
  discountAmount?: number;
  subTotal?: number;
  grandTotal: number;
  paymentMethod: 'CASH' | 'CARD' | 'QR' | 'CREDIT';
  paymentStatus?: 'PAID' | 'PENDING' | 'REFUNDED' | 'PARTIAL_REFUND';
}

// Purchase Types
export interface PurchaseCreateInput {
  supplierId: number;
  userId: number;
  supplierInvoiceNo?: string;
  purchaseDate?: Date;
  totalAmount?: number;
  status?: 'PENDING' | 'RECEIVED';
  items: PurchaseItemCreateInput[];
}

export interface PurchaseItemCreateInput {
  productId: number;
  quantity: number;
  buyPrice: number;
  expiryDate?: Date;
}

// Expense Types
export interface ExpenseCreateInput {
  categoryId: number;
  userId: number;
  title: string;
  description?: string;
  amount: number;
  expenseDate?: Date;
}

export interface ExpenseUpdateInput {
  categoryId?: number;
  title?: string;
  description?: string;
  amount?: number;
  expenseDate?: Date;
}
