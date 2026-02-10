import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Settings } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { db } from '@/api/db';

export default function SignUp() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validaciones
        if (!email || !password || !confirmPassword || !displayName) {
            toast({
                title: "Error",
                description: "Todos los campos son obligatorios",
                variant: "destructive",
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                title: "Error",
                description: "Las contraseñas no coinciden",
                variant: "destructive",
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: "Error",
                description: "La contraseña debe tener al menos 6 caracteres",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        try {
            // Verificar si el usuario ya existe
            const existingUsers = await db.User.filter({ email });

            if (existingUsers.length > 0) {
                toast({
                    title: "Error",
                    description: "Este email ya está registrado",
                    variant: "destructive",
                });
                setIsLoading(false);
                return;
            }

            // Crear nuevo usuario
            const passwordHash = btoa(password); // btoa funciona en el navegador
            const newUser = {
                id: 'user_' + Date.now(),
                email,
                password_hash: passwordHash,
                display_name: displayName,
                is_active: 1,
                created_date: new Date().toISOString()
            };

            await db.User.create(newUser);

            toast({
                title: "¡Registro exitoso!",
                description: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
            });

            // Redirigir al login después de 2 segundos
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error('Sign up error:', error);
            toast({
                title: "Error",
                description: "No se pudo crear la cuenta. Intenta de nuevo.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
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
                            Create Account
                        </CardTitle>
                        <CardDescription className="text-base mt-2 text-[var(--text-secondary)]">
                            Sign up to get started with QualityFlow
                        </CardDescription>
                    </div>
                </CardHeader>

                <CardContent className="space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Display Name */}
                        <div className="space-y-2">
                            <Label htmlFor="displayName" className="text-sm font-medium text-[var(--text-primary)]">
                                Full Name
                            </Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
                                <Input
                                    id="displayName"
                                    type="text"
                                    placeholder="John Doe"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    required
                                    className="h-12 pl-10 border-2 bg-[var(--bg-tertiary)] border-[var(--border-primary)] text-[var(--text-primary)] focus:border-[var(--primary-magenta)]"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Email */}
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

                        {/* Password */}
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
                            <p className="text-xs text-[var(--text-secondary)]">
                                Mínimo 6 caracteres
                            </p>
                        </div>

                        {/* Confirm Password */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-[var(--text-primary)]">
                                Confirm Password
                            </Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-[var(--text-secondary)]" />
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    className="h-12 pl-10 border-2 bg-[var(--bg-tertiary)] border-[var(--border-primary)] text-[var(--text-primary)] focus:border-[var(--primary-magenta)]"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-12 text-base font-medium bg-[var(--primary-magenta)] hover:opacity-90 text-white"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Creating account...
                                </div>
                            ) : (
                                'Sign up'
                            )}
                        </Button>
                    </form>

                    <div className="text-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            Already have an account? <span className="font-semibold text-[var(--primary-magenta)]">Sign in</span>
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
