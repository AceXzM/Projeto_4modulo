const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');

function fixture(token, api) {
  const items = new Map(token ? [['droz_token', token]] : []);
  const storage = {
    getItem: (k) => items.get(k) ?? null,
    setItem: (k, v) => items.set(k, v),
    removeItem: (k) => items.delete(k),
  };
  const source = fs.readFileSync(
    path.join(__dirname, '../src/contexts/AuthContext.tsx'),
    'utf8',
  );
  const js = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      jsx: ts.JsxEmit.ReactJSX,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const mod = {
    exports: {},
  };
  vm.runInNewContext(js, {
    module: mod,
    exports: mod.exports,
    localStorage: storage,
    require: (name) =>
      name === '../services/api'
        ? {
            api,
          }
        : require(name),
  });
  let current;
  function Consumer() {
    current = mod.exports.useAuth();
    return null;
  }
  let root;
  act(() => {
    root = create(
      React.createElement(mod.exports.AuthProvider, null, React.createElement(Consumer)),
    );
  });
  return {
    get state() {
      return current;
    },
    storage,
    dispose() {
      act(() => root.unmount());
    },
  };
}

test('sem token libera a tela de login sem consultar a API', () => {
  const f = fixture(null, {
    get() {
      throw new Error('Não deveria consultar');
    },
  });
  assert.equal(f.state.loading, false);
  assert.equal(f.state.user, null);
  f.dispose();
});

test('token válido restaura usuário e encerra loading após F5', async () => {
  let resolve;
  const f = fixture('valid', {
    get: () =>
      new Promise((r) => {
        resolve = r;
      }),
  });
  assert.equal(f.state.loading, true);
  await act(async () =>
    resolve({
      data: {
        id: 1,
        name: 'Demo',
      },
    }),
  );
  assert.equal(f.state.loading, false);
  assert.equal(f.state.user.id, 1);
  f.dispose();
});

for (const message of ['Token expirado', 'timeout de conexão']) {
  test(`${message}: limpa token e encerra loading`, async () => {
    let reject;
    const f = fixture('old', {
      get: () =>
        new Promise((_, r) => {
          reject = r;
        }),
    });
    await act(async () => reject(new Error(message)));
    assert.equal(f.state.loading, false);
    assert.equal(f.state.user, null);
    assert.equal(f.storage.getItem('droz_token'), null);
    f.dispose();
  });
}

test('login persiste sessão e logout limpa estado', async () => {
  const f = fixture(null, {
    post: async () => ({
      data: {
        token: 'new',
        user: {
          id: 2,
          name: 'Demo',
        },
      },
    }),
  });
  await act(async () => f.state.login('demo@example.com', 'password'));
  assert.equal(f.state.user.id, 2);
  assert.equal(f.storage.getItem('droz_token'), 'new');
  act(() => f.state.logout());
  assert.equal(f.state.user, null);
  assert.equal(f.state.loading, false);
  assert.equal(f.storage.getItem('droz_token'), null);
  f.dispose();
});
