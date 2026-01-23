import React, { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, eachWeekOfInterval, startOfMonth, endOfMonth, eachMonthOfInterval, isSameDay, isWithinInterval, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const COLOR_MAP = {
  planned: 'bg-gray-400',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  delayed: 'bg-red-500'
};

/**
 * Componente reutilizable de Gantt Chart
 * Mantiene consistencia visual entre vista de proyecto y global
 */
export default function ScheduleGanttChart({ 
  phases = [], 
  viewMode = 'weeks', // 'days', 'weeks', 'months'
  isCompact = false,
  onPhaseClick = null,
  showProjectColumn = false // Para vista global
}) {
  
  // Calcular rango de fechas
  const dateRange = useMemo(() => {
    if (phases.length === 0) return null;

    const allDates = phases.flatMap(p => [
      parseISO(p.start_date),
      parseISO(p.end_date)
    ]);

    const minDate = new Date(Math.min(...allDates));
    const maxDate = new Date(Math.max(...allDates));

    return { minDate, maxDate };
  }, [phases]);

  // Generar timeline según viewMode
  const timeline = useMemo(() => {
    if (!dateRange) return [];

    const { minDate, maxDate } = dateRange;
    const today = new Date();

    switch (viewMode) {
      case 'days':
        return eachDayOfInterval({ start: minDate, end: maxDate }).map(date => ({
          date,
          label: format(date, 'd', { locale: es }),
          subLabel: format(date, 'MMM', { locale: es }),
          isToday: isSameDay(date, today),
          isWeekend: date.getDay() === 0 || date.getDay() === 6
        }));

      case 'weeks':
        const weeks = eachWeekOfInterval(
          { start: minDate, end: maxDate },
          { weekStartsOn: 1 }
        );
        return weeks.map(weekStart => {
          const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
          const isCurrentWeek = isWithinInterval(today, { start: weekStart, end: weekEnd });
          
          return {
            date: weekStart,
            label: `S${format(weekStart, 'w', { locale: es })}`,
            subLabel: format(weekStart, 'MMM', { locale: es }),
            isToday: isCurrentWeek,
            range: { start: weekStart, end: weekEnd }
          };
        });

      case 'months':
        return eachMonthOfInterval({ start: minDate, end: maxDate }).map(monthStart => ({
          date: monthStart,
          label: format(monthStart, 'MMM', { locale: es }),
          subLabel: format(monthStart, 'yyyy', { locale: es }),
          isToday: today.getMonth() === monthStart.getMonth() && today.getFullYear() === monthStart.getFullYear(),
          range: { start: startOfMonth(monthStart), end: endOfMonth(monthStart) }
        }));

      default:
        return [];
    }
  }, [dateRange, viewMode]);

  // Calcular posición de barras
  const calculateBarPosition = (phase) => {
    if (!dateRange || timeline.length === 0) return { left: 0, width: 0 };

    const phaseStart = parseISO(phase.start_date);
    const phaseEnd = parseISO(phase.end_date);

    const totalWidth = timeline.length;
    let startIndex = 0;
    let endIndex = 0;

    if (viewMode === 'days') {
      startIndex = timeline.findIndex(t => isSameDay(t.date, phaseStart));
      endIndex = timeline.findIndex(t => isSameDay(t.date, phaseEnd));
    } else {
      // Para weeks y months, encontrar el periodo que contiene la fecha
      startIndex = timeline.findIndex(t => 
        t.range && isWithinInterval(phaseStart, t.range)
      );
      endIndex = timeline.findIndex(t => 
        t.range && isWithinInterval(phaseEnd, t.range)
      );
    }

    if (startIndex === -1) startIndex = 0;
    if (endIndex === -1) endIndex = timeline.length - 1;

    const left = (startIndex / totalWidth) * 100;
    const width = ((endIndex - startIndex + 1) / totalWidth) * 100;

    return { left, width };
  };

  if (!dateRange || timeline.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-secondary)]">
        No hay fases en el cronograma
      </div>
    );
  }

  const cellWidth = isCompact ? 'w-12' : 'w-16';
  const rowHeight = isCompact ? 'h-10' : 'h-14';

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full">
        {/* Header de timeline */}
        <div className="flex border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)] sticky top-0 z-10">
          <div className={`flex-shrink-0 ${isCompact ? 'w-48' : 'w-64'} px-4 py-3 font-semibold text-[var(--text-primary)] border-r border-[var(--border-primary)]`}>
            Fase
          </div>
          {showProjectColumn && (
            <div className={`flex-shrink-0 ${isCompact ? 'w-32' : 'w-48'} px-4 py-3 font-semibold text-[var(--text-primary)] border-r border-[var(--border-primary)]`}>
              Proyecto
            </div>
          )}
          <div className="flex flex-1">
            {timeline.map((period, idx) => (
              <div
                key={idx}
                className={`${cellWidth} flex-shrink-0 text-center py-3 border-r border-[var(--border-primary)] ${
                  period.isToday ? 'bg-yellow-100 dark:bg-yellow-900/20' : ''
                }`}
              >
                <div className={`text-xs font-semibold text-[var(--text-primary)] ${period.isToday ? 'text-yellow-700 dark:text-yellow-400' : ''}`}>
                  {period.label}
                </div>
                <div className="text-[10px] text-[var(--text-tertiary)]">
                  {period.subLabel}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filas de fases */}
        {phases.map((phase, phaseIdx) => {
          const barPos = calculateBarPosition(phase);
          const statusColor = COLOR_MAP[phase.status] || 'bg-gray-400';

          return (
            <div
              key={phase.id}
              className={`flex border-b border-[var(--border-primary)] hover:bg-[var(--bg-hover)] ${
                onPhaseClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onPhaseClick?.(phase)}
            >
              <div className={`flex-shrink-0 ${isCompact ? 'w-48' : 'w-64'} px-4 py-3 border-r border-[var(--border-primary)] ${rowHeight} flex items-center`}>
                <div className="flex-1">
                  <div className="font-medium text-sm text-[var(--text-primary)]">
                    {phase.phase_name}
                  </div>
                  {!isCompact && (
                    <div className="text-xs text-[var(--text-secondary)] mt-1">
                      {phase.duration_days} días
                    </div>
                  )}
                </div>
                <Badge className={`${statusColor} text-white text-[10px] ml-2`}>
                  {phase.status === 'planned' && 'Planeado'}
                  {phase.status === 'in_progress' && 'En curso'}
                  {phase.status === 'completed' && 'Completo'}
                  {phase.status === 'delayed' && 'Retrasado'}
                </Badge>
              </div>

              {showProjectColumn && (
                <div className={`flex-shrink-0 ${isCompact ? 'w-32' : 'w-48'} px-4 py-3 border-r border-[var(--border-primary)] ${rowHeight} flex items-center`}>
                  <div className="text-sm text-[var(--text-secondary)] truncate">
                    {phase.project_name || '-'}
                  </div>
                </div>
              )}

              <div className="flex-1 relative py-3">
                <div className="absolute inset-0 flex">
                  {timeline.map((period, idx) => (
                    <div
                      key={idx}
                      className={`${cellWidth} flex-shrink-0 border-r border-[var(--border-secondary)] ${
                        period.isWeekend ? 'bg-gray-50 dark:bg-gray-900/20' : ''
                      } ${
                        period.isToday ? 'bg-yellow-50 dark:bg-yellow-900/10' : ''
                      }`}
                    />
                  ))}
                </div>
                
                {/* Barra de gantt */}
                <div
                  className={`absolute ${statusColor} rounded-lg shadow-sm opacity-90 hover:opacity-100 transition-opacity`}
                  style={{
                    left: `${barPos.left}%`,
                    width: `${barPos.width}%`,
                    top: '25%',
                    height: '50%',
                    minWidth: '8px'
                  }}
                  title={`${phase.phase_name}: ${phase.start_date} - ${phase.end_date}`}
                >
                  {!isCompact && barPos.width > 5 && (
                    <div className="px-2 py-1 text-white text-xs font-medium truncate">
                      {phase.phase_name}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}