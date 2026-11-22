/* 040
 * tela de entrada com e-mail e senha
 */
import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* 040.01
 * Mostra os campos de e-mail e senha, os erros e o link para criar uma conta
 */
export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const nav = useNavigate();

  /* 040.02
   * envia os dados de login e abre o painel quando a autenticacao da certo
   */
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      nav('/');
    } catch (e) {
      setError((e as Error).message);
    }
  };
  return (
    <div className="auth-page">
      <form
        className="auth-card"
        onSubmit={submit}
      >
        <p className="eyebrow">DROZ CONTROL</p>
        <h1>Acesse sua conta</h1>
        <label>
          E-mail
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit">Entrar</button>
        <p>
          Primeiro acesso? <Link to="/register">Criar conta</Link>
        </p>
      </form>
    </div>
  );
}
