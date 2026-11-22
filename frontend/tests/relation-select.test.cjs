const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');

function load(api) {
  const source = fs.readFileSync(
    path.join(__dirname, '../src/components/RelationSelect.tsx'),
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
    document: {
      getElementById: () => null,
    },
    require: (name) =>
      name === '../services/api'
        ? {
            api,
          }
        : require(name),
  });
  return mod.exports;
}
const options = [
  {
    id: 1,
    name: 'Operações',
  },
  {
    id: 2,
    name: 'Administração',
  },
  {
    id: 3,
    name: 'José Silva',
    email: 'jose@example.com',
  },
];
const api = {
  get: async () => ({
    data: {
      data: options,
      totalPages: 1,
    },
  }),
};
async function mount(props = {}) {
  const mod = load(api);
  const changes = [];
  let root;
  await act(async () => {
    root = create(
      React.createElement(mod.RelationSelect, {
        endpoint: 'departments',
        label: 'Departamento',
        value: '',
        onChange: (v) => changes.push(v),
        ...props,
      }),
    );
  });
  const input = () =>
    root.root.findByProps({
      role: 'combobox',
    });
  return {
    root,
    input,
    changes,
    close: () => act(() => root.unmount()),
  };
}

test('carrega todas as páginas de vínculos, inclusive além de 50 registros', async () => {
  const calls = [];
  const { loadRelationOptions } = load({
    get: async (url) => {
      calls.push(url);
      return {
        data: {
          data: [
            {
              id: calls.length,
              name: `Nome ${calls.length}`,
            },
          ],
          totalPages: 2,
        },
      };
    },
  });
  const result = await loadRelationOptions('employees');
  assert.equal(result.length, 2);
  assert.ok(calls[1].includes('page=2&limit=50'));
});

test('busca por nome ignora acentos e busca por e-mail', async () => {
  const f = await mount();
  act(() => f.input().props.onFocus());
  act(() =>
    f.input().props.onChange({
      target: {
        value: 'operacoes',
      },
    }),
  );
  assert.equal(
    f.root.root.findAllByProps({
      role: 'option',
    }).length,
    1,
  );
  assert.equal(
    f.root.root
      .findByProps({
        role: 'option',
      })
      .findByType('span').children[0],
    'Operações',
  );
  act(() =>
    f.input().props.onChange({
      target: {
        value: 'jose@example',
      },
    }),
  );
  assert.equal(
    f.root.root.findAllByProps({
      role: 'option',
    }).length,
    1,
  );
  f.close();
});

test('seleção por clique envia ID do registro e fecha dropdown', async () => {
  const f = await mount();
  act(() => f.input().props.onFocus());
  const option = f.root.root.findAllByProps({
    role: 'option',
  })[0];
  act(() => option.props.onClick());
  assert.equal(f.changes.at(-1), '2');
  assert.equal(f.input().props['aria-expanded'], false);
  f.close();
});

test('edição exibe nome do vínculo atual e permite remover', async () => {
  const f = await mount({
    value: '1',
  });
  assert.equal(f.input().props.value, 'Operações');
  act(() =>
    f.root.root
      .findByProps({
        'aria-label': 'Remover departamento',
      })
      .props.onClick(),
  );
  assert.equal(f.changes.at(-1), '');
  f.close();
});

test('teclado seleciona resultado sem enviar formulário', async () => {
  const f = await mount();
  let prevented = 0;
  act(() =>
    f.input().props.onKeyDown({
      key: 'ArrowDown',
      preventDefault() {
        prevented++;
      },
    }),
  );
  act(() =>
    f.input().props.onKeyDown({
      key: 'Enter',
      preventDefault() {
        prevented++;
      },
    }),
  );
  assert.equal(f.changes.at(-1), '2');
  assert.equal(prevented, 2);
  f.close();
});

test('busca sem resultado apresenta mensagem', async () => {
  const f = await mount();
  act(() =>
    f.input().props.onChange({
      target: {
        value: 'inexistente',
      },
    }),
  );
  assert.equal(
    f.root.root.findByProps({
      role: 'status',
    }).children[0],
    'Nenhum resultado para esta busca.',
  );
  f.close();
});
