import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Pencil, Save, X, AlertCircle } from 'lucide-react';
import { DEFAULT_ENTRY_CRITERIA } from '../workflow/entryCriteriaTemplates';

const PHASE_LABELS = {
  activation: 'Inicio de proyecto',
  planning: 'Planeación',
  design: 'Diseño',
  web_development: 'Desarrollo Web',
  development: 'Desarrollo',
  seo: 'SEO',
  marketing_paid: 'Marketing - Paid',
  social_media: 'Social Media',
  final_approval: 'Aprobación Final'
};

export default function EntryCriteriaManager() {
  const [criteria, setCriteria] = useState(DEFAULT_ENTRY_CRITERIA);
  const [editingPhase, setEditingPhase] = useState(null);
  const [editingCriterion, setEditingCriterion] = useState(null);
  const [newCriterion, setNewCriterion] = useState(null);

  const handleAddCriterion = (phase) => {
    setNewCriterion({
      phase,
      area: '',
      title: '',
      description: '',
      is_mandatory: true
    });
  };

  const handleSaveNewCriterion = () => {
    if (!newCriterion.title || !newCriterion.area) return;
    
    setCriteria({
      ...criteria,
      [newCriterion.phase]: [
        ...(criteria[newCriterion.phase] || []),
        {
          area: newCriterion.area,
          title: newCriterion.title,
          description: newCriterion.description,
          is_mandatory: newCriterion.is_mandatory
        }
      ]
    });
    setNewCriterion(null);
  };

  const handleUpdateCriterion = (phase, index, updates) => {
    const updated = [...criteria[phase]];
    updated[index] = { ...updated[index], ...updates };
    setCriteria({
      ...criteria,
      [phase]: updated
    });
  };

  const handleDeleteCriterion = (phase, index) => {
    if (!confirm('¿Eliminar este criterio?')) return;
    
    const updated = criteria[phase].filter((_, i) => i !== index);
    setCriteria({
      ...criteria,
      [phase]: updated
    });
  };

  const handleSaveEditing = () => {
    setEditingCriterion(null);
  };

  const handleExportCriteria = () => {
    const dataStr = JSON.stringify(criteria, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'entry_criteria.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">
            Criterios de Entrada Base
          </h3>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Configura los criterios de entrada predeterminados para cada fase del proyecto
          </p>
        </div>
        <Button
          onClick={handleExportCriteria}
          variant="outline"
          size="sm"
        >
          Exportar JSON
        </Button>
      </div>

      <div className="bg-[#FF1B7E]/10 border border-[#FF1B7E]/30 rounded-lg p-4 text-sm text-[#FF1B7E]">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <strong>Importante:</strong> Los cambios aquí modificarán los criterios base que se aplicarán a nuevos proyectos. 
            Los proyectos existentes no se verán afectados automáticamente.
          </div>
        </div>
      </div>

      {Object.entries(criteria).map(([phaseKey, phaseCriteria]) => (
        <Card key={phaseKey} className="bg-[var(--bg-primary)] border-[var(--border-primary)]">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span className="text-[var(--text-primary)]">
                {PHASE_LABELS[phaseKey] || phaseKey}
              </span>
              <Badge variant="outline" className="text-xs">
                {phaseCriteria.length} criterios
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {phaseCriteria.map((criterion, index) => {
              const isEditing = editingCriterion?.phase === phaseKey && editingCriterion?.index === index;
              
              return (
                <Card key={index} className="bg-[var(--bg-secondary)] border-[var(--border-secondary)]">
                  <CardContent className="py-3">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <Label className="text-xs">Área</Label>
                            <Input
                              value={editingCriterion.data.area}
                              onChange={(e) => setEditingCriterion({
                                ...editingCriterion,
                                data: { ...editingCriterion.data, area: e.target.value }
                              })}
                              placeholder="Área responsable"
                            />
                          </div>
                          <div className="flex items-center gap-2 self-end">
                            <Switch
                              checked={editingCriterion.data.is_mandatory}
                              onCheckedChange={(checked) => setEditingCriterion({
                                ...editingCriterion,
                                data: { ...editingCriterion.data, is_mandatory: checked }
                              })}
                            />
                            <Label className="text-xs">Obligatorio</Label>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs">Título</Label>
                          <Input
                            value={editingCriterion.data.title}
                            onChange={(e) => setEditingCriterion({
                              ...editingCriterion,
                              data: { ...editingCriterion.data, title: e.target.value }
                            })}
                            placeholder="Título del criterio"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs">Descripción</Label>
                          <Textarea
                            value={editingCriterion.data.description}
                            onChange={(e) => setEditingCriterion({
                              ...editingCriterion,
                              data: { ...editingCriterion.data, description: e.target.value }
                            })}
                            placeholder="Descripción del criterio"
                            rows={2}
                          />
                        </div>
                        
                        <div className="flex gap-2 justify-end">
                          <Button
                            size="sm"
                            onClick={() => {
                              handleUpdateCriterion(phaseKey, index, editingCriterion.data);
                              handleSaveEditing();
                            }}
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Guardar
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingCriterion(null)}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm text-[var(--text-primary)]">
                              {criterion.title}
                            </p>
                            {criterion.is_mandatory && (
                              <Badge variant="destructive" className="text-xs">
                                Obligatorio
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-[var(--text-secondary)]">
                            {criterion.description}
                          </p>
                          <p className="text-xs text-[var(--text-tertiary)]">
                            Área: {criterion.area}
                          </p>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => setEditingCriterion({ 
                              phase: phaseKey, 
                              index, 
                              data: { ...criterion } 
                            })}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteCriterion(phaseKey, index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            
            {newCriterion?.phase === phaseKey ? (
              <Card className="bg-[var(--bg-tertiary)] border-[var(--border-primary)]">
                <CardContent className="py-3 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Área *</Label>
                      <Input
                        value={newCriterion.area}
                        onChange={(e) => setNewCriterion({ ...newCriterion, area: e.target.value })}
                        placeholder="Área responsable"
                      />
                    </div>
                    <div className="flex items-center gap-2 self-end">
                      <Switch
                        checked={newCriterion.is_mandatory}
                        onCheckedChange={(checked) => setNewCriterion({ ...newCriterion, is_mandatory: checked })}
                      />
                      <Label className="text-xs">Obligatorio</Label>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Título *</Label>
                    <Input
                      value={newCriterion.title}
                      onChange={(e) => setNewCriterion({ ...newCriterion, title: e.target.value })}
                      placeholder="Título del criterio"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label className="text-xs">Descripción</Label>
                    <Textarea
                      value={newCriterion.description}
                      onChange={(e) => setNewCriterion({ ...newCriterion, description: e.target.value })}
                      placeholder="Descripción del criterio"
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex gap-2 justify-end">
                    <Button
                      size="sm"
                      onClick={handleSaveNewCriterion}
                      disabled={!newCriterion.title || !newCriterion.area}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Agregar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setNewCriterion(null)}
                    >
                      <X className="h-3 w-3 mr-1" />
                      Cancelar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddCriterion(phaseKey)}
                className="w-full border-dashed"
              >
                <Plus className="h-3 w-3 mr-2" />
                Agregar nuevo criterio
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}