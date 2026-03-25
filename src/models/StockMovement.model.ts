import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.config';
import User from './User.model';
import Product from './Product.model';

class StockMovement extends Model {
  public movementId!: number;
  public productId!: number;
  public userId!: number;
  public movementType!: 'SALE' | 'PURCHASE' | 'RETURN' | 'RETURN_IN' | 'RETURN_OUT' | 'DAMAGE' | 'EXPIRED' | 'THEFT' | 'LOSS' | 'CORRECTION';
  public quantity!: number;
  public notes?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public product?: Product;
  public user?: User;
}

StockMovement.init(
  {
    movementId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'movement_id',
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'user_id',
      },
    },
    movementType: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'movement_type',
      validate: {
        isIn: [['SALE', 'PURCHASE', 'RETURN', 'RETURN_IN', 'RETURN_OUT', 'DAMAGE', 'EXPIRED', 'THEFT', 'LOSS', 'CORRECTION']],
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    modelName: 'StockMovement',
    tableName: 'stock_movements',
    timestamps: false, // Disable auto-timestamps as they're managed by DB triggers and defaults
  },
);

// Associations
StockMovement.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
StockMovement.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Product.hasMany(StockMovement, { foreignKey: 'productId', as: 'stockMovements' });
User.hasMany(StockMovement, { foreignKey: 'userId', as: 'stockMovements' });

export default StockMovement;
