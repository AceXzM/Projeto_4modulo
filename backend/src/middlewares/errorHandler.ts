/* 013
 * Transforma os erros em respostas que o frontend consegue mostrar
 */
import { NextFunction, Request, Response } from 'express';
import {
  UniqueConstraintError,
  ValidationError,
  ForeignKeyConstraintError,
} from 'sequelize';
import { AppError } from '../utils/AppError';

/* 013.01
 * define o status e a mensagem da resposta para erros de validacao, duplicidade, vinculo
 * ou falhas internas
 */
export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      message: error.message,
      code: error.code,
    });
  }
  if (error instanceof UniqueConstraintError) {
    return res.status(409).json({
      message: 'Já existe um registro com esses dados únicos.',
      code: 'DUPLICATE_RECORD',
    });
  }
  if (error instanceof ForeignKeyConstraintError) {
    return res.status(409).json({
      message: 'O vínculo não existe ou o registro está relacionado a outros dados.',
      code: 'RELATION_CONFLICT',
    });
  }
  if (error instanceof ValidationError) {
    return res.status(400).json({
      message: 'Verifique os campos obrigatórios e seus formatos.',
      code: 'VALIDATION_ERROR',
    });
  }
  const bodyError = error as {
    type?: string;
  };
  if (bodyError?.type === 'entity.parse.failed') {
    return res.status(400).json({
      message: 'JSON inválido.',
      code: 'INVALID_JSON',
    });
  }
  if (bodyError?.type === 'entity.too.large') {
    return res.status(413).json({
      message: 'Corpo da requisição muito grande.',
      code: 'BODY_TOO_LARGE',
    });
  }
  console.error(
    'Erro interno:',
    error instanceof Error ? error.message : 'erro desconhecido',
  );
  return res.status(500).json({
    message: 'Erro interno do servidor.',
  });
}
