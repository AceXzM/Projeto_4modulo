/* 005
 * Monta os controllers usados nos quatro cadastros
 */
import { Request, Response, NextFunction } from 'express';
import { Model, ModelStatic } from 'sequelize';
import { ResourceService } from '../services/ResourceService';
import { SequelizeResourceRepository } from '../repositories/SequelizeResourceRepository';

/* 005.01
 * recebe o modelo e monta os controllers de listagem, consulta, criacao, edicao e
 * exclusao
 */
export const resourceController = (model: ModelStatic<Model>) => {
  const service = new ResourceService(
    model.tableName,
    new SequelizeResourceRepository(model),
  );
  return {
    /* 005.02
     * Busca os registros com a pagina e o limite recebidos na URL
     */
    list: async (req: Request, res: Response, next: NextFunction) => {
      try {
        res.json(await service.list(req.query.page, req.query.limit));
      } catch (error) {
        next(error);
      }
    },

    /* 005.03
     * busca um registro pelo ID da URL
     */
    get: async (req: Request, res: Response, next: NextFunction) => {
      try {
        res.json(await service.get(req.params.id));
      } catch (error) {
        next(error);
      }
    },

    /* 005.04
     * Envia os dados ao servico e responde com o registro criado
     */
    create: async (req: Request, res: Response, next: NextFunction) => {
      try {
        res.status(201).json(await service.create(req.body));
      } catch (error) {
        next(error);
      }
    },

    /* 005.05
     * envia o ID e os dados ao servico e devolve o registro atualizado
     */
    update: async (req: Request, res: Response, next: NextFunction) => {
      try {
        res.json(await service.update(req.params.id, req.body));
      } catch (error) {
        next(error);
      }
    },

    /* 005.06
     * Exclui o registro pelo ID e responde sem conteudo
     */
    remove: async (req: Request, res: Response, next: NextFunction) => {
      try {
        await service.remove(req.params.id);
        res.status(204).send();
      } catch (error) {
        next(error);
      }
    },
  };
};
