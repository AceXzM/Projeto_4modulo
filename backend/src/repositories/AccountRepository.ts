/* 015
 * Define as operacoes de busca, cadastro e atualizacao de contas
 */
export type StoredAccount = {
  id: number;
  name: string;
  email: string;
  cpf: string;
  passwordHash: string;
};
export type NewAccount = Omit<StoredAccount, 'id'>;
export interface AccountRepository {
  findById(id: number): Promise<StoredAccount | null>;
  findByEmail(email: string): Promise<StoredAccount | null>;
  findByCpf(cpf: string): Promise<StoredAccount | null>;
  create(data: NewAccount): Promise<StoredAccount>;
  updateProfile(
    id: number,
    data: {
      name: string;
      cpf: string;
      passwordHash?: string;
    },
  ): Promise<boolean>;
}
