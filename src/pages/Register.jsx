
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await base44.auth.register(email, password, name);

            if (result.success) {
                toast.success('Cuenta creada exitosamente');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1500);
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
                    <div className="mx-auto w-12 h-12 bg-gradient-to-bl from-[#00C6FB] to-[#005BEA] rounded-xl flex items-center justify-center shadow-lg mb-2">
                        <UserPlus className="text-white h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold text-white">Crear Cuenta</CardTitle>
                    <CardDescription className="text-gray-300">Únete al equipo de QualityFlow</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-gray-200">Nombre Completo</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-[#00C6FB]/50 focus:ring-[#00C6FB]/20"
                                    placeholder="Juan Pérez"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-200">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-[#00C6FB]/50 focus:ring-[#00C6FB]/20"
                                    placeholder="tu@email.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-gray-200">Contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-gray-500 focus:border-[#00C6FB]/50 focus:ring-[#00C6FB]/20"
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
                            className="w-full bg-gradient-to-r from-[#00C6FB] to-[#005BEA] hover:opacity-90 transition-opacity"
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            {loading ? 'Registrando...' : 'Registrarse'}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-center border-t border-white/10 pt-4">
                    <p className="text-sm text-gray-400">
                        ¿Ya tienes cuenta?{' '}
                        <a href="/login" className="text-[#00C6FB] hover:text-[#005BEA] font-medium transition-colors hover:underline">
                            Inicia sesión aquí
                        </a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
