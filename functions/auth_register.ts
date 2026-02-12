
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { email, password, display_name } = await req.json();

        if (!email || !password) {
            return Response.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        // Default role
        const defaultRole = 'viewer';

        // Create User
        const newUser = await base44.asServiceRole.entities.User.create({
            email,
            password_hash: hash,
            display_name,
            role: defaultRole,
            is_active: true
        });

        // Create TeamMember for compatibility
        await base44.asServiceRole.entities.TeamMember.create({
            user_email: email,
            display_name: display_name,
            role: defaultRole,
            is_active: true,
            avatar_color: 'bg-blue-500' // Default color
        });

        return Response.json({ success: true, user: { id: newUser.id, email: newUser.email, role: newUser.role } });

    } catch (error) {
        console.error('Registration error:', error);
        return Response.json({ error: error.message || 'Error al registrar usuario' }, { status: 500 });
    }
});
