import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.config';

class ExpenseCategory extends Model {
  public categoryId!: number;
  public categoryName!: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

ExpenseCategory.init(
  {
    categoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'category_id',
    },
    categoryName: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: 'category_name',
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
    modelName: 'ExpenseCategory',
    tableName: 'expense_categories',
    timestamps: true,
  },
);

export default ExpenseCategory;
