import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Save, X, User, Phone, Mail, MapPin, Loader2, Building2, Briefcase, FileText, MessageSquare } from 'lucide-react';
import { useCreateCustomer, useUpdateCustomer } from '../../hooks/useApi';
import { formatToE164 } from '../../lib/phone';
import { LOCATIONS } from '../../lib/locations';

interface CustomerFormProps {
    onClose: () => void;
    initialData?: any;
}

export const CustomerForm = ({ onClose, initialData }: CustomerFormProps) => {
    const { organization } = useAuthStore();
    const [customerType, setCustomerType] = useState<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        address: '',
        city: '',
        state: '',
        notes: '',
        documentType: 'V', // Default for VE
        documentNumber: '',
        notifyWhatsapp: true,
        notifyEmail: false,
    });

    const createCustomer = useCreateCustomer();
    const updateCustomer = useUpdateCustomer();

    useEffect(() => {
        if (initialData) {
            setCustomerType(initialData.documentType === 'J' || initialData.documentType === 'G' || initialData.documentType === 'NIT' || initialData.documentType === 'TAX' ? 'BUSINESS' : 'INDIVIDUAL');
            setFormData({
                name: initialData.name || '',
                email: initialData.email || '',
                phone: initialData.phone || '',
                whatsapp: initialData.whatsapp || '',
                address: initialData.address || '',
                city: initialData.city || '',
                state: initialData.state || '',
                notes: initialData.notes || '',
                documentType: initialData.documentType || 'V',
                documentNumber: initialData.documentNumber || '',
                notifyWhatsapp: initialData.notifyWhatsapp ?? true,
                notifyEmail: initialData.notifyEmail ?? true,
            });
        }
    }, [initialData]);

    const [errors, setErrors] = useState<Record<string, string>>({});

    const validatePhone = (phone: string) => {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 10;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'phone' | 'whatsapp') => {
        const value = e.target.value;
        // Allow only numbers, spaces, dashed and plus sign
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

        if (!validatePhone(formData.phone)) {
            setErrors(prev => ({ ...prev, phone: 'Número de teléfono inválido' }));
            return;
        }

        try {
            const formattedPhone = formatToE164(formData.phone, organization?.country || 'VE');
            const formattedWhatsapp = formData.whatsapp ? formatToE164(formData.whatsapp, organization?.country || 'VE') : undefined;

            const dataToSubmit = {
                ...formData,
                phone: formattedPhone,
                whatsapp: formattedWhatsapp,
            };

            if (initialData) {
                await updateCustomer.mutateAsync({ id: initialData.id, ...dataToSubmit });
            } else {
                await createCustomer.mutateAsync(dataToSubmit);
            }

            onClose();
        } catch (error) {
            console.error('Error saving customer:', error);
        }
    };

    const country = organization?.country || 'VE';

    const getDocTypes = () => {
        if (country === 'VE') {
            return customerType === 'INDIVIDUAL'
                ? [{ value: 'V', label: 'V' }, { value: 'E', label: 'E' }]
                : [{ value: 'J', label: 'J' }, { value: 'G', label: 'G' }];
        }
        if (country === 'CO') {
            return customerType === 'INDIVIDUAL'
                ? [{ value: 'CC', label: 'CC' }, { value: 'CE', label: 'CE' }]
                : [{ value: 'NIT', label: 'NIT' }];
        }
        return [{ value: 'ID', label: 'ID' }, { value: 'TAX', label: 'TAX' }];
    };

    const isSubmitting = createCustomer.isPending || updateCustomer.isPending;
    const locationData = LOCATIONS[country];

    const currentState = locationData?.states.find(s => s.name === formData.state);
    const availableCities = currentState?.cities || [];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                        {initialData ? 'Editar Cliente' : 'Nuevo Cliente'}
                    </h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                        {customerType === 'INDIVIDUAL' ? 'Persona Natural' : 'Empresa / Jurídico'}
                    </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-400 hover:text-rose-500">
                    <X size={20} />
                </button>
            </div>

            <div className="overflow-y-auto flex-1 p-8 custom-scrollbar">
                <form id="create-customer-form" onSubmit={handleSubmit} className="space-y-8">

                    {/* Selector de Tipo (Estilo Prioridad) */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                            <User size={14} className="mr-2 text-primary-600" /> Tipo de Cliente
                        </label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => { setCustomerType('INDIVIDUAL'); setFormData({ ...formData, documentType: country === 'VE' ? 'V' : 'ID' }) }}
                                className={`
                                    py-3 text-[10px] font-black rounded-xl border-2 transition-all uppercase tracking-widest flex items-center justify-center space-x-2
                                    ${customerType === 'INDIVIDUAL'
                                        ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/20'
                                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary-600/30'}
                                `}
                            >
                                <User size={14} /> <span>Persona Natural</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setCustomerType('BUSINESS'); setFormData({ ...formData, documentType: country === 'VE' ? 'J' : 'TAX' }) }}
                                className={`
                                    py-3 text-[10px] font-black rounded-xl border-2 transition-all uppercase tracking-widest flex items-center justify-center space-x-2
                                    ${customerType === 'BUSINESS'
                                        ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/20'
                                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-primary-600/30'}
                                `}
                            >
                                <Building2 size={14} /> <span>Empresa / Jurídico</span>
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Columna Izquierda: Identidad y Contacto */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                                    <User size={14} className="mr-2 text-primary-600" /> {customerType === 'INDIVIDUAL' ? 'Nombre Completo' : 'Razón Social'}
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={customerType === 'INDIVIDUAL' ? 'Ej. Juan Pérez' : 'Ej. Soluciones C.A.'}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-bold placeholder:font-normal"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                                    <Briefcase size={14} className="mr-2 text-primary-600" /> Documento ({country})
                                </label>
                                <div className="flex space-x-2">
                                    <select
                                        value={formData.documentType}
                                        onChange={e => setFormData({ ...formData, documentType: e.target.value })}
                                        className="w-20 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2 text-xs font-bold outline-none focus:ring-2 focus:ring-primary-500/20"
                                    >
                                        {getDocTypes().map(dt => (
                                            <option key={dt.value} value={dt.value}>{dt.label}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="text"
                                        value={formData.documentNumber}
                                        onChange={e => setFormData({ ...formData, documentNumber: e.target.value })}
                                        placeholder="12345678"
                                        className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-mono font-bold"
                                    />
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
                                        placeholder="+58..."
                                        className={`w-full bg-slate-50 dark:bg-slate-950 border ${errors.phone ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium`}
                                        required
                                    />
                                    {errors.phone && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.phone}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                                        <MessageSquare size={14} className="mr-2 text-primary-600" /> WhatsApp
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.whatsapp || ''}
                                        onChange={(e) => handlePhoneChange(e, 'whatsapp')}
                                        placeholder="Igual..."
                                        className={`w-full bg-slate-50 dark:bg-slate-900 border ${errors.whatsapp ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'} rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium`}
                                    />
                                    {errors.whatsapp && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.whatsapp}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                                    <Mail size={14} className="mr-2 text-primary-600" /> Email
                                </label>
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
                                />
                            </div>
                        </div>

                        {/* Columna Derecha: Ubicación y Notas */}
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center ml-1">
                                    <MapPin size={14} className="mr-2 text-primary-600" /> Dirección
                                </label>
                                <input
                                    type="text"
                                    value={formData.address || ''}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    placeholder="Ubicación completa..."
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium"
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
                                    <FileText size={14} className="mr-2 text-primary-600" /> Notas
                                </label>
                                <textarea
                                    value={formData.notes || ''}
                                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Información adicional..."
                                    className="w-full min-h-[100px] bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 transition-all font-medium resize-none"
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-xl flex justify-between items-center z-10">
                <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer opacity-75 hover:opacity-100 transition-opacity">
                        <input
                            type="checkbox"
                            className="w-3.5 h-3.5 rounded border-slate-300 text-green-600 focus:ring-green-500"
                            checked={formData.notifyWhatsapp}
                            onChange={e => setFormData({ ...formData, notifyWhatsapp: e.target.checked })}
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notificar WhatsApp</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer opacity-75 hover:opacity-100 transition-opacity">
                        <input
                            type="checkbox"
                            checked={formData.notifyEmail}
                            onChange={e => setFormData({ ...formData, notifyEmail: e.target.checked })}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Notificar Email</span>
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
                        form="create-customer-form"
                        disabled={isSubmitting}
                        className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-500 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary-600/20 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        <span>{initialData ? 'Actualizar' : 'Guardar'} Cliente</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
