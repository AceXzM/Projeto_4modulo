const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const compile = spawnSync(
  process.execPath,
  [require.resolve('typescript/bin/tsc'), '-p', 'tsconfig.tests.json'],
  {
    cwd: root,
    stdio: 'inherit',
  },
);
if (compile.status !== 0) {
  process.exit(compile.status ?? 1);
}
fs.writeFileSync(
  path.join(root, 'test-build/package.json'),
  JSON.stringify({
    type: 'commonjs',
  }),
);
const tests = spawnSync(
  process.execPath,
  ['--test', 'test-build/tests-ts/validation.test.js'],
  {
    cwd: root,
    stdio: 'inherit',
  },
);
process.exit(tests.status ?? 1);
