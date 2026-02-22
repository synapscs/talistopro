import React, { useState, useEffect } from 'react';
import {
    Building2,
    Globe,
    Settings2,
    Save,
    Loader2,
    Shield,
    Users,
    Bell,
    Palette,
    CheckCircle2,
    Mail,
    Phone,
    MapPin,
    Coins,
    Banknote,
    Zap,
    Scale,
    GitBranch,
    ArrowUp,
    ArrowDown,
    Trash2,
    Plus,
    MessageSquare,
    Search,
    FileText,
    ThumbsUp,
    Wrench,
    Handshake,
    ShieldCheck,
    PackageCheck,
    LogIn,
    UserPlus,
    Key,
    Laptop,
    Smartphone,
    Monitor,
    LogOut,
    Tags,
    CreditCard,
    BarChart2,
    Clock,
    ArrowRight,
    Check,
    AlertCircle,
    Camera
} from 'lucide-react';
import { authClient } from '../../lib/auth-client';
import { client } from '../../lib/api-client';
import { useAuthStore } from '../../stores/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    useMembers,
    useDeleteMember,
    useSettings,
    useUpdateSettings,
    useWorkflowStages,
    useSyncWorkflow
} from '../../hooks/useApi';
import { formatToE164 } from '../../lib/phone';
import { AddMemberForm } from '../team/AddMemberForm';
import { EditMemberForm } from '../team/EditMemberForm';
import { CategoriesTab } from './CategoriesTab';
import { TERMINOLOGY_PRESETS, BusinessType, getEffectiveTerminology } from '../../lib/terminology';
import { PaletteSelector } from './components/PaletteSelector';
import { OrganizationSettings, Member } from '../../types/api';

// Sub-componentes (Cascarones iniciales)
const timezonesByCountry: Record<string, { label: string, value: string }[]> = {
    VE: [{ label: 'Caracas (UTC-4)', value: 'America/Caracas' }],
    CO: [{ label: 'Bogotá (UTC-5)', value: 'America/Bogota' }],
    MX: [
        { label: 'Ciudad de México (UTC-6)', value: 'America/Mexico_City' },
        { label: 'Cancún (UTC-5)', value: 'America/Cancun' },
        { label: 'Tijuana (UTC-8)', value: 'America/Tijuana' }
    ],
    OTHER: [
        { label: 'UTC', value: 'UTC' },
        { label: 'New York (UTC-5)', value: 'America/New_York' },
        { label: 'Madrid (UTC+1)', value: 'Europe/Madrid' }
    ]
};

