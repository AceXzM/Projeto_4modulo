const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const React = require('react');
const { act, create } = require('react-test-renderer');
const router = require('react-router-dom');
const sourceRoot = path.join(__dirname, '../src');
async function mount(route) {
  const cache = new Map();
  const record = {
    id: 7,
    name: 'Operações',
    title: 'Tarefa',
    email: 'demo@example.com',
    role: 'Analista',
    code: 'D001',
    category: 'Teste',
    status: route.startsWith('/assets') ? 'DISPONIVEL' : 'PENDENTE',
    departmentId: 7,
    employeeId: 7,
    department: {
      name: 'Operações',
    },
    assignee: {
      name: 'Demo',
    },
  };
  const calls = [];
  const api = {
    get: async (url) => {
      calls.push(url);
      return {
        data: url.includes('?')
          ? {
              data: [record],
              total: 1,
              page: 1,
              limit: 8,
              totalPages: 1,
            }
          : record,
      };
    },
  };
  function load(file) {
    if (file === path.join(sourceRoot, 'services/api.ts')) {
      return {
        api,
      };
    }
    if (file === path.join(sourceRoot, 'contexts/AuthContext.tsx')) {
      return {
        AuthProvider: ({ children }) => children,
        useAuth: () => ({
          user: {
            id: 1,
            name: 'Demo',
          },
          loading: false,
          logout() {},
        }),
      };
    }
    if (cache.has(file)) {
      return cache.get(file);
    }
    const mod = {
      exports: {},
    };
    cache.set(file, mod.exports);
    const js = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        jsx: ts.JsxEmit.ReactJSX,
        target: ts.ScriptTarget.ES2020,
      },
    }).outputText;
    vm.runInNewContext(js, {
      module: mod,
      exports: mod.exports,
      document: {
        getElementById: () => null,
      },
      confirm: () => false,
      require(name) {
        if (name === 'react-router-dom') {
          return {
            ...router,
            BrowserRouter: ({ children }) =>
              React.createElement(
                router.MemoryRouter,
                {
                  initialEntries: [route],
                  future: {
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                  },
                },
                children,
              ),
          };
        }
        if (!name.startsWith('.')) {
          return require(name);
        }
        const base = path.resolve(path.dirname(file), name);
        const target = ['.tsx', '.ts']
          .map((ext) => base + ext)
          .find((f) => fs.existsSync(f));
        if (!target) {
          throw new Error('Módulo não encontrado: ' + name);
        }
        return load(target);
      },
    });
    cache.set(file, mod.exports);
    return mod.exports;
  }
  const { default: App } = load(path.join(sourceRoot, 'App.tsx'));
  let root;
  await act(async () => {
    root = create(React.createElement(App));
  });
  return {
    root,
    calls,
  };
}
for (const resource of ['departments', 'employees', 'tasks', 'assets']) {
  for (const [suffix, expectedForms] of [
    ['', 0],
    ['/new', 1],
    ['/7/edit', 1],
  ]) {
    test(`tela separada /${resource}${suffix}`, async () => {
      const f = await mount(`/${resource}${suffix}`);
      assert.equal(f.root.root.findAllByType('form').length, expectedForms);
      if (!suffix) {
        assert.equal(f.root.root.findAllByType('table').length, 1);
        assert.ok(
          f.root.root.findAllByType('a').some((a) => a.props.href === `/${resource}/new`),
        );
      } else {
        assert.equal(f.root.root.findAllByType('table').length, 0);
        assert.ok(
          f.root.root.findAllByType('a').some((a) => a.props.href === `/${resource}`),
        );
      }
      if (suffix.includes('edit')) {
        assert.ok(f.calls.includes(`/${resource}/7`));
      }
      act(() => f.root.unmount());
    });
  }
}
