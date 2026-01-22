import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, token } = await req.json();

    if (!projectId) {
      return Response.json({ error: 'Missing projectId' }, { status: 400 });
    }

    let sharedAccess;

    // Si viene token, validar acceso por token
    if (token) {
      const result = await base44.asServiceRole.entities.SharedProjectAccess.filter({ 
        access_token: token,
        project_id: projectId,
        is_active: true
      });

      if (!result.length) {
        return Response.json({ error: 'Invalid or expired token' }, { status: 403 });
      }

      sharedAccess = result[0];

      // Verificar expiración
      if (sharedAccess.expires_at && new Date(sharedAccess.expires_at) < new Date()) {
        return Response.json({ error: 'Token expired' }, { status: 403 });
      }

      // Verificar que el usuario es el destinatario
      if (sharedAccess.shared_with_email !== user.email) {
        return Response.json({ error: 'Token not valid for this user' }, { status: 403 });
      }
    } else {
      // Buscar acceso compartido con el usuario actual
      const result = await base44.asServiceRole.entities.SharedProjectAccess.filter({
        project_id: projectId,
        shared_with_email: user.email,
        is_active: true
      });

      if (!result.length) {
        return Response.json({ error: 'No shared access found' }, { status: 404 });
      }

      sharedAccess = result[0];

      // Verificar expiración
      if (sharedAccess.expires_at && new Date(sharedAccess.expires_at) < new Date()) {
        return Response.json({ error: 'Access expired' }, { status: 403 });
      }
    }

    // Obtener los datos del proyecto
    const projectAccess = await base44.asServiceRole.entities.ProjectAccess.filter({ 
      project_id: projectId 
    });

    if (!projectAccess.length) {
      return Response.json({ error: 'Project access not found' }, { status: 404 });
    }

    const data = projectAccess[0];
    const permissions = sharedAccess.permissions;

    // Filtrar solo lo que tiene permiso de ver
    const filteredData = {
      project_id: projectId,
      qa_hosting: permissions.qa_hosting ? {
        url: data.qa_hosting_url,
        user: data.qa_hosting_user,
        password: data.qa_hosting_password
      } : null,
      prod_hosting: permissions.prod_hosting ? {
        url: data.prod_hosting_url,
        user: data.prod_hosting_user,
        password: data.prod_hosting_password
      } : null,
      cms_qa: permissions.cms_qa ? {
        url: data.cms_qa_url,
        user: data.cms_qa_user,
        password: data.cms_qa_password
      } : null,
      cms_prod: permissions.cms_prod ? {
        url: data.cms_prod_url,
        user: data.cms_prod_user,
        password: data.cms_prod_password
      } : null,
      apis: permissions.apis ? (data.apis || []).filter(api => 
        permissions.apis.includes(api.name)
      ) : []
    };

    // Registrar el acceso
    await base44.asServiceRole.entities.AccessLog.create({
      project_id: projectId,
      shared_access_id: sharedAccess.id,
      accessed_by: user.email,
      action: 'view',
      section: 'shared_access'
    });

    return Response.json({ 
      success: true, 
      data: filteredData,
      sharedBy: sharedAccess.shared_by,
      expiresAt: sharedAccess.expires_at
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});