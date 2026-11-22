/* 025
 * Define a tabela de tarefas com titulo, descricao, status, prazo e responsavel opcional
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
interface Attr {
  id: number;
  title: string;
  description: string | null;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  dueDate: Date | null;
  employeeId: number | null;
}
export class Task extends Model<Attr, Optional<Attr, 'id'>> implements Attr {
  declare id: number;
  declare title: string;
  declare description: string | null;
  declare status: 'PENDENTE' | 'EM_ANDAMENTO' | 'CONCLUIDA';
  declare dueDate: Date | null;
  declare employeeId: number | null;
}
Task.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(160),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('PENDENTE', 'EM_ANDAMENTO', 'CONCLUIDA'),
      allowNull: false,
      defaultValue: 'PENDENTE',
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'due_date',
    },
    employeeId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
      field: 'employee_id',
    },
  },
  {
    sequelize,
    tableName: 'tasks',
  },
);
