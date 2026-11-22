/* 003
 * Inicia a API depois de conferir a configuracao e conectar ao banco
 */
import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import {sequelize} from './config/database';
import './models/associations';
import './models/User';

const port = Number(process.env.PORT ?? 3000);


/* 003.01
 * Tenta conectar ao banco ate 12 vezes, esperando 2 segundos entre as tentativas
 */
async function waitForDatabase() {
  for (let attempt = 1; attempt <= 12; attempt++) {
    try {
      await sequelize.authenticate();
      return;
    } catch (error) {
      if (attempt === 12) throw error;
      console.warn(`Banco indisponível; nova tentativa em 2s (${attempt}/12).`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}


/* 003.02
 * Confere a porta e a configuracao do JWT, espera o banco e inicia a API
 */
async function start() {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT deve ser um inteiro entre 1 e 65535.');
  }
  if (!process.env.JWT_SECRET?.trim()) throw new Error('JWT_SECRET não configurado.');
  await waitForDatabase();
  // Cria as tabelas que faltam sem recriar as que já existem
  if (process.env.DB_SYNC === 'true') await sequelize.sync();
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Droz Control API escutando na porta ${port}.`);
  });
  server.on('error', error => {
    console.error('Falha ao abrir porta HTTP:', error.message);
    process.exit(1);
  });
}

start().catch(error => {
  console.error('Falha ao iniciar API:', error instanceof Error ? error.message : 'erro desconhecido');
  process.exit(1);
});
