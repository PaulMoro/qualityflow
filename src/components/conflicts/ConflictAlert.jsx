import React from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ROLE_CONFIG } from '../checklist/checklistTemplates';

export default function ConflictAlert({ conflict, onResolve, isLeader }) {
  const roleConfig = ROLE_CONFIG[conflict.reported_by_role];
  
  return (
    <Alert className="bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/50">
      <AlertTriangle className="h-4 w-4 text-orange-600 dark:text-orange-500" />
      <AlertTitle className="text-orange-800 dark:text-orange-400 font-semibold">
        Conflicto detectado
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-2">
          <p className="text-sm text-orange-700 dark:text-orange-300">
            <strong>{conflict.item_title}</strong>
          </p>
          
          <div className="flex items-center gap-2 text-xs text-orange-600 dark:text-orange-400">
            <span>Reportado por: {conflict.reported_by}</span>
            {roleConfig && (
              <Badge variant="outline" className="text-xs">
                {roleConfig.name}
              </Badge>
            )}
          </div>
          
          {conflict.reason && (
            <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{conflict.reason}"</p>
          )}
          
          <div className="flex items-center gap-2 mt-3">
            <Badge variant="outline" className="text-xs">
              {conflict.original_status}
            </Badge>
            <ArrowRight className="h-3 w-3 text-slate-400" />
            <Badge variant="outline" className="text-xs bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400">
              {conflict.conflicting_status}
            </Badge>
          </div>
          
          {isLeader && conflict.status !== 'resolved' && (
            <div className="flex gap-2 mt-3">
              <Button 
                size="sm" 
                variant="outline"
                className="text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 hover:bg-red-50 dark:hover:bg-red-950/30"
                onClick={() => onResolve(conflict.id, 'rejected', 'Conflicto rechazado por el líder')}
              >
                <XCircle className="h-3 w-3 mr-1" /> Rechazar
              </Button>
              <Button 
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => onResolve(conflict.id, 'resolved', 'Conflicto resuelto por el líder')}
              >
                <CheckCircle className="h-3 w-3 mr-1" /> Resolver
              </Button>
            </div>
          )}
          
          {conflict.status === 'resolved' && (
            <div className="flex items-center gap-2 mt-2 text-xs text-green-600 dark:text-green-400">
              <CheckCircle className="h-3 w-3" />
              <span>Resuelto por {conflict.resolved_by}</span>
              {conflict.resolved_at && (
                <span>- {format(new Date(conflict.resolved_at), "d MMM HH:mm", { locale: es })}</span>
              )}
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}