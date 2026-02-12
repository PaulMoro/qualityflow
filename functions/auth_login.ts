
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { email, password } = await req.json();

        if (!email || !password) {
            return Response.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
        }

        // Find user
        const users = await base44.asServiceRole.entities.User.filter({ email });
        const user = users[0];

        if (!user) {
            return Response.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) {
            return Response.json({ error: 'Credenciales inválidas' }, { status: 401 });
        }

        // Create session
        const token = crypto.randomUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

        await base44.asServiceRole.entities.UserSession.create({
            user_id: user.id,
            token: token,
            expires_at: expiresAt.toISOString()
        });

        // Update last login
        await base44.asServiceRole.entities.User.update(user.id, {
            last_login: new Date().toISOString()
        });

        return Response.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                display_name: user.display_name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return Response.json({ error: 'Error al iniciar sesión' }, { status: 500 });
    }
});
