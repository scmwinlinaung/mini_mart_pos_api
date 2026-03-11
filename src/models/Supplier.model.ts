import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.config';

class Supplier extends Model {
  public supplierId!: number;
  public companyName!: string;
  public contactName?: string;
  public phoneNumber?: string;
  public email?: string;
  public address?: string;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Supplier.init(
  {
    supplierId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'supplier_id',
    },
    companyName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'company_name',
    },
    contactName: {
      type: DataTypes.STRING(50),
      field: 'contact_name',
    },
    phoneNumber: {
      type: DataTypes.STRING(15),
      field: 'phone_number',
    },
    email: {
      type: DataTypes.STRING(254),
    },
    address: {
      type: DataTypes.TEXT,
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
    modelName: 'Supplier',
    tableName: 'suppliers',
    timestamps: true,
  },
);

export default Supplier;
