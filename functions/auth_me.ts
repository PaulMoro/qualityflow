
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        let token = req.headers.get('Authorization')?.replace('Bearer ', '');

        // Also check body if not in header
        if (!token) {
            try {
                const body = await req.json();
                token = body.token;
            } catch (e) {
                // Body might be empty
            }
        }

        if (!token) {
            return Response.json({ error: 'Token requerido' }, { status: 401 });
        }

        // Find session
        const sessions = await base44.asServiceRole.entities.UserSession.filter({ token });
        const session = sessions[0];

        if (!session) {
            return Response.json({ error: 'Sesión inválida' }, { status: 401 });
        }

        // Check expiration
        if (new Date(session.expires_at) < new Date()) {
            return Response.json({ error: 'Sesión expirada' }, { status: 401 });
        }

        // Get user
        const users = await base44.asServiceRole.entities.User.filter({ id: session.user_id });
        const user = users[0];

        if (!user) {
            return Response.json({ error: 'Usuario no encontrado' }, { status: 401 });
        }

        return Response.json({
            success: true,
            user: {
                id: user.id,
                email: user.email,
                display_name: user.display_name,
                role: user.role,
                full_name: user.display_name // Compatibility
            }
        });

    } catch (error) {
        console.error('Auth verification error:', error);
        return Response.json({ error: 'Error de verificación' }, { status: 500 });
    }
});
