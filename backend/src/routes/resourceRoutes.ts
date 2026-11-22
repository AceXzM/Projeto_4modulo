/* 019
 * liga as rotas de cada cadastro aos controllers e exige autenticacao
 */
import { Router } from 'express';
import { ModelStatic, Model } from 'sequelize';
import { resourceController } from '../controllers/resourceController';
import { authenticate } from '../middlewares/auth';

/* 019.01
 * Cria as cinco rotas do cadastro e exige autenticacao antes de chamar os controllers
 */
export function createResourceRoutes(model: ModelStatic<Model>) {
  const router = Router();
  const c = resourceController(model);
  router.use(authenticate);
  router.get('/', c.list);
  router.get('/:id', c.get);
  router.post('/', c.create);
  router.put('/:id', c.update);
  router.delete('/:id', c.remove);
  return router;
}
