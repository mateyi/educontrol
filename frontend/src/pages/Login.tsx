import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { School, ArrowRight, ShieldCheck, Sparkles, Check } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';

export const Login: React.FC = () => {
  const { login, loginAsDemo } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts: { role: UserRole; title: string; subtitle: string; email: string; pass: string }[] = [
    { role: 'ADMINISTRADOR', title: 'Administrador', subtitle: 'Facundo Santillán (Acceso total)', email: 'admin@educontrol.edu.ar', pass: 'admin123' },
    { role: 'DIRECTIVO', title: 'Directora', subtitle: 'Lic. Silvina Rossi (Estadísticas y gestión)', email: 'directora@educontrol.edu.ar', pass: 'admin123' },
    { role: 'PRECEPTOR', title: 'Preceptor', subtitle: 'Gustavo Peralta (Asistencias y legajos)', email: 'preceptor.manana@educontrol.edu.ar', pass: 'admin123' },
    { role: 'PROFESOR', title: 'Profesora', subtitle: 'Mariana Solís (Notas y tareas)', email: 'prof.programacion@educontrol.edu.ar', pass: 'prof123' },
    { role: 'ALUMNO', title: 'Alumno', subtitle: 'Juan Ignacio Pérez (Boletín y entregas)', email: 'juan.perez@alumno.educontrol.edu.ar', pass: 'alumno123' },
    { role: 'TUTOR', title: 'Tutor / Padre', subtitle: 'Roberto Pérez (Seguimiento hijos)', email: 'tutor.perez@educontrol.edu.ar', pass: 'tutor123' },
  ];

  const handleQuickDemo = async (role: UserRole) => {
    setIsLoading(true);
    setError('');
    try {
      await loginAsDemo(role);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error en inicio de sesión rápido');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-500/30 mb-4">
          <School className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight text-white">
          EduControl
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          Sistema Integral de Gestión Escolar • República Argentina
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl z-10 px-4 sm:px-0">
        <div className="bg-slate-800/90 border border-slate-700/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <span className="font-semibold">Error:</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Correo Institucional
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@educontrol.edu.ar"
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:border-blue-500 focus:outline-hidden transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:border-blue-500 focus:outline-hidden transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{isLoading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Logins Section */}
          <div className="mt-8 pt-6 border-t border-slate-700/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Acceso Rápido para Demostración (6 Roles)</span>
              </span>
              <span className="text-[10px] text-blue-400 font-medium">1-Click</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleQuickDemo(acc.role)}
                  className="text-left p-3 rounded-xl bg-slate-900/70 hover:bg-slate-700/80 border border-slate-700/60 hover:border-blue-500/50 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                      {acc.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 group-hover:bg-blue-500/20 group-hover:text-blue-300">
                      Entrar
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {acc.subtitle}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6 flex items-center justify-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Presentación de Trabajo Final • Laboratorio de Software</span>
        </p>
      </div>
    </div>
  );
};
