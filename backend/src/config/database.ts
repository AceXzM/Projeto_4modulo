/* 002
 * configura a conexao com o MySQL usando as variaveis de ambiente
 */
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config();

const required = ['DB_NAME', 'DB_USER', 'DB_HOST'] as const;
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Variável obrigatória ausente: ${key}`);
  }
}

export const sequelize = new Sequelize(
  process.env.DB_NAME!,
  process.env.DB_USER!,
  process.env.DB_PASSWORD ?? '',
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT ?? 3306),
    dialect: (process.env.DB_DIALECT ?? 'mysql') as 'mariadb' | 'mysql',
    logging: false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);
