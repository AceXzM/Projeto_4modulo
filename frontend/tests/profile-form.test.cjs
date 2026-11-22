const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');
function moduleFrom(file, mocks = {}) {
  const source = fs.readFileSync(path.join(__dirname, '../src', file), 'utf8');
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
    require: (name) => mocks[name] ?? require(name),
  });
  return mod.exports;
}
const validation = moduleFrom('utils/validation.ts');
async function fixture() {
  const calls = [];
  const auth = {
    user: {
      name: 'Demo',
      email: 'demo@example.com',
      cpf: '52998224725',
    },
    refreshUser: async () => {},
  };
  const { Profile } = moduleFrom('pages/Profile.tsx', {
    '../services/api': {
      api: {
        put: async (...args) => calls.push(args),
      },
    },
    '../contexts/AuthContext': {
      useAuth: () => auth,
    },
    '../utils/validation': validation,
  });
  let root;
  await act(async () => {
    root = create(React.createElement(Profile));
  });
  return {
    root,
    calls,
  };
}
test('perfil mantém e-mail desabilitado e não envia e-mail no PUT', async () => {
  const f = await fixture();
  assert.equal(f.root.root.findAllByType('input')[1].props.disabled, true);
  await act(async () =>
    f.root.root.findByType('form').props.onSubmit({
      preventDefault() {},
    }),
  );
  assert.equal(f.calls.length, 1);
  assert.equal('email' in f.calls[0][1], false);
  assert.equal(f.calls[0][1].cpf, '52998224725');
  act(() => f.root.unmount());
});
test('CPF inválido impede envio antes da API', async () => {
  const f = await fixture();
  act(() =>
    f.root.root.findAllByType('input')[2].props.onChange({
      target: {
        value: '11111111111',
      },
    }),
  );
  await act(async () =>
    f.root.root.findByType('form').props.onSubmit({
      preventDefault() {},
    }),
  );
  assert.equal(f.calls.length, 0);
  assert.equal(
    f.root.root.findByProps({
      role: 'alert',
    }).children[0],
    'CPF inválido.',
  );
  act(() => f.root.unmount());
});
test('validações do cliente rejeitam CPF repetido, e-mail e senha fraca', () => {
  assert.equal(validation.validCpf('529.982.247-25'), true);
  assert.equal(validation.validCpf('11111111111'), false);
  assert.equal(validation.validEmail('invalido'), false);
  assert.equal(validation.passwordStrong('12345678'), false);
  assert.equal(validation.passwordStrong('Senha123'), true);
});
