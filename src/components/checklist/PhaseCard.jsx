import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronDown, ChevronRight, FileText, GitBranch, Palette, Code, Zap, Search, Smartphone, CheckSquare, Shield, Rocket, Plus, Edit2, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ChecklistItemRow from './ChecklistItemRow';
import { PHASES } from './checklistTemplates';

const iconMap = {
  FileText, GitBranch, Palette, Code, Zap, Search, Smartphone, CheckSquare, Shield, Rocket
};

export default function PhaseCard({ 
  phase, 
  items, 
  isExpanded, 
  onToggle, 
  onItemUpdate,
  onItemEdit,
  onAddItem,
  onEditPhase,
  onItemReorder,
  userRole,
  isCriticalPhase,
  customPhaseName,
  dragHandleProps,
  isDragging
}) {
  const phaseConfig = PHASES[phase];
  const Icon = iconMap[phaseConfig?.icon] || FileText;
  const displayName = customPhaseName || phaseConfig?.name || phase;
  
  const completed = items.filter(i => i.status === 'completed').length;
  const total = items.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;
  const hasCritical = items.some(i => i.weight === 'critical' && i.status !== 'completed');
  const hasConflicts = items.some(i => i.status === 'conflict');
  
  const handleDragEnd = (result) => {
    if (onItemReorder) {
      onItemReorder(phase, result);
    }
  };

  return (
    <Card className={`bg-[#1a1a1a] border-[#2a2a2a] overflow-hidden transition-all duration-300 ${isCriticalPhase ? 'ring-2 ring-[#FF1B7E]/40' : ''} ${isDragging ? 'shadow-lg opacity-80' : ''}`}>
      <CardHeader 
        className="hover:bg-[#2a2a2a]/50 transition-colors py-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div 
              {...dragHandleProps}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-[#2a2a2a] rounded transition-colors"
            >
              <GripVertical className="h-5 w-5 text-gray-400" />
            </div>
            <div className="cursor-pointer flex items-center gap-3 flex-1" onClick={onToggle}>
              <div className={`p-2 rounded-lg ${isCriticalPhase ? 'bg-[#FF1B7E]/20' : 'bg-[#0a0a0a]'}`}>
                <Icon className={`h-5 w-5 ${isCriticalPhase ? 'text-[#FF1B7E]' : 'text-gray-400'}`} />
              </div>
            <div>
              <CardTitle className="text-base font-semibold flex items-center gap-2 text-white">
                {displayName}
                {isCriticalPhase && (
                  <Badge variant="outline" className="text-xs bg-[#FF1B7E]/20 text-[#FF1B7E] border-[#FF1B7E]/40">
                    Crítico para este proyecto
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-gray-400 mt-0.5">
                {completed} de {total} completados
              </p>
            </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-[#2a2a2a]"
              onClick={(e) => {
                e.stopPropagation();
                onEditPhase(phase);
              }}
            >
              <Edit2 className="h-4 w-4 text-gray-400" />
            </Button>
            {hasCritical && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/40 border">
                Críticos pendientes
              </Badge>
            )}
            {hasConflicts && (
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/40 border">
                Conflictos
              </Badge>
            )}
            <div className="w-24">
              <Progress value={progress} className="h-2 bg-white/20 [&>div]:bg-[#FF1B7E]" />
            </div>
            <span className="text-sm font-medium text-white w-12">
              {progress.toFixed(0)}%
            </span>
            <div className="cursor-pointer" onClick={onToggle}>
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent className="pt-0 pb-4">
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId={`items-${phase}`}>
                  {(provided) => (
                    <div 
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="border-t pt-4 space-y-1"
                    >
                      {items.sort((a, b) => a.order - b.order).map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                            >
                              <ChecklistItemRow 
                                item={item} 
                                onUpdate={onItemUpdate}
                                onEdit={onItemEdit}
                                userRole={userRole}
                                dragHandleProps={provided.dragHandleProps}
                                isDragging={snapshot.isDragging}
                              />
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              
              {/* Botón para agregar nuevo ítem */}
              <div className="mt-3 pt-3 border-t border-[#2a2a2a]">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-gray-300 border-[#2a2a2a] hover:bg-[#2a2a2a] hover:text-white"
                  onClick={() => onAddItem(phase)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar ítem a esta fase
                </Button>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}