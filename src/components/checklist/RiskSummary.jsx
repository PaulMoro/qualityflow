import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, AlertCircle, TrendingUp, Lock, Unlock, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

const RISK_CONFIG = {
  low: { 
    label: 'Riesgo Bajo', 
    color: 'bg-green-500', 
    bgColor: 'bg-green-50', 
    textColor: 'text-green-700',
    borderColor: 'border-green-200',
    icon: CheckCircle2 
  },
  medium: { 
    label: 'Riesgo Medio', 
    color: 'bg-amber-500', 
    bgColor: 'bg-amber-50', 
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    icon: AlertTriangle 
  },
  high: { 
    label: 'Riesgo Alto', 
    color: 'bg-red-500', 
    bgColor: 'bg-red-50', 
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
    icon: AlertCircle 
  }
};

export default function RiskSummary({ risk, project }) {
  const riskConfig = RISK_CONFIG[risk.level];
  const Icon = riskConfig.icon;
  
  return (
    <Card className={`${riskConfig.bgColor} border ${riskConfig.borderColor}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Icon className={`h-5 w-5 ${riskConfig.textColor}`} />
            Resumen del Proyecto
          </CardTitle>
          <Badge className={`${riskConfig.color} text-white border-0`}>
            {riskConfig.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progreso general */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Progreso General</span>
            <span className="font-semibold">{risk.completionRate.toFixed(0)}%</span>
          </div>
          <Progress value={risk.completionRate} className="h-3" />
        </div>
        
        {/* Métricas rápidas */}
        <div className="grid grid-cols-3 gap-3">
          <motion.div 
            className="bg-white rounded-lg p-3 text-center shadow-sm"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-2xl font-bold text-red-600">{risk.criticalPending}</p>
            <p className="text-xs text-slate-500">Críticos pendientes</p>
          </motion.div>
          <motion.div 
            className="bg-white rounded-lg p-3 text-center shadow-sm"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-2xl font-bold text-amber-600">{risk.highPending}</p>
            <p className="text-xs text-slate-500">Alta prioridad</p>
          </motion.div>
          <motion.div 
            className="bg-white rounded-lg p-3 text-center shadow-sm"
            whileHover={{ scale: 1.02 }}
          >
            <p className="text-2xl font-bold text-orange-600">{risk.conflicts}</p>
            <p className="text-xs text-slate-500">Conflictos</p>
          </motion.div>
        </div>
        
        {/* Estado de entrega */}
        <div className={`flex items-center gap-3 p-3 rounded-lg ${risk.canDeliver ? 'bg-green-100' : 'bg-red-100'}`}>
          {risk.canDeliver ? (
            <>
              <Unlock className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-700">Entrega habilitada</p>
                <p className="text-xs text-green-600">Todos los ítems críticos completados</p>
              </div>
            </>
          ) : (
            <>
              <Lock className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium text-red-700">Entrega bloqueada</p>
                <p className="text-xs text-red-600">Completar ítems críticos para desbloquear</p>
              </div>
            </>
          )}
        </div>
        
        {/* Motivos del riesgo */}
        {risk.reasons.length > 0 && (
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Motivos del riesgo
            </p>
            <ul className="space-y-1">
              {risk.reasons.map((reason, idx) => (
                <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Recomendaciones */}
        {risk.recommendations.length > 0 && (
          <div className="bg-white rounded-lg p-3">
            <p className="text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Recomendaciones
            </p>
            <ul className="space-y-1">
              {risk.recommendations.map((rec, idx) => (
                <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                  <TrendingUp className="h-3 w-3 text-green-500 mt-1 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}