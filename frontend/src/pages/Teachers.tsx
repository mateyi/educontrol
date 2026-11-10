import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Mail, Phone, BookOpen, Layers } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import api from '../services/api';

export const Teachers: React.FC = () => {
  const { hasRole } = useAuth();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    dni: '',
    email: '',
    phone: '',
    specialty: '',
  });

  const loadTeachers = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/teachers');
      setTeachers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/teachers', formData);
      setIsCreateOpen(false);
      setFormData({ name: '', lastName: '', dni: '', email: '', phone: '', specialty: '' });
      loadTeachers();
    } catch (err: any) {
      alert(err.message || 'Error al registrar profesor');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Cuerpo Docente y Especialidades
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestión de profesores, materias a cargo, carga horaria y legajos de personal.
          </p>
        </div>

        {hasRole('ADMINISTRADOR', 'DIRECTIVO') && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Nuevo Docente</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Cargando listado de docentes...
          </div>
        ) : (
          teachers.map((t) => (
            <div
              key={t.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-bold text-lg flex items-center justify-center shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      Prof. {t.name} {t.lastName}
                    </h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      {t.specialty || 'Docente de Nivel Secundario'}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                      Legajo: {t.fileNumber} • DNI: {t.dni}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 py-3 border-y border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{t.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.phone || 'Sin registrar'}</span>
                  </div>
                </div>

                {/* Assigned subjects */}
                <div className="mt-4">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Materias y Cursos Asignados
                  </p>
                  {t.assignments.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">Sin asignaciones actuales</p>
                  ) : (
                    <div className="space-y-1.5">
                      {t.assignments.map((asg: any) => (
                        <div
                          key={asg.id}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {asg.subjectName}
                          </span>
                          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                            {asg.courseName}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>{t.schedulesCount} horas semanales</span>
                <Badge variant={t.active ? 'success' : 'neutral'}>
                  {t.active ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Registrar Nuevo Docente"
        subtitle="Se creará una cuenta de usuario y perfil profesional."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Apellido *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                DNI *
              </label>
              <input
                type="text"
                required
                value={formData.dni}
                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Institucional *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Título / Especialidad
            </label>
            <input
              type="text"
              placeholder="Ej. Lic. en Matemática, Prof. en Historia, Ing. en Sistemas..."
              value={formData.specialty}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
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
              Registrar Docente
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
