import React from 'react';
import { Check, Crown, Zap, Shield, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../../stores/useAuthStore';

const PALETTES = [
    {
        id: 'obsidian',
        name: 'Obsidian Original',
        description: 'Lujo técnico y profundidad táctica.',
        icon: Shield,
        primary: '#6366f1', // Indigo 500
        secondary: '#0f172a', // Slate 900
    },
    {
        id: 'emerald',
        name: 'Emerald Elite',
        description: 'Elegancia natural y claridad orgánica (Refinado).',
        icon: Sparkles,
        primary: '#059669', // Emerald 600 (Darker)
        secondary: '#09090b', // Zinc 950
    },
    {
        id: 'industrial',
        name: 'Industrial Gray',
        description: 'Estética técnica, robusta y puramente funcional.',
        icon: Crown,
        primary: '#475569', // Slate 600 (Industrial Gray - Oscurecido)
        secondary: '#020617', // Slate 950
    },
    {
        id: 'ruby',
        name: 'Ruby Professional',
        description: 'Energía, pasión y precisión quirúrgica (Elite).',
        icon: Zap,
        primary: '#e11d48', // Rose 600 (Vivid & Elegant)
        secondary: '#27030c', // Darker Ruby BG
    },
];

interface PaletteSelectorProps {
    value: string;
    onChange: (themeId: string) => void;
}

export const PaletteSelector = ({ value, onChange }: PaletteSelectorProps) => {
    const { organization, setAuth, user } = useAuthStore();
    const currentTheme = value || organization?.themeKey || 'obsidian';

    const handleSelect = (themeId: string) => {
        if (!organization) return;

        // 1. Actualizar localmente el store para feedback visual instantáneo (Preview)
        setAuth(user, {
            ...organization,
            themeKey: themeId as any
        });

        // 2. Notificar al componente padre para persistencia futura
        onChange(themeId);
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {PALETTES.map((palette) => {
                    const isSelected = currentTheme === palette.id;
                    const Icon = palette.icon;

                    return (
                        <button
                            key={palette.id}
                            onClick={() => handleSelect(palette.id)}
                            className={`
                                relative p-4 rounded-[1.5rem] border-2 transition-all duration-300 text-left group flex flex-col justify-between h-full
                                ${isSelected
                                    ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-500/10 shadow-lg shadow-primary-500/10'
                                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-700'
                                }
                            `}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <div className={`
                                    p-2 rounded-xl transition-transform duration-500 group-hover:scale-110
                                    ${isSelected ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400'}
                                `}>
                                    <Icon size={18} />
                                </div>
                                {isSelected && (
                                    <div className="bg-primary-500 text-white p-0.5 rounded-full ring-2 ring-white dark:ring-slate-900">
                                        <Check size={10} strokeWidth={4} />
                                    </div>
                                )}
                            </div>

                            <div>
                                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-[10px] mb-1">
                                    {palette.name}
                                </h3>
                                <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest leading-tight">
                                    {palette.description.split(' (')[0]}
                                </p>
                            </div>

                            <div className="mt-4 flex items-center">
                                <div
                                    className="w-5 h-5 rounded-full border border-white dark:border-slate-800 shadow-sm"
                                    style={{ backgroundColor: palette.primary }}
                                />
                                <div
                                    className="w-5 h-5 rounded-full border border-white dark:border-slate-800 shadow-sm -ml-2.5"
                                    style={{ backgroundColor: palette.secondary }}
                                />
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex items-start space-x-3">
                <Shield className="text-amber-600 shrink-0 mt-0.5" size={16} />
                <p className="text-[10px] text-amber-800 dark:text-amber-200 font-bold uppercase tracking-widest leading-relaxed">
                    Personalización Segura: Estas paletas han sido diseñadas para cumplir con estándares de accesibilidad y contraste "Elite".
                </p>
            </div>
        </div>
    );
};
