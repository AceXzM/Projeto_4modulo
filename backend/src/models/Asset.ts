/* 026
 * Define a tabela de ativos com nome, codigo unico, categoria, status e departamento
 * opcional
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
interface Attr {
  id: number;
  name: string;
  code: string;
  category: string;
  status: 'DISPONIVEL' | 'EM_USO' | 'MANUTENCAO';
  departmentId: number | null;
}
export class Asset extends Model<Attr, Optional<Attr, 'id'>> implements Attr {
  declare id: number;
  declare name: string;
  declare code: string;
  declare category: string;
  declare status: 'DISPONIVEL' | 'EM_USO' | 'MANUTENCAO';
  declare departmentId: number | null;
}
Asset.init(
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
    code: {
      type: DataTypes.STRING(60),
      allowNull: false,
      unique: true,
    },
    category: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('DISPONIVEL', 'EM_USO', 'MANUTENCAO'),
      allowNull: false,
      defaultValue: 'DISPONIVEL',
    },
    departmentId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'department_id',
    },
  },
  {
    sequelize,
    tableName: 'assets',
  },
);
