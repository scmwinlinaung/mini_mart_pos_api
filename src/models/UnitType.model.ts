import { Model, DataTypes } from 'sequelize';
import { sequelize } from '../config/database.config';

class UnitType extends Model {
  public unitId!: number;
  public unitCode!: string;
  public unitName!: string;
  public isWeighted!: boolean;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UnitType.init(
  {
    unitId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'unit_id',
    },
    unitCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'unit_code',
    },
    unitName: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'unit_name',
    },
    isWeighted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_weighted',
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
    modelName: 'UnitType',
    tableName: 'unit_types',
    timestamps: true,
  },
);

export default UnitType;
