/* 022
 * define a tabela de contas com nome, e-mail, CPF e hash da senha
 */
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface UserAttributes {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  cpf: string;
  createdAt?: Date;
  updatedAt?: Date;
}
type UserCreation = Optional<UserAttributes, 'id'>;

export class User extends Model<UserAttributes, UserCreation> implements UserAttributes {
  declare id: number;
  declare name: string;
  declare email: string;
  declare passwordHash: string;
  declare cpf: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}
User.init(
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
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    passwordHash: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'password_hash',
    },
    cpf: {
      type: DataTypes.STRING(11),
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    modelName: 'User',
  },
);
