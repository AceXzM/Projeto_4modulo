/* 023
 * Define a tabela de departamentos com nome unico e descricao opcional
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
interface Attr {
  id: number;
  name: string;
  description: string | null;
}
export class Department extends Model<Attr, Optional<Attr, 'id'>> implements Attr {
  declare id: number;
  declare name: string;
  declare description: string | null;
}
Department.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'departments',
  },
);
