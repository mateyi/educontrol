import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  BookOpen,
  TrendingUp,
  FileText,
  CalendarCheck2,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import api from '../services/api';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api
      .get<any>('/dashboard')
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [user?.role]);

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="mt-3 text-xs text-slate-400">Cargando panel de control...</p>
      </div>
    );
  }

  // ================= ADMIN & DIRECTIVO DASHBOARD =================
  if (user?.role === 'ADMINISTRADOR' || user?.role === 'DIRECTIVO') {
    const kpis = data?.kpis || {};
    const weeklyData = data?.weeklyAttendanceTrend || [];
    const recentActivity = data?.recentActivity || [];

    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Dashboard Institucional
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Bienvenido, {user.name} {user.lastName}. Vista general del estado académico y operativo del establecimiento.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              Ciclo Lectivo Activo 2026
            </span>
          </div>
        </div>

        {/* Top 4 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Alumnos"
            value={kpis.totalStudents || 30}
            subtitle="Matrícula escolar activa"
            icon={Users}
            trend={{ value: '5.2%', isPositive: true, label: 'vs mes anterior' }}
            color="blue"
          />
          <StatCard
            title="Docentes y Personal"
            value={kpis.totalTeachers || 5}
            subtitle="Cuerpo docente activo"
            icon={GraduationCap}
            trend={{ value: '2.1%', isPositive: true, label: 'personal completo' }}
            color="indigo"
          />
          <StatCard
            title="Cursos Habilitados"
            value={kpis.totalCourses || 3}
            subtitle="Divisiones y turnos"
            icon={Layers}
            color="amber"
          />
          <StatCard
            title="Tasa de Asistencia"
            value={`${kpis.attendanceRate || 94.2}%`}
            subtitle="Promedio institucional"
            icon={TrendingUp}
            trend={{ value: '1.8%', isPositive: true, label: 'promedio semanal' }}
            color="emerald"
          />
        </div>

        {/* Daily Attendance Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Presentes</p>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {kpis.todayPresent || 28}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ausentes</p>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400">
                {kpis.todayAbsent || 2}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tardanzas</p>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {kpis.todayLate || 1}
              </p>
            </div>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Promedio General</p>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                {kpis.averageGrade || 7.8} / 10
              </p>
            </div>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Charts & Recent Activity Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weekly Attendance Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Tendencia Semanal de Asistencia
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Comparativa de alumnos presentes vs ausentes por día
                </p>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1.5 text-blue-600 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  <span>Presentes</span>
                </span>
                <span className="flex items-center space-x-1.5 text-rose-500 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span>Ausentes</span>
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderColor: '#334155',
                      borderRadius: '0.75rem',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="presentes"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ausentes"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Audit / Activity */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Actividad Reciente
                </h3>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">
                  Auditoría en vivo
                </span>
              </div>

              <div className="space-y-3.5">
                {recentActivity.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No se registran actividades recientes
                  </p>
                ) : (
                  recentActivity.map((log: any) => (
                    <div key={log.id} className="flex items-start space-x-3 text-xs">
                      <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 text-[11px] font-bold">
                        {log.user ? log.user.name[0] : 'S'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {log.user ? `${log.user.name} ${log.user.lastName}` : 'Sistema'}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {log.action.replace(/_/g, ' ')} • {log.entity}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button
              onClick={() => navigate('/admin')}
              className="mt-6 w-full py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors flex items-center justify-center space-x-1"
            >
              <span>Ver panel de auditoría</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ================= PROFESOR DASHBOARD =================
  if (user?.role === 'PROFESOR') {
    const kpis = data?.kpis || {};
    const assignments = data?.assignments || [];
    const todaySchedule = data?.todaySchedule || [];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Panel Docente
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Prof. {user.name} {user.lastName} • {data?.specialty || 'Docente'}
          </p>
        </div>

        {/* Teacher Stat Cards (Inspired by Reference Image 3) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-linear-to-br from-blue-600 to-blue-700 text-white shadow-md">
            <p className="text-xs font-medium text-blue-100">Mis Cursos Asignados</p>
            <p className="text-3xl font-extrabold mt-1">{kpis.coursesCount || 1}</p>
            <p className="text-[11px] text-blue-200 mt-2">6° 1° Informática</p>
          </div>
          <div className="p-5 rounded-2xl bg-linear-to-br from-emerald-600 to-teal-700 text-white shadow-md">
            <p className="text-xs font-medium text-emerald-100">Asistencia de Mis Clases</p>
            <p className="text-3xl font-extrabold mt-1">96.5%</p>
            <p className="text-[11px] text-emerald-200 mt-2">Promedio semanal</p>
          </div>
          <div className="p-5 rounded-2xl bg-linear-to-br from-indigo-600 to-purple-700 text-white shadow-md">
            <p className="text-xs font-medium text-indigo-100">Clases Programadas</p>
            <p className="text-3xl font-extrabold mt-1">{kpis.todayClasses || 2}</p>
            <p className="text-[11px] text-indigo-200 mt-2">Horarios asignados</p>
          </div>
          <div className="p-5 rounded-2xl bg-linear-to-br from-amber-500 to-orange-600 text-white shadow-md">
            <p className="text-xs font-medium text-amber-100">Tareas a Corregir</p>
            <p className="text-3xl font-extrabold mt-1">{kpis.pendingCorrections || 1}</p>
            <p className="text-[11px] text-amber-200 mt-2">Entregas de alumnos pendientes</p>
          </div>
        </div>

        {/* Quick Actions & Timetable */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Mis Asignaturas y Cursos
            </h3>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {assignments.map((asg: any) => (
                <div key={asg.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      {asg.subjectName}
                    </h4>
                    <p className="text-xs text-slate-500">Curso: {asg.courseName}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => navigate('/grades')}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 text-xs font-semibold hover:bg-blue-100 transition-colors"
                    >
                      Cargar Notas
                    </button>
                    <button
                      onClick={() => navigate('/assignments')}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors"
                    >
                      Tareas
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
                Accesos Rápidos
              </h3>
              <div className="space-y-2.5">
                <button
                  onClick={() => navigate('/grades')}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <span className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>Libro de Calificaciones Digital</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => navigate('/attendance')}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-colors flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <span className="flex items-center space-x-2">
                    <CalendarCheck2 className="w-4 h-4 text-emerald-500" />
                    <span>Tomar Asistencia de Clase</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => navigate('/schedules')}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500 transition-colors flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <span className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span>Consultar Mi Horario Semanal</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= ALUMNO DASHBOARD =================
  if (user?.role === 'ALUMNO') {
    const kpis = data?.kpis || {};
    const recentGrades = data?.recentGrades || [];
    const schedule = data?.schedule || [];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Mi Panel Académico
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Alumno: {user.name} {user.lastName} • Legajo: {data?.legajo} • Curso: {data?.course?.name}
          </p>
        </div>

        {/* Student KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Promedio General</span>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                {kpis.averageGrade || 8.5}
              </span>
              <span className="text-xs text-slate-400">/ 10.0</span>
            </div>
            <div className="mt-2">
              <Badge variant={kpis.averageGrade >= 7.0 ? 'success' : 'danger'}>
                {kpis.averageGrade >= 7.0 ? 'Aprobado (>= 7.0)' : 'En Proceso (< 7.0)'}
              </Badge>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Asistencia Registrada</span>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
                {kpis.attendanceRate || 100}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Faltas acumuladas: <strong className="text-slate-900 dark:text-white">{kpis.absentCount || 0}</strong>
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Trabajos Entregados</span>
            <div className="flex items-baseline space-x-2 mt-2">
              <span className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">
                {kpis.completedAssignments || 1}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Tareas y TPs completados</p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500">Boletín de Calificaciones</span>
            <p className="text-xs text-slate-500 mt-2">
              Informe oficial de calificaciones trimestrales
            </p>
            <button
              onClick={() => navigate('/grades')}
              className="mt-3 w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
            >
              Ver Boletín Completo
            </button>
          </div>
        </div>

        {/* Recent Grades & Timetable */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
              Últimas Calificaciones Recibidas
            </h3>
            <div className="space-y-3">
              {recentGrades.map((g: any) => (
                <div
                  key={g.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between"
                >
                  <div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {g.assessment?.teacherAssignment?.subject?.name || 'Materia'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {g.assessment?.title} ({g.assessment?.period})
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-base font-extrabold ${
                        g.score >= 7.0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {g.score.toFixed(1)}
                    </span>
                    <p className="text-[10px] text-slate-400">
                      {g.score >= 7.0 ? 'Aprobado' : 'Desaprobado'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Próximas Clases y Horario
              </h3>
              <button
                onClick={() => navigate('/schedules')}
                className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Ver semana completa
              </button>
            </div>
            <div className="space-y-3">
              {schedule.slice(0, 4).map((sch: any) => (
                <div
                  key={sch.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 text-xs font-bold">
                      {sch.startTime}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">
                        {sch.subject?.name}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {sch.classroom?.name} • Prof. {sch.teacher?.user?.lastName}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-slate-500">
                    {sch.dayOfWeek === 1
                      ? 'Lunes'
                      : sch.dayOfWeek === 2
                      ? 'Martes'
                      : sch.dayOfWeek === 3
                      ? 'Miércoles'
                      : sch.dayOfWeek === 4
                      ? 'Jueves'
                      : 'Viernes'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= TUTOR DASHBOARD =================
  if (user?.role === 'TUTOR') {
    const children = data?.children || [];

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Portal para Familias y Tutores
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Tutor: {user.name} {user.lastName} • Seguimiento pedagógico y asistencia de sus hijos
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {children.map((child: any) => (
            <div
              key={child.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {child.name}
                    </h3>
                    <p className="text-xs text-slate-500">
                      DNI: {child.dni} • Curso: {child.course}
                    </p>
                  </div>
                  <Badge variant={child.averageGrade >= 7.0 ? 'success' : 'warning'}>
                    Promedio: {child.averageGrade}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 my-5">
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[11px] text-slate-500">Faltas Acumuladas</span>
                    <p className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1">
                      {child.absentCount}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                    <span className="text-[11px] text-slate-500">Estado de Aprobación</span>
                    <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      {child.averageGrade >= 7.0 ? 'Regular / Aprobado' : 'A Intensificar'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigate(`/grades`)}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-2"
              >
                <span>Consultar Boletín y Calificaciones</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ================= PRECEPTOR DASHBOARD =================
  const kpis = data?.kpis || {};
  const assignedCourses = data?.assignedCourses || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Panel de Preceptoría
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Preceptor: {user?.name} {user?.lastName} • Control de asistencia, alertas de inasistencias y legajos
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Mis Cursos a Cargo"
          value={kpis.coursesCount || 2}
          subtitle="Divisiones asignadas"
          icon={Layers}
          color="blue"
        />
        <StatCard
          title="Total Alumnos a Cargo"
          value={kpis.totalStudents || 20}
          subtitle="Matrícula bajo supervisión"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Alertas de Faltas"
          value={kpis.alertsCount || 0}
          subtitle="Alumnos con riesgo de pérdida de regularidad"
          icon={AlertCircle}
          color="rose"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Cursos Asignados
          </h3>
          <button
            onClick={() => navigate('/attendance')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
          >
            Tomar Asistencia Diaria
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {assignedCourses.map((c: any) => (
            <div
              key={c.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {c.name}
                </p>
                <p className="text-xs text-slate-500">
                  Turno {c.shift} • {c.studentCount} alumnos
                </p>
              </div>
              <button
                onClick={() => navigate('/attendance')}
                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-medium hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                Abrir Planilla
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
