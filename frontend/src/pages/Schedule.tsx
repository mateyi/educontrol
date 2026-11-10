import React, { useState, useEffect } from 'react';
import { Clock, Plus, Filter, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Modal } from '../components/common/Modal';
import api from '../services/api';

export const Schedule: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    courseId: '',
    subjectId: '',
    teacherId: '',
    classroomId: '',
    dayOfWeek: 1,
    startTime: '07:45',
    endTime: '09:45',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [courseRes, teachRes, classRes] = await Promise.all([
        api.get<any>('/courses'),
        api.get<any>('/teachers'),
        api.get<any>('/schedules/classrooms'),
      ]);

      const courseList = courseRes.data || [];
      setCourses(courseList);
      setTeachers(teachRes.data || []);
      setClassrooms(classRes.data || []);

      if (courseList.length > 0 && !selectedCourseId) {
        setSelectedCourseId(courseList[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadSchedules = async () => {
    if (!selectedCourseId) return;
    try {
      const res: any = await api.get(`/schedules?courseId=${selectedCourseId}`);
      setSchedules(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, [selectedCourseId]);

  const currentCourse = courses.find((c) => c.id === selectedCourseId);
  const courseSubjects = currentCourse?.subjects || [];

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);
    try {
      await api.post('/schedules', {
        ...formData,
        courseId: selectedCourseId,
        dayOfWeek: Number(formData.dayOfWeek),
      });
      setIsCreateOpen(false);
      loadSchedules();
    } catch (err: any) {
      setConflictError(err.message || 'Error al asignar horario');
    }
  };

  const daysOfWeek = [
    { num: 1, name: 'Lunes' },
    { num: 2, name: 'Martes' },
    { num: 3, name: 'Miércoles' },
    { num: 4, name: 'Jueves' },
    { num: 5, name: 'Viernes' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Horarios y Grilla Semanal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Distribución horaria por curso y aula con detección automática de superposiciones y conflictos.
          </p>
        </div>

        {hasRole('ADMINISTRADOR', 'DIRECTIVO') && (
          <button
            onClick={() => {
              setConflictError(null);
              setFormData({
                courseId: selectedCourseId,
                subjectId: courseSubjects[0]?.subjectId || '',
                teacherId: teachers[0]?.id || '',
                classroomId: classrooms[0]?.id || '',
                dayOfWeek: 1,
                startTime: '07:45',
                endTime: '09:45',
              });
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Asignar Módulo Horario</span>
          </button>
        )}
      </div>

      {/* Course Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Curso seleccionado:
          </span>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.shift})
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-400 hidden sm:inline">
          Turno {currentCourse?.shift} • {currentCourse?.level}
        </span>
      </div>

      {/* Weekly Grid (Lunes a Viernes) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {daysOfWeek.map((day) => {
          const dayClasses = schedules.filter((s) => s.dayOfWeek === day.num);

          return (
            <div
              key={day.num}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col"
            >
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {day.name}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">
                  {dayClasses.length} {dayClasses.length === 1 ? 'módulo' : 'módulos'}
                </span>
              </div>

              <div className="mt-4 space-y-3 flex-1">
                {dayClasses.length === 0 ? (
                  <p className="text-center py-10 text-[11px] text-slate-400 italic">
                    Sin clases programadas
                  </p>
                ) : (
                  dayClasses.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 text-xs shadow-xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-blue-950 dark:text-blue-100 truncate">
                          {item.subject?.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                        Prof. {item.teacher?.user?.lastName}
                      </p>
                      <div className="mt-2.5 pt-2 border-t border-blue-200/60 dark:border-blue-900/40 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        <span className="font-bold text-blue-600 dark:text-blue-400">
                          {item.startTime} - {item.endTime}
                        </span>
                        <span>{item.classroom?.name}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE MODAL WITH CONFLICT CHECKING */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Asignar Nuevo Horario Semanal"
        subtitle={`Curso: ${currentCourse?.name}`}
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {conflictError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-200 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{conflictError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Materia *
            </label>
            <select
              required
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
            >
              {courseSubjects.map((s: any) => (
                <option key={s.subjectId} value={s.subjectId}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Docente Responsable *
            </label>
            <select
              required
              value={formData.teacherId}
              onChange={(e) => setFormData({ ...formData, teacherId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.lastName}, {t.name} ({t.specialty})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Aula / Espacio Físico *
            </label>
            <select
              required
              value={formData.classroomId}
              onChange={(e) => setFormData({ ...formData, classroomId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
            >
              {classrooms.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {cl.name} ({cl.building || 'Edificio Principal'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Día
              </label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) => setFormData({ ...formData, dayOfWeek: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value={1}>Lunes</option>
                <option value={2}>Martes</option>
                <option value={3}>Miércoles</option>
                <option value={4}>Jueves</option>
                <option value={5}>Viernes</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Inicio
              </label>
              <input
                type="text"
                placeholder="07:45"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fin
              </label>
              <input
                type="text"
                placeholder="09:45"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Guardar Horario
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

