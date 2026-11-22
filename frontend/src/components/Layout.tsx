/* 039
 * monta o menu lateral, o cabecalho e o espaco da tela atual
 */
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/* 039.01
 * Mostra o menu, o nome do usuario e a tela da rota atual
 */
export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  /* 039.02
   * encerra a sessao e volta para a tela de login
   */
  const exit = () => {
    logout();
    navigate('/login');
  };
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>
          DROZ <span>CONTROL</span>
        </h2>
        <nav>
          <NavLink
            to="/"
            end
          >
            Visão geral
          </NavLink>
          <NavLink to="/departments">Departamentos</NavLink>
          <NavLink to="/employees">Colaboradores</NavLink>
          <NavLink to="/tasks">Tarefas</NavLink>
          <NavLink to="/assets">Ativos</NavLink>
          <NavLink to="/profile">Meu perfil</NavLink>
        </nav>
        <button onClick={exit}>Sair</button>
      </aside>
      <main className="main">
        <header>
          <span>Gestão interna</span>
          <strong>{user?.name}</strong>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
