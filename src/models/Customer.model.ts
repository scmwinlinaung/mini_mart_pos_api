import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.config';

class Customer extends Model {
  public customerId!: number;
  public phoneNumber?: string;
  public fullName?: string;
  public address?: string;
  public loyaltyPoints!: number;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Customer.init(
  {
    customerId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'customer_id',
    },
    phoneNumber: {
      type: DataTypes.STRING(15),
      allowNull: true,
      unique: true,
      field: 'phone_number',
    },
    fullName: {
      type: DataTypes.STRING(50),
      field: 'full_name',
    },
    address: {
      type: DataTypes.TEXT,
    },
    loyaltyPoints: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'loyalty_points',
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
    modelName: 'Customer',
    tableName: 'customers',
    timestamps: true,
  },
);

export default Customer;
