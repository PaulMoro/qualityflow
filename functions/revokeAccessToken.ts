import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sharedAccessId } = await req.json();

    if (!sharedAccessId) {
      return Response.json({ error: 'Missing sharedAccessId' }, { status: 400 });
    }

    // Obtener el acceso compartido
    const sharedAccess = await base44.asServiceRole.entities.SharedProjectAccess.filter({ id: sharedAccessId });
    
    if (!sharedAccess.length || sharedAccess[0].shared_by !== user.email) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Revocar el acceso
    await base44.asServiceRole.entities.SharedProjectAccess.update(sharedAccessId, {
      is_active: false,
      revoked_at: new Date().toISOString(),
      revoked_by: user.email
    });

    // Registrar la acción
    await base44.asServiceRole.entities.AccessLog.create({
      project_id: sharedAccess[0].project_id,
      shared_access_id: sharedAccessId,
      accessed_by: user.email,
      action: 'token_revoked',
      section: 'share_access'
    });

    return Response.json({ success: true });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});