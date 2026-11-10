import React, { useState, useEffect } from 'react';
import {
  Bell,
  Sun,
  Moon,
  LogOut,
  Search,
  Sparkles,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { UserRole } from '../../types';
import api from '../../services/api';

interface NavbarProps {
  sidebarCollapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ sidebarCollapsed }) => {
  const { user, logout, loginAsDemo } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  useEffect(() => {
    if (user) {
      api
        .get<any>('/announcements/notifications')
        .then((res) => {
          setNotifications(res.data || []);
          setUnreadCount(res.unreadCount || 0);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.patch(`/announcements/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {}
  };

  const rolesList: { role: UserRole; label: string; icon: string }[] = [
    { role: 'ADMINISTRADOR', label: 'Administrador (Facundo)', icon: '⚡' },
    { role: 'DIRECTIVO', label: 'Directivo (Silvina)', icon: '🏛️' },
    { role: 'PRECEPTOR', label: 'Preceptor (Gustavo)', icon: '📋' },
    { role: 'PROFESOR', label: 'Profesor (Mariana)', icon: '👩‍🏫' },
    { role: 'ALUMNO', label: 'Alumno (Juan)', icon: '🎓' },
    { role: 'TUTOR', label: 'Tutor (Roberto)', icon: '👨‍👧' },
  ];

  const currentDateFormatted = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header
      className={`sticky top-0 z-30 h-16 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all duration-300 flex items-center justify-between px-6 ${
        sidebarCollapsed ? 'ml-20' : 'ml-64'
      }`}
    >
      {/* Search and Date */}
      <div className="flex items-center space-x-4 max-w-md w-full">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar alumnos, profesores, cursos... (Ctrl+K)"
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-slate-800/80 border border-transparent focus:border-blue-500 rounded-xl focus:outline-hidden transition-all text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>
        <div className="hidden xl:flex items-center space-x-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 shrink-0">
          <Calendar className="w-3.5 h-3.5" />
          <span className="capitalize">{currentDateFormatted}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Quick Demo Switcher Pill */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSelector(!showRoleSelector)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold transition-all shadow-xs"
            title="Cambiar rol de demostración rápidamente"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Rol: {user?.role}</span>
          </button>

          {showRoleSelector && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Simular Usuario / Rol
              </div>
              {rolesList.map((item) => (
                <button
                  key={item.role}
                  onClick={() => {
                    loginAsDemo(item.role);
                    setShowRoleSelector(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                    user?.role === item.role
                      ? 'font-bold text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  {user?.role === item.role && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Notificaciones
                </span>
                <span className="text-[10px] text-slate-400">
                  {unreadCount} no leídas
                </span>
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-center text-xs text-slate-400">
                    No tienes notificaciones pendientes
                  </p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id)}
                      className={`px-4 py-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                        !n.isRead ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {n.title}
                        </span>
                        {!n.isRead && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        )}
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                        {n.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* User Profile Avatar & Logout */}
        <div className="flex items-center space-x-3 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {user?.name?.[0] || 'U'}
          </div>
          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

