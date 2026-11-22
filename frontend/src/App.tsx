/* 030
 * Organiza as rotas publicas e as telas que precisam de login
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { CrudPage } from './components/CrudPage';
import { ResourceFormPage } from './pages/ResourceFormPage';
import { resources } from './config/resources';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';

/* 030.01
 * monta o contexto de sessao e as rotas de login, cadastro, painel, perfil e dos quatro
 * cadastros
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={<Login />}
          />
          <Route
            path="/register"
            element={<Register />}
          />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route
                index
                element={<Dashboard />}
              />
              {resources.map((config) => (
                <Route
                  key={config.endpoint}
                  path={config.endpoint}
                >
                  <Route
                    index
                    element={
                      <CrudPage
                        key={config.endpoint}
                        {...config}
                      />
                    }
                  />
                  <Route
                    path="new"
                    element={
                      <ResourceFormPage
                        key={`${config.endpoint}-new`}
                        config={config}
                      />
                    }
                  />
                  <Route
                    path=":id/edit"
                    element={
                      <ResourceFormPage
                        key={`${config.endpoint}-edit`}
                        config={config}
                        editing
                      />
                    }
                  />
                </Route>
              ))}
              <Route
                path="/profile"
                element={<Profile />}
              />
            </Route>
          </Route>
          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
