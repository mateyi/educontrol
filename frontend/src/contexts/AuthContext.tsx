import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginAsDemo: (role: UserRole) => Promise<void>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
}

const DEMO_CREDENTIALS: Record<UserRole, { email: string; pass: string }> = {
  ADMINISTRADOR: { email: 'admin@educontrol.edu.ar', pass: 'admin123' },
  DIRECTIVO: { email: 'directora@educontrol.edu.ar', pass: 'admin123' },
  PRECEPTOR: { email: 'preceptor.manana@educontrol.edu.ar', pass: 'admin123' },
  PROFESOR: { email: 'prof.programacion@educontrol.edu.ar', pass: 'prof123' },
  ALUMNO: { email: 'juan.perez@alumno.educontrol.edu.ar', pass: 'alumno123' },
  TUTOR: { email: 'tutor.perez@educontrol.edu.ar', pass: 'tutor123' },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('educontrol_token');
    const savedUser = localStorage.getItem('educontrol_user');

    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('educontrol_token');
        localStorage.removeItem('educontrol_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res: any = await api.post('/auth/login', { email, password });
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem('educontrol_token', res.token);
    localStorage.setItem('educontrol_user', JSON.stringify(res.user));
  };

  const loginAsDemo = async (role: UserRole) => {
    const creds = DEMO_CREDENTIALS[role];
    if (creds) {
      await login(creds.email, creds.pass);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('educontrol_token');
    localStorage.removeItem('educontrol_user');
    window.location.href = '/login';
  };

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginAsDemo,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}

