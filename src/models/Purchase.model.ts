import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.config';
import Supplier from './Supplier.model';
import User from './User.model';
import PurchaseItem from './PurchaseItem.model';

class Purchase extends Model {
  public purchaseId!: number;
  public supplierId!: number;
  public userId!: number;
  public supplierInvoiceNo?: string;
  public totalAmount!: number;
  public status!: 'PENDING' | 'RECEIVED';
  public purchaseDate!: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public supplier?: Supplier;
  public user?: User;
  public items?: PurchaseItem[];
}

Purchase.init(
  {
    purchaseId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'purchase_id',
    },
    supplierId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'supplier_id',
      references: {
        model: 'suppliers',
        key: 'supplier_id',
      },
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
    supplierInvoiceNo: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true,
      field: 'supplier_invoice_no',
    },
    totalAmount: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
      field: 'total_amount',
    },
    status: {
      type: DataTypes.STRING(8),
      allowNull: false,
      defaultValue: 'RECEIVED',
      validate: {
        isIn: [['PENDING', 'RECEIVED']],
      },
    },
    purchaseDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'purchase_date',
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
    modelName: 'Purchase',
    tableName: 'purchases',
    timestamps: true,
  },
);

// Associations
Purchase.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
Purchase.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Supplier.hasMany(Purchase, { foreignKey: 'supplierId', as: 'purchases' });
User.hasMany(Purchase, { foreignKey: 'userId', as: 'purchases' });

export default Purchase;
