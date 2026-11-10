import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Bell, Calendar, User, Pin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import api from '../services/api';

export const Announcements: React.FC = () => {
  const { user, hasRole } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'TODOS',
    isImportant: false,
  });

  const loadAnnouncements = async () => {
    setIsLoading(true);
    try {
      const res: any = await api.get('/announcements');
      setAnnouncements(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/announcements', formData);
      setIsCreateOpen(false);
      setFormData({ title: '', content: '', targetAudience: 'TODOS', isImportant: false });
      loadAnnouncements();
    } catch (err: any) {
      alert(err.message || 'Error al publicar comunicado');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Cartelera Digital y Comunicados
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Canal oficial de avisos institucionales, convocatorias y notas a la comunidad educativa.
          </p>
        </div>

        {hasRole('ADMINISTRADOR', 'DIRECTIVO', 'PRECEPTOR', 'PROFESOR') && (
          <button
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Publicar Comunicado</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Cargando comunicados...
          </div>
        ) : announcements.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            No hay comunicados publicados actualmente
          </div>
        ) : (
          announcements.map((item) => (
            <div
              key={item.id}
              className={`rounded-2xl p-6 shadow-xs border transition-all ${
                item.isImportant
                  ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {item.isImportant && (
                    <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                      <Pin className="w-3 h-3" />
                      <span>Importante</span>
                    </span>
                  )}
                  <Badge variant={item.targetAudience === 'TODOS' ? 'primary' : 'neutral'}>
                    Destino: {item.targetAudience}
                  </Badge>
                </div>
                <span className="text-xs text-slate-400 flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(item.createdAt).toLocaleDateString('es-AR')}</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                {item.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4 whitespace-pre-line">
                {item.content}
              </p>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>
                    Por: {item.author.name} {item.author.lastName} ({item.author.role || 'Directivo'})
                  </span>
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Publicar Nuevo Comunicado Institucional"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Título del Comunicado *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Reunión de Familias, Feriado Puente, Muestra Anual..."
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Destinatarios
            </label>
            <select
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
            >
              <option value="TODOS">Toda la Comunidad (Todos)</option>
              <option value="PROFESORES">Solo Docentes</option>
              <option value="ALUMNOS">Solo Alumnos</option>
              <option value="TUTORES">Solo Familias y Tutores</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Cuerpo del Mensaje *
            </label>
            <textarea
              rows={5}
              required
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Escriba el contenido del comunicado oficial..."
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isImportant"
              checked={formData.isImportant}
              onChange={(e) => setFormData({ ...formData, isImportant: e.target.checked })}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isImportant" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Fijar como aviso destacado / importante
            </label>
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
              Publicar Comunicado
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

