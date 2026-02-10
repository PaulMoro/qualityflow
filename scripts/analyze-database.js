import 'dotenv/config';
import { createClient } from '@libsql/client';

const client = createClient({
    url: process.env.VITE_TURSO_DATABASE_URL,
    authToken: process.env.VITE_TURSO_AUTH_TOKEN,
});

async function analyzeDatabase() {
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🔍 ANÁLISIS COMPLETO DE BASE DE DATOS - QUALITYFLOW');
    console.log('═══════════════════════════════════════════════════════\n');

    try {
        // 1. Verificar conexión
        console.log('📡 1. VERIFICANDO CONEXIÓN...\n');
        const testQuery = await client.execute('SELECT 1 as test');
        console.log('✅ Conexión exitosa a Turso\n');

        // 2. Verificar que existe la tabla User
        console.log('📋 2. VERIFICANDO TABLA USER...\n');
        const tableCheck = await client.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='User'"
        );

        if (tableCheck.rows.length === 0) {
            console.log('❌ ERROR: La tabla User NO existe');
            console.log('   Necesitas crearla primero\n');
            return;
        }
        console.log('✅ Tabla User existe\n');

        // 3. Ver estructura de la tabla
        console.log('🏗️  3. ESTRUCTURA DE LA TABLA USER...\n');
        const structure = await client.execute('PRAGMA table_info(User)');
        console.log('Columnas:');
        structure.rows.forEach(col => {
            console.log(`   - ${col.name} (${col.type})${col.notnull ? ' NOT NULL' : ''}${col.pk ? ' PRIMARY KEY' : ''}`);
        });
        console.log('');

        // 4. Contar usuarios
        console.log('👥 4. USUARIOS EN LA BASE DE DATOS...\n');
        const count = await client.execute('SELECT COUNT(*) as total FROM User');
        console.log(`Total de usuarios: ${count.rows[0].total}\n`);

        // 5. Listar todos los usuarios
        console.log('📊 5. DETALLE DE USUARIOS...\n');
        const users = await client.execute('SELECT * FROM User');

        if (users.rows.length === 0) {
            console.log('⚠️  No hay usuarios registrados\n');
        } else {
            users.rows.forEach((user, i) => {
                console.log(`Usuario ${i + 1}:`);
                console.log(`   ID: ${user.id}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Nombre: ${user.display_name || '(sin nombre)'}`);
                console.log(`   Hash Password: ${user.password_hash}`);
                console.log(`   Activo: ${user.is_active ? '✅ Sí' : '❌ No'}`);
                console.log(`   Creado: ${user.created_date || 'N/A'}`);
                console.log('');
            });
        }

        // 6. Verificar hashes
        console.log('🔐 6. VERIFICACIÓN DE HASHES...\n');

        const testPasswords = [
            { email: 'admin@qualityflow.com', password: 'admin123' },
            { email: 'paul.montoya@antpack.co', password: '123456' }
        ];

        for (const test of testPasswords) {
            const userResult = await client.execute({
                sql: 'SELECT email, password_hash FROM User WHERE email = ?',
                args: [test.email]
            });

            if (userResult.rows.length > 0) {
                const user = userResult.rows[0];
                const expectedHash = Buffer.from(test.password).toString('base64');
                const matches = user.password_hash === expectedHash;

                console.log(`${test.email}:`);
                console.log(`   Password esperada: ${test.password}`);
                console.log(`   Hash en BD: ${user.password_hash}`);
                console.log(`   Hash esperado: ${expectedHash}`);
                console.log(`   ¿Coincide?: ${matches ? '✅ SÍ' : '❌ NO'}`);

                if (!matches) {
                    console.log(`   ⚠️  PROBLEMA: El hash no coincide!`);
                }
                console.log('');
            } else {
                console.log(`${test.email}: ⚠️  No encontrado en la BD\n`);
            }
        }

        // 7. Probar query de login
        console.log('🔑 7. SIMULACIÓN DE LOGIN...\n');

        const loginTest = {
            email: 'admin@qualityflow.com',
            password: 'admin123'
        };

        console.log(`Intentando login con: ${loginTest.email}`);

        // Buscar usuario
        const loginUser = await client.execute({
            sql: 'SELECT * FROM User WHERE email = ?',
            args: [loginTest.email]
        });

        if (loginUser.rows.length === 0) {
            console.log('❌ Usuario no encontrado\n');
        } else {
            const user = loginUser.rows[0];
            const passwordHash = Buffer.from(loginTest.password).toString('base64');

            console.log('✅ Usuario encontrado');
            console.log(`   Hash en BD: ${user.password_hash}`);
            console.log(`   Hash calculado: ${passwordHash}`);

            if (user.password_hash === passwordHash) {
                console.log('✅ ¡LOGIN EXITOSO! Las credenciales coinciden\n');
            } else {
                console.log('❌ LOGIN FALLIDO: Las contraseñas no coinciden\n');
                console.log('   DIAGNÓSTICO:');
                console.log(`   - Tipo de hash en BD: ${typeof user.password_hash}`);
                console.log(`   - Tipo de hash calculado: ${typeof passwordHash}`);
                console.log(`   - Longitud hash BD: ${user.password_hash.length}`);
                console.log(`   - Longitud hash calculado: ${passwordHash.length}`);
                console.log(`   - Comparación estricta: ${user.password_hash === passwordHash}`);
                console.log(`   - Comparación flexible: ${user.password_hash == passwordHash}`);
                console.log('');
            }
        }

        // 8. Resumen final
        console.log('═══════════════════════════════════════════════════════');
        console.log('📝 RESUMEN DEL ANÁLISIS');
        console.log('═══════════════════════════════════════════════════════\n');

        console.log(`✅ Conexión a Turso: OK`);
        console.log(`✅ Tabla User: ${tableCheck.rows.length > 0 ? 'Existe' : 'NO existe'}`);
        console.log(`✅ Total usuarios: ${users.rows.length}`);

        const activeUsers = users.rows.filter(u => u.is_active).length;
        console.log(`✅ Usuarios activos: ${activeUsers}`);

        console.log('\n═══════════════════════════════════════════════════════\n');

    } catch (error) {
        console.error('\n❌ ERROR EN EL ANÁLISIS:');
        console.error('   Mensaje:', error.message);
        console.error('   Stack:', error.stack);
        console.log('\n═══════════════════════════════════════════════════════\n');
    }
}

analyzeDatabase();
