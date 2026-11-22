import { test } from 'node:test';
import assert from 'node:assert/strict';
import { AccountProfile } from '../src/domain/AccountProfile';
import { ResourceRecord } from '../src/domain/ResourceRecord';
import { ResourceService } from '../src/services/ResourceService';
import { ResourceRepository, ResourceData } from '../src/repositories/ResourceRepository';
import { AppError } from '../src/utils/AppError';

class MemoryRepository implements ResourceRepository {
  private rows: ResourceData[] = [];
  private sequence = 0;
  async list(page: number, limit: number) {
    return {
      data: this.rows.slice((page - 1) * limit, page * limit),
      total: this.rows.length,
    };
  }
  async find(id: number) {
    return this.rows.find((row) => row.id === id) ?? null;
  }
  async create(data: Readonly<ResourceData>) {
    const row = {
      ...data,
      id: ++this.sequence,
    };
    this.rows.push(row);
    return row;
  }
  async update(id: number, data: Readonly<ResourceData>) {
    const row = await this.find(id);
    if (!row) {
      return null;
    }
    Object.assign(row, data);
    return row;
  }
  async remove(id: number) {
    const before = this.rows.length;
    this.rows = this.rows.filter((row) => row.id !== id);
    return before !== this.rows.length;
  }
}

test('perfil encapsula dados e mantém e-mail somente leitura', () => {
  const profile = new AccountProfile(
    1,
    '  Demonstração  ',
    'demo@example.com',
    '529.982.247-25',
  );
  assert.equal(profile.name, 'Demonstração');
  assert.equal(profile.cpf, '52998224725');
  assert.throws(() => profile.rename('  '), AppError);
  assert.throws(() => profile.changeCpf('11111111111'), AppError);
  assert.equal(
    Object.getOwnPropertyDescriptor(AccountProfile.prototype, 'email')?.set,
    undefined,
  );
  const publicCopy = profile.toJSON();
  publicCopy.name = 'Tentativa';
  assert.equal(profile.name, 'Demonstração');
});

test('registro rejeita atributos extras, vazios e relações inválidas', () => {
  for (const body of [
    {
      name: '  ',
    },
    {
      name: 'Demo',
      id: 9,
    },
    {
      name: 'Demo',
      passwordHash: 'injetado',
    },
    null,
    [],
  ]) {
    assert.throws(() => new ResourceRecord('departments', body), AppError);
  }
  assert.throws(
    () =>
      new ResourceRecord('employees', {
        name: 'Demo',
        email: 'x@example.com',
        role: 'Analista',
        departmentId: -1,
      }),
    AppError,
  );
  assert.throws(
    () =>
      new ResourceRecord('employees', {
        name: 'Demo',
        email: 'x@example.com',
        role: 'Analista',
        departmentId: true,
      }),
    AppError,
  );
});

test('datas e enums são validados; opcional vazio é normalizado para null', () => {
  assert.throws(
    () =>
      new ResourceRecord('tasks', {
        title: 'Teste',
        status: 'FEITO',
      }),
    AppError,
  );
  assert.throws(
    () =>
      new ResourceRecord('tasks', {
        title: 'Teste',
        dueDate: '2026-02-30',
      }),
    AppError,
  );
  const task = new ResourceRecord('tasks', {
    title: 'Teste',
    employeeId: '',
    dueDate: '',
  }).toJSON();
  assert.equal(task.status, 'PENDENTE');
  assert.equal(task.employeeId, null);
  assert.equal(task.dueDate, null);
  assert.throws(() => {
    (task as ResourceData).status = 'ERRADO';
  }, TypeError);
});

for (const [resource, body] of Object.entries({
  departments: {
    name: 'Operações',
  },
  employees: {
    name: 'Demo',
    email: 'demo@example.com',
    role: 'Analista',
  },
  tasks: {
    title: 'Tarefa',
  },
  assets: {
    name: 'Notebook',
    code: 'T001',
    category: 'Informática',
  },
})) {
  test(`CRUD completo, paginação e 404: ${resource}`, async () => {
    const service = new ResourceService(resource, new MemoryRepository());
    const row = await service.create(body);
    assert.equal((await service.get(row.id)).id, row.id);
    assert.equal((await service.list(1, 8)).total, 1);
    await service.update(row.id, body);
    await service.remove(row.id);
    for (const operation of [
      () => service.get(row.id),
      () => service.update(row.id, body),
      () => service.remove(row.id),
    ]) {
      await assert.rejects(
        operation,
        (error) => error instanceof AppError && error.statusCode === 404,
      );
    }
    for (const [page, limit] of [
      [0, 8],
      [1.2, 8],
      [1, 51],
      [1, 0],
    ]) {
      await assert.rejects(service.list(page, limit), AppError);
    }
  });
}

test('paginação devolve página parcial e total correto', async () => {
  const service = new ResourceService('departments', new MemoryRepository());
  for (let i = 0; i < 9; i++) {
    await service.create({
      name: `Departamento ${i}`,
    });
  }
  const page = await service.list(2, 8);
  assert.equal(page.data.length, 1);
  assert.equal(page.total, 9);
  assert.equal(page.totalPages, 2);
});
