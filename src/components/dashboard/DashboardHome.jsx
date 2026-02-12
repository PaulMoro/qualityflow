import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { 
  FolderKanban, 
  Users, 
  Calendar,
  BarChart3,
  ArrowRight,
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

const QUICK_ACCESS = [
  {
    id: 'projects',
    title: 'Proyectos',
    description: 'Gestiona y visualiza todos los proyectos',
    icon: FolderKanban,
    color: 'bg-[#FF1B7E]',
    section: 'projects'
  },
  {
    id: 'resources',
    title: 'Ocupación de Recursos',
    description: 'Revisa la carga de trabajo del equipo',
    icon: Users,
    color: 'bg-[var(--text-primary)]',
    section: 'resources'
  },
  {
    id: 'schedules',
    title: 'Cronogramas Generales',
    description: 'Visualiza los cronogramas de proyectos',
    icon: Calendar,
    color: 'bg-[#FF1B7E]',
    section: 'schedules'
  },
  {
    id: 'reports',
    title: 'Reportes',
    description: 'Genera reportes y análisis',
    icon: BarChart3,
    color: 'bg-[var(--text-primary)]',
    section: 'reports'
  }
];

export default function DashboardHome({ onNavigate }) {
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => base44.entities.Project.list()
  });

  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'in_progress').length,
    blocked: projects.filter(p => p.status === 'blocked').length,
    avgCompletion: projects.length > 0 
      ? projects.reduce((acc, p) => acc + (p.completion_percentage || 0), 0) / projects.length 
      : 0
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#FF1B7E] to-[#e6156e] rounded-2xl p-6 sm:p-8 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Project Manager</h1>
        <p className="text-sm sm:text-base text-white/80">Gestiona tus proyectos y recursos de forma eficiente</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:border-[#FF1B7E] transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Total Proyectos</p>
                <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">{stats.total}</p>
              </div>
              <div className="p-3 bg-[#FF1B7E]/20 rounded-lg">
                <FolderKanban className="h-6 w-6 text-[#FF1B7E]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:border-[#FF1B7E] transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">En Progreso</p>
                <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">{stats.inProgress}</p>
              </div>
              <div className="p-3 bg-[var(--text-primary)]/20 rounded-lg">
                <TrendingUp className="h-6 w-6 text-[var(--text-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:border-[#FF1B7E] transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Bloqueados</p>
                <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">{stats.blocked}</p>
              </div>
              <div className="p-3 bg-[#FF1B7E]/20 rounded-lg">
                <AlertCircle className="h-6 w-6 text-[#FF1B7E]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:border-[#FF1B7E] transition-all">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--text-secondary)]">Progreso Promedio</p>
                <p className="text-3xl font-bold text-[var(--text-primary)] mt-2">{stats.avgCompletion.toFixed(0)}%</p>
              </div>
              <div className="p-3 bg-[var(--text-primary)]/20 rounded-lg">
                <Clock className="h-6 w-6 text-[var(--text-primary)]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Acceso Rápido</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {QUICK_ACCESS.map((item) => {
            const Icon = item.icon;
            return (
              <Card 
                key={item.id}
                onClick={() => onNavigate(item.section)}
                className="bg-[var(--bg-secondary)] border-[var(--border-primary)] hover:border-[#FF1B7E] cursor-pointer transition-all group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className={`${item.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{item.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)]">{item.description}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-[var(--text-secondary)] group-hover:text-[#FF1B7E] transition-colors" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}