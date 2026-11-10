import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Layers,
  BookOpen,
  CalendarDays,
  FileCheck2,
  Clock,
  ClipboardList,
  Megaphone,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  School,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR', 'PROFESOR', 'ALUMNO', 'TUTOR'],
    },
    {
      label: 'Alumnos',
      path: '/students',
      icon: Users,
      roles: ['ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR', 'PROFESOR'],
    },
    {
      label: 'Profesores',
      path: '/teachers',
      icon: GraduationCap,
      roles: ['ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR'],
    },
    {
      label: 'Cursos y Divisiones',
      path: '/courses',
      icon: Layers,
      roles: ['ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR', 'PROFESOR'],
    },
    {
      label: 'Materias',
      path: '/subjects',
      icon: BookOpen,
      roles: ['ADMINISTRADOR', 'DIRECTIVO'],
    },
    {
      label: 'Calificaciones',
      path: '/grades',
      icon: FileCheck2,
      roles: ['ADMINISTRADOR', 'DIRECTIVO', 'PROFESOR', 'ALUMNO', 'TUTOR'],
    },
    {
      label: 'Asistencias',
      path: '/attendance',
      icon: CalendarDays,
      roles: ['ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR', 'PROFESOR', 'ALUMNO', 'TUTOR'],
    },
    {
      label: 'Horarios',
      path: '/schedules',
      icon: Clock,
      roles: ['ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR', 'PROFESOR', 'ALUMNO', 'TUTOR'],
    },
    {
      label: 'Tareas y Trabajos',
      path: '/assignments',
      icon: ClipboardList,
      roles: ['ADMINISTRADOR', 'DIRECTIVO', 'PROFESOR', 'ALUMNO', 'TUTOR'],
    },
    {
      label: 'Comunicados',
      path: '/announcements',
      icon: Megaphone,
      roles: ['ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR', 'PROFESOR', 'ALUMNO', 'TUTOR'],
    },
    {
      label: 'Administración',
      path: '/admin',
      icon: ShieldCheck,
      roles: ['ADMINISTRADOR'],
    },
  ];

  const allowedNavItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 shrink-0">
              <School className="w-6 h-6" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
                  EduControl
                </span>
                <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold tracking-wider uppercase">
                  Gestión Escolar
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Institution Tagline */}
        {!collapsed && (
          <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60">
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 truncate">
              {user.school?.name || 'Colegio Secundario'}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              CUE: {user.school?.cueCode || '0601523-00'} • Ciclo 2026
            </p>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-12rem)]">
          {allowedNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                  } ${collapsed ? 'justify-center px-0' : ''}`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Role Indicator Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800">
        {!collapsed ? (
          <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
            <div className="truncate">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                {user.name} {user.lastName}
              </p>
              <p className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">
                {user.role}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center" title={`${user.name} (${user.role})`}>
            <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs">
              {user.name[0]}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

