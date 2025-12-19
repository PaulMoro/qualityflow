import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Users, UserPlus, Pencil, Trash2, Shield } from 'lucide-react';
import { ROLE_CONFIG } from '../checklist/checklistTemplates';

export default function AdminPanel({ isOpen, onClose }) {
  const [newMember, setNewMember] = useState({ user_email: '', display_name: '', role: 'developer' });
  const [editingMember, setEditingMember] = useState(null);
  
  const queryClient = useQueryClient();
  
  const { data: teamMembers = [] } = useQuery({
    queryKey: ['team-members'],
    queryFn: () => base44.entities.TeamMember.list('-created_date'),
    enabled: isOpen
  });
  
  const createMemberMutation = useMutation({
    mutationFn: (data) => base44.entities.TeamMember.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setNewMember({ user_email: '', display_name: '', role: 'developer' });
    }
  });
  
  const updateMemberMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.TeamMember.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      setEditingMember(null);
    }
  });
  
  const deleteMemberMutation = useMutation({
    mutationFn: (id) => base44.entities.TeamMember.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
    }
  });
  
  const handleCreateMember = (e) => {
    e.preventDefault();
    if (newMember.user_email && newMember.role) {
      createMemberMutation.mutate(newMember);
    }
  };
  
  const handleUpdateMember = (member, updates) => {
    updateMemberMutation.mutate({ id: member.id, data: updates });
  };
  
  const activeMembers = teamMembers.filter(m => m.is_active);
  const inactiveMembers = teamMembers.filter(m => !m.is_active);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Panel de Administración
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="members" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" />
              Miembros del Equipo
            </TabsTrigger>
            <TabsTrigger value="roles">
              <Shield className="h-4 w-4 mr-2" />
              Roles y Permisos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="members" className="space-y-6 mt-6">
            {/* Crear nuevo miembro */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Agregar Nuevo Miembro
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateMember} className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newMember.user_email}
                        onChange={(e) => setNewMember({ ...newMember, user_email: e.target.value })}
                        placeholder="usuario@ejemplo.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="displayName">Nombre para mostrar</Label>
                      <Input
                        id="displayName"
                        value={newMember.display_name}
                        onChange={(e) => setNewMember({ ...newMember, display_name: e.target.value })}
                        placeholder="Juan Pérez"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="role">Rol *</Label>
                      <Select
                        value={newMember.role}
                        onValueChange={(value) => setNewMember({ ...newMember, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key}>{config.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    disabled={!newMember.user_email || !newMember.role || createMemberMutation.isPending}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Agregar Miembro
                  </Button>
                </form>
              </CardContent>
            </Card>
            
            {/* Lista de miembros activos */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Miembros Activos ({activeMembers.length})</h3>
              <div className="space-y-2">
                {activeMembers.map((member) => {
                  const roleConfig = ROLE_CONFIG[member.role];
                  const isEditing = editingMember?.id === member.id;
                  
                  return (
                    <Card key={member.id}>
                      <CardContent className="py-3">
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-3">
                              <Input
                                value={editingMember.display_name || ''}
                                onChange={(e) => setEditingMember({ ...editingMember, display_name: e.target.value })}
                                placeholder="Nombre"
                              />
                              <Select
                                value={editingMember.role}
                                onValueChange={(value) => setEditingMember({ ...editingMember, role: value })}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                                    <SelectItem key={key} value={key}>{config.name}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleUpdateMember(member, editingMember)}
                                  disabled={updateMemberMutation.isPending}
                                >
                                  Guardar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setEditingMember(null)}
                                >
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                                <Users className="h-5 w-5 text-slate-600" />
                              </div>
                              <div>
                                <p className="font-medium text-slate-900">
                                  {member.display_name || member.user_email}
                                </p>
                                <p className="text-sm text-slate-500">{member.user_email}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Badge className={`${roleConfig?.color || 'bg-slate-600'} text-white border-0`}>
                                {roleConfig?.name || member.role}
                              </Badge>
                              
                              <div className="flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => setEditingMember(member)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    if (confirm('¿Desactivar este miembro?')) {
                                      handleUpdateMember(member, { is_active: false });
                                    }
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
            
            {/* Miembros inactivos */}
            {inactiveMembers.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-500">Miembros Inactivos ({inactiveMembers.length})</h3>
                <div className="space-y-2">
                  {inactiveMembers.map((member) => (
                    <Card key={member.id} className="opacity-60">
                      <CardContent className="py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <p className="text-sm text-slate-600">{member.display_name || member.user_email}</p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateMember(member, { is_active: true })}
                          >
                            Reactivar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="roles" className="space-y-4 mt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-700">
              <strong>ℹ️ Información sobre roles:</strong> Los roles determinan qué acciones puede realizar cada miembro del equipo en los proyectos.
            </div>
            
            <div className="space-y-3">
              {Object.entries(ROLE_CONFIG).map(([key, config]) => (
                <Card key={key}>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge className={`${config.color} text-white border-0`}>
                        {config.name}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">
                        <strong>Permisos:</strong>
                      </p>
                      <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
                        {config.canComplete && <li>Puede marcar ítems como completados</li>}
                        {config.canReportConflicts && <li>Puede reportar conflictos</li>}
                        {key === 'web_leader' && <li>Puede resolver conflictos</li>}
                        {key === 'product_owner' && <li>Puede aprobar entregas</li>}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}