/* 001
 * Configura o Express, libera as origens do frontend e liga as rotas e o tratamento de
 * erros
 */
import express from 'express';
import cors from 'cors';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';
const app = express();
const allowed = (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',');
app.use(
  cors({
    origin: allowed,
    credentials: true,
  }),
);
app.use(
  express.json({
    limit: '1mb',
  }),
);
app.use('/api', routes);
app.use(errorHandler);
export default app;
