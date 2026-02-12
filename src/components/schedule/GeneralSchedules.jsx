import React, { useState, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, BarChart3, Filter } from 'lucide-react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, isSameMonth, isSameDay, addMonths, subMonths, parseISO, addDays, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState('gantt'); // 'gantt' o 'calendar'
  const [filterArea, setFilterArea] = useState('all');
  const [filterProject, setFilterProject] = useState('all');

  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list('-created_date')
  });

  const { data: allTasks = [] } = useQuery({
    queryKey: ['all-schedule-tasks'],
    queryFn: () => base44.entities.ScheduleTask.list('-start_date')
  });

  // Filtrar proyectos con tareas
  const projectsWithTasks = projects.filter(p => 
    allTasks.some(t => t.project_id === p.id)
  );

  // Filtrar tareas
  const filteredTasks = useMemo(() => {
    let filtered = allTasks;
    
    if (filterArea !== 'all') {
      filtered = filtered.filter(t => t.area === filterArea);
    }
    
    if (filterProject !== 'all') {
      filtered = filtered.filter(t => t.project_id === filterProject);
    }
    
    return filtered;
  }, [allTasks, filterArea, filterProject]);

  // Agrupar tareas por proyecto
  const tasksByProject = useMemo(() => {
    const grouped = {};
    filteredTasks.forEach(task => {
      if (!grouped[task.project_id]) {
        grouped[task.project_id] = [];
      }
      grouped[task.project_id].push(task);
    });
    return grouped;
  }, [filteredTasks]);

  // Estadísticas por área
  const areaStats = useMemo(() => {
    const stats = {};
    allTasks.forEach(task => {
      if (!stats[task.area]) {
        stats[task.area] = { count: 0, totalDuration: 0, projects: new Set() };
      }
      stats[task.area].count++;
      stats[task.area].totalDuration += task.duration || 0;
      stats[task.area].projects.add(task.project_id);
    });
    return Object.entries(stats).map(([area, data]) => ({
      area,
      ...data,
      projectCount: data.projects.size
    }));
  }, [allTasks]);

  // Calcular rango de fechas para el Gantt
  const dateRange = useMemo(() => {
    if (filteredTasks.length === 0) return { start: new Date(), end: addDays(new Date(), 30) };
    
    const dates = filteredTasks.flatMap(t => [
      parseISO(t.start_date),
      parseISO(t.end_date || t.start_date)
    ]);
    
    const minDate = new Date(Math.min(...dates));
    const maxDate = new Date(Math.max(...dates));
    
    return {
      start: startOfWeek(minDate, { locale: es }),
      end: endOfWeek(maxDate, { locale: es })
    };
  }, [filteredTasks]);

  const weeksInRange = useMemo(() => {
    return eachWeekOfInterval(
      { start: dateRange.start, end: dateRange.end },
      { locale: es }
    );
  }, [dateRange]);

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-[var(--border-secondary)] text-[var(--text-secondary)]">
            {projectsWithTasks.length} proyectos
          </Badge>
          <Badge variant="outline" className="border-[var(--border-secondary)] text-[var(--text-secondary)]">
            {filteredTasks.length} tareas
          </Badge>
        </div>

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
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)]">
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[var(--text-secondary)]" />
              <span className="text-sm font-medium text-[var(--text-primary)]">Filtros:</span>
            </div>
            
            <Select value={filterProject} onValueChange={setFilterProject}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Todos los proyectos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proyectos</SelectItem>
                {projectsWithTasks.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterArea} onValueChange={setFilterArea}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Todas las áreas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las áreas</SelectItem>
                {Object.entries(AREA_COLORS).map(([key, config]) => (
                  <SelectItem key={key} value={key}>{config.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(filterArea !== 'all' || filterProject !== 'all') && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  setFilterArea('all');
                  setFilterProject('all');
                }}
              >
                Limpiar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {projectsWithTasks.length === 0 ? (
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
              <CardContent>
                <div className="overflow-x-auto">
                  {/* Header con semanas */}
                  <div className="flex gap-2 mb-4 min-w-max">
                    <div className="w-64 flex-shrink-0" />
                    <div className="flex gap-1">
                      {weeksInRange.map((weekStart, idx) => (
                        <div key={idx} className="w-24 text-center">
                          <div className="text-xs font-medium text-[var(--text-secondary)]">
                            {format(weekStart, 'MMM d', { locale: es })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tareas agrupadas por proyecto */}
                  <div className="space-y-6">
                    {Object.entries(tasksByProject).map(([projectId, tasks]) => {
                      const project = projects.find(p => p.id === projectId);
                      if (!project) return null;

                      return (
                        <div key={projectId} className="border-l-4 border-[#FF1B7E] pl-4">
                          <Link 
                            to={`${createPageUrl('ProjectChecklist')}?id=${projectId}`}
                            className="text-sm font-semibold text-[var(--text-primary)] hover:text-[#FF1B7E] mb-3 block"
                          >
                            {project.name}
                          </Link>
                          
                          <div className="space-y-2">
                            {tasks.map(task => {
                              const startDate = parseISO(task.start_date);
                              const endDate = parseISO(task.end_date || task.start_date);
                              const totalDays = differenceInDays(dateRange.end, dateRange.start);
                              const startOffset = differenceInDays(startDate, dateRange.start);
                              const duration = differenceInDays(endDate, startDate) + 1;
                              const leftPercent = (startOffset / totalDays) * 100;
                              const widthPercent = (duration / totalDays) * 100;
                              const areaConfig = AREA_COLORS[task.area];

                              return (
                                <div key={task.id} className="flex gap-2 items-center min-w-max">
                                  <div className="w-64 flex-shrink-0">
                                    <div className="text-xs font-medium text-[var(--text-primary)] truncate">
                                      {task.name}
                                    </div>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge className={`${areaConfig?.bg} text-white border-0 text-[10px]`}>
                                        {areaConfig?.name}
                                      </Badge>
                                      <span className="text-[10px] text-[var(--text-secondary)]">
                                        {task.duration}d
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex-1 relative h-8">
                                    <div 
                                      className={`absolute h-6 ${areaConfig?.bg} rounded opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                                      style={{
                                        left: `${Math.max(0, leftPercent)}%`,
                                        width: `${widthPercent}%`
                                      }}
                                      title={`${task.name} - ${format(startDate, 'd MMM', { locale: es })} a ${format(endDate, 'd MMM', { locale: es })}`}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
                          
                          <div className="grid grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-xs text-[var(--text-secondary)]">Total tareas</p>
                              <p className="text-xl font-bold text-[var(--text-primary)]">{stat.count}</p>
                            </div>
                            <div>
                              <p className="text-xs text-[var(--text-secondary)]">Duración promedio</p>
                              <p className="text-xl font-bold text-[var(--text-primary)]">{Math.round(avgDuration)}d</p>
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
                    {projectsWithTasks.map(project => {
                      const projectTasks = allTasks.filter(t => t.project_id === project.id);
                      const areaBreakdown = {};
                      projectTasks.forEach(t => {
                        areaBreakdown[t.area] = (areaBreakdown[t.area] || 0) + 1;
                      });

                      return (
                        <Link 
                          key={project.id} 
                          to={`${createPageUrl('ProjectChecklist')}?id=${project.id}`}
                          className="block border border-[var(--border-primary)] rounded-lg p-3 hover:border-[#FF1B7E]/40 transition-colors"
                        >
                          <h4 className="font-medium text-[var(--text-primary)] mb-2">{project.name}</h4>
                          <div className="flex items-center gap-2 flex-wrap">
                            {Object.entries(areaBreakdown).map(([area, count]) => {
                              const areaConfig = AREA_COLORS[area];
                              return (
                                <Badge key={area} className={`${areaConfig?.bg} text-white border-0 text-xs`}>
                                  {areaConfig?.name}: {count}
                                </Badge>
                              );
                            })}
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