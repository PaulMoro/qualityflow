import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarIcon, BarChart3, Filter, Download, TrendingUp, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ScheduleGanttChart from './ScheduleGanttChart';
import * as XLSX from 'xlsx';
import { toast } from 'sonner';

const AREA_COLORS = {
  creativity: { bg: 'bg-purple-500', name: 'Creatividad' },
  software: { bg: 'bg-blue-500', name: 'Software' },
  seo: { bg: 'bg-green-500', name: 'SEO' },
  marketing: { bg: 'bg-orange-500', name: 'Marketing' },
  paid: { bg: 'bg-red-500', name: 'Paid' },
  social: { bg: 'bg-pink-500', name: 'Social' },
  product: { bg: 'bg-cyan-500', name: 'Producto' },
  qa: { bg: 'bg-yellow-500', name: 'QA' }
};

export default function GeneralSchedules() {
  const [viewMode, setViewMode] = useState('gantt'); // 'gantt' o 'stats'
  const [ganttViewMode, setGanttViewMode] = useState('weeks'); // 'weeks' o 'months'
  const [filterProject, setFilterProject] = useState('all');

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date')
  });

  // Cargar fases del cronograma automatizado
  const { data: allPhases = [] } = useQuery({
    queryKey: ['all-schedule-phases'],
    queryFn: () => base44.entities.SchedulePhase.list('-start_date')
  });

  // Filtrar proyectos con cronograma
  const projectsWithSchedule = projects.filter(p => 
    allPhases.some(phase => phase.project_id === p.id)
  );

  // Enriquecer fases con nombre de proyecto
  const enrichedPhases = useMemo(() => {
    return allPhases.map(phase => {
      const project = projects.find(p => p.id === phase.project_id);
      return {
        ...phase,
        project_name: project?.name || 'Sin nombre'
      };
    });
  }, [allPhases, projects]);

  // Filtrar fases
  const filteredPhases = useMemo(() => {
    if (filterProject === 'all') return enrichedPhases;
    return enrichedPhases.filter(p => p.project_id === filterProject);
  }, [enrichedPhases, filterProject]);

  // Estadísticas
  const stats = useMemo(() => {
    return {
      totalProjects: projectsWithSchedule.length,
      totalPhases: allPhases.length,
      inProgress: allPhases.filter(p => p.status === 'in_progress').length,
      delayed: allPhases.filter(p => p.status === 'delayed').length,
      completed: allPhases.filter(p => p.status === 'completed').length
    };
  }, [allPhases, projectsWithSchedule]);

  // Estadísticas por área
  const areaStats = useMemo(() => {
    const stats = {};
    allPhases.forEach(phase => {
      const area = phase.responsible_area;
      if (!area) return;
      
      if (!stats[area]) {
        stats[area] = { count: 0, totalDuration: 0, projects: new Set(), inProgress: 0, delayed: 0 };
      }
      stats[area].count++;
      stats[area].totalDuration += phase.duration_days || 0;
      stats[area].projects.add(phase.project_id);
      if (phase.status === 'in_progress') stats[area].inProgress++;
      if (phase.status === 'delayed') stats[area].delayed++;
    });
    
    return Object.entries(stats).map(([area, data]) => ({
      area,
      ...data,
      projectCount: data.projects.size
    }));
  }, [allPhases]);

  // Exportar a Excel
  const handleExportExcel = () => {
    if (filteredPhases.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    try {
      const header = [
        ['Cronograma Global de Proyectos'],
        [`Exportado: ${format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}`],
        [`Total proyectos: ${projectsWithSchedule.length}`],
        []
      ];

      const dataRows = [
        ['Proyecto', 'Fase', 'Inicio', 'Fin', 'Duración', 'Estado', 'Área', 'Responsable']
      ];

      projectsWithSchedule.forEach(project => {
        const projectPhases = filteredPhases.filter(p => p.project_id === project.id);
        
        projectPhases.forEach((phase, idx) => {
          dataRows.push([
            idx === 0 ? project.name : '',
            phase.phase_name,
            phase.start_date,
            phase.end_date,
            `${phase.duration_days} días`,
            phase.status,
            AREA_COLORS[phase.responsible_area]?.name || '-',
            phase.responsible_email || '-'
          ]);
        });

        dataRows.push([]);
      });

      const data = [...header, ...dataRows];
      const ws = XLSX.utils.aoa_to_sheet(data);

      ws['A1'].s = { font: { bold: true, sz: 16 } };
      ws['!cols'] = [
        { wch: 30 },
        { wch: 25 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 12 },
        { wch: 20 },
        { wch: 30 }
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Cronograma Global');

      XLSX.writeFile(wb, `cronograma_global_${Date.now()}.xlsx`);
      toast.success('✅ Cronograma exportado');
    } catch (error) {
      console.error('Error exportando:', error);
      toast.error('Error al exportar');
    }
  };

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)]">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)]">Proyectos</div>
                <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalProjects}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)]">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)]">En progreso</div>
                <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.inProgress}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)]">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)]">Retrasadas</div>
                <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.delayed}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)]">
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CalendarIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-xs text-[var(--text-secondary)]">Completadas</div>
                <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.completed}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Header con controles */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Select value={viewMode} onValueChange={setViewMode}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gantt">Vista Gantt</SelectItem>
              <SelectItem value="stats">Estadísticas</SelectItem>
            </SelectContent>
          </Select>

          {viewMode === 'gantt' && (
            <div className="flex bg-[var(--bg-tertiary)] rounded-lg p-1">
              {['weeks', 'months'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setGanttViewMode(mode)}
                  className={`px-3 py-1 text-xs rounded transition-all ${
                    ganttViewMode === mode
                      ? 'bg-[#FF1B7E] text-white'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {mode === 'weeks' && 'Semanas'}
                  {mode === 'months' && 'Meses'}
                </button>
              ))}
            </div>
          )}
        </div>

        <Button
          onClick={handleExportExcel}
          variant="outline"
          size="sm"
          className="bg-[var(--bg-secondary)] border-[var(--border-primary)]"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar Excel
        </Button>
      </div>

      {/* Filtros */}
      <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)]">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[var(--text-secondary)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">Filtro:</span>
            </div>
            
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Todos los proyectos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proyectos</SelectItem>
                {projectsWithSchedule.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {filterProject !== 'all' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setFilterProject('all')}
              >
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {projectsWithSchedule.length === 0 ? (
        <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)]">
          <CardContent className="py-12 text-center">
            <CalendarIcon className="h-12 w-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <p className="text-[var(--text-secondary)]">No hay proyectos con cronogramas definidos</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {viewMode === 'gantt' ? (
            <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)]">
              <CardHeader>
                <CardTitle className="text-base text-[var(--text-primary)]">Cronograma General</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScheduleGanttChart
                  phases={filteredPhases}
                  viewMode={ganttViewMode}
                  isCompact={true}
                  showProjectColumn={true}
                  onPhaseClick={(phase) => {
                    window.location.href = createPageUrl('ProjectChecklist') + `?id=${phase.project_id}`;
                  }}
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Estadísticas por área */}
              <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)]">
                <CardHeader>
                  <CardTitle className="text-base text-[var(--text-primary)]">
                    <BarChart3 className="h-4 w-4 inline mr-2" />
                    Estadísticas por Área
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {areaStats.map(stat => {
                      const areaConfig = AREA_COLORS[stat.area];
                      const avgDuration = stat.totalDuration / stat.count;
                      
                      return (
                        <div key={stat.area} className="border border-[var(--border-primary)] rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={`${areaConfig?.bg} text-white border-0`}>
                              {areaConfig?.name}
                            </Badge>
                            <span className="text-xs text-[var(--text-secondary)]">
                              {stat.projectCount} proyecto{stat.projectCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-4 mt-3">
                            <div>
                              <p className="text-xs text-[var(--text-secondary)]">Total fases</p>
                              <p className="text-xl font-bold text-[var(--text-primary)]">{stat.count}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[var(--text-secondary)]">En progreso</p>
                              <p className="text-xl font-bold text-blue-500">{stat.inProgress}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[var(--text-secondary)]">Retrasadas</p>
                              <p className="text-xl font-bold text-red-500">{stat.delayed}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3">
                            <p className="text-xs text-[var(--text-secondary)] mb-1">Total de días</p>
                            <div className="bg-[var(--bg-tertiary)] rounded-full h-2">
                              <div 
                                className={`${areaConfig?.bg} h-2 rounded-full`}
                                style={{ width: `${Math.min(100, (stat.totalDuration / Math.max(...areaStats.map(s => s.totalDuration))) * 100)}%` }}
                              />
                            </div>
                            <p className="text-xs font-medium text-[var(--text-primary)] mt-1">{stat.totalDuration} días</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Proyectos con cronogramas */}
              <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)]">
                <CardHeader>
                  <CardTitle className="text-base text-[var(--text-primary)]">Proyectos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {projectsWithSchedule.map(project => {
                      const projectPhases = allPhases.filter(p => p.project_id === project.id);
                      const phasesByStatus = {
                        planned: projectPhases.filter(p => p.status === 'planned').length,
                        in_progress: projectPhases.filter(p => p.status === 'in_progress').length,
                        completed: projectPhases.filter(p => p.status === 'completed').length,
                        delayed: projectPhases.filter(p => p.status === 'delayed').length
                      };

                      return (
                        <Link 
                          key={project.id} 
                          to={`${createPageUrl('ProjectChecklist')}?id=${project.id}`}
                          className="block border border-[var(--border-primary)] rounded-lg p-3 hover:border-[#FF1B7E]/40 transition-colors"
                        >
                          <h4 className="font-medium text-[var(--text-primary)] mb-2">{project.name}</h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            {phasesByStatus.in_progress > 0 && (
                              <Badge className="bg-blue-500 text-white border-0 text-xs">
                                {phasesByStatus.in_progress} en progreso
                              </Badge>
                            )}
                            {phasesByStatus.delayed > 0 && (
                              <Badge className="bg-red-500 text-white border-0 text-xs">
                                {phasesByStatus.delayed} retrasadas
                              </Badge>
                            )}
                            {phasesByStatus.completed > 0 && (
                              <Badge className="bg-green-500 text-white border-0 text-xs">
                                {phasesByStatus.completed} completadas
                              </Badge>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}