import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  Calendar,
  Send,
  CheckCircle2,
  Clock,
  FileText,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import api from '../services/api';

export const Assignments: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isGradeOpen, setIsGradeOpen] = useState(false);

  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  // Forms
  const [createForm, setCreateForm] = useState({
    courseId: '',
    subjectId: '',
    title: '',
    description: '',
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
  });

  const [submitForm, setSubmitForm] = useState({
    content: '',
  });

  const [gradeForm, setGradeForm] = useState({
    score: 8.0,
    feedback: '',
    status: 'CORREGIDO',
  });

  const loadAssignments = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/assignments');
      setAssignments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignments();
    api.get<any>('/courses').then((res) => {
      const list = res.data || [];
      setCourses(list);
      if (list.length > 0) {
        setCreateForm((prev) => ({
          ...prev,
          courseId: list[0].id,
          subjectId: list[0].subjects?.[0]?.subjectId || '',
        }));
      }
    });
  }, []);

  const currentCourse = courses.find((c) => c.id === createForm.courseId);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const assignment = currentCourse?.subjects?.find((s: any) => s.subjectId === createForm.subjectId);
    if (!assignment) {
      alert('La materia seleccionada no tiene asignación docente activa');
      return;
    }

    try {
      await api.post('/assignments', {
        teacherAssignmentId: assignment.assignmentId,
        title: createForm.title,
        description: createForm.description,
        dueDate: createForm.dueDate,
        maxScore: 10.0,
      });
      setIsCreateOpen(false);
      loadAssignments();
    } catch (err: any) {
      alert(err.message || 'Error al crear tarea');
    }
  };

  const handleSubmitWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    try {
      await api.post('/assignments/submit', {
        assignmentId: selectedAssignment.id,
        content: submitForm.content,
      });
      setIsSubmitOpen(false);
      loadAssignments();
    } catch (err: any) {
      alert(err.message || 'Error al enviar tarea');
    }
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    try {
      await api.post('/assignments/grade', {
        submissionId: selectedSubmission.id,
        score: Number(gradeForm.score),
        feedback: gradeForm.feedback,
        status: gradeForm.status,
      });
      setIsGradeOpen(false);
      loadAssignments();
    } catch (err: any) {
      alert(err.message || 'Error al calificar entrega');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Tareas, Actividades y Trabajos Prácticos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Plataforma pedagógica de consignas, recepción digital de trabajos y devoluciones docentes.
          </p>
        </div>

        {hasRole('PROFESOR', 'ADMINISTRADOR') && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Nueva Tarea</span>
          </button>
        )}
      </div>

      {/* Grid of Assignments */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Cargando actividades...
          </div>
        ) : assignments.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            No se registran actividades pedagógicas activas
          </div>
        ) : (
          assignments.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                    {item.subjectName}
                  </span>
                  <span className="text-xs text-slate-400 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Vence: {new Date(item.dueDate).toLocaleDateString('es-AR')}</span>
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4 line-clamp-3">
                  {item.description}
                </p>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-1 text-slate-500">
                  <p>Curso: <strong>{item.courseName}</strong></p>
                  <p>Profesor: <strong>{item.teacherName}</strong></p>
                </div>

                {/* If student, show their submission status */}
                {user?.role === 'ALUMNO' && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {item.mySubmission ? (
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-emerald-800 dark:text-emerald-300">
                            Estado: {item.mySubmission.status}
                          </span>
                          {item.mySubmission.score && (
                            <span className="font-extrabold text-sm text-emerald-600">
                              Nota: {item.mySubmission.score} / 10
                            </span>
                          )}
                        </div>
                        {item.mySubmission.feedback && (
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1 italic">
                            &quot;{item.mySubmission.feedback}&quot;
                          </p>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedAssignment(item);
                          setSubmitForm({ content: '' });
                          setIsSubmitOpen(true);
                        }}
                        className="w-full py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Entregar Trabajo</span>
                      </button>
                    )}
                  </div>
                )}

                {/* If teacher, show submissions list */}
                {(user?.role === 'PROFESOR' || user?.role === 'ADMINISTRADOR') && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Entregas ({item.submissions?.length || 0})
                      </span>
                    </div>

                    <div className="space-y-1.5 max-h-36 overflow-y-auto">
                      {item.submissions?.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">Sin entregas aún</p>
                      ) : (
                        item.submissions?.map((sub: any) => (
                          <div
                            key={sub.id}
                            className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white">
                                {sub.studentName}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {sub.status} {sub.score ? `• ${sub.score}/10` : ''}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setSelectedSubmission(sub);
                                setGradeForm({
                                  score: sub.score || 8.0,
                                  feedback: sub.feedback || '',
                                  status: sub.status === 'CORREGIDO' ? 'CORREGIDO' : 'CORREGIDO',
                                });
                                setIsGradeOpen(true);
                              }}
                              className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold text-[10px]"
                            >
                              Corregir
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Publicar Nueva Tarea o Actividad"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Título de la Tarea *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Ejercicios de Álgebra, Ensayo Literario..."
              value={createForm.title}
              onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Curso
              </label>
              <select
                value={createForm.courseId}
                onChange={(e) => setCreateForm({ ...createForm, courseId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Materia
              </label>
              <select
                value={createForm.subjectId}
                onChange={(e) => setCreateForm({ ...createForm, subjectId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              >
                {currentCourse?.subjects?.map((s: any) => (
                  <option key={s.subjectId} value={s.subjectId}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Fecha Límite de Entrega
            </label>
            <input
              type="date"
              required
              value={createForm.dueDate}
              onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Consigna y Descripción *
            </label>
            <textarea
              rows={4}
              required
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              placeholder="Detalle los requisitos, pautas de entrega y criterios de evaluación..."
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
              Publicar Tarea
            </button>
          </div>
        </form>
      </Modal>

      {/* SUBMIT MODAL */}
      <Modal
        isOpen={isSubmitOpen}
        onClose={() => setIsSubmitOpen(false)}
        title={`Entregar: ${selectedAssignment?.title}`}
        subtitle={`Materia: ${selectedAssignment?.subjectName}`}
      >
        <form onSubmit={handleSubmitWork} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Contenido de la entrega o Enlace (GitHub, Google Drive, etc.) *
            </label>
            <textarea
              rows={4}
              required
              value={submitForm.content}
              onChange={(e) => setSubmitForm({ content: e.target.value })}
              placeholder="Escriba su respuesta o ingrese el enlace al trabajo práctico..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsSubmitOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Confirmar Entrega
            </button>
          </div>
        </form>
      </Modal>

      {/* GRADE MODAL */}
      <Modal
        isOpen={isGradeOpen}
        onClose={() => setIsGradeOpen(false)}
        title="Calificar Entrega de Alumno"
        subtitle={`Alumno: ${selectedSubmission?.studentName}`}
      >
        <form onSubmit={handleGradeSubmit} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
            <p className="font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Respuesta / Contenido enviado por el alumno:
            </p>
            <p className="text-slate-600 dark:text-slate-400 italic">
              {selectedSubmission?.content || 'Sin texto'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Calificación (1 a 10)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="10"
                required
                value={gradeForm.score}
                onChange={(e) => setGradeForm({ ...gradeForm, score: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estado
              </label>
              <select
                value={gradeForm.status}
                onChange={(e) => setGradeForm({ ...gradeForm, status: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="CORREGIDO">Corregido / Aprobado</option>
                <option value="REENTREGA">Solicitar Reentrega</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Devolución Pedagógica / Feedback
            </label>
            <textarea
              rows={3}
              value={gradeForm.feedback}
              onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
              placeholder="Comentarios constructivos sobre la entrega..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsGradeOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Guardar Corrección
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

