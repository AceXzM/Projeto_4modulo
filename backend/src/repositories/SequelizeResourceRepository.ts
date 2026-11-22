/* 018
 * Acessa a tabela do cadastro usando o modelo recebido
 */
import { Model, ModelStatic } from 'sequelize';
import { ResourceRepository, ResourceData } from './ResourceRepository';

export class SequelizeResourceRepository implements ResourceRepository {
  /* 018.01
   * recebe o modelo que define qual tabela sera acessada
   */
  constructor(private readonly model: ModelStatic<Model>) {}

  /* 018.02
   * Busca a pagina de registros do mais recente para o mais antigo e inclui os nomes dos
   * vinculos
   */
  async list(page: number, limit: number) {
    const include = ['department', 'assignee']
      .filter((name) => this.model.associations[name])
      .map((association) => ({
        association,
        attributes: ['id', 'name'],
      }));
    const result = await this.model.findAndCountAll({
      limit,
      offset: (page - 1) * limit,
      order: [['id', 'DESC']],
      include,
      distinct: true,
    });
    return {
      data: result.rows.map((row) => row.toJSON() as ResourceData),
      total: result.count,
    };
  }

  /* 018.03
   * busca um registro pela chave primaria e devolve null se nao encontrar
   */
  async find(id: number) {
    return ((await this.model.findByPk(id))?.toJSON() as ResourceData) ?? null;
  }

  /* 018.04
   * Salva os dados validados e devolve o registro criado
   */
  async create(data: Readonly<ResourceData>) {
    return (
      await this.model.create({
        ...data,
      })
    ).toJSON() as ResourceData;
  }

  /* 018.05
   * busca o registro pelo ID e salva os dados recebidos
   */
  async update(id: number, data: Readonly<ResourceData>) {
    const row = await this.model.findByPk(id);
    return row
      ? ((
          await row.update({
            ...data,
          })
        ).toJSON() as ResourceData)
      : null;
  }

  /* 018.06
   * Busca o registro pelo ID e exclui, retornando false se nao encontrar
   */
  async remove(id: number) {
    const row = await this.model.findByPk(id);
    if (!row) {
      return false;
    }
    await row.destroy();
    return true;
  }
}
