import React from 'react';
import { Palette, Layers, Type, ShieldCheck, Zap, Share2 } from 'lucide-react';

export const StyleGuide = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-12 pb-20">
            <div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Luxury Design System</h1>
                <p className="text-slate-500 dark:text-slate-400">Estándares visuales y componentes de marca de TaListoPro.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Colors */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <h3 className="flex items-center text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-6">
                        <Palette size={18} className="mr-2 text-primary-600" /> Paleta de Colores
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary-600 shadow-lg shadow-primary-500/20" />
                            <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">Primary Indigo</p>
                                <p className="text-[10px] text-slate-500">Acciones principales y branding.</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700 shadow-lg" />
                            <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">Luxury Dark</p>
                                <p className="text-[10px] text-slate-500">Fondos oscuros profundos (Modo Dark).</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-500 shadow-lg shadow-emerald-500/20" />
                            <div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">Success Green</p>
                                <p className="text-[10px] text-slate-500">Facturación y estados aprobados.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Typography */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800">
                    <h3 className="flex items-center text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-6">
                        <Type size={18} className="mr-2 text-primary-600" /> Tipografía
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">TITULARES</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mt-1">Inter Black / Tracking Tight</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                                Cuerpo de texto diseñado para legibilidad en interfaces complejas de gestión.
                            </p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em] mt-1">Inter Medium / Line Height 1.6</p>
                        </div>
                    </div>
                </div>

                {/* Components */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 md:col-span-2">
                    <h3 className="flex items-center text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white mb-6">
                        <Layers size={18} className="mr-2 text-primary-600" /> Principios UX
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <ShieldCheck size={20} className="text-primary-600 mb-2" />
                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-1">Confianza</p>
                            <p className="text-[10px] text-slate-500">Diseño limpio y profesional que inspira seguridad al cliente.</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <Zap size={20} className="text-amber-500 mb-2" />
                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-1">Eficiencia</p>
                            <p className="text-[10px] text-slate-500">Micro-interacciones rápidas y flujos sin fricción.</p>
                        </div>
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <Share2 size={20} className="text-indigo-500 mb-2" />
                            <p className="text-xs font-bold text-slate-900 dark:text-white uppercase mb-1">Escalabilidad</p>
                            <p className="text-[10px] text-slate-500">Componentes modulares adaptables a cualquier rubro.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
