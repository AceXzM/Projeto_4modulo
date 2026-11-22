/* 017
 * acessa as contas no banco pelo modelo User
 */
import { User } from '../models/User';
import { AccountRepository, NewAccount, StoredAccount } from './AccountRepository';

export class SequelizeAccountRepository implements AccountRepository {
  /* 017.01
   * Transforma o modelo User em um objeto para uso interno do servico
   */
  private plain(user: User | null): StoredAccount | null {
    return user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          cpf: user.cpf,
          passwordHash: user.passwordHash,
        }
      : null;
  }

  /* 017.02
   * busca a conta pelo ID e devolve null se nao encontrar
   */
  async findById(id: number) {
    return this.plain(await User.findByPk(id));
  }

  /* 017.03
   * Busca a conta pelo e-mail e devolve null se nao encontrar
   */
  async findByEmail(email: string) {
    return this.plain(
      await User.findOne({
        where: {
          email,
        },
      }),
    );
  }

  /* 017.04
   * busca a conta pelo CPF e devolve null se nao encontrar
   */
  async findByCpf(cpf: string) {
    return this.plain(
      await User.findOne({
        where: {
          cpf,
        },
      }),
    );
  }

  /* 017.05
   * Salva a conta no banco com o hash da senha ja preparado
   */
  async create(data: NewAccount) {
    return this.plain(await User.create(data))!;
  }

  /* 017.06
   * busca a conta e atualiza nome, CPF e hash da senha quando informado
   */
  async updateProfile(
    id: number,
    data: {
      name: string;
      cpf: string;
      passwordHash?: string;
    },
  ) {
    const user = await User.findByPk(id);
    if (!user) {
      return false;
    }
    await user.update(data);
    return true;
  }
}
