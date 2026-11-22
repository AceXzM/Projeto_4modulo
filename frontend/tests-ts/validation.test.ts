import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validCpf, validEmail, passwordStrong } from '../src/utils/validation';

test('CPF: máscara aceita e dígito verificador incorreto rejeitado', () => {
  const cases: ReadonlyArray<readonly [string, boolean]> = [
    ['52998224725', true],
    ['529.982.247-25', true],
    ['52998224724', false],
    ['11111111111', false],
    ['', false],
  ];
  for (const [value, expected] of cases) {
    assert.equal(validCpf(value), expected);
  }
});
test('e-mail: formato completo exigido e espaços internos rejeitados', () => {
  for (const value of ['demo', 'demo@', 'a b@example.com', 'demo@example']) {
    assert.equal(validEmail(value), false);
  }
  assert.equal(validEmail('demo@example.com'), true);
});
test('senha: cada requisito é obrigatório, não apenas comprimento', () => {
  for (const value of ['12345678', 'abcdefgh', 'ABCDEFGH', 'Senha12', 'Senhasenha']) {
    assert.equal(passwordStrong(value), false);
  }
  assert.equal(passwordStrong('Senha123'), true);
});
