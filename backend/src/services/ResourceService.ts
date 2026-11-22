/* 007
 * reune as regras que os quatro cadastros tem em comum
 */
import { ResourceRepository } from '../repositories/ResourceRepository';
import { ResourceRecord } from '../domain/ResourceRecord';
import { AppError } from '../utils/AppError';

export class ResourceService {
  /* 007.01
   * Recebe o nome do cadastro e o repositorio que vai acessar os dados
   */
  constructor(
    private readonly resource: string,
    private readonly repository: ResourceRepository,
  ) {}

  /* 007.02
   * confere se o ID e um numero inteiro positivo e devolve o valor convertido
   */
  private id(input: unknown) {
    if (
      !['string', 'number'].includes(typeof input) ||
      !Number.isSafeInteger(Number(input)) ||
      Number(input) < 1
    ) {
      throw new AppError('ID inválido.');
    }
    return Number(input);
  }

  /* 007.03
   * Valida a pagina e o limite de 1 a 50 registros e devolve a lista com os dados da
   * paginacao
   */
  async list(pageInput: unknown = 1, limitInput: unknown = 10) {
    if (
      !['string', 'number'].includes(typeof pageInput) ||
      !['string', 'number'].includes(typeof limitInput)
    ) {
      throw new AppError('Paginação inválida.');
    }
    const page = Number(pageInput);
    const limit = Number(limitInput);
    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 50 ||
      !Number.isSafeInteger((page - 1) * limit)
    ) {
      throw new AppError('Use página inteira positiva e limite entre 1 e 50.');
    }
    const result = await this.repository.list(page, limit);
    return {
      ...result,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    };
  }

  /* 007.04
   * busca pelo ID e retorna erro 404 se o registro nao existir
   */
  async get(input: unknown) {
    const row = await this.repository.find(this.id(input));
    if (!row) {
      throw new AppError('Registro não encontrado.', 404, 'NOT_FOUND');
    }
    return row;
  }

  /* 007.05
   * Valida os campos com ResourceRecord antes de salvar o cadastro
   */
  async create(input: unknown) {
    return this.repository.create(new ResourceRecord(this.resource, input).toJSON());
  }

  /* 007.06
   * confere se o registro existe e valida os campos antes de atualizar
   */
  async update(id: unknown, input: unknown) {
    await this.get(id);
    const row = await this.repository.update(
      this.id(id),
      new ResourceRecord(this.resource, input).toJSON(),
    );
    if (!row) {
      throw new AppError('Registro não encontrado.', 404, 'NOT_FOUND');
    }
    return row;
  }

  /* 007.07
   * Exclui pelo ID e retorna erro 404 se o registro nao existir
   */
  async remove(id: unknown) {
    if (!(await this.repository.remove(this.id(id)))) {
      throw new AppError('Registro não encontrado.', 404, 'NOT_FOUND');
    }
  }
}
