import React, { useState } from 'react';
import { authClient } from '../../lib/auth-client';
import { useOnboardingResolveSlug, useOnboardingSetup } from '../../hooks/useApi';
import {
    Building2,
    Globe,
    Settings2,
    ArrowRight,
    Check,
    Car,
    Cpu,
    Factory,
    Layout,
    ChevronRight,
    Loader2,
    DollarSign
} from 'lucide-react';
import clsx from 'clsx';

const BUSINESS_TYPES = [
    {
        id: 'AUTOMOTIVE',
        label: 'Automotriz',
        description: 'Talleres mecánicos, latonería, pintura y detallado.',
        icon: Car,
        color: 'text-blue-500',
        bg: 'bg-blue-500/10'
    },
    {
        id: 'ELECTRONICS',
        label: 'Electrónica',
        description: 'Reparación de celulares, laptops, consolas y electrodomésticos.',
        icon: Cpu,
        color: 'text-purple-500',
        bg: 'bg-purple-500/10'
    },
    {
        id: 'MANUFACTURING',
        label: 'Manufactura',
        description: 'Talleres de corte, confección, carpintería y producción.',
        icon: Factory,
        color: 'text-amber-500',
        bg: 'bg-amber-500/10'
    },
    {
        id: 'OTHER',
        label: 'Otro / General',
        description: 'Cualquier otro tipo de servicio técnico o profesional.',
        icon: Settings2,
        color: 'text-slate-500',
        bg: 'bg-slate-500/10'
    }
];

/** Configuración monetaria por país */
const COUNTRY_CONFIG: Record<string, {
    label: string;
    flag: string;
    primaryCurrency: string;
    secondaryCurrency?: string;
    biCurrency: boolean;
    currencySymbol: string;
    defaultRate: string;
    taxIdLabel: string;
    taxIdPlaceholder: string;
    taxRegimeLabel: string;
    taxRegimePlaceholder: string;
    taxRate: number;
    taxName: string;
}> = {
    VE: {
        label: 'Venezuela', flag: '🇻🇪',
        primaryCurrency: 'USD', secondaryCurrency: 'VES',
        biCurrency: true, currencySymbol: 'VES',
        defaultRate: '36.50',
        taxIdLabel: 'RIF', taxIdPlaceholder: 'J-12345678-0',
        taxRegimeLabel: 'Régimen Fiscal',
        taxRegimePlaceholder: 'Contribuyente Especial / Ordinario',
        taxRate: 16, taxName: 'IVA'
    },
    CO: {
        label: 'Colombia', flag: '🇨🇴',
        primaryCurrency: 'COP', biCurrency: false,
        currencySymbol: 'COP', defaultRate: '4200',
        taxIdLabel: 'NIT', taxIdPlaceholder: '900.123.456-7',
        taxRegimeLabel: 'Régimen Tributario',
        taxRegimePlaceholder: 'Régimen Común / Simplificado',
        taxRate: 19, taxName: 'IVA'
    },
    MX: {
        label: 'México', flag: '🇲🇽',
        primaryCurrency: 'MXN', biCurrency: false,
        currencySymbol: 'MXN', defaultRate: '17.50',
        taxIdLabel: 'RFC', taxIdPlaceholder: 'XAXX010101000',
        taxRegimeLabel: 'Régimen Fiscal',
        taxRegimePlaceholder: 'General de Ley / RESICO',
        taxRate: 16, taxName: 'IVA'
    },
    OTHER: {
        label: 'Otro', flag: '🌎',
        primaryCurrency: 'USD', biCurrency: false,
        currencySymbol: 'USD', defaultRate: '1',
        taxIdLabel: 'Tax ID', taxIdPlaceholder: 'Tax Identification Number',
        taxRegimeLabel: 'Tax Regime',
        taxRegimePlaceholder: 'Tax regime / category',
        taxRate: 0, taxName: 'Tax'
    }
};

