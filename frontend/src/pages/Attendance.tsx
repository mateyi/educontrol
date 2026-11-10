import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
  AlertTriangle,
  Save,
  CheckCheck,
  Search,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import api from '../services/api';

export const Attendance: React.FC = () => {
  const { user, hasRole } = useAuth();

  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [records, setRecords] = useState<any[]>([]);
  const [isRecorded, setIsRecorded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Watchlist
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'daily' | 'alerts'>('daily');

  // Justification Modal
  const [isJustifyOpen, setIsJustifyOpen] = useState(false);
  const [selectedStudentForJustify, setSelectedStudentForJustify] = useState<any>(null);
  const [justificationReason, setJustificationReason] = useState('');

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

  // Load attendance records
  const loadAttendance = async () => {
    if (!selectedCourseId) return;
    setIsLoading(true);
    try {
      const res: any = await api.get(
        `/attendance?courseId=${selectedCourseId}&date=${selectedDate}`
      );
      setRecords(res.records || []);
      setIsRecorded(res.isRecorded || false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, [selectedCourseId, selectedDate]);

  // Load alerts
  useEffect(() => {
    api
      .get<any>('/attendance/stats')
      .then((res) => setAlerts(res.studentsWithAlerts || []))
      .catch(() => {});
  }, [selectedCourseId]);

  const handleStatusChange = (studentId: string, newStatus: string) => {
    setRecords((prev) =>
      prev.map((r) =>
        r.studentId === studentId
          ? {
              ...r,
              status: newStatus,
              justified: newStatus === 'JUSTIFICADO',
            }
          : r
      )
    );
  };

  const handleMarkAllPresent = () => {
    setRecords((prev) =>
      prev.map((r) => ({
        ...r,
        status: 'PRESENTE',
        justified: false,
      }))
    );
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      await api.post('/attendance', {
        courseId: selectedCourseId,
        date: selectedDate,
        periodOrShift: 'GENERAL_DIARIA',
        records: records.map((r) => ({
          studentId: r.studentId,
          status: r.status,
          justified: r.justified,
          justificationReason: r.justificationReason,
          remarks: r.remarks,
        })),
      });

      setSaveSuccess(true);
      setIsRecorded(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error al guardar planilla de asistencia');
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenJustify = (record: any) => {
    setSelectedStudentForJustify(record);
    setJustificationReason(record.justificationReason || '');
    setIsJustifyOpen(true);
  };

  const handleSaveJustification = () => {
    if (!selectedStudentForJustify) return;
    setRecords((prev) =>
      prev.map((r) =>
        r.studentId === selectedStudentForJustify.studentId
          ? {
              ...r,
              status: 'JUSTIFICADO',
              justified: true,
              justificationReason,
            }
          : r
      )
    );
    setIsJustifyOpen(false);
  };

  // Stats for the current sheet
  const total = records.length;
  const presentCount = records.filter((r) => r.status === 'PRESENTE').length;
  const absentCount = records.filter((r) => r.status === 'AUSENTE').length;
  const lateCount = records.filter((r) => r.status === 'TARDE').length;
  const justifiedCount = records.filter((r) => r.status === 'JUSTIFICADO').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Control de Asistencia Escolar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Registro diario de presentismo, tardanzas, justificaciones y monitoreo de umbral de inasistencias.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-4 py-1.5 rounded-lg transition-colors ${
              activeTab === 'daily'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Planilla Diaria
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`px-4 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === 'alerts'
                ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <span>Alertas de Inasistencias</span>
            {alerts.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {alerts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'alerts' ? (
        /* ALERTS WATCHLIST VIEW */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Monitoreo de Pérdida de Regularidad
              </h3>
              <p className="text-xs text-slate-500">
                Alumnos con 10 o más inasistencias injustificadas (Umbral de alerta institucional: 15 faltas).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="px-6 py-3.5">Alumno</th>
                  <th className="px-6 py-3.5">DNI</th>
                  <th className="px-6 py-3.5">Curso</th>
                  <th className="px-6 py-3.5 text-center">Inasistencias</th>
                  <th className="px-6 py-3.5 text-center">Tardanzas</th>
                  <th className="px-6 py-3.5 text-center">Tasa Asistencia</th>
                  <th className="px-6 py-3.5 text-right">Nivel de Riesgo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {alerts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Excelente: Ningún alumno se encuentra en riesgo por inasistencias.
                    </td>
                  </tr>
                ) : (
                  alerts.map((al) => (
                    <tr key={al.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">
                        {al.name}
                      </td>
                      <td className="px-6 py-3.5 font-mono">{al.dni}</td>
                      <td className="px-6 py-3.5 font-medium">{al.courseName}</td>
                      <td className="px-6 py-3.5 text-center font-bold text-rose-600 text-sm">
                        {al.absences}
                      </td>
                      <td className="px-6 py-3.5 text-center font-mono">{al.late}</td>
                      <td className="px-6 py-3.5 text-center font-mono">{al.attendanceRate}%</td>
                      <td className="px-6 py-3.5 text-right">
                        <Badge variant={al.critical ? 'danger' : 'warning'}>
                          {al.critical ? 'Crítico (>= 15 Faltas)' : 'Advertencia (>= 10 Faltas)'}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* DAILY ATTENDANCE REGISTER */
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <div className="w-full sm:w-auto">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Curso
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full sm:w-60 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.shift})
                    </option>
                  ))}
                </select>
              </div>

              <div className="w-full sm:w-auto">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Fecha de la Sesión
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-44 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-semibold"
                >
                </input>
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
              {hasRole('ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR', 'PROFESOR') && (
                <>
                  <button
                    onClick={handleMarkAllPresent}
                    className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <CheckCheck className="w-4 h-4 text-emerald-600" />
                    <span>Todos Presentes</span>
                  </button>

                  <button
                    onClick={handleSaveAttendance}
                    disabled={isSaving}
                    className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Guardando...' : 'Guardar Planilla'}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Quick Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500 uppercase font-semibold">Presentes</p>
                <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{presentCount}</p>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500 uppercase font-semibold">Ausentes</p>
                <p className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-0.5">{absentCount}</p>
              </div>
              <XCircle className="w-5 h-5 text-rose-500" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500 uppercase font-semibold">Tardanzas</p>
                <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-0.5">{lateCount}</p>
              </div>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <p className="text-[11px] text-slate-500 uppercase font-semibold">Justificados</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-0.5">{justifiedCount}</p>
              </div>
              <FileCheck className="w-5 h-5 text-blue-500" />
            </div>
          </div>

          {/* Sheet Table */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Alumno</th>
                    <th className="px-6 py-3.5">DNI</th>
                    <th className="px-6 py-3.5">Estado de Asistencia</th>
                    <th className="px-6 py-3.5">Justificación / Motivo</th>
                    <th className="px-6 py-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {records.map((r) => (
                    <tr key={r.studentId} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">
                        {r.lastName}, {r.name}
                      </td>
                      <td className="px-6 py-3.5 font-mono">{r.dni}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center space-x-1.5">
                          {(['PRESENTE', 'AUSENTE', 'TARDE', 'JUSTIFICADO'] as const).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(r.studentId, st)}
                              disabled={!hasRole('ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR', 'PROFESOR')}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                r.status === st
                                  ? st === 'PRESENTE'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : st === 'AUSENTE'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : st === 'TARDE'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'bg-blue-600 text-white shadow-xs'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white'
                              }`}
                            >
                              {st}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        {r.justificationReason ? (
                          <span className="text-blue-600 dark:text-blue-400 font-medium">
                            {r.justificationReason}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Sin observaciones</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {(r.status === 'AUSENTE' || r.status === 'JUSTIFICADO') && (
                          <button
                            onClick={() => handleOpenJustify(r)}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold text-[11px] hover:bg-blue-100"
                          >
                            Justificar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* JUSTIFY MODAL */}
      <Modal
        isOpen={isJustifyOpen}
        onClose={() => setIsJustifyOpen(false)}
        title="Justificación de Inasistencia"
        subtitle={selectedStudentForJustify ? `${selectedStudentForJustify.name} ${selectedStudentForJustify.lastName}` : ''}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Motivo / Detalle del Certificado Médico o Nota *
            </label>
            <textarea
              rows={3}
              value={justificationReason}
              onChange={(e) => setJustificationReason(e.target.value)}
              placeholder="Ej. Certificado médico presentado por el tutor, reposo 48 hs..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsJustifyOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Cancelar
            </button>
            <button
              onClick={handleSaveJustification}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Guardar Justificación
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
