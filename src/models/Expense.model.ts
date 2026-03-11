import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.config';
import ExpenseCategory from './ExpenseCategory.model';
import User from './User.model';

class Expense extends Model {
  public expenseId!: number;
  public categoryId!: number;
  public userId!: number;
  public title!: string;
  public description?: string;
  public amount!: number;
  public expenseDate!: Date;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Associations
  public category?: ExpenseCategory;
  public user?: User;
}

Expense.init(
  {
    expenseId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'expense_id',
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'category_id',
      references: {
        model: 'expense_categories',
        key: 'category_id',
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
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    expenseDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
      field: 'expense_date',
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
    modelName: 'Expense',
    tableName: 'expenses',
    timestamps: true,
  },
);

// Associations
Expense.belongsTo(ExpenseCategory, { foreignKey: 'categoryId', as: 'category' });
Expense.belongsTo(User, { foreignKey: 'userId', as: 'user' });

ExpenseCategory.hasMany(Expense, { foreignKey: 'categoryId', as: 'expenses' });
User.hasMany(Expense, { foreignKey: 'userId', as: 'expenses' });

export default Expense;
