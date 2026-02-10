import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/api/db';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const { toast } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return;

        setIsLoading(true);
        try {
            // Buscar usuario en la base de datos
            const users = await db.User.filter({ email });

            if (users.length === 0) {
                toast({
                    title: "Error",
                    description: "Usuario no encontrado",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }

            const user = users[0];

            console.log('🔍 Debug Login:');
            console.log('Email ingresado:', email);
            console.log('Password ingresado:', password);
            console.log('Usuario encontrado:', user);
            console.log('Hash en BD:', user.password_hash);

            // Verificar contraseña (simple base64 por ahora)
            const passwordHash = btoa(password); // btoa funciona en el navegador
            console.log('Hash calculado:', passwordHash);
            console.log('¿Coinciden?:', user.password_hash === passwordHash);

            if (user.password_hash !== passwordHash) {
                toast({
                    title: "Error",
                    description: "Contraseña incorrecta",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }

            // Login exitoso
            await login({
                email: user.email,
                display_name: user.display_name,
                method: 'email',
                userId: user.id
            });

            toast({
                title: "¡Bienvenido!",
                description: `Hola ${user.display_name || user.email}`,
            });
        } catch (error) {
            console.error('Login error:', error);
            toast({
                title: "Error",
                description: "No se pudo iniciar sesión. Intenta de nuevo.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleClick = () => {
        // Por ahora, solo redirige al dashboard sin OAuth
        toast({
            title: "Google OAuth",
            description: "Funcionalidad pendiente de configurar",
        });
        // Simular login con Google
        login({
            email: 'user@gmail.com',
            display_name: 'Usuario Google',
            method: 'google'
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-4">
            <style>{`
        :root {
          --font-sans: Satoshi, sans-serif;
          --primary-magenta: #FF1B7E;
        }
        
        /* Light Mode */
        [data-theme="light"], :root:not([data-theme]) {
          --bg-primary: #f8f9fa;
          --bg-secondary: #ffffff;
          --bg-tertiary: #f1f3f5;
          --bg-hover: rgba(241, 243, 245, 0.8);
          --text-primary: #1a1a1a;
          --text-secondary: #52525b;
          --text-tertiary: #71717a;
          --border-primary: #e5e7eb;
          --border-secondary: #d1d5db;
          --shadow: rgba(0, 0, 0, 0.1);
        }
        
        /* Dark Mode */
        [data-theme="dark"] {
          --bg-primary: #0a0a0a;
          --bg-secondary: #1a1a1a;
          --bg-tertiary: #2a2a2a;
          --bg-hover: rgba(42, 42, 42, 0.5);
          --text-primary: #ffffff;
          --text-secondary: #a1a1aa;
          --text-tertiary: #71717a;
          --border-primary: #2a2a2a;
          --border-secondary: #3f3f46;
          --shadow: rgba(0, 0, 0, 0.5);
        }
        
        body {
          font-family: Satoshi, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
          background: var(--bg-primary);
          color: var(--text-primary);
        }
      `}</style>

            <Card className="w-full max-w-md shadow-2xl border-0 bg-[var(--bg-secondary)]">
                <CardHeader className="space-y-4 text-center pb-8">
                    {/* Logo */}
                    <div className="mx-auto w-24 h-24 bg-[var(--primary-magenta)] rounded-full flex items-center justify-center shadow-lg">
                        <Settings className="w-12 h-12 text-white" />
                    </div>

                    <div>
                        <CardTitle className="text-3xl font-bold text-[var(--text-primary)]">
                            Welcome to QualityFlow
                        </CardTitle>
                        <CardDescription className="text-base mt-2 text-[var(--text-secondary)]">
                            Sign in to continue
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Google Button */}
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full h-12 text-base font-medium border-2 border-[var(--border-primary)] bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"
                        onClick={handleGoogleClick}
                        disabled={isLoading}
                    >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </Button>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-[var(--border-primary)]" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-[var(--bg-secondary)] px-3 text-[var(--text-secondary)] font-medium">
                                OR
                            </span>
                        </div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-[var(--text-primary)]">
                                Email
                            </Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="h-12 pl-10 border-2 bg-[var(--bg-tertiary)] border-[var(--border-primary)] text-[var(--text-primary)] focus:border-[var(--primary-magenta)]"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-[var(--text-primary)]">
                                Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="h-12 pl-10 border-2 bg-[var(--bg-tertiary)] border-[var(--border-primary)] text-[var(--text-primary)] focus:border-[var(--primary-magenta)]"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-medium bg-[var(--primary-magenta)] hover:opacity-90 text-white"
                            disabled={isLoading || !email || !password}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Signing in...
                                </div>
                            ) : (
                                'Sign in'
                            )}
                        </Button>
                    </form>

                    <div className="flex items-center justify-between text-sm">
                        <button className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
                            Forgot password?
                        </button>
                        <button
                            onClick={() => navigate('/signup')}
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            Need an account? <span className="font-semibold text-[var(--primary-magenta)]">Sign up</span>
                        </button>
                    </div>

                    {/* Credenciales de prueba */}
                    <div className="mt-6 p-4 bg-[var(--bg-tertiary)] rounded-lg border border-[var(--border-primary)]">
                        <p className="text-xs font-semibold text-[var(--text-primary)] mb-2">
                            🔑 Credenciales de prueba:
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                            Email: <code className="bg-[var(--bg-hover)] px-1 py-0.5 rounded text-[var(--text-primary)]">admin@qualityflow.com</code>
                        </p>
                        <p className="text-xs text-[var(--text-secondary)]">
                            Password: <code className="bg-[var(--bg-hover)] px-1 py-0.5 rounded text-[var(--text-primary)]">admin123</code>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
