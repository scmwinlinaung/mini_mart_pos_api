import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.config';
import Purchase from './Purchase.model';
import Product from './Product.model';

class PurchaseItem extends Model {
  public itemId!: number;
  public purchaseId!: number;
  public productId!: number;
  public quantity!: number;
  public buyPrice!: number;
  public expiryDate?: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public purchase?: Purchase;
  public product?: Product;
}

PurchaseItem.init(
  {
    itemId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'item_id',
    },
    purchaseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'purchase_id',
      references: {
        model: 'purchases',
        key: 'purchase_id',
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
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    buyPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'buy_price',
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'expiry_date',
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
    modelName: 'PurchaseItem',
    tableName: 'purchase_items',
    timestamps: true,
  },
);

// Associations
PurchaseItem.belongsTo(Purchase, { foreignKey: 'purchaseId', as: 'purchase' });
PurchaseItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

Purchase.hasMany(PurchaseItem, { foreignKey: 'purchaseId', as: 'items' });
Product.hasMany(PurchaseItem, { foreignKey: 'productId', as: 'purchaseItems' });

export default PurchaseItem;
