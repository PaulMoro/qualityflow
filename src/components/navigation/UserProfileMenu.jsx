import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  User, 
  LogOut, 
  Settings, 
  Briefcase, 
  Users,
  FolderKanban,
  ChevronDown
} from 'lucide-react';
import { ROLE_CONFIG } from '../checklist/checklistTemplates';

export default function UserProfileMenu() {
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  
  useEffect(() => {
    const loadUser = async () => {
      const u = await base44.auth.me();
      setUser(u);
    };
    loadUser();
  }, []);

  const { data: teamMember } = useQuery({
    queryKey: ['team-member', user?.email],
    queryFn: () => base44.entities.TeamMember.filter({ user_email: user?.email }).then(r => r[0]),
    enabled: !!user?.email
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['user-projects', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      const allProjects = await base44.entities.Project.list();
      return allProjects.filter(p => 
        p.team_members?.includes(user.email) ||
        p.product_owner_email === user.email ||
        Object.values(p.area_responsibles || {}).includes(user.email) ||
        Object.values(p.phase_responsibles || {}).flat().includes(user.email)
      );
    },
    enabled: !!user?.email
  });

  const { data: leader } = useQuery({
    queryKey: ['leader', teamMember?.role],
    queryFn: async () => {
      if (!teamMember?.role) return null;
      const leaderRole = `leader_${teamMember.role.replace('leader_', '')}`;
      const leaders = await base44.entities.TeamMember.filter({ role: leaderRole, is_active: true });
      return leaders[0];
    },
    enabled: !!teamMember?.role && !teamMember?.role.startsWith('leader_')
  });

  if (!user) return null;

  const roleConfig = ROLE_CONFIG[teamMember?.role] || {};
  const initials = user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || user.email[0].toUpperCase();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-3 hover:bg-[#2a2a2a]">
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user.full_name || user.email}</p>
                {teamMember && (
                  <p className="text-xs text-gray-400">{roleConfig.name || teamMember.role}</p>
                )}
              </div>
              <Avatar className="h-10 w-10 bg-[#FF1B7E]">
                <AvatarFallback className="bg-[#FF1B7E] text-white font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 bg-[#1a1a1a] border-[#2a2a2a]">
          <DropdownMenuLabel className="text-white">Mi Cuenta</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-[#2a2a2a]" />
          <DropdownMenuItem onClick={() => setShowProfile(true)} className="text-gray-300 hover:text-white hover:bg-[#2a2a2a]">
            <User className="mr-2 h-4 w-4" />
            Ver Perfil Completo
          </DropdownMenuItem>
          <DropdownMenuItem className="text-gray-300 hover:text-white hover:bg-[#2a2a2a]">
            <Settings className="mr-2 h-4 w-4" />
            Configuración
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-[#2a2a2a]" />
          <DropdownMenuItem 
            onClick={() => base44.auth.logout()}
            className="text-red-400 hover:text-red-300 hover:bg-[#2a2a2a]"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Cerrar Sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="bg-[#1a1a1a] border-[#2a2a2a] text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white text-xl">Mi Perfil</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Header con avatar */}
            <div className="flex items-center gap-6 p-6 bg-[#0a0a0a] rounded-xl border border-[#2a2a2a]">
              <Avatar className="h-20 w-20 bg-[#FF1B7E]">
                <AvatarFallback className="bg-[#FF1B7E] text-white text-2xl font-bold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white">{user.full_name || user.email}</h2>
                <p className="text-gray-400">{user.email}</p>
                {teamMember && (
                  <Badge className={`mt-2 ${roleConfig.color} text-white`}>
                    {roleConfig.name || teamMember.role}
                  </Badge>
                )}
              </div>
            </div>

            {/* Información del rol */}
            {teamMember && (
              <Card className="p-6 bg-[#0a0a0a] border-[#2a2a2a]">
                <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-[#FF1B7E]" />
                  Información del Cargo
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-400">Rol:</span>
                    <span className="text-white ml-2 font-medium">{roleConfig.name || teamMember.role}</span>
                  </div>
                  {leader && (
                    <div>
                      <span className="text-gray-400">Líder de Área:</span>
                      <span className="text-white ml-2 font-medium">
                        {leader.display_name || leader.user_email}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-400">Área que domina:</span>
                    <span className="text-white ml-2 font-medium">
                      {roleConfig.name?.replace('Líder de ', '') || teamMember.role}
                    </span>
                  </div>
                  {roleConfig.canComplete && (
                    <div>
                      <span className="text-gray-400">Fases que puede completar:</span>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {roleConfig.canComplete.map(phase => (
                          <Badge key={phase} variant="outline" className="text-xs border-gray-600 text-gray-300">
                            {phase === 'all' ? 'Todas' : phase}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Proyectos asignados */}
            <Card className="p-6 bg-[#0a0a0a] border-[#2a2a2a]">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-[#FF1B7E]" />
                Proyectos Asignados ({projects.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {projects.length === 0 ? (
                  <p className="text-gray-400 text-sm">No tienes proyectos asignados</p>
                ) : (
                  projects.map(project => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg border border-[#2a2a2a]">
                      <div>
                        <p className="text-sm font-medium text-white">{project.name}</p>
                        <p className="text-xs text-gray-400">{project.status}</p>
                      </div>
                      <Badge variant="outline" className="border-[#FF1B7E] text-[#FF1B7E]">
                        {project.completion_percentage?.toFixed(0) || 0}%
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}