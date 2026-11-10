import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Settings,
  History,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Save,
  Lock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import api from '../services/api';

export const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'settings' | 'audit'>('users');

  // Users state
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    lastName: '',
    dni: '',
    email: '',
    role: 'PRECEPTOR',
    password: '',
  });

  // School settings state
  const [schoolData, setSchoolData] = useState<any>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Audit logs state
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [auditSearch, setAuditSearch] = useState('');

  const loadUsers = async () => {
    try {
      const res: any = await api.get('/admin/users');
      setUsersList(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadSettings = async () => {
    try {
      const res: any = await api.get('/admin/school-settings');
      setSchoolData(res.school);
    } catch (err) {
      console.error(err);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const res: any = await api.get('/admin/audit-logs');
      setAuditLogs(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
    loadSettings();
    loadAuditLogs();
  }, []);

  const handleToggleUserStatus = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`);
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado de usuario');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', newUserForm);
      setIsCreateUserOpen(false);
      setNewUserForm({ name: '', lastName: '', dni: '', email: '', role: 'PRECEPTOR', password: '' });
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Error al crear usuario');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schoolData) return;
    setIsSavingSettings(true);
    setSettingsSuccess(false);
    try {
      await api.put('/admin/school-settings', {
        name: schoolData.name,
        cueCode: schoolData.cueCode,
        address: schoolData.address,
        phone: schoolData.phone,
        email: schoolData.email,
        passingGrade: Number(schoolData.passingGrade),
        minAttendancePercentage: Number(schoolData.minAttendancePercentage),
        absenceWarningThreshold: Number(schoolData.absenceWarningThreshold),
      });
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Error al guardar configuración');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.dni.includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const filteredLogs = auditLogs.filter((l) => {
    const q = auditSearch.toLowerCase();
    return (
      l.action.toLowerCase().includes(q) ||
      l.entity.toLowerCase().includes(q) ||
      (l.user && `${l.user.name} ${l.user.lastName}`.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Panel de Administración del Sistema
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Gestión integral de usuarios, parámetros institucionales y libro de auditoría de seguridad.
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex p-1 bg-slate-200 dark:bg-slate-800 rounded-xl self-start sm:self-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === 'users'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Usuarios ({usersList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Institución</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5 ${
              activeTab === 'audit'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Auditoría</span>
          </button>
        </div>
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Buscar usuarios por nombre, correo, DNI o rol..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <button
              onClick={() => setIsCreateUserOpen(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Usuario</span>
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Usuario</th>
                    <th className="px-6 py-3.5">Email</th>
                    <th className="px-6 py-3.5">DNI</th>
                    <th className="px-6 py-3.5">Rol del Sistema</th>
                    <th className="px-6 py-3.5">Estado</th>
                    <th className="px-6 py-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white">
                        {u.lastName}, {u.name}
                      </td>
                      <td className="px-6 py-3.5 font-mono text-slate-500">{u.email}</td>
                      <td className="px-6 py-3.5 font-mono">{u.dni}</td>
                      <td className="px-6 py-3.5">
                        <Badge
                          variant={
                            u.role === 'ADMINISTRADOR'
                              ? 'primary'
                              : u.role === 'DIRECTIVO'
                              ? 'purple'
                              : u.role === 'PROFESOR'
                              ? 'success'
                              : u.role === 'PRECEPTOR'
                              ? 'warning'
                              : 'neutral'
                          }
                        >
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`inline-flex items-center space-x-1 font-semibold ${
                            u.active ? 'text-emerald-600' : 'text-slate-400'
                          }`}
                        >
                          {u.active ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                          <span>{u.active ? 'Activo' : 'Inactivo'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        {u.id !== user?.id && (
                          <button
                            onClick={() => handleToggleUserStatus(u.id)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
                          >
                            {u.active ? 'Desactivar' : 'Activar'}
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

      {/* SETTINGS TAB */}
      {activeTab === 'settings' && schoolData && (
        <form onSubmit={handleSaveSettings} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Parámetros Institucionales y Escala de Calificaciones
              </h3>
              <p className="text-xs text-slate-500">
                Configuración del establecimiento escolar y umbrales de aprobación reglamentarios.
              </p>
            </div>
            {settingsSuccess && (
              <span className="text-xs font-semibold text-emerald-600">¡Configuración guardada!</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nombre Oficial de la Institución *
              </label>
              <input
                type="text"
                required
                value={schoolData.name}
                onChange={(e) => setSchoolData({ ...schoolData, name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Código Único de Establecimiento (CUE) *
              </label>
              <input
                type="text"
                required
                value={schoolData.cueCode}
                onChange={(e) => setSchoolData({ ...schoolData, cueCode: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Dirección / Domicilio Institucional
              </label>
              <input
                type="text"
                value={schoolData.address}
                onChange={(e) => setSchoolData({ ...schoolData, address: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Teléfono Institucional
              </label>
              <input
                type="text"
                value={schoolData.phone}
                onChange={(e) => setSchoolData({ ...schoolData, phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            {/* Passing grade threshold */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nota Mínima de Aprobación Escolar (Escala 1 a 10)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="10"
                required
                value={schoolData.passingGrade}
                onChange={(e) => setSchoolData({ ...schoolData, passingGrade: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-blue-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Configurado en 7.0 puntos: 7 a 10 Aprobado, menor a 7 Desaprobado.
              </p>
            </div>

            {/* Attendance warning threshold */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Umbral de Alerta de Inasistencias (Límite de Faltas)
              </label>
              <input
                type="number"
                min="5"
                max="30"
                required
                value={schoolData.absenceWarningThreshold}
                onChange={(e) => setSchoolData({ ...schoolData, absenceWarningThreshold: Number(e.target.value) })}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-rose-600"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Alerta de riesgo de pérdida de regularidad (15 inasistencias acumuladas).
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="submit"
              disabled={isSavingSettings}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingSettings ? 'Guardando...' : 'Guardar Cambios Institucionales'}</span>
            </button>
          </div>
        </form>
      )}

      {/* AUDIT LOG TAB */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
            <div className="relative w-full sm:max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Filtrar por acción, entidad o usuario..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-semibold uppercase">
                  <tr>
                    <th className="px-6 py-3.5">Fecha y Hora</th>
                    <th className="px-6 py-3.5">Usuario</th>
                    <th className="px-6 py-3.5">Acción</th>
                    <th className="px-6 py-3.5">Entidad Afectada</th>
                    <th className="px-6 py-3.5">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="px-6 py-3.5 font-mono text-slate-500">
                        {new Date(log.createdAt).toLocaleString('es-AR')}
                      </td>
                      <td className="px-6 py-3.5 font-semibold text-slate-900 dark:text-white">
                        {log.user ? `${log.user.name} ${log.user.lastName}` : 'Sistema'}
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">{log.entity}</td>
                      <td className="px-6 py-3.5 font-mono text-slate-400 truncate max-w-xs">
                        {log.details || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={isCreateUserOpen}
        onClose={() => setIsCreateUserOpen(false)}
        title="Crear Nuevo Usuario del Sistema"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                required
                value={newUserForm.name}
                onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
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
                value={newUserForm.lastName}
                onChange={(e) => setNewUserForm({ ...newUserForm, lastName: e.target.value })}
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
                value={newUserForm.dni}
                onChange={(e) => setNewUserForm({ ...newUserForm, dni: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Email *
              </label>
              <input
                type="email"
                required
                value={newUserForm.email}
                onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rol del Usuario
              </label>
              <select
                value={newUserForm.role}
                onChange={(e) => setNewUserForm({ ...newUserForm, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              >
                <option value="ADMINISTRADOR">Administrador</option>
                <option value="DIRECTIVO">Directivo</option>
                <option value="PRECEPTOR">Preceptor</option>
                <option value="PROFESOR">Profesor</option>
                <option value="ALUMNO">Alumno</option>
                <option value="TUTOR">Tutor / Familiar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contraseña Inicial (opcional)
              </label>
              <input
                type="password"
                placeholder="Por defecto su DNI"
                value={newUserForm.password}
                onChange={(e) => setNewUserForm({ ...newUserForm, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsCreateUserOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs"
            >
              Crear Usuario
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
