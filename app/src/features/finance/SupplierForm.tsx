import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Save, X, Building2, Phone, Mail, MapPin, Loader2, FileText, MessageSquare, Globe, CreditCard, User, Tag } from 'lucide-react';
import { useCreateSupplier, useUpdateSupplier } from '../../hooks/useApi';
import { formatToE164 } from '../../lib/phone';
import { LOCATIONS } from '../../lib/locations';

interface SupplierFormProps {
    onClose: () => void;
    initialData?: any;
}

export const SupplierForm = ({ onClose, initialData }: SupplierFormProps) => {
    const { organization } = useAuthStore();

    const [formData, setFormData] = useState({
        name: '',
        taxName: '',
        taxId: '',
        type: '',
        active: true,
        notes: '',
        phone: '',
        whatsapp: '',
        email: '',
        address: '',
        city: '',
        state: '',
        contact: '',
        url: '',
        paymentMethod1: '',
        paymentMethod2: '',
    });

    const createSupplier = useCreateSupplier();
    const updateSupplier = useUpdateSupplier();

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                taxName: initialData.taxName || '',
                taxId: initialData.taxId || '',
                type: initialData.type || '',
                active: initialData.active ?? true,
                notes: initialData.notes || '',
                phone: initialData.phone || '',
                whatsapp: initialData.whatsapp || '',
                email: initialData.email || '',
                address: initialData.address || '',
                city: initialData.city || '',
                state: initialData.state || '',
                contact: initialData.contact || '',
                url: initialData.url || '',
                paymentMethod1: initialData.paymentMethod1 || '',
                paymentMethod2: initialData.paymentMethod2 || '',
            });
        }
    }, [initialData]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validatePhone = (phone: string) => {
        if (!phone) return true;
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'phone' | 'whatsapp') => {
        const value = e.target.value;
        if (!/^[0-9+\- ]*$/.test(value)) return;

        setFormData({ ...formData, [field]: value });

        if (value && !validatePhone(value)) {
            setErrors(prev => ({ ...prev, [field]: 'Número inválido (mín. 10 dígitos)' }));
        } else {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.phone && !validatePhone(formData.phone)) {
            setErrors(prev => ({ ...prev, phone: 'Número de teléfono inválido' }));
            return;
        }

        try {
            const formattedPhone = formData.phone ? formatToE164(formData.phone, organization?.country || 'VE') : undefined;
            const formattedWhatsapp = formData.whatsapp ? formatToE164(formData.whatsapp, organization?.country || 'VE') : undefined;

            const dataToSubmit = {
                ...formData,
                phone: formattedPhone,
                whatsapp: formattedWhatsapp,
            };

            if (initialData) {
                await updateSupplier.mutateAsync({ id: initialData.id, ...dataToSubmit });
            } else {
                await createSupplier.mutateAsync(dataToSubmit);
            }

            onClose();
        } catch (error) {
            console.error('Error saving supplier:', error);
        }
    };

    const isSubmitting = createSupplier.isPending || updateSupplier.isPending;
    const country = organization?.country || 'VE';
    const locationData = LOCATIONS[country];

    const currentState = locationData?.states.find(s => s.name === formData.state);
    const availableCities = currentState?.cities || [];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                        {initialData ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 underline decoration-primary-500/50 underline-offset-2">
                        Gestión de Alianzas y Suministros
                    </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-rose-500">
                    <X size={20} />
                </button>
            </div>

            <div className="overflow-y-auto flex-1 p-8 custom-scrollbar">
                <form id="supplier-form" onSubmit={handleSubmit} className="space-y-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Columna Izquierda: Identidad y Contacto */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                                    <Building2 size={14} className="mr-2 text-primary-600" /> Nombre Comercial
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ej. Distribuidora Central"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-bold"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                                    <FileText size={14} className="mr-2 text-primary-600" /> Razón Social
                                </label>
                                <input
                                    type="text"
                                    value={formData.taxName}
                                    onChange={e => setFormData({ ...formData, taxName: e.target.value })}
                                    placeholder="Nombre legal de la empresa"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-bold"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                                        Rif / Tax ID
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.taxId}
                                        onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                                        placeholder="J-12345678-0"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-mono font-bold"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                                        Tipo
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500/20"
                                    >
                                        <option value="">Seleccionar...</option>
                                        <option value="fabricante">Fabricante</option>
                                        <option value="distribuidor">Distribuidor</option>
                                        <option value="mayorista">Mayorista</option>
                                        <option value="taller_externo">Taller Externo</option>
                                        <option value="otro">Otro</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                                        <Phone size={14} className="mr-2 text-primary-600" /> Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handlePhoneChange(e, 'phone')}
                                        placeholder="Fijo o General"
                                        className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium`}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                                        <MessageSquare size={14} className="mr-2 text-primary-600" /> WhatsApp
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.whatsapp}
                                        onChange={(e) => handlePhoneChange(e, 'whatsapp')}
                                        placeholder="Móvil ventas"
                                        className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.whatsapp ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium`}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                                    <Mail size={14} className="mr-2 text-primary-600" /> Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                                    <User size={14} className="mr-2 text-primary-600" /> Persona de Contacto
                                </label>
                                <input
                                    type="text"
                                    value={formData.contact}
                                    onChange={e => setFormData({ ...formData, contact: e.target.value })}
                                    placeholder="Nombre del vendedor / atención"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 font-bold"
                                />
                            </div>
                        </div>

                        {/* Columna Derecha: Ubicación, Pagos y Notas */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                                    <MapPin size={14} className="mr-2 text-primary-600" /> Dirección
                                </label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                                        {locationData?.stateLabel || 'Estado / Prov'}
                                    </label>
                                    {locationData ? (
                                        <select
                                            value={formData.state}
                                            onChange={e => setFormData({ ...formData, state: e.target.value, city: '' })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500/20"
                                        >
                                            <option value="">Seleccionar...</option>
                                            {locationData.states.map(s => (
                                                <option key={s.name} value={s.name}>{s.name}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={formData.state}
                                            onChange={e => setFormData({ ...formData, state: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs font-medium"
                                        />
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                                        {locationData?.cityLabel || 'Ciudad'}
                                    </label>
                                    {locationData ? (
                                        <select
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                            disabled={!formData.state}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500/20 disabled:opacity-50"
                                        >
                                            <option value="">Seleccionar...</option>
                                            {availableCities.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    ) : (
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={e => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs font-medium"
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                                    <Globe size={14} className="mr-2 text-primary-600" /> Web / URL
                                </label>
                                <input
                                    type="url"
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-indigo-500 font-mono"
                                />
                            </div>

                            <div className="space-y-4 pt-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                                    <CreditCard size={14} className="mr-2 text-primary-600" /> Formas de Pago
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <select
                                        value={formData.paymentMethod1}
                                        onChange={e => setFormData({ ...formData, paymentMethod1: e.target.value })}
                                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500/20"
                                    >
                                        <option value="">Principal...</option>
                                        <option value="transferencia">Transferencia</option>
                                        <option value="zelle">Zelle</option>
                                        <option value="efectivo">Efectivo</option>
                                        <option value="pago_movil">Pago Móvil</option>
                                        <option value="tarjeta">Tarjeta</option>
                                    </select>
                                    <select
                                        value={formData.paymentMethod2}
                                        onChange={e => setFormData({ ...formData, paymentMethod2: e.target.value })}
                                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500/20"
                                    >
                                        <option value="">Opcional...</option>
                                        <option value="transferencia">Transferencia</option>
                                        <option value="zelle">Zelle</option>
                                        <option value="efectivo">Efectivo</option>
                                        <option value="pago_movil">Pago Móvil</option>
                                        <option value="tarjeta">Tarjeta</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                                    <Tag size={14} className="mr-2 text-primary-600" /> Notas / Comentarios
                                </label>
                                <textarea
                                    value={formData.notes}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full min-h-[120px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 font-medium resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center sticky bottom-0 z-10">
                <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.active}
                            onChange={e => setFormData({ ...formData, active: e.target.checked })}
                            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 shadow-sm transition-all"
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Proveedor Activo</span>
                    </label>
                </div>

                <div className="flex items-center space-x-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        form="supplier-form"
                        disabled={isSubmitting}
                        className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary-600/20 active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        <span>{initialData ? 'Actualizar' : 'Guardar'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
