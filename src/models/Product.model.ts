import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.config';
import Category from './Category.model';
import Supplier from './Supplier.model';
import UnitType from './UnitType.model';

class Product extends Model {
  public productId!: number;
  public categoryId!: number;
  public supplierId!: number;
  public unitTypeId!: number;
  public barcode!: string;
  public productName!: string;
  public description?: string;
  public costPrice!: number;
  public sellPrice!: number;
  public stockQuantity!: number;
  public reorderLevel!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public category?: Category;
  public supplier?: Supplier;
  public unitType?: UnitType;
}

Product.init(
  {
    productId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'product_id',
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_id',
      references: {
        model: 'categories',
        key: 'category_id',
      },
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
      unique: true,
    },
    productName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'product_name',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    costPrice: {
      type: DataTypes.FLOAT,
      defaultValue: 0.0,
      field: 'cost_price',
    },
    sellPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
      field: 'sell_price',
    },
    stockQuantity: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'stock_quantity',
    },
    reorderLevel: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
      field: 'reorder_level',
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
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
  },
);

// Associations
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Product.belongsTo(Supplier, { foreignKey: 'supplierId', as: 'supplier' });
Product.belongsTo(UnitType, { foreignKey: 'unitTypeId', as: 'unitType' });

Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Supplier.hasMany(Product, { foreignKey: 'supplierId', as: 'products' });
UnitType.hasMany(Product, { foreignKey: 'unitTypeId', as: 'products' });

export default Product;
