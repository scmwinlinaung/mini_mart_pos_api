import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.config';
import User from './User.model';
import Customer from './Customer.model';
import Product from './Product.model';
import UnitType from './UnitType.model';

class Sale extends Model {
  public saleId!: number;
  public invoiceNo!: string;
  public userId!: number;
  public customerId?: number;
  public productId!: number;
  public unitTypeId!: number;
  public barcode!: string;
  public productName!: string;
  public quantity!: number;
  public unitPrice!: number;
  public totalPrice!: number;
  public taxAmount!: number;
  public discountAmount!: number;
  public subTotal!: number;
  public grandTotal!: number;
  public paymentMethod!: 'CASH' | 'CARD' | 'QR' | 'CREDIT';
  public paymentStatus!: 'PAID' | 'PENDING' | 'REFUNDED';
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public user?: User;
  public customer?: Customer;
  public product?: Product;
  public unitType?: UnitType;
}

Sale.init(
  {
    saleId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'sale_id',
    },
    invoiceNo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'invoice_no',
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'customer_id',
      references: {
        model: 'customers',
        key: 'customer_id',
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'product_id',
      references: {
        model: 'products',
        key: 'product_id',
      },
    },
    unitTypeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'unit_type_id',
      references: {
        model: 'unit_types',
        key: 'unit_id',
      },
    },
    barcode: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    productName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'product_name',
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    unitPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'unit_price',
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'total_price',
    },
    taxAmount: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
      field: 'tax_amount',
    },
    discountAmount: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
      field: 'discount_amount',
    },
    subTotal: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
      field: 'sub_total',
    },
    grandTotal: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'grand_total',
    },
    paymentMethod: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'payment_method',
      validate: {
        isIn: [['CASH', 'CARD', 'QR', 'CREDIT']],
      },
    },
    paymentStatus: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: 'PAID',
      field: 'payment_status',
      validate: {
        isIn: [['PAID', 'PENDING', 'REFUNDED']],
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active',
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'created_at',
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'updated_at',
    },
  },
  {
    sequelize,
    modelName: 'Sale',
    tableName: 'sales',
    timestamps: true,
  },
);

// Associations
Sale.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Sale.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Sale.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Sale.belongsTo(UnitType, { foreignKey: 'unitTypeId', as: 'unitType' });

User.hasMany(Sale, { foreignKey: 'userId', as: 'sales' });
Customer.hasMany(Sale, { foreignKey: 'customerId', as: 'sales' });
Product.hasMany(Sale, { foreignKey: 'productId', as: 'sales' });
UnitType.hasMany(Sale, { foreignKey: 'unitTypeId', as: 'sales' });

export default Sale;
