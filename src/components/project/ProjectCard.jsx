import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, Users, ArrowRight, AlertTriangle, CheckCircle2, Clock, Copy, Pencil, MoreVertical, Trash2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { SITE_TYPE_CONFIG } from '../checklist/checklistTemplates';
import { useTechnologies } from '../checklist/useTechnologies';
import { motion } from 'framer-motion';

const STATUS_CONFIG = {
  draft: { label: 'Borrador', color: 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]' },
  in_progress: { label: 'En Progreso', color: 'bg-[#FF1B7E]/10 text-[#FF1B7E]' },
  review: { label: 'En Revisión', color: 'bg-[#FF1B7E]/20 text-[#FF1B7E]' },
  blocked: { label: 'Bloqueado', color: 'bg-[var(--text-primary)]/10 text-[var(--text-primary)]' },
  completed: { label: 'Completado', color: 'bg-[var(--text-primary)]/10 text-[var(--text-primary)]' }
};

const RISK_CONFIG = {
  low: { color: 'bg-[var(--text-primary)]', icon: CheckCircle2 },
  medium: { color: 'bg-[#FF1B7E]', icon: AlertTriangle },
  high: { color: 'bg-[var(--text-primary)]', icon: AlertTriangle }
};

export default function ProjectCard({ project, index, onEdit, onDuplicate, onDelete }) {
  const technologies = useTechnologies();
  const siteTypeConfig = SITE_TYPE_CONFIG[project.site_type];
  const techConfig = technologies[project.technology];
  const statusConfig = STATUS_CONFIG[project.status];
  const riskConfig = project.risk_level ? RISK_CONFIG[project.risk_level] : null;
  
  const daysRemaining = project.target_date 
    ? Math.ceil((new Date(project.target_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:shadow-md hover:border-[#FF1B7E]/20 transition-all duration-200 group h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className={`w-2 h-2 rounded-full ${techConfig?.color || 'bg-gray-400'} flex-shrink-0`} />
                <span className="text-xs text-[var(--text-secondary)] uppercase tracking-wide truncate">
                  {techConfig?.name || project.technology}
                </span>
              </div>
              <CardTitle className="text-base sm:text-lg font-semibold text-[var(--text-primary)] group-hover:text-[#FF1B7E] transition-colors duration-200 line-clamp-2">
                {project.name}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              <Badge className={`${statusConfig.color} border-0 font-medium`}>
                {statusConfig.label}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.preventDefault()}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => { e.preventDefault(); onEdit(project); }}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => { e.preventDefault(); onDuplicate(project); }}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => { e.preventDefault(); onDelete(project); }}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4 flex-1 flex flex-col">
          <div className="h-10">
            {project.description && (
              <p className="text-sm text-[var(--text-secondary)] line-clamp-2">{project.description}</p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            {project.has_conflicts && (
              <Badge className="bg-[#FF1B7E]/10 text-[#FF1B7E] border-0 text-xs font-medium">
                Conflictos
              </Badge>
            )}
            {project.critical_pending > 0 && (
              <Badge className="bg-[var(--text-primary)]/10 text-[var(--text-primary)] border-0 text-xs font-medium">
                {project.critical_pending} críticos
              </Badge>
            )}
          </div>
          
          {/* Progreso */}
          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[var(--text-secondary)] font-medium">Progreso</span>
              <span className="font-semibold text-[var(--text-primary)]">{project.completion_percentage?.toFixed(0) || 0}%</span>
            </div>
            <Progress value={project.completion_percentage || 0} className="h-2.5 bg-[var(--bg-tertiary)] [&>div]:bg-[#FF1B7E] rounded-full" />
          </div>
          
          {/* Fechas y equipo */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-[var(--text-secondary)] mb-2">
            <div className="flex items-center gap-3 flex-wrap">
              {project.target_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span className="whitespace-nowrap">{format(new Date(project.target_date), "d MMM", { locale: es })}</span>
                  {daysRemaining !== null && (
                    <Badge 
                      variant="outline" 
                      className={`ml-1 text-xs whitespace-nowrap ${daysRemaining < 0 ? 'text-[#FF1B7E] border-[#FF1B7E]/40' : daysRemaining < 3 ? 'text-[#FF1B7E] border-[#FF1B7E]/40' : 'text-[var(--text-secondary)] border-[var(--border-secondary)]'}`}
                    >
                      {daysRemaining < 0 ? `${Math.abs(daysRemaining)}d vencido` : `${daysRemaining}d`}
                    </Badge>
                  )}
                </div>
              )}
              {project.team_members?.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3 flex-shrink-0" />
                  <span>{project.team_members.length}</span>
                </div>
              )}
            </div>
            
            {riskConfig && (
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${riskConfig.color}`} />
                <span className="capitalize text-[var(--text-secondary)]">{project.risk_level}</span>
              </div>
            )}
          </div>
          
          <div className="mt-auto pt-4">
            <Link to={createPageUrl(`ProjectChecklist?id=${project.id}`)}>
              <Button className="w-full group-hover:shadow-md transition-all">
                Ver Proyecto
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}