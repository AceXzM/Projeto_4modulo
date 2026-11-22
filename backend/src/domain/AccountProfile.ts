/* 008
 * guarda os dados da conta e valida as mudancas de nome e CPF
 */
import { AppError } from '../utils/AppError';
import { validCpf, validEmail } from './validation';

/*
 * O e-mail fica fixo depois que a conta e criada
 */
export class AccountProfile {
  private _name: string;
  private _cpf: string;
  private readonly _email: string;

  /* 008.01
   * recebe os dados da conta, valida o e-mail e inicializa nome e CPF pelos metodos da
   * classe
   */
  constructor(
    readonly id: number,
    name: string,
    email: string,
    cpf: string,
  ) {
    if (!validEmail(email)) {
      throw new AppError('E-mail inválido.');
    }
    this._email = email.toLowerCase();
    this._name = '';
    this._cpf = '';
    this.rename(name);
    this.changeCpf(cpf);
  }

  /* 008.02
   * Devolve o nome sem permitir alteracao direta do campo privado
   */
  get name() {
    return this._name;
  }

  /* 008.03
   * devolve o CPF sem permitir alteracao direta do campo privado
   */
  get cpf() {
    return this._cpf;
  }

  /* 008.04
   * Devolve o e-mail, que nao pode ser alterado depois de criar a conta
   */
  get email() {
    return this._email;
  }

  /* 008.05
   * confere se o nome foi preenchido e tem ate 120 caracteres antes de salvar sem espacos
   * nas pontas
   */
  rename(value: string) {
    if (typeof value !== 'string' || !value.trim() || value.trim().length > 120) {
      throw new AppError('Nome obrigatório, com até 120 caracteres.');
    }
    this._name = value.trim();
  }

  /* 008.06
   * Valida o CPF e guarda apenas os numeros
   */
  changeCpf(value: string) {
    if (typeof value !== 'string' || !validCpf(value)) {
      throw new AppError('CPF inválido.');
    }
    this._cpf = value.replace(/\D/g, '');
  }

  /* 008.07
   * devolve um objeto com ID, nome, e-mail e CPF
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      cpf: this.cpf,
    };
  }
}
