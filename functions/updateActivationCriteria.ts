import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const NEW_ACTIVATION_CRITERIA = [
  {
    area: 'Inicio de proyecto',
    title: 'Información del cliente',
    description: 'Información completa del cliente y contexto del negocio',
    is_mandatory: true
  },
  {
    area: 'Inicio de proyecto',
    title: 'Brief del proyecto',
    description: 'Brief detallado con objetivos, alcance y requerimientos del proyecto',
    is_mandatory: true
  },
  {
    area: 'Inicio de proyecto',
    title: 'Propuesta (Presentación - documento formal, aprobado por las áreas involucradas)',
    description: 'Propuesta formal presentada y aprobada por todas las áreas involucradas',
    is_mandatory: true
  },
  {
    area: 'Inicio de proyecto',
    title: 'Contrato del proyecto (alcance corroborado por las áreas involucradas)',
    description: 'Contrato firmado con alcance validado y corroborado por las áreas',
    is_mandatory: true
  },
  {
    area: 'Inicio de proyecto',
    title: 'Kickoff Interno, planeación del proyecto (Grabación - acta)',
    description: 'Kickoff interno realizado con grabación y acta de reunión',
    is_mandatory: true
  },
  {
    area: 'Inicio de proyecto',
    title: 'Kickoff con Cliente (Presentación, grabación y entrega oficial para aprobación de pautas legales)',
    description: 'Kickoff con cliente realizado, con presentación, grabación y pautas legales aprobadas',
    is_mandatory: true
  }
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Obtener todos los proyectos
    const projects = await base44.asServiceRole.entities.Project.list();
    
    let updatedProjects = 0;
    const results = [];

    for (const project of projects) {
      // Obtener criterios de entrada actuales de la fase activation
      const existingCriteria = await base44.asServiceRole.entities.EntryCriteria.filter({
        project_id: project.id,
        phase_key: 'activation'
      });

      // Eliminar criterios antiguos
      for (const criterion of existingCriteria) {
        await base44.asServiceRole.entities.EntryCriteria.delete(criterion.id);
      }

      // Crear nuevos criterios
      for (const newCriterion of NEW_ACTIVATION_CRITERIA) {
        await base44.asServiceRole.entities.EntryCriteria.create({
          project_id: project.id,
          phase_key: 'activation',
          ...newCriterion
        });
      }

      updatedProjects++;
      results.push({
        projectId: project.id,
        projectName: project.name,
        oldCriteriaCount: existingCriteria.length,
        newCriteriaCount: NEW_ACTIVATION_CRITERIA.length
      });
    }

    return Response.json({
      success: true,
      message: `Criterios de activación actualizados en ${updatedProjects} proyectos`,
      results
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});