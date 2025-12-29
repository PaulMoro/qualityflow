import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  LayoutDashboard, 
  FolderKanban, 
  Users, 
  Calendar,
  Settings,
  UserCircle,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

const MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    page: 'Dashboard'
  },
  {
    id: 'projects',
    label: 'Proyectos',
    icon: FolderKanban,
    page: 'Dashboard',
    section: 'projects'
  },
  {
    id: 'resources',
    label: 'Ocupación de Recursos',
    icon: Users,
    page: 'Dashboard',
    section: 'resources'
  },
  {
    id: 'schedules',
    label: 'Cronogramas Generales',
    icon: Calendar,
    page: 'Dashboard',
    section: 'schedules'
  },
  {
    id: 'team',
    label: 'Gestión de Equipo',
    icon: UserCircle,
    page: 'Dashboard',
    admin: true
  },
  {
    id: 'reports',
    label: 'Reportes',
    icon: BarChart3,
    page: 'Dashboard',
    section: 'reports'
  }
];

export default function Sidebar({ currentSection, onSectionChange }) {
  const location = useLocation();
  
  return (
    <div className="w-64 bg-[#1a1a1a] border-r border-[#2a2a2a] min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-[#2a2a2a]">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FF1B7E] rounded-lg flex items-center justify-center">
            <LayoutDashboard className="h-5 w-5 text-white" />
          </div>
          Control QA
        </h1>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4 space-y-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = item.section ? currentSection === item.section : currentSection === 'dashboard';
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.section || 'dashboard')}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                isActive 
                  ? "bg-[#FF1B7E] text-white shadow-lg shadow-[#FF1B7E]/20" 
                  : "text-gray-400 hover:text-white hover:bg-[#2a2a2a]"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[#2a2a2a]">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-[#2a2a2a] transition-all">
          <Settings className="h-5 w-5" />
          <span>Configuración</span>
        </button>
      </div>
    </div>
  );
}