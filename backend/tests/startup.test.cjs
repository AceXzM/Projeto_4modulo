const { test, after } = require('node:test');
const assert = require('node:assert/strict');
process.env.DB_HOST = '127.0.0.1';
process.env.DB_USER = 'test';
process.env.DB_NAME = 'test';
process.env.JWT_SECRET = 'test-only-key';
const { AuthService: AuthServiceClass } = require('../dist/services/authService');
const {
  SequelizeAccountRepository,
} = require('../dist/repositories/SequelizeAccountRepository');
const AuthService = new AuthServiceClass(new SequelizeAccountRepository());
const { AppError } = require('../dist/utils/AppError');
const app = require('../dist/app').default;
const { sequelize } = require('../dist/config/database');

for (const input of [
  undefined,
  null,
  {},
  {
    name: 42,
  },
  {
    name: 'Demo',
    email: 'demo@example.com',
    password: 'Valid123',
    cpf: null,
  },
]) {
  test(`cadastro incompleto/malformado retorna AppError 400: ${JSON.stringify(input)}`, async () => {
    await assert.rejects(
      AuthService.register(input),
      (error) => error instanceof AppError && error.statusCode === 400,
    );
  });
}

test('cadastro com formato de e-mail inválido é rejeitado antes do banco', async () => {
  await assert.rejects(
    AuthService.register({
      name: 'Demo',
      email: 'invalid',
      password: 'Valid123',
      cpf: '12345678900',
    }),
    /E-mail inválido/,
  );
});

test('login com tipo inválido retorna 400 em vez de TypeError', async () => {
  await assert.rejects(
    AuthService.login(42, {}),
    (error) => error instanceof AppError && error.statusCode === 400,
  );
});

test('HTTP: health, proteção JWT e corpos inválidos recebem resposta', async () => {
  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    assert.equal((await fetch(base + '/api/health')).status, 200);
    assert.equal((await fetch(base + '/api/departments')).status, 401);
    for (const endpoint of ['register', 'login']) {
      const res = await fetch(base + '/api/auth/' + endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: '{}',
      });
      assert.equal(res.status, 400);
      assert.equal(typeof (await res.json()).message, 'string');
    }
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
after(async () => {
  await sequelize.close();
});
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

async function startup({ failures = 0, port = '3000' } = {}) {
  const calls = {
    connect: 0,
    sync: [],
    listen: [],
    exits: [],
    delays: [],
  };
  const db = {
    async authenticate() {
      calls.connect++;
      if (calls.connect <= failures) {
        throw new Error('Banco inicializando');
      }
    },
    async sync(...args) {
      calls.sync.push(args);
    },
  };
  const app = {
    listen(...args) {
      calls.listen.push(args.slice(0, 2));
      return {
        on() {},
      };
    },
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../dist/server.js'), 'utf8'), {
    exports: {},
    process: {
      env: {
        PORT: port,
        DB_SYNC: 'true',
        JWT_SECRET: 'test-only',
      },
      exit: (code) => calls.exits.push(code),
    },
    console: {
      log() {},
      warn() {},
      error() {},
    },
    setTimeout: (callback) => {
      calls.delays.push(2000);
      callback();
    },
    require(name) {
      if (name === 'dotenv') {
        return {
          config() {},
        };
      }
      if (name === './app') {
        return {
          __esModule: true,
          default: app,
        };
      }
      if (name === './config/database') {
        return {
          sequelize: db,
        };
      }
      return {};
    },
  });
  await new Promise((resolve) => setImmediate(resolve));
  return calls;
}

test('partida aguarda banco e cria tabelas sem alter/force', async () => {
  const calls = await startup({
    failures: 2,
  });
  assert.equal(calls.connect, 3);
  assert.equal(calls.delays.length, 2);
  assert.deepEqual(calls.sync, [[]]);
  assert.deepEqual(calls.listen, [[3000, '0.0.0.0']]);
  assert.deepEqual(calls.exits, []);
});

test('porta inválida interrompe antes de conectar ao banco', async () => {
  const calls = await startup({
    port: 'invalid',
  });
  assert.equal(calls.connect, 0);
  assert.deepEqual(calls.exits, [1]);
});

test('falha persistente do banco encerra sem aceitar HTTP', async () => {
  const calls = await startup({
    failures: 12,
  });
  assert.equal(calls.connect, 12);
  assert.equal(calls.listen.length, 0);
  assert.deepEqual(calls.exits, [1]);
});
