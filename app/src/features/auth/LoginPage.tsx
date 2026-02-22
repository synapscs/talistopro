import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authClient } from '../../lib/auth-client';
import { Loader2, Mail, Lock, LogIn, AlertCircle } from 'lucide-react';

export const LoginPage = ({ onToggle }: { onToggle: () => void }) => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error: loginError } = await authClient.signIn.email({
            email,
            password,
            callbackURL: '/dashboard'
        });

        if (loginError) {
            setError(loginError.message || 'Error al iniciar sesión');
            setLoading(false);
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden text-slate-100">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-500/10 blur-[120px] rounded-full" />
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-600/20 mb-4">
                        <LogIn className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">TaListo<span className="text-indigo-500">Pro</span></h1>
                    <p className="text-slate-400">Entra a la gestión inteligente de tu taller</p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl">
                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20 text-sm">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 ml-1">Correo Electrónico</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@tu-taller.com"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 ml-1">Contraseña</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all placeholder:text-slate-600"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : <LogIn size={20} />}
                            <span>{loading ? 'Iniciando...' : 'Entrar al Sistema'}</span>
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-sm text-slate-500">
                            ¿No tienes una cuenta?{' '}
                            <button
                                onClick={() => navigate('/register')}
                                className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors"
                            >
                                Regístrate gratis
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
