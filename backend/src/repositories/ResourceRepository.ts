/* 016
 * define as operacoes de listagem, consulta, criacao, edicao e exclusao dos cadastros
 */
/*
 * O servico usa este contrato sem depender do Sequelize
 */
export type ResourceData = Record<string, unknown>;
export interface ResourceRepository {
  list(
    page: number,
    limit: number,
  ): Promise<{
    data: ResourceData[];
    total: number;
  }>;
  find(id: number): Promise<ResourceData | null>;
  create(data: Readonly<ResourceData>): Promise<ResourceData>;
  update(id: number, data: Readonly<ResourceData>): Promise<ResourceData | null>;
  remove(id: number): Promise<boolean>;
}
