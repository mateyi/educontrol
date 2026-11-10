import React, { useState, useEffect } from 'react';
import { Layers, Plus, Users, BookOpen, Clock, Trash2, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import api from '../services/api';

export const Courses: React.FC = () => {
  const { hasRole } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    level: 'SECUNDARIO TÉCNICO',
    yearNumber: 1,
    division: 'A',
    shift: 'MAÑANA',
  });

  const loadCourses = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/courses');
      setCourses(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/courses', {
        ...formData,
        yearNumber: Number(formData.yearNumber),
      });
      setIsCreateOpen(false);
      setFormData({ name: '', level: 'SECUNDARIO TÉCNICO', yearNumber: 1, division: 'A', shift: 'MAÑANA' });
      loadCourses();
    } catch (err: any) {
      alert(err.message || 'Error al crear curso');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Cursos y Divisiones
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Estructura curricular de la institución, turnos, preceptores y alumnos asignados.
          </p>
        </div>

        {hasRole('ADMINISTRADOR', 'DIRECTIVO') && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Curso / División</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Cargando cursos...
          </div>
        ) : (
          courses.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                    Año {c.yearNumber} • Div. {c.division}
                  </span>
                  <Badge variant={c.shift === 'MAÑANA' ? 'primary' : c.shift === 'TARDE' ? 'warning' : 'purple'}>
                    Turno {c.shift}
                  </Badge>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                  {c.name}
                </h3>
                <p className="text-xs text-slate-500 mb-4">{c.level}</p>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Preceptor Asignado:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {c.preceptor ? `${c.preceptor.name} ${c.preceptor.lastName}` : 'Sin asignar'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Materias Activas:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {c.subjectsCount} asignaturas
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Matrícula Inscripta:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {c.studentCount} alumnos
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setSelectedCourseForStudents(c)}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Ver Alumnos Inscriptos ({c.studentCount})</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE COURSE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Crear Nuevo Curso y División"
        subtitle="Configuración académica para el ciclo lectivo actual."
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre Completo del Curso *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. 6° 1° Informática, 4° C, 2° B..."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Año / Grado (1 a 7)
              </label>
              <input
                type="number"
                min="1"
                max="7"
                required
                value={formData.yearNumber}
                onChange={(e) => setFormData({ ...formData, yearNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                División *
              </label>
              <input
                type="text"
                required
                placeholder="Ej. A, B, 1°, Informática..."
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nivel
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="SECUNDARIO TÉCNICO">Secundario Técnico</option>
                <option value="SECUNDARIO BÁSICO">Secundario Básico</option>
                <option value="SECUNDARIO ORIENTADO">Secundario Orientado</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Turno
              </label>
              <select
                value={formData.shift}
                onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="MAÑANA">Mañana</option>
                <option value="TARDE">Tarde</option>
                <option value="VESPERTINO">Vespertino</option>
                <option value="JORNADA_COMPLETA">Jornada Completa</option>
              </select>
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
              Guardar Curso
            </button>
          </div>
        </form>
      </Modal>

      {/* ENROLLED STUDENTS MODAL */}
      <Modal
        isOpen={!!selectedCourseForStudents}
        onClose={() => setSelectedCourseForStudents(null)}
        title={`Alumnos Inscriptos en ${selectedCourseForStudents?.name}`}
        subtitle={`Turno ${selectedCourseForStudents?.shift} • Total: ${selectedCourseForStudents?.studentCount} alumnos`}
        maxWidth="lg"
      >
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {selectedCourseForStudents?.students?.length === 0 ? (
            <p className="p-4 text-center text-xs text-slate-400">Sin alumnos inscriptos</p>
          ) : (
            selectedCourseForStudents?.students?.map((st: any) => (
              <div
                key={st.studentId}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">
                    {st.lastName}, {st.name}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    DNI: {st.dni} • Legajo: {st.fileNumber}
                  </p>
                </div>
                <Badge variant={st.status === 'REGULAR' ? 'success' : 'neutral'}>
                  {st.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};