export const OnboardingWizard = ({ onComplete }: { onComplete?: () => void }) => {
    const [step, setStep] = useState(1);
    const resolveSlugMutation = useOnboardingResolveSlug();
    const setupMutation = useOnboardingSetup();
    const [loading, setLoading] = useState(false);

    // Form State
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [businessType, setBusinessType] = useState('');
    const [country, setCountry] = useState('VE');
    const [exchangeRate, setExchangeRate] = useState(COUNTRY_CONFIG.VE.defaultRate);

    // Contact & Fiscal Fields
    const [tradeName, setTradeName] = useState('');
    const [address, setAddress] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [email, setEmail] = useState('');
    const [taxId, setTaxId] = useState('');
    const [taxRegime, setTaxRegime] = useState('');

    // Configuración derivada del país
    const countryConfig = COUNTRY_CONFIG[country] || COUNTRY_CONFIG.OTHER;

    const handleCountryChange = (newCountry: string) => {
        setCountry(newCountry);
        const config = COUNTRY_CONFIG[newCountry] || COUNTRY_CONFIG.OTHER;
        setExchangeRate(config.defaultRate);
    };

    const handleComplete = async () => {
        setLoading(true);

        let targetOrgId = '';
        let targetOrgSlug = slug || name.toLowerCase().replace(/ /g, '-');

        try {
            // 1. Crear Organización o Recuperar si ya existe (Resume Logic)
            const { data: org, error: createError } = await authClient.organization.create({
                name,
                slug: targetOrgSlug,
            });

            if (createError) {
                if ((createError as any).status === 400 || createError.message?.includes('exists')) {
                    const resolveRes = await resolveSlugMutation.mutateAsync(targetOrgSlug);

                    if (resolveRes?.exists) {
                        if (resolveRes.isOrphan) {
                            targetOrgId = resolveRes.id as string;
                        } else {
                            const { data: myOrgs } = await authClient.organization.list();
                            const existing = myOrgs?.find(o => o.slug === targetOrgSlug);
                            if (existing) {
                                targetOrgId = existing.id;
                            } else {
                                throw new Error("El identificador del taller ya está en uso por otro taller. Por favor, elige uno diferente.");
                            }
                        }
                    } else {
                        throw new Error("El identificador del taller ya está en uso. Por favor, elige uno diferente.");
                    }
                } else {
                    throw createError;
                }
            } else if (org) {
                targetOrgId = org.id;
                targetOrgSlug = org.slug;
            }

            if (!targetOrgId) throw new Error("No se pudo identificar el ID de la organización.");

            // 2. Establecer como activa
            await authClient.organization.setActive({
                organizationId: targetOrgId
            });

            // ESPERA ESTRATÉGICA: Dar tiempo a Better-Auth / Cookies para estabilizarse
            await new Promise(resolve => setTimeout(resolve, 2000));

            const setupResponse = await setupMutation.mutateAsync({
                organizationId: targetOrgId,
                name,
                businessType: businessType as any,
                country: country as any,
                tradeName,
                address,
                phoneNumber,
                whatsappNumber,
                taxId,
                taxRegime
            });

            if (!setupResponse?.success) throw new Error('Error en la respuesta de configuración');

            if (onComplete) onComplete();
            window.location.href = `/${targetOrgSlug}/dashboard`;
        } catch (err: any) {
            console.error('[Onboarding] !!! FATAL ERROR during onboarding:', err);
            if (err.message?.includes('403') || err.message?.includes('Forbidden')) {
                alert(`Error de sincronización (403): Tu sesión no se actualizó a tiempo o no tienes permisos. Por favor, intenta de nuevo ahora que "${name}" ya está reservado.`);
            } else {
                alert(`Error durante la configuración: ${err.message || 'Error desconocido'}`);
            }
            setLoading(false);
        }
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full">
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 mb-6">
                        <Layout size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">Configuración del Taller</span>
                    </div>
                    <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">
                        BIENVENIDO A <span className="text-primary-500 italic">TALISTO PRO</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto font-medium">
                        Configura tu entorno de trabajo en menos de 2 minutos.
                        Personalizaremos la interfaz según tu tipo de negocio.
                    </p>
                </div>

                {/* Wizard Container */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                        <Settings2 size={200} className="text-primary-500" />
                    </div>

                    {/* Progress Indicator */}
                    <div className="flex gap-4 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex-1">
                                <div className={clsx(
                                    "h-1 rounded-full transition-all duration-500",
                                    step >= i ? "bg-primary-500" : "bg-slate-800"
                                )} />
                            </div>
                        ))}
                    </div>

                    {/* Step Content */}
                    <div className="min-h-[400px]">

                        {/* STEP 1: Nombre del Taller */}
                        {step === 1 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-2xl font-bold text-white mb-6">¿Cómo se llama tu taller?</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Nombre Comercial</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Ej: Auto Center Caracas"
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors text-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Identificador (Slug)</label>
                                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
                                            <span className="text-slate-500 text-sm">talistopro.com/</span>
                                            <input
                                                type="text"
                                                value={slug || name.toLowerCase().replace(/ /g, '-')}
                                                onChange={(e) => setSlug(e.target.value)}
                                                placeholder="autocenter-valencia"
                                                className="bg-transparent border-none text-white focus:outline-none w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: Tipo de Negocio */}
                        {step === 2 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-2xl font-bold text-white mb-6">¿A qué se dedica tu negocio?</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {BUSINESS_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => setBusinessType(type.id)}
                                            className={clsx(
                                                "p-6 rounded-2xl border text-left transition-all group relative overflow-hidden",
                                                businessType === type.id
                                                    ? "bg-primary-500/10 border-primary-500 ring-1 ring-primary-500"
                                                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                                            )}
                                        >
                                            <div className={clsx("mb-4 rounded-xl p-3 w-fit transition-transform group-hover:scale-110", type.bg, type.color)}>
                                                <type.icon size={24} />
                                            </div>
                                            <h3 className="text-lg font-bold text-white mb-2">{type.label}</h3>
                                            <p className="text-sm text-slate-400 leading-relaxed">{type.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* STEP 3: País y Moneda (antes era Step 4) */}
                        {step === 3 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-2xl font-bold text-white mb-6">País y Moneda</h2>
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">País de Operación</label>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {Object.entries(COUNTRY_CONFIG).map(([id, config]) => (
                                                <button
                                                    key={id}
                                                    onClick={() => handleCountryChange(id)}
                                                    className={clsx(
                                                        "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                                                        country === id ? "bg-primary-500/10 border-primary-500 text-primary-400" : "bg-slate-900/50 border-slate-800 text-slate-500"
                                                    )}
                                                >
                                                    <span className="text-2xl">{config.flag}</span>
                                                    <span className="text-xs font-bold uppercase">{config.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Resumen de moneda automática */}
                                    <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                                        <div className="flex items-center gap-3 mb-3">
                                            <DollarSign size={18} className="text-emerald-400" />
                                            <h3 className="text-emerald-400 font-bold uppercase tracking-wider text-sm">Tu Moneda</h3>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-white font-bold text-lg">{countryConfig.primaryCurrency}</span>
                                            {countryConfig.biCurrency && (
                                                <>
                                                    <span className="text-slate-500">+</span>
                                                    <span className="text-indigo-400 font-bold text-lg">{countryConfig.secondaryCurrency}</span>
                                                    <span className="text-[10px] text-slate-500 bg-indigo-500/10 px-2 py-1 rounded-full font-bold">DOBLE MONEDA</span>
                                                </>
                                            )}
                                        </div>
                                        <p className="mt-2 text-xs text-emerald-500/60 italic">
                                            {countryConfig.biCurrency
                                                ? '* Operarás en USD como moneda principal con conversión automática a VES.'
                                                : country === 'OTHER'
                                                    ? '* Operarás directamente en USD.'
                                                    : `* Los precios base (USD) se convertirán a ${countryConfig.primaryCurrency} usando la tasa indicada.`
                                            }
                                        </p>
                                    </div>

                                    {/* Tasa de cambio — solo para países que no son OTHER */}
                                    {country !== 'OTHER' && (
                                        <div className="p-6 rounded-2xl bg-amber-500/5 border border-amber-500/20">
                                            <div className="flex items-center gap-3 mb-4">
                                                <Globe size={18} className="text-amber-400" />
                                                <h3 className="text-amber-400 font-bold uppercase tracking-wider text-sm">Tasa de Cambio</h3>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex-1">
                                                    <label className="block text-xs font-bold text-amber-500/70 uppercase mb-2">1 USD =</label>
                                                    <input
                                                        type="number"
                                                        value={exchangeRate}
                                                        onChange={(e) => setExchangeRate(e.target.value)}
                                                        className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 text-white font-mono text-xl"
                                                    />
                                                </div>
                                                <div className="flex items-center gap-2 pt-6">
                                                    <span className="text-white font-bold text-xl">{countryConfig.currencySymbol}</span>
                                                </div>
                                            </div>
                                            <p className="mt-4 text-xs text-amber-500/50 italic leading-relaxed">
                                                * Los precios de servicios y productos pre-cargados se convertirán con esta tasa.
                                                Podrás actualizarla diariamente desde tu dashboard.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 4: Contacto e Info Fiscal (antes era Step 3) — etiquetas según país */}
                        {step === 4 && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <h2 className="text-2xl font-bold text-white mb-2">Información de Contacto y Fiscal</h2>
                                <p className="text-sm text-slate-500 mb-6">
                                    Datos para {countryConfig.flag} {countryConfig.label} — campos opcionales, puedes completarlos más tarde.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="col-span-1 md:col-span-2">
                                        <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Nombre Comercial / Razón Social</label>
                                        <input
                                            type="text"
                                            value={tradeName}
                                            onChange={(e) => setTradeName(e.target.value)}
                                            placeholder="Ej. Repuestos Talisto, C.A."
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white mb-6"
                                        />
                                        <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Dirección del Taller</label>
                                        <input
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="Av. Principal, Edif. TaListo, Piso 1"
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 uppercase mb-2">WhatsApp (Ventas)</label>
                                        <input
                                            type="text"
                                            value={whatsappNumber}
                                            onChange={(e) => setWhatsappNumber(e.target.value)}
                                            placeholder="+58 412..."
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 uppercase mb-2">Teléfono fijo / Otro</label>
                                        <input
                                            type="text"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="0212..."
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 uppercase mb-2">{countryConfig.taxIdLabel}</label>
                                        <input
                                            type="text"
                                            value={taxId}
                                            onChange={(e) => setTaxId(e.target.value)}
                                            placeholder={countryConfig.taxIdPlaceholder}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-400 uppercase mb-2">{countryConfig.taxRegimeLabel}</label>
                                        <input
                                            type="text"
                                            value={taxRegime}
                                            onChange={(e) => setTaxRegime(e.target.value)}
                                            placeholder={countryConfig.taxRegimePlaceholder}
                                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-12 flex items-center justify-between border-t border-slate-800 pt-8">
                        {step > 1 ? (
                            <button
                                onClick={prevStep}
                                className="text-slate-500 font-bold uppercase tracking-widest text-sm hover:text-white transition-colors"
                            >
                                Volver
                            </button>
                        ) : <div />}

                        {step < 4 ? (
                            <button
                                onClick={nextStep}
                                disabled={step === 1 && !name || step === 2 && !businessType}
                                className="flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-slate-950 font-black uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                            >
                                Siguiente
                                <ArrowRight size={20} />
                            </button>
                        ) : (
                            <button
                                onClick={handleComplete}
                                disabled={loading}
                                className="flex items-center gap-2 px-12 py-4 rounded-xl bg-primary-500 text-white font-black uppercase tracking-widest hover:scale-105 transition-all relative overflow-hidden group disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" />
                                        PROCESANDO...
                                    </>
                                ) : (
                                    <>
                                        COMPLETAR REGISTRO
                                        <Check size={24} />
                                    </>
                                )}
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Footer Security Note */}
                <div className="mt-8 flex items-center justify-center gap-2 text-slate-500">
                    <Check size={14} />
                    <span className="text-xs uppercase font-bold tracking-[0.2em]">Entorno Seguro y Cifrado de Datos</span>
                </div>
            </div>
        </div>
    );
};
