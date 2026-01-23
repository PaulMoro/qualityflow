import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Motor de recálculo automático de cronogramas
 * Recalcula dependencias en cascada cuando una fase cambia
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { projectId, modifiedPhaseKey, newEndDate } = await req.json();

    if (!projectId || !modifiedPhaseKey || !newEndDate) {
      return Response.json({ 
        error: 'Parámetros requeridos: projectId, modifiedPhaseKey, newEndDate' 
      }, { status: 400 });
    }

    // 1. Obtener todas las fases del proyecto ordenadas
    const phases = await base44.asServiceRole.entities.SchedulePhase.filter({ 
      project_id: projectId 
    });
    phases.sort((a, b) => a.order - b.order);

    // 2. Encontrar la fase modificada
    const modifiedPhase = phases.find(p => p.phase_key === modifiedPhaseKey);
    if (!modifiedPhase) {
      return Response.json({ error: 'Fase no encontrada' }, { status: 404 });
    }

    const cascade = [];
    const oldEnd = modifiedPhase.end_date;
    const shiftDays = calculateBusinessDays(oldEnd, newEndDate);

    // 3. Actualizar la fase modificada
    await base44.asServiceRole.entities.SchedulePhase.update(modifiedPhase.id, {
      end_date: newEndDate
    });

    // 4. Log del cambio inicial
    await base44.asServiceRole.entities.ScheduleChangeLog.create({
      project_id: projectId,
      phase_key: modifiedPhaseKey,
      change_type: 'manual_edit',
      changed_by: user.email,
      previous_start: modifiedPhase.start_date,
      previous_end: oldEnd,
      new_start: modifiedPhase.start_date,
      new_end: newEndDate,
      reason: `Cambio manual de fecha fin`,
      is_automatic: false,
      shift_days: shiftDays
    });

    // 5. Recalcular dependencias en cascada
    const affectedPhases = await recalculateCascade(
      base44, 
      projectId, 
      modifiedPhaseKey, 
      phases, 
      user.email
    );

    cascade.push(...affectedPhases);

    // 6. Generar alertas
    if (cascade.length > 0) {
      await generateScheduleAlerts(base44, projectId, modifiedPhase, cascade, shiftDays);
    }

    // 7. Actualizar fecha final del proyecto
    const lastPhase = phases[phases.length - 1];
    const updatedLastPhase = await base44.asServiceRole.entities.SchedulePhase.filter({
      project_id: projectId,
      phase_key: lastPhase.phase_key
    });
    
    if (updatedLastPhase[0]) {
      await base44.asServiceRole.entities.Project.update(projectId, {
        target_date: updatedLastPhase[0].end_date
      });
    }

    return Response.json({
      success: true,
      shiftDays,
      cascadeCount: cascade.length,
      affectedPhases: cascade,
      newProjectDeadline: updatedLastPhase[0]?.end_date
    });

  } catch (error) {
    console.error('Error recalculando cronograma:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});

/**
 * Recalcula fases dependientes en cascada
 */
async function recalculateCascade(base44, projectId, modifiedPhaseKey, allPhases, userEmail) {
  const cascade = [];
  const processedPhases = new Set();

  async function processPhase(phaseKey) {
    if (processedPhases.has(phaseKey)) return;
    processedPhases.add(phaseKey);

    // Encontrar fases que dependen de esta
    const dependents = allPhases.filter(p => 
      p.depends_on && p.depends_on.includes(phaseKey)
    );

    for (const dependent of dependents) {
      // Calcular nueva fecha de inicio (después de todas sus dependencias)
      const dependencies = allPhases.filter(p => 
        dependent.depends_on && dependent.depends_on.includes(p.phase_key)
      );

      // Buscar versiones actualizadas de las dependencias
      const updatedDeps = await Promise.all(
        dependencies.map(async (dep) => {
          const updated = await base44.asServiceRole.entities.SchedulePhase.filter({
            project_id: projectId,
            phase_key: dep.phase_key
          });
          return updated[0] || dep;
        })
      );

      const maxEndDate = updatedDeps.reduce((max, dep) => {
        return new Date(dep.end_date) > new Date(max) ? dep.end_date : max;
      }, updatedDeps[0].end_date);

      const newStart = addBusinessDays(maxEndDate, 1);
      const newEnd = addBusinessDays(newStart, dependent.duration_days);

      const oldStart = dependent.start_date;
      const oldEnd = dependent.end_date;
      const shift = calculateBusinessDays(oldStart, newStart);

      // Solo actualizar si hay cambio significativo
      if (shift !== 0) {
        await base44.asServiceRole.entities.SchedulePhase.update(dependent.id, {
          start_date: newStart,
          end_date: newEnd
        });

        cascade.push({
          phase_key: dependent.phase_key,
          phase_name: dependent.phase_name,
          oldStart,
          oldEnd,
          newStart,
          newEnd,
          shiftDays: shift
        });

        // Log automático
        await base44.asServiceRole.entities.ScheduleChangeLog.create({
          project_id: projectId,
          phase_key: dependent.phase_key,
          change_type: 'auto_dependency',
          changed_by: userEmail,
          previous_start: oldStart,
          previous_end: oldEnd,
          new_start: newStart,
          new_end: newEnd,
          reason: `Recalculado automáticamente por dependencia de ${modifiedPhaseKey}`,
          is_automatic: true,
          shift_days: shift
        });

        // Recursión para dependientes de este
        await processPhase(dependent.phase_key);
      }
    }
  }

  await processPhase(modifiedPhaseKey);
  return cascade;
}

/**
 * Genera alertas automáticas para cambios en el cronograma
 */
async function generateScheduleAlerts(base44, projectId, modifiedPhase, cascade, shiftDays) {
  const project = await base44.asServiceRole.entities.Project.filter({ id: projectId });
  const projectData = project[0];
  
  if (!projectData) return;

  const alerts = [];

  // 1. Alerta al responsable de la fase modificada
  if (modifiedPhase.responsible_email) {
    alerts.push({
      project_id: projectId,
      project_name: projectData.name,
      alert_type: 'phase_delayed',
      severity: shiftDays > 5 ? 'high' : 'medium',
      affected_phase: modifiedPhase.phase_key,
      delay_days: shiftDays,
      new_deadline: modifiedPhase.end_date,
      recipients: [modifiedPhase.responsible_email],
      message: `La fase "${modifiedPhase.phase_name}" se ha ${shiftDays > 0 ? 'retrasado' : 'adelantado'} ${Math.abs(shiftDays)} días. Nueva fecha: ${modifiedPhase.end_date}`
    });
  }

  // 2. Alerta al líder del proyecto sobre cascada
  if (cascade.length > 0 && projectData.leader_email) {
    const totalShift = cascade.reduce((sum, c) => sum + Math.abs(c.shiftDays), 0);
    
    alerts.push({
      project_id: projectId,
      project_name: projectData.name,
      alert_type: 'dependency_cascade',
      severity: cascade.length > 3 ? 'high' : 'medium',
      affected_phase: modifiedPhase.phase_key,
      delay_days: totalShift,
      new_deadline: cascade[cascade.length - 1].newEnd,
      recipients: [projectData.leader_email],
      message: `⚠️ Efecto cascada: ${cascade.length} fases afectadas por cambios en "${modifiedPhase.phase_name}". Desplazamiento total: ${totalShift} días.`,
      cascade_info: {
        affected_count: cascade.length,
        phases: cascade.map(c => c.phase_name)
      }
    });
  }

  // 3. Alerta crítica al PO si el retraso total es significativo
  const totalDelay = Math.abs(shiftDays) + cascade.reduce((sum, c) => sum + Math.abs(c.shiftDays), 0);
  
  if (totalDelay > 10 && projectData.product_owner_email) {
    alerts.push({
      project_id: projectId,
      project_name: projectData.name,
      alert_type: 'deadline_risk',
      severity: 'critical',
      affected_phase: modifiedPhase.phase_key,
      delay_days: totalDelay,
      new_deadline: cascade.length > 0 ? cascade[cascade.length - 1].newEnd : modifiedPhase.end_date,
      recipients: [projectData.product_owner_email],
      message: `🚨 RIESGO CRÍTICO: ${totalDelay} días acumulados de retraso en el proyecto "${projectData.name}". Requiere revisión urgente.`
    });
  }

  // Crear las alertas y enviar emails
  for (const alert of alerts) {
    await base44.asServiceRole.entities.ScheduleAlert.create(alert);
    
    // Enviar email
    try {
      for (const recipient of alert.recipients) {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: recipient,
          subject: `[Cronograma] ${projectData.name}`,
          body: alert.message
        });
      }
    } catch (error) {
      console.error('Error enviando email de alerta:', error);
    }
  }
}

/**
 * Calcula días hábiles entre dos fechas
 */
function calculateBusinessDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let count = 0;
  const current = new Date(start);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // No sábado ni domingo
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return start > end ? -count : count;
}

/**
 * Añade días hábiles a una fecha
 */
function addBusinessDays(dateStr, days) {
  const date = new Date(dateStr);
  let added = 0;

  while (added < days) {
    date.setDate(date.getDate() + 1);
    const dayOfWeek = date.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      added++;
    }
  }

  return date.toISOString().split('T')[0];
}