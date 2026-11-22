/* 006
 * cuida do cadastro, login e alteracoes do perfil
 */
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AccountRepository } from '../repositories/AccountRepository';
import { AppError } from '../utils/AppError';
import { AccountProfile } from '../domain/AccountProfile';
import { passwordStrong, validEmail } from '../domain/validation';
import { bodyObject } from '../domain/ResourceRecord';

export class AuthService {
  /* 006.01
   * Recebe o repositorio que sera usado para acessar as contas
   */
  constructor(private readonly users: AccountRepository) {}

  /* 006.02
   * valida os dados, confere se e-mail ou CPF ja existem e salva a conta com a senha em
   * hash
   */
  async register(input: unknown) {
    const data = bodyObject(input);
    if (
      ['name', 'email', 'password', 'cpf'].some(
        (key) => typeof data[key] !== 'string' || !(data[key] as string).trim(),
      )
    ) {
      throw new AppError('Preencha todos os campos obrigatórios.');
    }
    const { name, email, password, cpf } = data as Record<string, string>;
    const profile = new AccountProfile(0, name, email.trim(), cpf);
    if (!passwordStrong(password)) {
      throw new AppError(
        'A senha deve ter 8 caracteres, letra maiúscula, minúscula e número.',
      );
    }
    if (await this.users.findByEmail(profile.email)) {
      throw new AppError('E-mail já cadastrado.', 409);
    }
    if (await this.users.findByCpf(profile.cpf)) {
      throw new AppError('CPF já cadastrado.', 409);
    }
    const user = await this.users.create({
      name: profile.name,
      email: profile.email,
      cpf: profile.cpf,
      passwordHash: await bcrypt.hash(password, 12),
    });
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
    };
  }

  /* 006.03
   * Confere e-mail e senha e gera o token com o ID do usuario
   */
  async login(email: unknown, password: unknown) {
    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      throw new AppError('Informe e-mail e senha.');
    }
    if (!validEmail(email.trim())) {
      throw new AppError('E-mail inválido.');
    }
    const user = await this.users.findByEmail(email.trim().toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new AppError('E-mail ou senha incorretos.', 401);
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET não configurado');
    }
    const token = jwt.sign({}, secret, {
      subject: String(user.id),
      expiresIn: (process.env.JWT_EXPIRES_IN ?? '8h') as jwt.SignOptions['expiresIn'],
    });
    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        cpf: user.cpf,
      },
    };
  }

  /* 006.04
   * valida nome e CPF, impede mudar o e-mail e exige a senha atual para cadastrar uma nova
   * senha
   */
  async updateProfile(userId: number, input: unknown) {
    const data = bodyObject(input);
    if (
      Object.keys(data).some(
        (key) => !['name', 'cpf', 'email', 'password', 'currentPassword'].includes(key),
      )
    ) {
      throw new AppError('Campo de perfil não permitido.');
    }
    const user = await this.users.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }
    if ('email' in data && data.email !== user.email) {
      throw new AppError('O e-mail não pode ser alterado.', 400, 'EMAIL_IMMUTABLE');
    }
    if (typeof data.name !== 'string' || typeof data.cpf !== 'string') {
      throw new AppError('Nome e CPF são obrigatórios.');
    }
    const profile = new AccountProfile(user.id, data.name, user.email, data.cpf);
    const duplicate = await this.users.findByCpf(profile.cpf);
    if (duplicate && duplicate.id !== user.id) {
      throw new AppError('CPF já cadastrado.', 409);
    }
    let passwordHash: string | undefined;
    if ('password' in data) {
      if (typeof data.password !== 'string' || !passwordStrong(data.password)) {
        throw new AppError(
          'A nova senha deve ter 8 caracteres, maiúscula, minúscula e número.',
        );
      }
      if (
        typeof data.currentPassword !== 'string' ||
        !(await bcrypt.compare(data.currentPassword, user.passwordHash))
      ) {
        throw new AppError('Senha atual incorreta.', 400, 'CURRENT_PASSWORD_INVALID');
      }
      passwordHash = await bcrypt.hash(data.password, 12);
    }
    if (
      !(await this.users.updateProfile(user.id, {
        name: profile.name,
        cpf: profile.cpf,
        ...(passwordHash
          ? {
              passwordHash,
            }
          : {}),
      }))
    ) {
      throw new AppError('Usuário não encontrado.', 404);
    }
    return profile.toJSON();
  }

  /* 006.05
   * Busca a conta pelo ID e devolve os dados do perfil sem o hash da senha
   */
  async getProfile(userId: number) {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new AppError('Usuário não encontrado.', 404);
    }
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      cpf: user.cpf,
    };
  }
}
