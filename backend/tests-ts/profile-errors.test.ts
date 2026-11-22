import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  UniqueConstraintError,
  ValidationError,
  ForeignKeyConstraintError,
} from 'sequelize';
import { Request, Response } from 'express';
import { errorHandler } from '../src/middlewares/errorHandler';
import { AppError } from '../src/utils/AppError';
import { AuthService } from '../src/services/authService';
import {
  AccountRepository,
  StoredAccount,
  NewAccount,
} from '../src/repositories/AccountRepository';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authenticate } from '../src/middlewares/auth';

class MemoryAccounts implements AccountRepository {
  rows: StoredAccount[] = [];
  async findById(id: number) {
    return this.rows.find((row) => row.id === id) ?? null;
  }
  async findByEmail(email: string) {
    return this.rows.find((row) => row.email === email) ?? null;
  }
  async findByCpf(cpf: string) {
    return this.rows.find((row) => row.cpf === cpf) ?? null;
  }
  async create(data: NewAccount) {
    const row = {
      ...data,
      id: this.rows.length + 1,
    };
    this.rows.push(row);
    return row;
  }
  async updateProfile(
    id: number,
    data: {
      name: string;
      cpf: string;
      passwordHash?: string;
    },
  ) {
    const row = await this.findById(id);
    if (!row) {
      return false;
    }
    Object.assign(row, data);
    return true;
  }
}

test('erros ORM e JSON recebem status legíveis e não 500', () => {
  for (const [error, expected] of [
    [new UniqueConstraintError({}), 409],
    [new ValidationError('validation', []), 400],
    [new ForeignKeyConstraintError({}), 409],
    [
      {
        type: 'entity.parse.failed',
      },
      400,
    ],
  ] as const) {
    let status = 0;
    let body: {
      message?: string;
    } = {};
    const response = {
      status(value: number) {
        status = value;
        return this;
      },
      json(value: { message: string }) {
        body = value;
        return this;
      },
    } as unknown as Response;
    errorHandler(error, {} as Request, response, () => {});
    assert.equal(status, expected);
    assert.equal(typeof body.message, 'string');
  }
});

test('cadastro, duplicidade, login, CPF, e-mail imutável e senha atual', async () => {
  process.env.JWT_SECRET = 'test-only';
  const repository = new MemoryAccounts();
  const service = new AuthService(repository);
  const publicAccount = await service.register({
    name: 'Demo',
    email: 'demo@example.com',
    cpf: '52998224725',
    password: 'Senha123',
  });
  assert.equal('passwordHash' in publicAccount, false);
  await assert.rejects(
    service.register({
      name: 'Demo',
      email: 'demo@example.com',
      cpf: '11144477735',
      password: 'Senha123',
    }),
    (error) => error instanceof AppError && error.statusCode === 409,
  );
  await assert.rejects(
    service.register({
      name: 'Demo',
      email: 'other@example.com',
      cpf: '52998224725',
      password: 'Senha123',
    }),
    (error) => error instanceof AppError && error.statusCode === 409,
  );
  await assert.rejects(
    service.login('demo@example.com', 'wrong'),
    (error) => error instanceof AppError && error.statusCode === 401,
  );
  const session = await service.login('demo@example.com', 'Senha123');
  assert.ok(session.token);
  await assert.rejects(
    service.updateProfile(1, {
      name: 'Demo',
      cpf: '52998224725',
      email: 'other@example.com',
    }),
    (error) => error instanceof AppError && error.code === 'EMAIL_IMMUTABLE',
  );
  assert.equal(repository.rows[0].email, 'demo@example.com');
  await assert.rejects(
    service.updateProfile(1, {
      name: 'Demo',
      cpf: '11111111111',
    }),
    /CPF inválido/,
  );
  await assert.rejects(
    service.updateProfile(1, {
      name: 'Demo',
      cpf: '52998224725',
      password: 'weak',
      currentPassword: 'Senha123',
    }),
    /nova senha/,
  );
  await assert.rejects(
    service.updateProfile(1, {
      name: 'Demo',
      cpf: '52998224725',
      password: 'NovaSenha123',
      currentPassword: 'wrong',
    }),
    /Senha atual incorreta/,
  );
  await service.register({
    name: 'Outra Conta',
    email: 'other@example.com',
    cpf: '11144477735',
    password: 'Senha123',
  });
  await assert.rejects(
    service.updateProfile(1, {
      name: 'Demo',
      cpf: '11144477735',
    }),
    (error) => error instanceof AppError && error.statusCode === 409,
  );
  const result = await service.updateProfile(1, {
    name: 'Novo Nome',
    cpf: '52998224725',
    password: 'NovaSenha123',
    currentPassword: 'Senha123',
  });
  assert.equal(result.name, 'Novo Nome');
  assert.equal(result.email, 'demo@example.com');
  assert.equal('passwordHash' in result, false);
  assert.ok(await bcrypt.compare('NovaSenha123', repository.rows[0].passwordHash));
  assert.equal(repository.rows[1].name, 'Outra Conta');
  await assert.rejects(
    service.getProfile(999),
    (error) => error instanceof AppError && error.statusCode === 404,
  );
});

test('JWT real: token válido, expirado, assinatura incorreta e subject inválido', () => {
  process.env.JWT_SECRET = 'test-only';
  for (const [token, accepted] of [
    [
      jwt.sign({}, 'test-only', {
        subject: '7',
      }),
      true,
    ],
    [
      jwt.sign({}, 'test-only', {
        subject: '7',
        expiresIn: -1,
      }),
      false,
    ],
    [
      jwt.sign({}, 'other-secret', {
        subject: '7',
      }),
      false,
    ],
    [
      jwt.sign({}, 'test-only', {
        subject: 'invalid',
      }),
      false,
    ],
  ] as const) {
    const req = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as Request;
    let error: unknown;
    authenticate(req, {} as Response, (value) => {
      error = value;
    });
    if (accepted) {
      assert.equal(error, undefined);
      assert.equal(req.userId, 7);
    } else {
      assert.ok(error instanceof AppError && error.statusCode === 401);
    }
  }
});
