import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Clock, Users, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Modal } from '../components/common/Modal';
import api from '../services/api';

export const Subjects: React.FC = () => {
  const { hasRole } = useAuth();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    hoursPerWeek: 4,
  });

  const [assignData, setAssignData] = useState({
    teacherId: '',
    courseId: '',
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [subRes, teachRes, courseRes] = await Promise.all([
        api.get<any>('/subjects'),
        api.get<any>('/teachers'),
        api.get<any>('/courses'),
      ]);
      setSubjects(subRes.data || []);
      setTeachers(teachRes.data || []);
      setCourses(courseRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/subjects', {
        ...formData,
        hoursPerWeek: Number(formData.hoursPerWeek),
      });
      setIsCreateOpen(false);
      setFormData({ name: '', code: '', description: '', hoursPerWeek: 4 });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al crear materia');
    }
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject) return;
    try {
      await api.post('/subjects/assign-teacher', {
        subjectId: selectedSubject.id,
        teacherId: assignData.teacherId,
        courseId: assignData.courseId,
      });
      setIsAssignOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error al asignar docente a la materia');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Plan de Estudios y Materias
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Diseño curricular, código oficial, carga horaria semanal y asignación docente por curso.
          </p>
        </div>

        {hasRole('ADMINISTRADOR', 'DIRECTIVO') && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Asignatura</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Cargando materias...
          </div>
        ) : (
          subjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    {sub.code}
                  </span>
                  <span className="text-xs text-slate-500 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{sub.hoursPerWeek} hs/sem</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {sub.name}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {sub.description || 'Asignatura troncal del diseño curricular provincial.'}
                </p>

                {/* Assignments by course */}
                <div className="space-y-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Docentes a Cargo
                  </p>
                  {sub.assignments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Sin cursos asignados</p>
                  ) : (
                    sub.assignments.map((asg: any) => (
                      <div
                        key={asg.id}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                      >
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {asg.courseName}
                        </span>
                        <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">
                          {asg.teacherName}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {hasRole('ADMINISTRADOR', 'DIRECTIVO') && (
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => {
                      setSelectedSubject(sub);
                      setAssignData({
                        teacherId: teachers[0]?.id || '',
                        courseId: courses[0]?.id || '',
                      });
                      setIsAssignOpen(true);
                    }}
                    className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950 hover:text-blue-600 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Asignar a Curso y Docente</span>
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Crear Nueva Materia / Asignatura"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre de la Materia *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Matemática, Programación II, Química..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Código Curricular *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. MAT-601"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Carga Horaria Semanal
              </label>
              <input
                type="number"
                min="1"
                max="20"
                required
                value={formData.hoursPerWeek}
                onChange={(e) => setFormData({ ...formData, hoursPerWeek: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descripción Curricular
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Contenidos mínimos y objetivos pedagógicos..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
            />
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
              Guardar Materia
            </button>
          </div>
        </form>
      </Modal>

      {/* ASSIGN TEACHER MODAL */}
      <Modal
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title={`Asignar Docente a ${selectedSubject?.name}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Docente Responsable *
            </label>
            <select
              value={assignData.teacherId}
              onChange={(e) => setAssignData({ ...assignData, teacherId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.lastName}, {t.name} ({t.specialty || 'Docente'})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Curso / División *
            </label>
            <select
              value={assignData.courseId}
              onChange={(e) => setAssignData({ ...assignData, courseId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.shift})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsAssignOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Confirmar Asignación
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
