import React, { useState, useEffect } from 'react';
import {
  FileCheck2,
  Plus,
  BookOpen,
  Save,
  Printer,
  TrendingUp,
  Award,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import api from '../services/api';

export const Grades: React.FC = () => {
  const { user, hasRole } = useAuth();

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('1° Trimestre');

  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedAssessment, setSelectedAssessment] = useState<any | null>(null);
  const [editableGrades, setEditableGrades] = useState<Record<string, { score: number; observations: string }>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New assessment modal
  const [isNewAssessmentOpen, setIsNewAssessmentOpen] = useState(false);
  const [assessmentForm, setAssessmentForm] = useState({
    title: '',
    type: 'EXAMEN',
    period: '1° Trimestre',
    date: new Date().toISOString().split('T')[0],
    maxScore: 10.0,
    passingScore: 7.0, // Regla institucional fijada en 7.0
  });

  // Report card modal
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [reportCardData, setReportCardData] = useState<any>(null);

  // Load courses
  useEffect(() => {
    api.get<any>('/courses').then((res) => {
      const data = res.data || [];
      setCourses(data);
      if (data.length > 0) {
        setSelectedCourseId(data[0].id);
      }
    });
  }, []);

  // Set default subject when course changes
  const currentCourse = courses.find((c) => c.id === selectedCourseId);
  const courseSubjects = currentCourse?.subjects || [];

  useEffect(() => {
    if (courseSubjects.length > 0) {
      setSelectedSubjectId(courseSubjects[0].subjectId);
    } else {
      setSelectedSubjectId('');
    }
  }, [selectedCourseId]);

  // Load assessments
  const loadAssessments = async () => {
    if (!selectedCourseId) return;
    try {
      const params = new URLSearchParams({
        courseId: selectedCourseId,
        period: selectedPeriod,
      });
      if (selectedSubjectId) params.append('subjectId', selectedSubjectId);

      const res: any = await api.get(`/grades/assessments?${params.toString()}`);
      const list = res.data || [];
      setAssessments(list);

      if (list.length > 0) {
        setSelectedAssessment(list[0]);
      } else {
        setSelectedAssessment(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAssessments();
  }, [selectedCourseId, selectedSubjectId, selectedPeriod]);

  // Sync editable grades when selected assessment changes
  useEffect(() => {
    if (selectedAssessment) {
      const initialMap: Record<string, { score: number; observations: string }> = {};

      // If assessment has grades, populate them
      selectedAssessment.grades?.forEach((g: any) => {
        initialMap[g.studentId] = {
          score: g.score,
          observations: g.observations || '',
        };
      });

      // Also ensure all students enrolled in the current course have an entry
      currentCourse?.students?.forEach((st: any) => {
        if (!initialMap[st.studentId]) {
          initialMap[st.studentId] = { score: 7.0, observations: '' };
        }
      });

      setEditableGrades(initialMap);
    }
  }, [selectedAssessment, currentCourse]);

  const handleScoreChange = (studentId: string, scoreStr: string) => {
    const val = parseFloat(scoreStr);
    setEditableGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        score: isNaN(val) ? 0 : Math.min(10, Math.max(1, val)),
      },
    }));
  };

  const handleObservationsChange = (studentId: string, obs: string) => {
    setEditableGrades((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        observations: obs,
      },
    }));
  };

  const handleSaveGrades = async () => {
    if (!selectedAssessment) return;
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const payload = {
        assessmentId: selectedAssessment.id,
        grades: Object.entries(editableGrades).map(([studentId, data]) => ({
          studentId,
          score: data.score,
          observations: data.observations,
        })),
      };

      await api.post('/grades/save', payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      loadAssessments();
    } catch (err: any) {
      alert(err.message || 'Error al guardar calificaciones');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCourse || !selectedSubjectId) return;

    // Find assignmentId
    const assignment = currentCourse.subjects?.find((s: any) => s.subjectId === selectedSubjectId);
    if (!assignment) {
      alert('Esta materia no tiene una asignación docente registrada en el curso.');
      return;
    }

    try {
      await api.post('/grades/assessments', {
        teacherAssignmentId: assignment.assignmentId,
        title: assessmentForm.title,
        type: assessmentForm.type,
        period: assessmentForm.period,
        date: assessmentForm.date,
        maxScore: 10.0,
        passingScore: 7.0,
      });

      setIsNewAssessmentOpen(false);
      loadAssessments();
    } catch (err: any) {
      alert(err.message || 'Error al crear evaluación');
    }
  };

  const handleOpenReportCard = async (studentId: string) => {
    try {
      const res: any = await api.get(`/grades/report-card/${studentId}`);
      setReportCardData(res);
      setIsReportCardOpen(true);
    } catch (err: any) {
      alert(err.message || 'Error al cargar boletín');
    }
  };

  // If user is ALUMNO, automatically load their report card
  useEffect(() => {
    if (user?.role === 'ALUMNO' && user.studentProfile) {
      api.get<any>(`/grades/report-card/${user.studentProfile.id}`).then((res) => {
        setReportCardData(res);
      });
    }
  }, [user]);

  // STUDENT VIEW FOR REPORT CARD
  if (user?.role === 'ALUMNO') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Boletín Digital de Calificaciones
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Registro oficial de rendimiento escolar, trimestres y estado de aprobación (Umbral: 7.0).
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Boletín</span>
          </button>
        </div>

        {reportCardData && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {reportCardData.institution.name}
                </h3>
                <p className="text-xs text-slate-500">
                  CUE: {reportCardData.institution.cueCode} • Ciclo Lectivo 2026
                </p>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 mt-2">
                  Alumno: {reportCardData.student.name} • Legajo: {reportCardData.student.fileNumber}
                </p>
                <p className="text-xs text-slate-500">
                  Curso: {reportCardData.student.course} ({reportCardData.student.shift})
                </p>
              </div>

              <div className="flex flex-col items-end">
                <span className="text-xs font-semibold text-slate-500 uppercase">Promedio General</span>
                <span className="text-4xl font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                  {reportCardData.overallAverage}
                </span>
                <Badge variant={reportCardData.overallAverage >= 7.0 ? 'success' : 'danger'}>
                  {reportCardData.academicStatus}
                </Badge>
              </div>
            </div>

            {/* Subjects Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">Materia / Asignatura</th>
                    <th className="px-4 py-3">Docente</th>
                    <th className="px-4 py-3 text-center">1° Trimestre</th>
                    <th className="px-4 py-3 text-center">2° Trimestre</th>
                    <th className="px-4 py-3 text-center">3° Trimestre</th>
                    <th className="px-4 py-3 text-center">Promedio Final</th>
                    <th className="px-4 py-3 text-center">Condición</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reportCardData.subjectsReport.map((sub: any) => (
                    <tr key={sub.subjectId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">
                        {sub.subjectName}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">{sub.teacherName}</td>
                      <td className="px-4 py-3.5 text-center font-mono">
                        {sub.periods[0]?.periodAverage !== null ? sub.periods[0].periodAverage : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono">
                        {sub.periods[1]?.periodAverage !== null ? sub.periods[1].periodAverage : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-center font-mono">
                        {sub.periods[2]?.periodAverage !== null ? sub.periods[2].periodAverage : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-center font-bold text-sm">
                        {sub.finalAverage !== null ? (
                          <span
                            className={
                              sub.finalAverage >= 7.0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : 'text-rose-600 dark:text-rose-400'
                            }
                          >
                            {sub.finalAverage}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <Badge variant={sub.status === 'APROBADO' ? 'success' : sub.status === 'EN_PROCESO' ? 'danger' : 'neutral'}>
                          {sub.status === 'APROBADO' ? 'Aprobado' : sub.status === 'EN_PROCESO' ? 'Desaprobado (< 7)' : 'En curso'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Attendance note */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-300">
                Inasistencias Acumuladas: <strong>{reportCardData.attendanceSummary.absences}</strong> • Asistencia: <strong>{reportCardData.attendanceSummary.attendanceRate}%</strong>
              </span>
              <span className="text-slate-400">Escala de 1 a 10 • Nota mínima de aprobación: 7.0</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // TEACHER, PRECEPTOR, ADMIN & DIRECTIVO VIEW
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Libro de Calificaciones Digital
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Carga de notas por curso y materia, cálculo de promedios trimestrales y escala de aprobación (Aprobado &ge; 7.0).
          </p>
        </div>

        {hasRole('PROFESOR', 'ADMINISTRADOR') && (
          <button
            onClick={() => setIsNewAssessmentOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Evaluación / TP</span>
          </button>
        )}
      </div>

      {/* Selectors Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            1. Seleccionar Curso
          </label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
          >
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.shift})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            2. Seleccionar Materia
          </label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
          >
            {courseSubjects.length === 0 ? (
              <option value="">Sin materias asignadas</option>
            ) : (
              courseSubjects.map((s: any) => (
                <option key={s.subjectId} value={s.subjectId}>
                  {s.name} ({s.teacherName})
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            3. Período / Trimestre
          </label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
          >
            <option value="1° Trimestre">1° Trimestre</option>
            <option value="2° Trimestre">2° Trimestre</option>
            <option value="3° Trimestre">3° Trimestre</option>
          </select>
        </div>
      </div>

      {/* Main Gradebook Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left column: Assessment selector */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Evaluaciones del Período ({assessments.length})
          </h3>

          {assessments.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No hay evaluaciones creadas para esta materia y trimestre.
            </p>
          ) : (
            <div className="space-y-2">
              {assessments.map((a) => (
                <div
                  key={a.id}
                  onClick={() => setSelectedAssessment(a)}
                  className={`p-3 rounded-xl cursor-pointer border transition-all ${
                    selectedAssessment?.id === a.id
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {a.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                      {a.type}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Fecha: {new Date(a.date).toLocaleDateString('es-AR')}
                  </p>
                  <div className="flex items-center justify-between mt-2 text-[11px]">
                    <span className="text-emerald-600 font-semibold">
                      Aprobados: {a.stats.passedCount}
                    </span>
                    <span className="text-slate-400">
                      Promedio: {a.stats.averageScore ? a.stats.averageScore : '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column: Students Grade Entry Table */}
        <div className="lg:col-span-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between">
          <div>
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedAssessment ? selectedAssessment.title : 'Planilla de Carga de Calificaciones'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Regla de Aprobación: 7.0 a 10.0 Aprobado • 1.0 a 6.9 Desaprobado
                </p>
              </div>

              {selectedAssessment && hasRole('PROFESOR', 'ADMINISTRADOR') && (
                <div className="flex items-center space-x-3">
                  {saveSuccess && (
                    <span className="text-xs font-semibold text-emerald-600 animate-in fade-in">
                      ¡Guardado exitosamente!
                    </span>
                  )}
                  <button
                    onClick={handleSaveGrades}
                    disabled={isSaving}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Guardando...' : 'Guardar Calificaciones'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Students List */}
            {!selectedAssessment ? (
              <div className="p-12 text-center text-slate-400 text-xs">
                Seleccione una evaluación a la izquierda o cree una nueva para comenzar a cargar calificaciones.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                    <tr>
                      <th className="px-6 py-3.5">Alumno</th>
                      <th className="px-6 py-3.5">DNI</th>
                      <th className="px-6 py-3.5 w-32">Nota (1 a 10)</th>
                      <th className="px-6 py-3.5">Estado</th>
                      <th className="px-6 py-3.5">Observaciones Pedagógicas</th>
                      <th className="px-6 py-3.5 text-right">Boletín</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {currentCourse?.students?.map((st: any) => {
                      const gradeData = editableGrades[st.studentId] || { score: 7.0, observations: '' };
                      const isApproved = gradeData.score >= 7.0;

                      return (
                        <tr key={st.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="px-6 py-3 font-semibold text-slate-900 dark:text-white">
                            {st.lastName}, {st.name}
                          </td>
                          <td className="px-6 py-3 font-mono">{st.dni}</td>
                          <td className="px-6 py-3">
                            <input
                              type="number"
                              step="0.5"
                              min="1"
                              max="10"
                              value={gradeData.score}
                              disabled={!hasRole('PROFESOR', 'ADMINISTRADOR')}
                              onChange={(e) => handleScoreChange(st.studentId, e.target.value)}
                              className={`w-24 px-3 py-1.5 rounded-lg border font-bold text-center text-xs focus:outline-hidden ${
                                isApproved
                                  ? 'border-emerald-300 bg-emerald-50/50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                  : 'border-rose-300 bg-rose-50/50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
                              }`}
                            />
                          </td>
                          <td className="px-6 py-3">
                            <Badge variant={isApproved ? 'success' : 'danger'}>
                              {isApproved ? 'Aprobado (>= 7)' : 'Desaprobado (< 7)'}
                            </Badge>
                          </td>
                          <td className="px-6 py-3">
                            <input
                              type="text"
                              value={gradeData.observations}
                              disabled={!hasRole('PROFESOR', 'ADMINISTRADOR')}
                              onChange={(e) => handleObservationsChange(st.studentId, e.target.value)}
                              placeholder="Observación opcional..."
                              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                            />
                          </td>
                          <td className="px-6 py-3 text-right">
                            <button
                              onClick={() => handleOpenReportCard(st.studentId)}
                              className="px-2.5 py-1 text-[11px] rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100"
                            >
                              Ver Boletín
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CREATE ASSESSMENT MODAL */}
      <Modal
        isOpen={isNewAssessmentOpen}
        onClose={() => setIsNewAssessmentOpen(false)}
        title="Crear Nueva Evaluación o Trabajo Práctico"
        subtitle={`Curso: ${currentCourse?.name} • Período: ${selectedPeriod}`}
      >
        <form onSubmit={handleCreateAssessment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Título de la Evaluación *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Parcial de Algoritmos, TP Integrador N° 2..."
              value={assessmentForm.title}
              onChange={(e) => setAssessmentForm({ ...assessmentForm, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipo
              </label>
              <select
                value={assessmentForm.type}
                onChange={(e) => setAssessmentForm({ ...assessmentForm, type: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="EXAMEN">Examen Escrito</option>
                <option value="TRABAJO_PRACTICO">Trabajo Práctico</option>
                <option value="ORAL">Exposición Oral</option>
                <option value="RECUPERATORIO">Recuperatorio</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fecha
              </label>
              <input
                type="date"
                required
                value={assessmentForm.date}
                onChange={(e) => setAssessmentForm({ ...assessmentForm, date: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 text-xs">
            <strong>Nota mínima de aprobación:</strong> 7.0 puntos (escala 1 a 10).
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsNewAssessmentOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Crear Evaluación
            </button>
          </div>
        </form>
      </Modal>

      {/* REPORT CARD MODAL */}
      <Modal
        isOpen={isReportCardOpen}
        onClose={() => setIsReportCardOpen(false)}
        title="Boletín de Calificaciones Digital"
        maxWidth="2xl"
      >
        {reportCardData && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-base">
                  {reportCardData.student.name}
                </p>
                <p className="text-xs text-slate-500">
                  DNI: {reportCardData.student.dni} • Legajo: {reportCardData.student.fileNumber}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  Curso: {reportCardData.student.course} ({reportCardData.student.shift})
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                  {reportCardData.overallAverage}
                </span>
                <p className="text-[10px] text-slate-500 uppercase font-semibold">Promedio General</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Materia</th>
                    <th className="px-4 py-2.5 text-center">1° Trim</th>
                    <th className="px-4 py-2.5 text-center">2° Trim</th>
                    <th className="px-4 py-2.5 text-center">3° Trim</th>
                    <th className="px-4 py-2.5 text-center">Final</th>
                    <th className="px-4 py-2.5 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {reportCardData.subjectsReport.map((sub: any) => (
                    <tr key={sub.subjectId}>
                      <td className="px-4 py-2.5 font-bold text-slate-900 dark:text-white">
                        {sub.subjectName}
                      </td>
                      <td className="px-4 py-2.5 text-center">{sub.periods[0]?.periodAverage || '-'}</td>
                      <td className="px-4 py-2.5 text-center">{sub.periods[1]?.periodAverage || '-'}</td>
                      <td className="px-4 py-2.5 text-center">{sub.periods[2]?.periodAverage || '-'}</td>
                      <td className="px-4 py-2.5 text-center font-bold">{sub.finalAverage || '-'}</td>
                      <td className="px-4 py-2.5 text-center">
                        <Badge variant={sub.status === 'APROBADO' ? 'success' : 'danger'}>
                          {sub.status === 'APROBADO' ? 'Aprobado' : 'Desaprobado (< 7)'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

