/* 042
 * Tela para editar nome, CPF e senha da propria conta
 */
import { FormEvent, useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { validCpf, passwordStrong } from '../utils/validation';

/* 042.01
 * mostra os dados da conta com o e-mail bloqueado e os campos para trocar a senha
 */
export function Profile() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [cpf, setCpf] = useState(user?.cpf ?? '');
  const [password, setPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  /* 042.02
   * Atualiza nome e CPF do formulario quando os dados do usuario mudam
   */
  useEffect(() => {
    setName(user?.name ?? '');
    setCpf(user?.cpf ?? '');
  }, [user]);

  /* 042.03
   * valida nome, CPF e senha, salva as alteracoes e atualiza o usuario da sessao
   */
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    if (!name.trim()) {
      setError('Nome obrigatório.');
      return;
    }
    if (!validCpf(cpf)) {
      setError('CPF inválido.');
      return;
    }
    if (password && (!passwordStrong(password) || !currentPassword)) {
      setError(
        'Informe a senha atual e uma nova senha com 8 caracteres, maiúscula, minúscula e número.',
      );
      return;
    }
    setSaving(true);
    try {
      await api.put('/auth/me', {
        name: name.trim(),
        cpf: cpf.replace(/\D/g, ''),
        ...(password
          ? {
              password,
              currentPassword,
            }
          : {}),
      });
      await refreshUser();
      setPassword('');
      setCurrentPassword('');
      setMessage('Perfil atualizado.');
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setSaving(false);
    }
  };
  return (
    <section>
      <p className="eyebrow">CONTA</p>
      <h1>Meu perfil</h1>
      <p className="page-description">
        O e-mail identifica sua conta e não pode ser alterado.
      </p>
      <form
        className="panel profile-form"
        onSubmit={submit}
      >
        <label className="field-wide">
          Nome
          <input
            required
            maxLength={120}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </label>
        <label>
          E-mail
          <input
            type="email"
            value={user?.email ?? ''}
            disabled
          />
        </label>
        <label>
          CPF
          <input
            required
            maxLength={14}
            value={cpf}
            onChange={(event) => setCpf(event.target.value)}
          />
        </label>
        <div className="form-heading">
          <h3>Alterar senha (opcional)</h3>
          <p>Deixe em branco para manter a senha atual.</p>
        </div>
        <label>
          Senha atual
          <input
            type="password"
            autoComplete="current-password"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
          />
        </label>
        <label>
          Nova senha
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <div className="actions">
          <button disabled={saving}>{saving ? 'Salvando...' : 'Salvar perfil'}</button>
        </div>
        {error && (
          <p
            className="error field-wide"
            role="alert"
          >
            {error}
          </p>
        )}
        {message && (
          <p
            className="field-wide"
            role="status"
          >
            {message}
          </p>
        )}
      </form>
    </section>
  );
}
