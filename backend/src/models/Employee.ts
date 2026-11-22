/* 024
 * define a tabela de colaboradores com nome, e-mail, cargo e departamento opcional
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
interface Attr {
  id: number;
  name: string;
  email: string;
  role: string;
  departmentId: number | null;
}
export class Employee extends Model<Attr, Optional<Attr, 'id'>> implements Attr {
  declare id: number;
  declare name: string;
  declare email: string;
  declare role: string;
  declare departmentId: number | null;
}
Employee.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(160),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    role: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    departmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'department_id',
    },
  },
  {
    sequelize,
    tableName: 'employees',
  },
);
