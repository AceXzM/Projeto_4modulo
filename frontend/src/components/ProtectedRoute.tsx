/* 038
 * Controla o acesso as telas internas de acordo com a sessao
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* 038.01
 * espera a sessao carregar e mostra a tela interna ou redireciona para o login
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth();
  if (loading) {
    return <p>Carregando...</p>;
  }
  return user ? (
    <Outlet />
  ) : (
    <Navigate
      to="/login"
      replace
    />
  );
}
