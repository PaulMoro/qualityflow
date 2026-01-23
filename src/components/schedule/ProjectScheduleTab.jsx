import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Download, RefreshCw, AlertCircle, Clock, Play, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import ScheduleGanttChart from './ScheduleGanttChart';
import EditSchedulePhaseModal from './EditSchedulePhaseModal';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';

export default function ProjectScheduleTab({ projectId }) {
  const [viewMode, setViewMode] = useState('weeks');
  const [selectedPhase, setSelectedPhase] = useState(null);
  const queryClient = useQueryClient();

  // Cargar proyecto
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const result = await base44.entities.Project.filter({ id: projectId });
      return result[0];
    }
  });

  // Cargar fases del cronograma
  const { data: phases = [], isLoading } = useQuery({
    queryKey: ['schedule-phases', projectId],
    queryFn: async () => {
      const result = await base44.entities.SchedulePhase.filter({ project_id: projectId });
      return result.sort((a, b) => a.order - b.order);
    }
  });

  // Inicializar cronograma desde plantilla
  const initScheduleMutation = useMutation({
    mutationFn: () => base44.functions.invoke('initScheduleFromTemplate', {
      projectId,
      startDate: project?.start_date || new Date().toISOString().split('T')[0]
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-phases', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      toast.success('✅ Cronograma inicializado correctamente');
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  // Exportar a Excel
  const handleExportExcel = () => {
    if (phases.length === 0) {
      toast.error('No hay fases para exportar');
      return;
    }

    try {
      // Header con metadata
      const header = [
        [`Proyecto: ${project?.name || 'Sin nombre'}`],
        [`Fecha Final: ${project?.target_date || '-'}`],
        [`Exportado: ${format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}`],
        []
      ];

      // Generar timeline
      const allDates = phases.flatMap(p => [new Date(p.start_date), new Date(p.end_date)]);
      const minDate = new Date(Math.min(...allDates));
      const maxDate = new Date(Math.max(...allDates));

      // Crear columnas de semanas
      const weeks = [];
      let currentDate = new Date(minDate);
      while (currentDate <= maxDate) {
        weeks.push(format(currentDate, "'S'w - MMM", { locale: es }));
        currentDate.setDate(currentDate.getDate() + 7);
      }

      const timelineRow = ['Fase', 'Inicio', 'Fin', 'Duración', 'Estado', ...weeks];

      // Datos de fases con barras visuales
      const rows = phases.map(phase => {
        const row = [
          phase.phase_name,
          phase.start_date,
          phase.end_date,
          `${phase.duration_days} días`,
          phase.status
        ];

        // Añadir marcas en timeline
        weeks.forEach((_, weekIdx) => {
          const weekStart = new Date(minDate);
          weekStart.setDate(weekStart.getDate() + (weekIdx * 7));
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);

          const phaseStart = new Date(phase.start_date);
          const phaseEnd = new Date(phase.end_date);

          const isInRange = (phaseStart <= weekEnd) && (phaseEnd >= weekStart);
          row.push(isInRange ? '█' : '');
        });

        return row;
      });

      // Combinar todo
      const data = [...header, timelineRow, ...rows];

      // Crear workbook
      const ws = XLSX.utils.aoa_to_sheet(data);

      // Aplicar estilos básicos
      ws['A1'].s = { font: { bold: true, sz: 14 } };
      ws['!cols'] = [
        { wch: 25 }, // Fase
        { wch: 12 }, // Inicio
        { wch: 12 }, // Fin
        { wch: 12 }, // Duración
        { wch: 12 }, // Estado
        ...weeks.map(() => ({ wch: 4 })) // Semanas
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Cronograma');

      XLSX.writeFile(wb, `cronograma_${project?.name || 'proyecto'}_${Date.now()}.xlsx`);
      toast.success('✅ Cronograma exportado a Excel');
    } catch (error) {
      console.error('Error exportando:', error);
      toast.error('Error al exportar cronograma');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-[#FF1B7E]" />
      </div>
    );
  }

  // Si no hay fases, mostrar botón de inicialización
  if (phases.length === 0) {
    return (
      <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)]">
        <CardContent className="pt-12 pb-12 text-center">
          <Calendar className="h-16 w-16 mx-auto text-[var(--text-tertiary)] mb-4" />
          <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
            Sin cronograma
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mb-6">
            Este proyecto no tiene un cronograma configurado. Inicialízalo desde una plantilla.
          </p>
          <Button
            onClick={() => initScheduleMutation.mutate()}
            disabled={initScheduleMutation.isPending}
            className="bg-[#FF1B7E] hover:bg-[#e6156e]"
          >
            <Play className="h-4 w-4 mr-2" />
            {initScheduleMutation.isPending ? 'Inicializando...' : 'Inicializar cronograma'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera con controles */}
      <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-[var(--text-primary)]">
              <Calendar className="h-5 w-5" />
              Cronograma del proyecto
            </CardTitle>
            <div className="flex items-center gap-2">
              {/* Selector de vista */}
              <div className="flex bg-[var(--bg-tertiary)] rounded-lg p-1">
                {['days', 'weeks', 'months'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1 text-xs rounded transition-all ${
                      viewMode === mode
                        ? 'bg-[#FF1B7E] text-white'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {mode === 'days' && 'Días'}
                    {mode === 'weeks' && 'Semanas'}
                    {mode === 'months' && 'Meses'}
                  </button>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
                className="bg-[var(--bg-secondary)] border-[var(--border-primary)]"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Información del proyecto */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)]">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)]">Duración total</div>
                <div className="text-lg font-semibold text-[var(--text-primary)]">
                  {phases.reduce((sum, p) => sum + p.duration_days, 0)} días
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)]">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)]">Fecha final</div>
                <div className="text-lg font-semibold text-[var(--text-primary)]">
                  {project?.target_date ? format(new Date(project.target_date), 'd MMM yyyy', { locale: es }) : '-'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)]">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)]">Fases</div>
                <div className="text-lg font-semibold text-[var(--text-primary)]">
                  {phases.length} fases
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gantt Chart */}
      <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)]">
        <CardContent className="p-0">
          <ScheduleGanttChart
            phases={phases}
            viewMode={viewMode}
            onPhaseClick={setSelectedPhase}
          />
        </CardContent>
      </Card>

      {/* Modal de edición */}
      {selectedPhase && (
        <EditSchedulePhaseModal
          phase={selectedPhase}
          projectId={projectId}
          onClose={() => setSelectedPhase(null)}
        />
      )}
    </div>
  );
}