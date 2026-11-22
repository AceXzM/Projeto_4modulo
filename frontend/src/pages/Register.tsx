/* 041
 * Tela de criacao de conta com nome, e-mail, CPF e senha
 */
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { validCpf, validEmail, passwordStrong } from '../utils/validation';

/* 041.01
 * mostra os campos de criacao da conta e acompanha o envio do formulario
 */
export function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    cpf: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  /* 041.02
   * Valida os dados, remove a mascara do CPF e envia o cadastro antes de voltar para o
   * login
   */
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Nome obrigatório.');
      return;
    }
    if (!validEmail(form.email.trim())) {
      setError('E-mail inválido.');
      return;
    }
    if (!validCpf(form.cpf)) {
      setError('CPF inválido.');
      return;
    }
    if (!passwordStrong(form.password)) {
      setError('A senha precisa ter 8 caracteres, maiúscula, minúscula e número.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/auth/register', {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        cpf: form.cpf.replace(/\D/g, ''),
      });
      navigate('/login');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="auth-page">
      <form
        className="auth-card"
        onSubmit={submit}
      >
        <p className="eyebrow">DROZ CONTROL</p>
        <h1>Criar usuário</h1>
        {(
          [
            ['name', 'Nome completo', 'text'],
            ['email', 'E-mail', 'email'],
            ['cpf', 'CPF', 'text'],
            ['password', 'Senha', 'password'],
          ] as const
        ).map(([key, label, type]) => (
          <label key={key}>
            {label}
            <input
              type={type}
              required
              maxLength={
                key === 'name'
                  ? 120
                  : key === 'email'
                    ? 160
                    : key === 'cpf'
                      ? 14
                      : undefined
              }
              autoComplete={key === 'password' ? 'new-password' : undefined}
              value={form[key]}
              onChange={(event) =>
                setForm({
                  ...form,
                  [key]: event.target.value,
                })
              }
            />
          </label>
        ))}
        <small>Senha: mínimo 8 caracteres, com maiúscula, minúscula e número.</small>
        {error && (
          <p
            className="error"
            role="alert"
          >
            {error}
          </p>
        )}
        <button disabled={saving}>{saving ? 'Cadastrando...' : 'Cadastrar'}</button>
        <p>
          Já possui conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
