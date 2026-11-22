/* 004
 * Recebe as requisicoes de conta e chama o servico de autenticacao
 */
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { SequelizeAccountRepository } from '../repositories/SequelizeAccountRepository';

/*
 * o controller escolhe o repositorio que o servico vai usar
 */
const service = new AuthService(new SequelizeAccountRepository());

/* 004.01
 * Envia os dados do cadastro ao servico e responde com a conta criada
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.status(201).json(await service.register(req.body));
  } catch (error) {
    next(error);
  }
};

/* 004.02
 * envia e-mail e senha ao servico e devolve o token e os dados do usuario
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body ?? {};
    res.json(await service.login(email, password));
  } catch (error) {
    next(error);
  }
};

/* 004.03
 * Consulta o perfil usando o ID do usuario autenticado
 */
export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await service.getProfile(req.userId!));
  } catch (error) {
    next(error);
  }
};

/* 004.04
 * envia as alteracoes do perfil junto com o ID que veio do token
 */
export const updateMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.json(await service.updateProfile(req.userId!, req.body));
  } catch (error) {
    next(error);
  }
};
