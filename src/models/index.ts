import { sequelize } from '../config/database.config';
import Role from './Role.model';
import User from './User.model';
import Category from './Category.model';
import Supplier from './Supplier.model';
import UnitType from './UnitType.model';
import Product from './Product.model';
import Customer from './Customer.model';
import Sale from './Sale.model';
import Purchase from './Purchase.model';
import PurchaseItem from './PurchaseItem.model';
import ExpenseCategory from './ExpenseCategory.model';
import Expense from './Expense.model';
import StockMovement from './StockMovement.model';

// Export all models
export {
  Role,
  User,
  Category,
  Supplier,
  UnitType,
  Product,
  Customer,
  Sale,
  Purchase,
  PurchaseItem,
  ExpenseCategory,
  Expense,
  StockMovement,
};

export const models = {
  Role,
  User,
  Category,
  Supplier,
  UnitType,
  Product,
  Customer,
  Sale,
  Purchase,
  PurchaseItem,
  ExpenseCategory,
  Expense,
  StockMovement,
};

// Setup associations
export const setupAssociations = (): void => {
  // All associations are already defined in individual model files
  // This function serves as a centralized place for association setup
  // if needed in the future
};

export default sequelize;
