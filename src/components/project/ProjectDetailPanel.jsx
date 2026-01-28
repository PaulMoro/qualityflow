import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { X, ExternalLink, Calendar, Users, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { createPageUrl } from '../../utils';

export default function ProjectDetailPanel({ projectId, onClose }) {
  const { data: project, isLoading } = useQuery({
    queryKey: ['project-detail', projectId],
    queryFn: async () => {
      return await base44.entities.Project.get(projectId);
    },
    enabled: !!projectId
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['project-tasks', projectId],
    queryFn: async () => {
      const allTasks = await base44.entities.Task.list();
      return allTasks.filter(t => t.project_id === projectId);
    },
    enabled: !!projectId
  });

  const { data: checklistItems = [] } = useQuery({
    queryKey: ['project-checklist', projectId],
    queryFn: async () => {
      const items = await base44.entities.ChecklistItem.filter({ project_id: projectId });
      return items;
    },
    enabled: !!projectId
  });

  if (!projectId) return null;

  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    review: 'bg-yellow-100 text-yellow-700',
    blocked: 'bg-red-100 text-red-700',
    completed: 'bg-green-100 text-green-700'
  };

  const statusLabels = {
    draft: 'Borrador',
    in_progress: 'En Progreso',
    review: 'En Revisión',
    blocked: 'Bloqueado',
    completed: 'Completado'
  };

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending' || t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length
  };

  const checklistStats = {
    total: checklistItems.length,
    completed: checklistItems.filter(i => i.status === 'completed').length,
    pending: checklistItems.filter(i => i.status === 'pending').length,
    critical: checklistItems.filter(i => i.weight === 'critical' && i.status !== 'completed').length
  };

  const goToProject = () => {
    window.location.href = createPageUrl('ProjectChecklist') + `?project=${projectId}`;
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-full sm:w-[600px] bg-[var(--bg-secondary)] shadow-2xl z-50 overflow-y-auto border-l border-[var(--border-primary)]">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--bg-secondary)] border-b border-[var(--border-primary)] px-6 py-4 z-10">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[var(--text-primary)] mb-2">
                {isLoading ? 'Cargando...' : project?.name}
              </h2>
              {project && (
                <Badge className={statusColors[project.status]}>
                  {statusLabels[project.status]}
                </Badge>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF1B7E]"></div>
          </div>
        ) : project ? (
          <div className="p-6 space-y-6">
            {/* Descripción */}
            {project.description && (
              <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Descripción</h3>
                <p className="text-[var(--text-primary)]">{project.description}</p>
              </div>
            )}

            {/* Info general */}
            <div className="grid grid-cols-2 gap-4">
              {project.project_type && (
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Tipo</h3>
                  <p className="text-[var(--text-primary)] capitalize">{project.project_type}</p>
                </div>
              )}
              {project.technology && (
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Tecnología</h3>
                  <p className="text-[var(--text-primary)] capitalize">{project.technology}</p>
                </div>
              )}
              {project.start_date && (
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Inicio</h3>
                  <p className="text-[var(--text-primary)] flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(project.start_date), "d 'de' MMM, yyyy", { locale: es })}
                  </p>
                </div>
              )}
              {project.target_date && (
                <div>
                  <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">Objetivo</h3>
                  <p className="text-[var(--text-primary)] flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(project.target_date), "d 'de' MMM, yyyy", { locale: es })}
                  </p>
                </div>
              )}
            </div>

            {/* Estadísticas de tareas */}
            <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Tareas
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Total</span>
                  <span className="font-semibold text-[var(--text-primary)]">{taskStats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Pendientes</span>
                  <span className="font-semibold text-orange-600">{taskStats.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">En Progreso</span>
                  <span className="font-semibold text-blue-600">{taskStats.inProgress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Completadas</span>
                  <span className="font-semibold text-green-600">{taskStats.completed}</span>
                </div>
              </div>
            </div>

            {/* Estadísticas de checklist */}
            <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
              <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Checklist
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Total</span>
                  <span className="font-semibold text-[var(--text-primary)]">{checklistStats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Pendientes</span>
                  <span className="font-semibold text-orange-600">{checklistStats.pending}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[var(--text-secondary)]">Completados</span>
                  <span className="font-semibold text-green-600">{checklistStats.completed}</span>
                </div>
                {checklistStats.critical > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--text-secondary)]">Críticos</span>
                    <span className="font-semibold text-red-600">{checklistStats.critical}</span>
                  </div>
                )}
              </div>
              {checklistStats.total > 0 && (
                <div className="mt-3 pt-3 border-t border-[var(--border-primary)]">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-[var(--text-secondary)]">Progreso</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {Math.round((checklistStats.completed / checklistStats.total) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-[var(--bg-primary)] rounded-full h-2">
                    <div 
                      className="bg-[#FF1B7E] h-2 rounded-full transition-all"
                      style={{ width: `${(checklistStats.completed / checklistStats.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Áreas aplicables */}
            {project.applicable_areas && project.applicable_areas.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-2">Áreas</h3>
                <div className="flex flex-wrap gap-2">
                  {project.applicable_areas.map(area => (
                    <Badge key={area} variant="outline" className="capitalize">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Botón para ir al proyecto completo */}
            <Button
              onClick={goToProject}
              className="w-full bg-[#FF1B7E] hover:bg-[#e6156e] text-white"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Proyecto Completo
            </Button>
          </div>
        ) : (
          <div className="p-6 text-center text-[var(--text-secondary)]">
            No se pudo cargar el proyecto
          </div>
        )}
      </div>
    </>
  );
}