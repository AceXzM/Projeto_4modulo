/* 012
 * Confere o token antes de liberar as rotas protegidas
 */
import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError';

/* 012.01
 * confere o token Bearer e guarda o ID do usuario na requisicao, retornando 401 se o
 * token faltar ou nao for valido
 */
export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Token não informado.', 401, 'TOKEN_REQUIRED'));
  }
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET ausente');
    }
    const decoded = jwt.verify(header.slice(7), secret);
    if (
      typeof decoded === 'string' ||
      !decoded.sub ||
      !Number.isSafeInteger(Number(decoded.sub)) ||
      Number(decoded.sub) <= 0
    ) {
      throw new Error('Identificador de usuário inválido');
    }
    req.userId = Number(decoded.sub);
    return next();
  } catch {
    return next(new AppError('Token inválido ou expirado.', 401, 'INVALID_TOKEN'));
  }
}
