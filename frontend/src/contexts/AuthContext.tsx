/* 036
 * guarda a sessao e recupera o usuario ao atualizar a pagina
 */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '../services/api';
import { User } from '../types';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/* 036.01
 * Compartilha o usuario e as funcoes de sessao com as telas da aplicacao
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  /* 036.02
   * busca o perfil com o token salvo e encerra o carregamento mesmo quando a sessao nao e
   * valida
   */
  const refreshUser = async () => {
    try {
      const { data } = await api.get<User>('/auth/me');
      setUser(data);
    } catch {
      setUser(null);
      localStorage.removeItem('droz_token');
    } finally {
      /*
       * Encerra o carregamento mesmo se o token expirou ou a API nao respondeu
       */
      setLoading(false);
    }
  };

  /* 036.03
   * recupera o usuario ao abrir a aplicacao se houver um token salvo
   */
  useEffect(() => {
    if (localStorage.getItem('droz_token')) {
      void refreshUser();
    } else {
      setLoading(false);
    }
  }, []);

  /* 036.04
   * Envia e-mail e senha, salva o token no navegador e atualiza o usuario da sessao
   */
  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', {
      email,
      password,
    });
    localStorage.setItem('droz_token', data.token);
    setUser(data.user);
    setLoading(false);
  };

  /* 036.05
   * apaga o token salvo e limpa o usuario da sessao
   */
  const logout = () => {
    localStorage.removeItem('droz_token');
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* 036.06
 * Permite que os componentes acessem os dados e as funcoes da sessao
 */
export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return value;
};
