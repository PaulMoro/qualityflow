import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Inicializa el cronograma de un proyecto desde una plantilla
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { projectId, templateId, startDate } = await req.json();

    if (!projectId) {
      return Response.json({ 
        error: 'projectId es requerido' 
      }, { status: 400 });
    }

    // 1. Buscar proyecto
    const projects = await base44.asServiceRole.entities.Project.filter({ id: projectId });
    const project = projects[0];

    if (!project) {
      return Response.json({ error: 'Proyecto no encontrado' }, { status: 404 });
    }

    // 2. Obtener plantilla (o usar plantilla por defecto)
    let template;
    if (templateId) {
      const templates = await base44.asServiceRole.entities.ScheduleTemplate.filter({ 
        id: templateId 
      });
      template = templates[0];
    } else {
      // Buscar plantilla por tipo de proyecto
      const templates = await base44.asServiceRole.entities.ScheduleTemplate.filter({ 
        project_type: project.project_type,
        is_active: true
      });
      template = templates[0];
    }

    // Si no hay plantilla, usar plantilla por defecto
    if (!template) {
      template = getDefaultTemplate();
    }

    // 3. Calcular fechas secuencialmente
    const projectStartDate = startDate || project.start_date || new Date().toISOString().split('T')[0];
    let currentDate = projectStartDate;
    const createdPhases = [];

    for (const phaseTemplate of template.phases) {
      const phaseStart = currentDate;
      const phaseEnd = addBusinessDays(phaseStart, phaseTemplate.default_duration_days);

      // Buscar responsable del área
      let responsibleEmail = null;
      if (phaseTemplate.required_area && project.area_responsibles) {
        responsibleEmail = project.area_responsibles[phaseTemplate.required_area];
      }

      const phaseData = {
        project_id: projectId,
        phase_key: phaseTemplate.phase_key,
        phase_name: phaseTemplate.phase_name,
        start_date: phaseStart,
        end_date: phaseEnd,
        duration_days: phaseTemplate.default_duration_days,
        depends_on: phaseTemplate.depends_on || [],
        responsible_email: responsibleEmail,
        responsible_area: phaseTemplate.required_area,
        status: 'planned',
        order: phaseTemplate.order || 0,
        is_locked: false,
        buffer_days: 0
      };

      const created = await base44.asServiceRole.entities.SchedulePhase.create(phaseData);
      createdPhases.push(created);

      // Log de creación
      await base44.asServiceRole.entities.ScheduleChangeLog.create({
        project_id: projectId,
        phase_key: phaseTemplate.phase_key,
        change_type: 'template_init',
        changed_by: user.email,
        new_start: phaseStart,
        new_end: phaseEnd,
        reason: `Inicializado desde plantilla: ${template.name}`,
        is_automatic: true
      });

      // La siguiente fase comienza al día siguiente del fin de esta
      currentDate = addBusinessDays(phaseEnd, 1);
    }

    // 4. Actualizar fecha final del proyecto
    const lastPhase = createdPhases[createdPhases.length - 1];
    await base44.asServiceRole.entities.Project.update(projectId, {
      target_date: lastPhase.end_date
    });

    return Response.json({
      success: true,
      phasesCreated: createdPhases.length,
      projectDeadline: lastPhase.end_date,
      templateUsed: template.name
    });

  } catch (error) {
    console.error('Error inicializando cronograma:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});

/**
 * Plantilla por defecto si no existe ninguna
 */
function getDefaultTemplate() {
  return {
    name: 'Plantilla estándar',
    phases: [
      {
        phase_key: 'activation',
        phase_name: 'Activación',
        default_duration_days: 5,
        depends_on: [],
        order: 0
      },
      {
        phase_key: 'planning',
        phase_name: 'Planeación',
        default_duration_days: 10,
        depends_on: ['activation'],
        order: 1
      },
      {
        phase_key: 'design',
        phase_name: 'Diseño',
        default_duration_days: 15,
        depends_on: ['planning'],
        required_area: 'creativity',
        order: 2
      },
      {
        phase_key: 'development',
        phase_name: 'Desarrollo',
        default_duration_days: 30,
        depends_on: ['design'],
        required_area: 'software',
        order: 3
      },
      {
        phase_key: 'qa',
        phase_name: 'QA',
        default_duration_days: 10,
        depends_on: ['development'],
        order: 4
      },
      {
        phase_key: 'content',
        phase_name: 'Carga de contenido',
        default_duration_days: 7,
        depends_on: ['qa'],
        order: 5
      },
      {
        phase_key: 'production',
        phase_name: 'Producción',
        default_duration_days: 5,
        depends_on: ['content'],
        order: 6
      }
    ]
  };
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