import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Filter,
  UserPlus,
  Phone,
  Mail,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import api from '../services/api';

export const Students: React.FC = () => {
  const { hasRole } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isLegajoOpen, setIsLegajoOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentDetail, setStudentDetail] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    dni: '',
    email: '',
    birthDate: '2008-01-01',
    phone: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    courseId: '',
  });

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
      });
      if (search) params.append('search', search);
      if (selectedCourse) params.append('courseId', selectedCourse);

      const res: any = await api.get(`/students?${params.toString()}`);
      setStudents(res.data || []);
      setTotalPages(res.meta?.totalPages || 1);
      setTotal(res.meta?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, [page, search, selectedCourse]);

  useEffect(() => {
    api.get<any>('/courses').then((res) => setCourses(res.data || []));
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      name: '',
      lastName: '',
      dni: '',
      email: '',
      birthDate: '2008-01-01',
      phone: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      courseId: courses[0]?.id || '',
    });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/students', formData);
      setIsCreateOpen(false);
      loadStudents();
    } catch (err: any) {
      alert(err.message || 'Error al registrar alumno');
    }
  };

  const handleOpenEdit = (st: any) => {
    setSelectedStudent(st);
    setFormData({
      name: st.name,
      lastName: st.lastName,
      dni: st.dni,
      email: st.email,
      birthDate: st.birthDate ? st.birthDate.split('T')[0] : '2008-01-01',
      phone: st.phone || '',
      address: st.address || '',
      emergencyContact: st.emergencyContact || '',
      emergencyPhone: st.emergencyPhone || '',
      courseId: st.course?.id || '',
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/students/${selectedStudent.id}`, formData);
      setIsEditOpen(false);
      loadStudents();
    } catch (err: any) {
      alert(err.message || 'Error al actualizar alumno');
    }
  };

  const handleOpenLegajo = async (st: any) => {
    try {
      const res: any = await api.get(`/students/${st.id}`);
      setStudentDetail(res.student);
      setIsLegajoOpen(true);
    } catch (err: any) {
      alert(err.message || 'Error al obtener legajo');
    }
  };

  const handleDeleteSubmit = async () => {
    try {
      await api.delete(`/students/${selectedStudent.id}`);
      setIsDeleteOpen(false);
      loadStudents();
    } catch (err: any) {
      alert(err.message || 'Error al dar de baja al alumno');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Gestión de Alumnos y Legajos
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Matrícula escolar, legajos pedagógicos, contactos de emergencia y asignación de divisiones.
          </p>
        </div>

        {hasRole('ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR') && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Inscribir Nuevo Alumno</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por apellido, nombre, DNI o número de legajo..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setPage(1);
            }}
            className="w-full sm:w-56 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
          >
            <option value="">Todos los cursos</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.shift})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Legajo / Alumno</th>
                <th className="px-6 py-3.5">DNI</th>
                <th className="px-6 py-3.5">Curso / Turno</th>
                <th className="px-6 py-3.5">Contacto</th>
                <th className="px-6 py-3.5">Tutores</th>
                <th className="px-6 py-3.5">Estado</th>
                <th className="px-6 py-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Cargando listado de alumnos...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No se encontraron alumnos registrados con los filtros seleccionados
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr
                    key={st.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">
                          {st.name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">
                            {st.lastName}, {st.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{st.fileNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono">{st.dni}</td>
                    <td className="px-6 py-4">
                      {st.course ? (
                        <div>
                          <p className="font-medium text-slate-800 dark:text-slate-200">
                            {st.course.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{st.course.shift}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Sin curso</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="truncate max-w-[150px]">{st.email}</p>
                      <p className="text-[10px] text-slate-400">{st.phone || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      {st.guardians && st.guardians.length > 0 ? (
                        st.guardians.map((g: any, i: number) => (
                          <div key={i}>
                            <p className="font-medium text-slate-800 dark:text-slate-200">
                              {g.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {g.relationship} • {g.phone}
                            </p>
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-400 italic">No vinculado</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={st.status === 'REGULAR' ? 'success' : 'neutral'}>
                        {st.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => handleOpenLegajo(st)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-colors"
                          title="Ver Legajo Completo"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {hasRole('ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR') && (
                          <button
                            onClick={() => handleOpenEdit(st)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
                            title="Editar Datos"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {hasRole('ADMINISTRADOR', 'DIRECTIVO') && (
                          <button
                            onClick={() => {
                              setSelectedStudent(st);
                              setIsDeleteOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title="Dar de baja"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Mostrando {students.length} de {total} alumnos registrados
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Anterior
            </button>
            <span>
              Página {page} de {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Inscripción de Nuevo Alumno"
        subtitle="Complete los datos para generar el legajo digital y matrícula escolar."
        maxWidth="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre(s) *
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
                Apellido(s) *
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
                DNI / Documento *
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
                Fecha de Nacimiento *
              </label>
              <input
                type="date"
                required
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email Institucional / Personal *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Teléfono de Contacto
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Curso / División a Inscribir
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
            >
              <option value="">Seleccione un curso...</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.shift})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contacto de Emergencia
              </label>
              <input
                type="text"
                value={formData.emergencyContact}
                onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                placeholder="Nombre del familiar"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Teléfono de Emergencia
              </label>
              <input
                type="text"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                placeholder="+54 223..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Registrar Alumno
            </button>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Modificar Datos del Alumno"
        subtitle={`Legajo: ${selectedStudent?.fileNumber}`}
        maxWidth="lg"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre
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
                Apellido
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
                DNI
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
                Curso / División
              </label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="">Sin asignar</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.shift})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </Modal>

      {/* LEGAJO MODAL */}
      <Modal
        isOpen={isLegajoOpen}
        onClose={() => setIsLegajoOpen(false)}
        title="Legajo Digital del Alumno"
        subtitle={studentDetail ? `${studentDetail.name} ${studentDetail.lastName} (${studentDetail.fileNumber})` : ''}
        maxWidth="xl"
      >
        {studentDetail && (
          <div className="space-y-6">
            {/* Header info card */}
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/80 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-blue-900 dark:text-blue-100">
                  {studentDetail.name} {studentDetail.lastName}
                </h4>
                <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                  DNI: {studentDetail.dni} • Fecha Nac: {new Date(studentDetail.birthDate).toLocaleDateString('es-AR')}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-0.5">
                  Curso Actual: {studentDetail.currentCourse?.name || 'No asignado'} ({studentDetail.currentCourse?.shift || '-'})
                </p>
              </div>
              <Badge variant={studentDetail.stats?.averageGrade >= 7.0 ? 'success' : 'danger'}>
                Promedio: {studentDetail.stats?.averageGrade}
              </Badge>
            </div>

            {/* Attendance & Warning alerts */}
            {studentDetail.stats?.warningThresholdReached && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center space-x-2.5">
                <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>
                  <strong>Alerta de Inasistencias:</strong> El alumno acumula{' '}
                  {studentDetail.stats.absentCount} inasistencias injustificadas, alcanzando el umbral de riesgo de regularidad (15 faltas).
                </span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Tasa Asistencia</span>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  {studentDetail.stats?.attendanceRate}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Faltas Injustificadas</span>
                <p className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-1">
                  {studentDetail.stats?.absentCount}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Notas Cargadas</span>
                <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {studentDetail.stats?.totalGradesCount}
                </p>
              </div>
            </div>

            {/* Grades Table */}
            <div>
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                Historial de Calificaciones
              </h5>
              <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {studentDetail.grades?.length === 0 ? (
                  <p className="p-4 text-center text-slate-400">Sin calificaciones registradas aún</p>
                ) : (
                  studentDetail.grades?.map((g: any) => (
                    <div key={g.id} className="p-2.5 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {g.assessment?.teacherAssignment?.subject?.name}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {g.assessment?.title} ({g.assessment?.period})
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${g.score >= 7.0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {g.score.toFixed(1)}
                        </span>
                        <p className="text-[10px] text-slate-400">{g.score >= 7.0 ? 'Aprobado' : 'Desaprobado'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Guardians Contact */}
            <div>
              <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2">
                Familiares y Tutores Vinculados
              </h5>
              <div className="space-y-2">
                {studentDetail.guardians?.map((g: any) => (
                  <div
                    key={g.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">
                        {g.name} ({g.relationship})
                      </p>
                      <p className="text-slate-500">{g.email}</p>
                    </div>
                    <span className="font-mono text-blue-600 dark:text-blue-400">{g.phone}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDeleteSubmit}
        title="Dar de baja al Alumno"
        message={`¿Está seguro de que desea dar de baja a ${selectedStudent?.name} ${selectedStudent?.lastName}? Se conservará el historial académico pero el usuario pasará a estado inactivo.`}
        confirmLabel="Dar de Baja"
        isDestructive={true}
      />
    </div>
  );
};