const IdentityTab = ({ formData, setFormData }: { formData: Partial<OrganizationSettings>, setFormData: (data: any) => void }) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Perfil del Taller */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden h-full">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Building2 size={120} />
                </div>
                <div className="flex items-center space-x-4 mb-8">
                    <div className="p-3 bg-primary-600/10 rounded-2xl text-primary-600">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">Perfil del Taller</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Identidad de Marca y Legal</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre Comercial</label>
                        <input
                            type="text"
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-bold"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre Fiscal / Razón Social</label>
                        <input
                            type="text"
                            value={formData.tradeName || ''}
                            onChange={e => setFormData({ ...formData, tradeName: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tipo de Negocio</label>
                        <select
                            value={formData.businessType}
                            onChange={e => setFormData({ ...formData, businessType: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-bold"
                        >
                            <option value="AUTOMOTIVE">Taller Automotriz</option>
                            <option value="ELECTRONICS">Soporte Electrónico</option>
                            <option value="MANUFACTURING">Manufactura</option>
                            <option value="OTHER">Otro Servicio</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">ID Fiscal / RIF / NIT</label>
                        <input
                            type="text"
                            value={formData.taxId || ''}
                            onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                            placeholder="Ej: J-12345678-9"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Régimen Fiscal</label>
                        <input
                            type="text"
                            value={formData.taxRegime || ''}
                            onChange={e => setFormData({ ...formData, taxRegime: e.target.value })}
                            placeholder="Ej: Contribuyente Especial"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all"
                        />
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="p-2 bg-primary-600/10 rounded-xl text-primary-600">
                            <Palette size={16} />
                        </div>
                        <h4 className="font-black text-slate-900 dark:text-white uppercase text-[9px] tracking-widest">Logo y Marca</h4>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-950 border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center relative overflow-hidden group">
                            {formData.logo ? (
                                <img src={formData.logo} alt="Logo" className="w-full h-full object-contain p-2" />
                            ) : (
                                <Building2 className="text-slate-300" size={24} />
                            )}
                        </div>
                        <div className="flex-1 space-y-1">
                            <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-1">URL o Hex Color</label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={formData.logo || ''}
                                    onChange={e => setFormData({ ...formData, logo: e.target.value })}
                                    placeholder="URL del Logo"
                                    className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-[10px] outline-none"
                                />
                                <input
                                    type="color"
                                    value={formData.primaryColor || '#6366F1'}
                                    onChange={e => setFormData({ ...formData, primaryColor: e.target.value })}
                                    className="h-9 w-10 bg-transparent cursor-pointer rounded-lg border-none p-0"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contacto y Ubicación */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden h-full">
                <div className="flex items-center space-x-4 mb-8">
                    <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-600">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">Contacto y Ubicación</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Presencia Digital y Física</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Dirección del Taller</label>
                        <textarea
                            value={formData.address || ''}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            rows={3}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
                        />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                                <Phone size={10} className="mr-1" /> Teléfono fijo
                            </label>
                            <input
                                type="tel"
                                value={formData.phoneNumber || ''}
                                onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-green-600 uppercase tracking-widest ml-1 flex items-center">
                                WhatsApp Business
                            </label>
                            <input
                                type="tel"
                                value={formData.whatsappNumber || ''}
                                onChange={e => setFormData({ ...formData, whatsappNumber: e.target.value })}
                                className="w-full bg-green-500/5 dark:bg-green-500/5 border border-green-200 dark:border-green-900/50 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-green-500/20"
                            />
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                            <Mail size={10} className="mr-1" /> Email Corporativo
                        </label>
                        <input
                            type="email"
                            value={formData.email || ''}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>

        {/* Regionalización y Monedas */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-amber-500/10 rounded-2xl text-amber-500">
                    <Globe size={24} />
                </div>
                <div>
                    <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">Regionalización y Monedas</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Impuestos y Preferencias Regionales</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">País Base</label>
                            <select
                                value={formData.country}
                                onChange={e => {
                                    const newCountry = e.target.value;
                                    const defaultTz = timezonesByCountry[newCountry]?.[0]?.value || 'UTC';
                                    setFormData({ ...formData, country: newCountry, timezone: defaultTz });
                                }}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none font-bold"
                            >
                                <option value="VE">Venezuela</option>
                                <option value="CO">Colombia</option>
                                <option value="MX">México</option>
                                <option value="OTHER">Otros</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Zona Horaria</label>
                            <select
                                value={formData.timezone}
                                onChange={e => setFormData({ ...formData, timezone: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none font-bold"
                            >
                                {(timezonesByCountry[formData.country] || timezonesByCountry.OTHER).map(tz => (
                                    <option key={tz.value} value={tz.value}>{tz.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-primary-600 uppercase tracking-widest flex items-center">
                                <Scale size={10} className="mr-1" /> Nombre Impuesto
                            </label>
                            <input
                                type="text"
                                value={formData.taxName}
                                onChange={e => setFormData({ ...formData, taxName: e.target.value })}
                                placeholder="IVA, TAX, IGV..."
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none font-black"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tasa (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.taxRate}
                                onChange={e => setFormData({ ...formData, taxRate: Number(e.target.value) })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none font-mono"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-6 bg-primary-600/5 rounded-3xl border border-primary-600/10">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-3">
                                <div className="p-2 bg-primary-600 rounded-xl text-white">
                                    <Coins size={16} />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Doble Moneda</span>
                            </div>
                            <button
                                onClick={() => setFormData({ ...formData, biCurrencyEnabled: !formData.biCurrencyEnabled })}
                                className={`w-10 h-5 rounded-full relative transition-colors ${formData.biCurrencyEnabled ? 'bg-primary-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${formData.biCurrencyEnabled ? 'left-5.5' : 'left-0.5'}`} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Principal</label>
                                <select
                                    value={formData.primaryCurrency}
                                    onChange={e => setFormData({ ...formData, primaryCurrency: e.target.value })}
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-[10px] outline-none font-bold"
                                >
                                    <option value="USD">USD</option>
                                    <option value="VES">VES</option>
                                    <option value="COP">COP</option>
                                    <option value="MXN">MXN</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Secundaria</label>
                                <select
                                    disabled={!formData.biCurrencyEnabled}
                                    value={formData.secondaryCurrency}
                                    onChange={e => setFormData({ ...formData, secondaryCurrency: e.target.value })}
                                    className={`w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-[10px] outline-none font-bold ${!formData.biCurrencyEnabled && 'opacity-30'}`}
                                >
                                    <option value="">Desactivada</option>
                                    <option value="USD">USD</option>
                                    <option value="VES">VES</option>
                                    <option value="COP">COP</option>
                                    <option value="MXN">MXN</option>
                                </select>
                            </div>
                        </div>

                        {formData.biCurrencyEnabled && formData.secondaryCurrency && (
                            <div className="mt-6 pt-6 border-t border-primary-600/10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary-600">Tasa de Cambio</span>
                                    <button
                                        onClick={() => setFormData({ ...formData, exchangeInverted: !formData.exchangeInverted })}
                                        className="text-[9px] font-black uppercase tracking-tighter text-slate-400 hover:text-primary-500 flex items-center"
                                    >
                                        Invertir <Zap size={10} className="ml-1" />
                                    </button>
                                </div>

                                <div className="flex items-center space-x-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-primary-600/10 shadow-inner">
                                    <span className="text-xs font-bold text-slate-500">1 {formData.exchangeInverted ? formData.secondaryCurrency : formData.primaryCurrency} =</span>
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={formData.exchangeRate ?? 0}
                                        onChange={e => setFormData({ ...formData, exchangeRate: Number(e.target.value) })}
                                        className="flex-1 bg-transparent text-right font-mono font-black text-xs outline-none"
                                    />
                                    <span className="text-xs font-black text-slate-900 dark:text-white uppercase">{formData.exchangeInverted ? formData.primaryCurrency : formData.secondaryCurrency}</span>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Fuente</label>
                                        <select
                                            value={formData.exchangeRateSource}
                                            onChange={e => setFormData({ ...formData, exchangeRateSource: e.target.value })}
                                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-2 text-[9px] outline-none font-bold"
                                        >
                                            <option value="CUSTOM">Manual</option>
                                            <option value="BCV">BCV (VE)</option>
                                            <option value="PARALLEL">Paralelo</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center justify-between px-1 pt-4">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auto</span>
                                        <button
                                            onClick={() => setFormData({ ...formData, autoUpdateRate: !formData.autoUpdateRate })}
                                            className={`w-8 h-4 rounded-full relative transition-colors ${formData.autoUpdateRate ? 'bg-primary-600' : 'bg-slate-300'}`}
                                        >
                                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${formData.autoUpdateRate ? 'left-4.5' : 'left-0.5'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const NotificationsTab = ({ formData, setFormData }: { formData: Partial<OrganizationSettings>, setFormData: (data: any) => void }) => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
            <div className="flex items-center space-x-4 mb-8">
                <div className="p-3 bg-green-500/10 rounded-2xl text-green-600">
                    <Bell size={24} />
                </div>
                <div>
                    <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">Notificaciones Automáticas</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">WhatsApp Business API</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                    { key: 'bookingReminder', label: 'Citas y Reservas', msgKey: 'bookingReminderMsg', desc: 'Se envía cuando se agenda una nueva orden.' },
                    { key: 'pendingPayment', label: 'Recordatorio de Pagos', msgKey: 'pendingPaymentMsg', desc: 'Para órdenes con saldo pendiente.' }
                ].map(notif => (
                    <div key={notif.key} className="p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 hover:border-green-500/30 transition-all">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <span className="text-xs font-black uppercase tracking-widest block">{notif.label}</span>
                                <span className="text-[9px] text-slate-400 font-bold uppercase">{notif.desc}</span>
                            </div>
                            <button
                                onClick={() => setFormData({ ...formData, [`${notif.key}Enabled`]: !formData[`${notif.key}Enabled`] })}
                                className={`w-10 h-5 rounded-full relative transition-colors ${formData[`${notif.key}Enabled`] ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${formData[`${notif.key}Enabled`] ? 'left-5.5' : 'left-0.5'}`} />
                            </button>
                        </div>
                        <div className="relative group">
                            <textarea
                                value={formData[notif.msgKey] || ''}
                                onChange={e => setFormData({ ...formData, [notif.msgKey]: e.target.value })}
                                placeholder="Hola {cliente}, te recordamos tu cita..."
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs outline-none min-h-[120px] resize-none focus:ring-2 focus:ring-green-500/10 transition-all"
                            />
                            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-1 rounded-lg uppercase">Variables activas</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-primary-600/10 rounded-2xl text-primary-600">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">Conexión con WhatsApp Business</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">API de Evolution (Integración Técnica)</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setFormData({ ...formData, whatsappEnabled: !formData.whatsappEnabled })}
                        className={`w-12 h-6 rounded-full relative transition-colors ${formData.whatsappEnabled ? 'bg-green-600' : 'bg-slate-300 dark:bg-slate-700'}`}
                    >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${formData.whatsappEnabled ? 'left-7' : 'left-1'}`} />
                    </button>
                </div>

                {formData.whatsappEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in zoom-in-95 duration-300">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Instancia</label>
                            <input
                                type="text"
                                value={formData.evolutionInstance || ''}
                                onChange={e => setFormData({ ...formData, evolutionInstance: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">API Key</label>
                            <input
                                type="password"
                                value={formData.evolutionApiKey || ''}
                                onChange={e => setFormData({ ...formData, evolutionApiKey: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Global Token</label>
                            <input
                                type="password"
                                value={formData.evolutionApiToken || ''}
                                onChange={e => setFormData({ ...formData, evolutionApiToken: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
);

const TeamTab = () => {
    const [showForm, setShowForm] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const queryClient = useQueryClient();
    const { data: members, isLoading } = useMembers();
    const deleteMutation = useDeleteMember();

    const Badge = ({ role }: { role: Member['role'] }) => {
        const styles: Record<Member['role'], string> = {
            owner: 'bg-primary-600 text-white shadow-lg shadow-primary-600/20',
            admin: 'bg-indigo-500 text-white',
            operator: 'bg-amber-500 text-white',
            technician: 'bg-emerald-500 text-white'
        };
        const labels: Record<Member['role'], string> = {
            owner: 'Propietario / Dueño',
            admin: 'Administrador',
            operator: 'Operador / Recepción',
            technician: 'Tecnico Especialista'
        };
        return (
            <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest ${styles[role] || 'bg-slate-500 text-white'}`}>
                {labels[role] || role}
            </span>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-premium relative overflow-hidden h-full">
                <div className="flex justify-between items-center mb-10">
                    <div className="flex items-center space-x-6">
                        <div className="p-4 bg-primary-600/10 rounded-2xl text-primary-600">
                            <Users size={28} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-widest">Gestion del Equipo</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1 px-1 border-l-2 border-primary-500">Miembros con acceso directo</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-primary-600 hover:bg-primary-500 text-white text-[10px] font-black uppercase px-8 py-4 rounded-2xl shadow-xl shadow-primary-600/20 transition-all flex items-center space-x-3 active:scale-95"
                    >
                        <UserPlus size={16} />
                        <span>Añadir a Equipo</span>
                    </button>
                </div>

                <div className="overflow-hidden">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                            <Loader2 className="animate-spin text-primary-500" size={32} />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando equipo...</span>
                        </div>
                    ) : members && members.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {members.map((member) => (
                                <div key={member.id} className="group relative flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-[2rem] hover:border-primary-500/30 transition-all">
                                    <div
                                        className={`flex items-center space-x-5 flex-1 ${member.role !== 'owner' ? 'cursor-pointer' : ''}`}
                                        onClick={() => member.role !== 'owner' && setEditingMember(member)}
                                    >
                                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-primary-600 font-black uppercase text-base shadow-sm group-hover:bg-primary-600 group-hover:text-white transition-all">
                                            {member.user?.name?.substring(0, 2) || 'M'}
                                        </div>
                                        <div>
                                            <span className="block font-black text-slate-900 dark:text-white uppercase text-xs tracking-tight mb-1">{member.user?.name}</span>
                                            <div className="flex items-center">
                                                <Badge role={member.role} />
                                            </div>
                                        </div>
                                    </div>

                                    {member.role !== 'owner' && (
                                        <button
                                            onClick={() => deleteMutation.mutate(member.id)}
                                            className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Users size={32} />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No hay miembros registrados</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Formulario con Estilo Elite */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
                    <AddMemberForm onClose={() => setShowForm(false)} />
                </div>
            )}

            {editingMember && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
                    <EditMemberForm member={editingMember} onClose={() => setEditingMember(null)} />
                </div>
            )}
        </div>
    );
};

const SecurityTab = () => {
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isChanging, setIsChanging] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Sesiones usando react-query para estabilidad
    const { data: sessionsResponse, isLoading: loadingSessions, refetch: refetchSessions } = useQuery({
        queryKey: ['active-sessions'],
        queryFn: async () => {
            const res = await authClient.listSessions();
            return res;
        }
    });

    const sessions = sessionsResponse?.data || [];

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMsg({ type: 'error', text: 'Las contraseñas no coinciden' });
            return;
        }
        setIsChanging(true);
        setMsg(null);

        try {
            const { error } = await authClient.changePassword({
                newPassword: passwordData.newPassword,
                currentPassword: passwordData.currentPassword,
                revokeOtherSessions: false
            });

            if (error) throw error;

            setMsg({ type: 'success', text: 'Contraseña actualizada correctamente' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            setMsg({ type: 'error', text: err.message || 'Error al cambiar la contraseña' });
        } finally {
            setIsChanging(false);
        }
    };

    const handleRevokeSession = async (token: string) => {
        try {
            await authClient.revokeSession({ token });
            refetchSessions();
        } catch (err) {
            console.error('Error revoking session:', err);
        }
    };

    const getDeviceIcon = (ua: string) => {
        const lowerUA = ua.toLowerCase();
        if (lowerUA.includes('iphone') || lowerUA.includes('android')) return <Smartphone size={18} />;
        if (lowerUA.includes('mac') || lowerUA.includes('windows') || lowerUA.includes('linux')) return <Monitor size={18} />;
        return <Laptop size={18} />;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                {/* Cambio de Contraseña */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-premium relative overflow-hidden">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-600">
                            <Key size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">Cambiar Contraseña</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Seguridad de la Cuenta</p>
                        </div>
                    </div>

                    <form onSubmit={handleChangePassword} className="space-y-5">
                        {msg && (
                            <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                                }`}>
                                {msg.text}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Contraseña Actual</label>
                            <input
                                type="password"
                                required
                                value={passwordData.currentPassword}
                                onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nueva Contraseña</label>
                            <input
                                type="password"
                                required
                                value={passwordData.newPassword}
                                onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirmar Nueva Contraseña</label>
                            <input
                                type="password"
                                required
                                value={passwordData.confirmPassword}
                                onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isChanging}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl transition-all shadow-xl shadow-primary-500/10 active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            {isChanging ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            <span>Actualizar Contraseña</span>
                        </button>
                    </form>
                </div>

                {/* Sesiones Activas */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-premium">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-amber-600/10 rounded-2xl text-amber-600">
                                <Monitor size={24} />
                            </div>
                            <div>
                                <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">Sesiones Activas</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Dispositivos Conectados</p>
                            </div>
                        </div>
                        <button
                            onClick={() => refetchSessions()}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                        >
                            <Zap size={16} className="text-amber-500" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {loadingSessions ? (
                            <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-amber-500" size={24} /></div>
                        ) : sessions && sessions.length > 0 ? (
                            sessions.map((session) => (
                                <div key={session.id} className="group flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-amber-500/30 transition-all">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400">
                                            {getDeviceIcon(session.userAgent || '')}
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                                    {session.userAgent?.split(' ')[0] || 'Navegador'}
                                                </span>
                                                {session.isCurrent && (
                                                    <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase rounded-md tracking-widest">Actual</span>
                                                )}
                                            </div>
                                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{session.ipAddress || 'IP Oculta'}</p>
                                        </div>
                                    </div>

                                    {!session.isCurrent && (
                                        <button
                                            onClick={() => handleRevokeSession(session.token)}
                                            className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <LogOut size={16} />
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="py-8 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">No se encontraron sesiones</p>
                        )}
                    </div>

                    <div className="mt-8 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                        <p className="text-[9px] text-amber-800 dark:text-amber-400 font-bold uppercase tracking-widest leading-relaxed">
                            Si ves un dispositivo desconocido, te recomendamos cerrar su sesión y cambiar tu contraseña inmediatamente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const WorkflowTab = ({ orgId }: { orgId?: string }) => {
    const queryClient = useQueryClient();

    // Si no hay orgId, no renderizamos nada sustancial
    if (!orgId) return <div className="p-8 text-center text-xs font-bold uppercase text-slate-500">Error: No se pudo identificar la organización.</div>;

    const { data: stages, isLoading } = useWorkflowStages();
    const syncMutation = useSyncWorkflow();

    const defaultStages = [
        { name: 'Recibido', icon: 'LogIn', color: '#6366F1' },
        { name: 'Diagnosticado', icon: 'Search', color: '#8B5CF6' },
        { name: 'Cotizado', icon: 'FileText', color: '#EC4899' },
        { name: 'Aprobado', icon: 'ThumbsUp', color: '#10B981' },
        { name: 'En Proceso', icon: 'Wrench', color: '#F59E0B' },
        { name: 'Control de Calidad', icon: 'ShieldCheck', color: '#3B82F6' },
        { name: 'Listo para Entrega', icon: 'PackageCheck', color: '#06B6D4' },
        { name: 'Entregado', icon: 'Handshake', color: '#10B981' },
    ];

    const handleAddInitial = () => {
        const newStages = defaultStages.map((s, idx) => ({
            ...s,
            order: idx,
            notifyCustomer: false,
            notificationMsg: `Hola, tu orden ha pasado al estado: ${s.name}`,
            isInitial: idx === 0,
            isFinal: idx === defaultStages.length - 1
        }));
        syncMutation.mutate(newStages);
    };

    const handleAddStage = () => {
        const nextOrder = (stages?.length || 0);
        const newStage = {
            name: 'Nueva Etapa',
            icon: 'Settings2',
            color: '#6366F1',
            order: nextOrder,
            notifyCustomer: false,
            notificationMsg: '',
            isInitial: nextOrder === 0,
            isFinal: true
        };

        // El anterior ya no es final
        const updated = (stages || [])
            .map((s: any) => ({
                ...s,
                id: s.id || undefined,
                description: s.description || undefined,
                icon: s.icon || undefined,
                notificationMsg: s.notificationMsg || undefined,
                isFinal: false,
                createdAt: undefined,
                updatedAt: undefined,
                organizationId: undefined
            }));
        syncMutation.mutate([...updated, newStage]);
    };

    const handleDelete = (id: string) => {
        const filtered = stages
            .filter((s: any) => s.id !== id)
            .map((s: any, idx: number) => ({
                ...s,
                id: s.id || undefined, // Ensure no null IDs
                order: idx + 1,
                isInitial: idx === 0,
                isFinal: idx === (stages.length - 1) - 1,
                // Sanitize potential nulls
                description: s.description || undefined,
                notificationMsg: s.notificationMsg || undefined,
                icon: s.icon || undefined
            }));
        syncMutation.mutate(filtered);
    };

    const handleUpdate = (idx: number, field: string, value: any) => {
        const updated = [...stages];
        updated[idx] = { ...updated[idx], [field]: value };
        // Sanitization happens in mutation function or before mutate call
        // Let's create a sanitizer helper
        const payload = updated.map((s: any) => ({
            ...s,
            id: s.id || undefined,
            description: s.description || undefined,
            notificationMsg: s.notificationMsg || undefined,
            icon: s.icon || undefined,
            createdAt: undefined, // Remove DB fields not in schema
            updatedAt: undefined,
            organizationId: undefined // Let backend handle this
        }));
        syncMutation.mutate(payload);
    };

    const moveStage = (idx: number, direction: 'up' | 'down') => {
        if (!stages) return;
        const newStages = [...stages];
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;

        if (targetIdx < 0 || targetIdx >= newStages.length) return;

        // Swap elements
        const temp = newStages[idx];
        newStages[idx] = newStages[targetIdx];
        newStages[targetIdx] = temp;

        // Recalculate properties for ALL stages based on new order
        const reordered = newStages.map((s, i) => ({
            ...s,
            id: s.id || undefined,
            order: i + 1,
            isInitial: i === 0,
            isFinal: i === newStages.length - 1,
            description: s.description || undefined,
            notificationMsg: s.notificationMsg || undefined,
            icon: s.icon || undefined,
            createdAt: undefined,
            updatedAt: undefined,
            organizationId: undefined
        }));

        syncMutation.mutate(reordered);
    };

    const IconMap: Record<string, React.ElementType> = {
        LogIn, Search, FileText, ThumbsUp, Wrench, ShieldCheck, PackageCheck, Handshake, Building2, Settings2, Zap
    };

    if (isLoading) return <div className="p-8 text-center text-xs font-bold uppercase text-slate-500 animate-pulse">Cargando flujo de trabajo...</div>;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                    <div className="flex items-center space-x-6">
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl text-primary-600 shadow-sm border border-slate-100 dark:border-slate-800">
                            <GitBranch size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Etapas del Proceso</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Configura el ciclo de vida de tus órdenes de servicio</p>
                        </div>
                    </div>
                    {(!stages || stages.length === 0) ? (
                        <button onClick={handleAddInitial} className="bg-primary-600 hover:bg-primary-500 text-white text-[10px] font-black uppercase px-6 py-3 rounded-2xl shadow-lg shadow-primary-600/20 transition-all flex items-center space-x-2">
                            <Zap size={14} />
                            <span>Inicializar Flujo Base</span>
                        </button>
                    ) : (
                        <button onClick={handleAddStage} className="bg-primary-600 hover:bg-primary-700 text-white text-[10px] font-black uppercase px-6 py-3 rounded-2xl shadow-lg shadow-primary-500/10 transition-all flex items-center space-x-2">
                            <Plus size={14} />
                            <span>Añadir Etapa</span>
                        </button>
                    )}
                </div>

                <div className="p-8">
                    {(!stages || stages.length === 0) ? (
                        <div className="py-20 text-center space-y-4">
                            <div className="mx-auto w-20 h-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700">
                                <GitBranch size={40} />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No hay etapas configuradas</p>
                            <p className="text-[10px] text-slate-500 max-w-xs mx-auto">Inicializa el flujo base para comenzar con las etapas estándar: Recibido, Proceso, Entregado, etc.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {stages.map((stage: any, idx: number) => {
                                const Icon = IconMap[stage.icon] || Settings2;
                                return (
                                    <div key={stage.id} className={`group flex items-center space-x-6 p-6 rounded-3xl border transition-all ${stage.isInitial ? 'bg-indigo-50/30 border-indigo-200 dark:bg-indigo-500/5 dark:border-indigo-500/20' : stage.isFinal ? 'bg-emerald-50/30 border-emerald-200 dark:bg-emerald-500/5 dark:border-emerald-500/20' : 'bg-slate-50/30 border-slate-100 dark:bg-slate-800/30 dark:border-slate-800'}`}>
                                        <div className="flex flex-col space-y-2">
                                            <button disabled={idx === 0} onClick={() => moveStage(idx, 'up')} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 disabled:opacity-20 transition-all">
                                                <ArrowUp size={14} />
                                            </button>
                                            <button disabled={idx === stages.length - 1} onClick={() => moveStage(idx, 'down')} className="p-1.5 hover:bg-white dark:hover:bg-slate-700 rounded-lg text-slate-400 disabled:opacity-20 transition-all">
                                                <ArrowDown size={14} />
                                            </button>
                                        </div>

                                        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                                            <Icon size={20} />
                                        </div>

                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                                            <div className="md:col-span-1 space-y-1">
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block ml-1">Nombre</label>
                                                <input
                                                    type="text"
                                                    value={stage.name}
                                                    onChange={e => handleUpdate(idx, 'name', e.target.value)}
                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs outline-none font-bold"
                                                />
                                            </div>

                                            <div className="md:col-span-2 space-y-1">
                                                <div className="flex items-center justify-between ml-1">
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">Mensaje Notificación</label>
                                                    <button
                                                        onClick={() => handleUpdate(idx, 'notifyCustomer', !stage.notifyCustomer)}
                                                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-lg border transition-all ${stage.notifyCustomer ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700'}`}
                                                    >
                                                        {stage.notifyCustomer ? 'Activa' : 'Desactivada'}
                                                    </button>
                                                </div>
                                                <div className="relative">
                                                    <input
                                                        type="text"
                                                        value={stage.notificationMsg || ''}
                                                        onChange={e => handleUpdate(idx, 'notificationMsg', e.target.value)}
                                                        placeholder="Mensaje de WhatsApp..."
                                                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-3 pr-8 text-xs outline-none font-medium text-slate-600"
                                                    />
                                                    <MessageSquare className="absolute right-3 top-2.5 text-slate-300" size={12} />
                                                </div>
                                            </div>

                                            <div className="flex justify-end items-center space-x-3">
                                                <div className="text-right">
                                                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${stage.isInitial ? 'bg-indigo-500 text-white' : stage.isFinal ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                                                        {stage.isInitial ? 'Inicial' : stage.isFinal ? 'Final' : 'Intermedia'}
                                                    </span>
                                                </div>
                                                <button onClick={() => handleDelete(stage.id)} className="p-3 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-[2rem] flex items-center space-x-6">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-indigo-500/20">
                    <GitBranch className="text-indigo-600" size={20} />
                </div>
                <p className="text-[11px] text-indigo-800 dark:text-indigo-400 font-black uppercase tracking-wider leading-relaxed">
                    Importante: Al cambiar el orden de las etapas, las órdenes de servicio actuales mantendrán su etapa, pero el flujo lógico de avance cambiará para nuevos procesos.
                </p>
            </div>
        </div>
    );
};

const CustomizationTab = ({ formData, setFormData }: any) => {
    const termGroups = [
        {
            title: 'Entidades Principales',
            icon: Building2,
            desc: 'Configura cómo se llaman los pilares centrales de tu negocio.',
            terms: [
                { key: 'assetLabel', label: 'Qué reparas/fabricas (Singular)', placeholder: 'Vehículo, Equipo, Proyecto' },
                { key: 'assetPlural', label: 'Qué reparas/fabricas (Plural)', placeholder: 'Vehículos, Equipos, Piezas' },
                { key: 'orderLabel', label: 'Definicion de Orden', placeholder: 'Orden de Servicio, Ticket' },
                { key: 'orderPlural', label: 'Plural Definicion de Orden', placeholder: 'Órdenes, Tickets' },
                { key: 'technicianLabel', label: 'Nombre del Staff', placeholder: 'Mecánico, Técnico, Operario' },
                { key: 'workshopLabel', label: 'Nombre del Local', placeholder: 'Taller, Laboratorio, Planta' },
            ]
        },
        {
            title: 'Detalles del Activo',
            icon: Settings2,
            desc: 'Define los campos técnicos de identificación de lo que reparas/fabricas.',
            terms: [
                { key: 'assetFields.field1.label', label: 'Marca / Fabricante', placeholder: 'Marca, Fabricante' },
                { key: 'assetFields.field2.label', label: 'Modelo / Referencia', placeholder: 'Modelo, Versión' },
                { key: 'assetFields.field3.label', label: 'Identificador Único', placeholder: 'Placa, Matrícula, IMEI, Serial' },
                { key: 'assetFields.field4.label', label: 'Atributo Personalizado 1', placeholder: 'Color, Año, Kilometraje' },
                { key: 'assetFields.field5.label', label: 'Atributo Personalizado 2', placeholder: 'Ej: Capacidad, Talla' },
                { key: 'assetFields.field6.label', label: 'Atributo Personalizado 3', placeholder: 'Ej: Material, Estado' },
            ]
        },
        {
            title: 'Operaciones e Inventario',
            icon: Zap,
            desc: 'Ajusta los términos operativos para insumos y revisiones.',
            terms: [
                { key: 'partLabel', label: 'Qué vendes/usas (Singular)', placeholder: 'Repuesto, Material, Filamento' },
                { key: 'partPlural', label: 'Qué vendes/usas (Plural)', placeholder: 'Repuestos, Materiales, Insumos' },
                { key: 'checkLabel', label: 'Diagnóstico Inicial', placeholder: 'CheckList, Revisión, Análisis' },
            ]
        }
    ];

    const getNestedValue = (obj: any, path: string) => {
        return path.split('.').reduce((acc, part) => acc && acc[part], obj);
    };

    const setNestedValue = (obj: any, path: string, value: any) => {
        const keys = path.split('.');
        const lastKey = keys.pop()!;
        const deepClone = JSON.parse(JSON.stringify(obj)); // Deep clone to avoid mutation
        let current = deepClone;

        keys.forEach(key => {
            if (!current[key]) current[key] = {};
            current = current[key];
        });

        current[lastKey] = value;
        return deepClone;
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Nueva Sección de Paletas */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center space-x-6">
                    <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl text-primary-600 shadow-sm border border-slate-100 dark:border-slate-800">
                        <Palette size={24} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Personalización Estética</h3>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Selecciona una de las paletas maestras para tu taller.</p>
                    </div>
                </div>

                <div className="p-8">
                    <PaletteSelector
                        value={formData.themeKey}
                        onChange={(themeId) => setFormData({ ...formData, themeKey: themeId })}
                    />
                </div>
            </div>
            {termGroups.map((group, gIdx) => (
                <div key={gIdx} className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center space-x-6">
                        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl text-indigo-600 shadow-sm border border-slate-100 dark:border-slate-800">
                            <group.icon size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{group.title}</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{group.desc}</p>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {group.terms.map(term => (
                            <div key={term.key} className="space-y-2.5">
                                <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center ml-1">
                                    <Palette size={12} className="mr-2 text-indigo-500 opacity-50" /> {term.label}
                                </label>
                                <input
                                    type="text"
                                    value={getNestedValue(formData.customTerminology, term.key) || ''}
                                    onChange={e => {
                                        const newValue = e.target.value;
                                        setFormData((prev: any) => ({
                                            ...prev,
                                            customTerminology: setNestedValue(prev.customTerminology || {}, term.key, newValue)
                                        }));
                                    }}
                                    placeholder={term.placeholder}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-5 text-xs outline-none font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-inner"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-[2rem] flex items-center space-x-6">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-amber-500/20 animate-pulse">
                    <Zap className="text-amber-500" size={20} />
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-400 font-black uppercase tracking-wider leading-relaxed">
                    Nota: La nueva terminología navegará por todo el ecosistema de la aplicación. Asegúrate de guardar los cambios para activarla globalmente.
                </p>
            </div>
        </div>
    );
};

const SubscriptionTab = () => {
    const [selectedMethod, setSelectedMethod] = useState('');
    const [paymentData, setPaymentData] = useState({
        reference: '',
        amount: '',
        date: new Date().toISOString().split('T')[0]
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [paymentReported, setPaymentReported] = useState(false);

    const plans = [
        {
            name: 'Básico',
            price: '20',
            features: [
                { text: '50 Órdenes de Servicio / mes', icon: FileText },
                { text: 'Hasta 2 Usuarios', icon: Users },
                { text: '2 Fotos por Orden', icon: Palette },
                { text: 'Soporte Básico', icon: Shield },
            ],
            notIncluded: ['Notificaciones WhatsApp'],
            color: 'slate',
            isCurrent: true
        },
        {
            name: 'Pro',
            price: '45',
            features: [
                { text: '200 Órdenes de Servicio / mes', icon: FileText },
                { text: 'Hasta 5 Usuarios', icon: Users },
                { text: '6 Fotos por Orden', icon: Palette },
                { text: 'Notificaciones WhatsApp', icon: MessageSquare },
                { text: 'Soporte Prioritario', icon: ShieldCheck },
            ],
            color: 'primary',
            isPopular: true
        },
        {
            name: 'Elite',
            price: '60',
            features: [
                { text: 'Órdenes Ilimitadas', icon: Zap },
                { text: 'Usuarios Ilimitados', icon: Users },
                { text: 'Fotos Ilimitadas', icon: Camera },
                { text: 'Notificaciones WhatsApp', icon: MessageSquare },
                { text: 'Soporte VIP 24/7', icon: ShieldCheck },
            ],
            color: 'amber'
        }
    ];

    const usage = [
        { label: 'Órdenes de Servicio', current: 15, limit: 50, unit: 'ordenes' },
        { label: 'Usuarios del Sistema', current: 2, limit: 2, unit: 'usuarios' }
    ];

    const handleReportPayment = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simular envío
        setTimeout(() => {
            setIsSubmitting(false);
            setPaymentReported(true);
            setTimeout(() => setPaymentReported(false), 5000);
        }, 1500);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header: Estado Actual */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                            <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-600 shadow-sm border border-emerald-500/20">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest text-emerald-600">Suscripción Activa</h3>
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Plan contratado: Básico</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Próximo Pago</p>
                            <div className="flex items-center space-x-2 text-slate-900 dark:text-white font-black mt-1">
                                <Clock size={14} className="text-primary-500" />
                                <span className="text-xs uppercase">15 Mar, 2026</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                        {usage.map((item, idx) => (
                            <div key={idx} className="space-y-4">
                                <div className="flex justify-between items-end">
                                    <h4 className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">{item.label}</h4>
                                    <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                        {item.current} / {item.limit} {item.unit}
                                    </span>
                                </div>
                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 p-0.5">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${(item.current / item.limit) > 0.9 ? 'bg-rose-500' :
                                            (item.current / item.limit) > 0.7 ? 'bg-amber-500' : 'bg-primary-500'
                                            }`}
                                        style={{ width: `${(item.current / item.limit) * 100}%` }}
                                    />
                                </div>
                                <p className="text-[9px] text-slate-400 font-bold italic">
                                    {((item.current / item.limit) * 100).toFixed(0)}% del límite utilizado
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Card de Pago Rápido */}
                <div className="bg-primary-600 rounded-[2.5rem] shadow-xl shadow-primary-600/20 p-8 text-white relative overflow-hidden group">
                    <div className="absolute -top-10 -right-10 opacity-10 group-hover:rotate-12 transition-all duration-700">
                        <CreditCard size={200} />
                    </div>
                    <div className="relative z-10 space-y-6">
                        <div className="p-3 bg-white/20 rounded-xl w-fit">
                            <Banknote size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black uppercase tracking-tighter leading-none">Monto Pendiente</h3>
                            <p className="text-[10px] font-bold uppercase opacity-60 tracking-widest mt-2">Mes de Febrero 2026</p>
                        </div>
                        <div className="text-4xl font-black tracking-tighter">$20.00</div>
                        <p className="text-[9px] font-bold uppercase opacity-80 leading-relaxed">
                            Mantén tu cuenta al día para evitar interrupciones en el servicio y pérdida de límites.
                        </p>
                    </div>
                </div>
            </div>

            {/* Selector de Planes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {plans.map((plan, idx) => (
                    <div key={idx} className={`relative flex flex-col bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 transition-all duration-300 ${plan.isCurrent ? 'border-primary-500 shadow-xl' : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}>
                        {plan.isPopular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-600 text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">Más Recomendado</div>
                        )}

                        <div className="p-8 border-b border-slate-100 dark:border-slate-800">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">{plan.name}</h4>
                            <div className="mt-4 flex items-baseline">
                                <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">${plan.price}</span>
                                <span className="ml-2 text-[10px] font-black text-slate-400 uppercase">/ Mes</span>
                            </div>
                        </div>

                        <div className="p-8 flex-1 space-y-4">
                            {plan.features.map((feature, fIdx) => (
                                <div key={fIdx} className="flex items-center space-x-3">
                                    <div className={`p-1.5 rounded-lg ${plan.isCurrent ? 'bg-primary-500/10 text-primary-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                        <feature.icon size={12} />
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-tight ${plan.isCurrent ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500'}`}>{feature.text}</span>
                                </div>
                            ))}
                            {plan.notIncluded?.map((item, nIdx) => (
                                <div key={nIdx} className="flex items-center space-x-3 opacity-40">
                                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-300">
                                        <ArrowRight size={12} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-tight line-through text-slate-400">{item}</span>
                                </div>
                            ))}
                        </div>

                        <div className="p-8 pt-0">
                            <button
                                disabled={plan.isCurrent}
                                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${plan.isCurrent
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-default'
                                    : 'bg-slate-900 border-2 border-slate-900 dark:bg-white dark:text-slate-900 text-white hover:bg-slate-800'
                                    }`}
                            >
                                {plan.isCurrent ? 'Plan Actual' : 'Ascender de Plan'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Formulario de Reporte de Pago */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-6">
                        <div className="p-4 bg-primary-600/10 rounded-2xl text-primary-600 shadow-sm border border-slate-100 dark:border-slate-800">
                            <CreditCard size={24} />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Reportar Pago</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Registra tu transferencia para validación</p>
                        </div>
                    </div>
                    {paymentReported ? (
                        <div className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-600 px-6 py-3 rounded-2xl border border-emerald-500/20 animate-in zoom-in duration-300">
                            <CheckCircle2 size={16} />
                            <span className="text-[10px] font-black uppercase tracking-widest">Pago reportado con éxito</span>
                        </div>
                    ) : (
                        <div className="text-[9px] font-black uppercase tracking-widest px-4 py-2 bg-amber-500/10 text-amber-600 rounded-xl border border-amber-500/20 flex items-center space-x-2">
                            <AlertCircle size={14} />
                            <span>El tiempo de validación es de 2 a 4 horas</span>
                        </div>
                    )}
                </div>

                <form onSubmit={handleReportPayment} className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center ml-1">
                                <CreditCard size={12} className="mr-2 text-primary-500" /> Método
                            </label>
                            <select
                                value={selectedMethod}
                                onChange={(e) => setSelectedMethod(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-5 text-xs outline-none font-bold text-slate-900 dark:text-white"
                                required
                            >
                                <option value="">Seleccionar...</option>
                                <option value="pago_movil">Pago Móvil</option>
                                <option value="transferencia">Transferencia Nacional</option>
                                <option value="usdt">USDT Binance</option>
                                <option value="paypal">PayPal</option>
                                <option value="international_apps">Wally / Zinli / Pipol Pay</option>
                            </select>
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center ml-1">
                                <Search size={12} className="mr-2 text-primary-500" /> Referencia
                            </label>
                            <input
                                type="text"
                                value={paymentData.reference}
                                onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })}
                                placeholder="Ejem: 749204..."
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-5 text-xs outline-none font-bold text-slate-900 dark:text-white"
                                required
                            />
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center ml-1">
                                <Banknote size={12} className="mr-2 text-primary-500" /> Monto ($)
                            </label>
                            <input
                                type="number"
                                value={paymentData.amount}
                                onChange={(e) => setPaymentData({ ...paymentData, amount: e.target.value })}
                                placeholder="20.00"
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 px-5 text-xs outline-none font-bold text-slate-900 dark:text-white"
                                required
                            />
                        </div>

                        <div className="flex items-end">
                            <button
                                type="submit"
                                disabled={isSubmitting || !selectedMethod}
                                className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:bg-slate-600 text-white font-black uppercase text-[10px] tracking-widest py-4 rounded-2xl shadow-xl shadow-primary-600/20 active:scale-95 transition-all flex items-center justify-center space-x-3"
                            >
                                {isSubmitting ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        <Check size={18} />
                                        <span>Reportar Pago</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const GeneralSettings = () => {
    const { organization } = useAuthStore();
    const orgId = organization?.id;
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState('identity');

    const { data: settings, isLoading } = useSettings();
    const mutation = useUpdateSettings();

    const [formData, setFormData] = useState<any>({
        name: '',
        businessType: '',
        country: 'VE',
        primaryCurrency: 'USD',
        secondaryCurrency: '',
        taxRate: 16,
        taxName: 'IVA',
        timezone: 'America/Caracas',
        primaryColor: '#6366F1',
        biCurrencyEnabled: false,
        exchangeInverted: false,
        exchangeRate: 1,
        exchangeRateSource: 'CUSTOM',
        autoUpdateRate: false,
        taxId: '',
        taxRegime: '',
        address: '',
        phoneNumber: '',
        whatsappNumber: '',
        email: '',
        logo: '',
        // Evol
        whatsappEnabled: false,
        evolutionInstance: '',
        evolutionApiKey: '',
        evolutionApiToken: '',
        // Nuevos
        bookingReminderEnabled: true,
        bookingReminderMsg: '',
        pendingPaymentEnabled: true,
        pendingPaymentMsg: '',
        customTerminology: {},
        themeKey: 'obsidian'
    });
    const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        if (settings) {
            setFormData({
                ...settings,
                name: settings.name || '',
                tradeName: (settings as any).tradeName || '',
                businessType: settings.businessType || 'AUTOMOTIVE',
                country: (settings.country === 'OT' ? 'OTHER' : settings.country) || 'VE',
                primaryCurrency: settings.primaryCurrency || 'USD',
                secondaryCurrency: settings.secondaryCurrency || '',
                timezone: settings.timezone || 'America/Caracas',
                primaryColor: settings.primaryColor || '#6366F1',
                logo: settings.logo || '',
                taxId: settings.taxId || '',
                taxRegime: settings.taxRegime || '',
                address: settings.address || '',
                phoneNumber: settings.phoneNumber || '',
                whatsappNumber: settings.whatsappNumber || '',
                email: settings.email || '',
                taxName: settings.taxName || 'IVA',
                evolutionInstance: settings.evolutionInstance || '',
                evolutionApiKey: settings.evolutionApiKey || '',
                evolutionApiToken: settings.evolutionApiToken || '',
                bookingReminderMsg: settings.bookingReminderMsg || '',
                pendingPaymentMsg: settings.pendingPaymentMsg || '',
                biCurrencyEnabled: !!settings.biCurrencyEnabled,
                whatsappEnabled: !!settings.whatsappEnabled,
                autoUpdateRate: !!settings.autoUpdateRate,
                exchangeInverted: !!settings.exchangeInverted,
                bookingReminderEnabled: !!settings.bookingReminderEnabled,
                pendingPaymentEnabled: !!settings.pendingPaymentEnabled,
                taxRate: Number(settings.taxRate || 0),
                exchangeRate: Number(settings.exchangeRate || 1),
                customTerminology: settings.customTerminology || getEffectiveTerminology(settings.businessType as BusinessType, {}),
                themeKey: settings.themeKey || 'obsidian'
            });
        }
    }, [settings]);

    const handleSave = async () => {
        setSaveMessage(null);
        const formattedData = {
            ...formData,
            phoneNumber: formatToE164(formData.phoneNumber, formData.country),
            whatsappNumber: formatToE164(formData.whatsappNumber, formData.country)
        };

        try {
            await mutation.mutateAsync(formattedData);

            // Sincronizar store global para feedback inmediato (especialmente para el tema)
            const { data: session } = await authClient.getSession();
            if (session?.user) {
                const res = await client.api.settings.$get();
                if (res.ok) {
                    const fullOrg = await res.json();
                    const { setAuth } = useAuthStore.getState();
                    setAuth(session.user, { ...fullOrg } as any);
                }
            }

            setSaveMessage({ type: 'success', text: 'Configuración guardada correctamente' });

            // Limpiar mensaje después de 5 segundos
            setTimeout(() => setSaveMessage(null), 5000);
        } catch (error: any) {
            console.error('Error saving settings:', error);
            setSaveMessage({ type: 'error', text: 'Error al guardar la configuración: ' + (error.message || 'Error desconocido') });
        }
    };

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-600" size={32} /></div>;

    const tabs = [
        { id: 'identity', label: 'Identidad', icon: Building2 },
        { id: 'notifications', label: 'Notificaciones', icon: Bell },
        { id: 'categories', label: 'Categorías', icon: Tags },
        { id: 'workflow', label: 'Flujo de Trabajo', icon: GitBranch },
        { id: 'team', label: 'Equipo', icon: Users },
        { id: 'security', label: 'Seguridad', icon: Shield },
        { id: 'custom', label: 'Personalización', icon: Palette },
        { id: 'subscription', label: 'Suscripción', icon: CreditCard },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12">
            <header className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-premium overflow-hidden">
                <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-slate-800/50">
                    <div className="flex items-center space-x-6">
                        <div className="w-16 h-16 rounded-3xl bg-primary-600/10 flex items-center justify-center text-primary-600 shadow-inner">
                            <Settings2 size={32} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">Configuración</h1>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-2 px-1 border-l-2 border-primary-500">Workshop Control Center</p>
                        </div>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={mutation.isPending}
                        className="bg-primary-600 hover:bg-primary-500 text-white font-black uppercase text-xs tracking-widest py-4 px-8 rounded-2xl shadow-xl shadow-primary-600/20 active:scale-95 transition-all flex items-center space-x-3"
                    >
                        {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        <span>Guardar Cambios</span>
                    </button>
                </div>

                {saveMessage && (
                    <div className={`mx-8 mb-4 p-4 rounded-2xl flex items-center space-x-3 animate-in fade-in slide-in-from-top-2 duration-300 border ${saveMessage.type === 'success'
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                        : 'bg-rose-500/10 border-rose-500/20 text-rose-600'
                        }`}>
                        {saveMessage.type === 'success' ? <CheckCircle2 size={18} /> : <ThumbsUp size={18} className="rotate-180" />}
                        <span className="text-[10px] font-black uppercase tracking-widest">{saveMessage.text}</span>
                    </div>
                )}

                {/* Horizontal Navigation Tabs */}
                <nav className="flex items-center space-x-1 px-4 py-3 bg-slate-50/50 dark:bg-slate-950/50">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                flex items-center space-x-2 px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all
                                ${activeTab === tab.id
                                    ? 'bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-300 shadow-sm border border-slate-200 dark:border-slate-700 ring-1 ring-primary-500/10'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'}
                            `}
                        >
                            <tab.icon size={14} />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>
            </header>

            <main className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'identity' && <IdentityTab formData={formData} setFormData={setFormData} />}
                {activeTab === 'notifications' && <NotificationsTab formData={formData} setFormData={setFormData} />}
                {activeTab === 'categories' && <CategoriesTab formData={formData} setFormData={setFormData} />}
                {activeTab === 'workflow' && <WorkflowTab orgId={orgId} />}
                {activeTab === 'team' && <TeamTab />}
                {activeTab === 'security' && <SecurityTab />}
                {activeTab === 'custom' && <CustomizationTab formData={formData} setFormData={setFormData} />}
                {activeTab === 'subscription' && <SubscriptionTab />}
            </main>
        </div>
    );
};
