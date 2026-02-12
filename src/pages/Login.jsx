
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await base44.auth.login(email, password);

            if (result.success) {
                window.location.href = '/';
            } else {
                setError(result.error);
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
                <CardHeader className="text-center space-y-2">
                    <div className="mx-auto w-12 h-12 bg-gradient-to-tr from-[#FF1B7E] to-[#FF8C69] rounded-xl flex items-center justify-center shadow-lg mb-2">
                        <Lock className="text-white h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Bienvenido de nuevo</CardTitle>
                    <CardDescription className="text-gray-300">Ingresa tus credenciales para continuar</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-gray-200">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-[#FF1B7E]/50 focus:ring-[#FF1B7E]/20"
                                    placeholder="tu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-gray-200">Contraseña</Label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-[#FF1B7E]/50 focus:ring-[#FF1B7E]/20"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-200 text-center">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-[#FF1B7E] to-[#FF5757] hover:opacity-90 transition-opacity"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {loading ? 'Ingresando...' : 'Iniciar Sesión'}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-center border-t border-white/10 pt-4">
                    <p className="text-sm text-gray-400">
                        ¿No tienes cuenta?{' '}
                        <a href="/register" className="text-[#FF1B7E] hover:text-[#FF8C69] font-medium transition-colors hover:underline">
                            Regístrate aquí
                        </a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
