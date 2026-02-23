import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, Car, Search, Loader2, Save, AlertCircle, MessageSquare, Bell } from 'lucide-react';
import { useCustomers, useAssets, useCreateAppointment, useUpdateAppointment } from '../../../hooks/useApi';
import { useAuthStore } from '../../../stores/useAuthStore';
import { getEffectiveTerminology } from '../../../lib/terminology';
import { format } from 'date-fns';

interface AppointmentFormProps {
    onClose: () => void;
    initialData?: any;
    defaultDate?: Date;
    onSuccess?: () => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
    onClose,
    initialData,
    defaultDate,
    onSuccess
}) => {
    const { organization } = useAuthStore();
    const terminology = getEffectiveTerminology(organization?.businessType, organization?.customTerminology);
    const createAppointment = useCreateAppointment();
    const updateAppointment = useUpdateAppointment();

    const [form, setForm] = useState({
        title: initialData?.title || '',
        description: initialData?.description || '',
        scheduledAt: initialData?.scheduledAt 
            ? format(new Date(initialData.scheduledAt), "yyyy-MM-dd'T'HH:mm")
            : defaultDate 
                ? format(defaultDate, "yyyy-MM-dd'T'HH:mm")
                : '',
        duration: initialData?.duration || 60,
        customerId: initialData?.customerId || '',
        tempClientName: initialData?.tempClientName || '',
        tempClientPhone: initialData?.tempClientPhone || '',
        assetId: initialData?.assetId || '',
        tempAssetInfo: initialData?.tempAssetInfo || '',
        reminder24h: initialData?.reminder24h ?? true,
        reminder1h: initialData?.reminder1h ?? false,
        sendConfirmation: initialData?.sendConfirmation ?? true,
        internalNotes: initialData?.internalNotes || '',
    });

    const [searchClient, setSearchClient] = useState('');
    const [showClientDropdown, setShowClientDropdown] = useState(false);

    const { data: customers, isLoading: loadingCustomers } = useCustomers();
    const { data: assets, isLoading: loadingAssets } = useAssets(undefined, form.customerId || undefined);

    const isEditing = !!initialData?.id;

    const filteredCustomers = customers?.filter((c: any) =>
        c.name.toLowerCase().includes(searchClient.toLowerCase()) ||
        c.phone?.includes(searchClient) ||
        c.whatsapp?.includes(searchClient)
    )?.slice(0, 8) || [];

    const selectedCustomer = customers?.find((c: any) => c.id === form.customerId);
    const customerAssets = assets?.filter((a: any) => a.customerId === form.customerId) || [];

    useEffect(() => {
        if (form.customerId && !searchClient && selectedCustomer) {
            setSearchClient(selectedCustomer.name);
        }
    }, [form.customerId, selectedCustomer]);

    const handleSelectCustomer = (customer: any) => {
        setForm(prev => ({
            ...prev,
            customerId: customer.id,
            tempClientName: '',
            tempClientPhone: '',
            assetId: '',
            tempAssetInfo: '',
        }));
        setSearchClient(customer.name);
        setShowClientDropdown(false);
    };

    const handleUseTempClient = () => {
        setForm(prev => ({
            ...prev,
            customerId: '',
            assetId: '',
        }));
        setShowClientDropdown(false);
    };

    const handleSubmit = async () => {
        if (!form.title || !form.scheduledAt) return;

        const payload = {
            title: form.title,
            description: form.description || undefined,
            scheduledAt: form.scheduledAt,
            duration: form.duration,
            customerId: form.customerId || null,
            tempClientName: !form.customerId ? form.tempClientName || searchClient : null,
            tempClientPhone: !form.customerId ? form.tempClientPhone : null,
            assetId: form.assetId || null,
            tempAssetInfo: !form.assetId && !form.customerId ? form.tempAssetInfo : null,
            reminder24h: form.reminder24h,
            reminder1h: form.reminder1h,
            sendConfirmation: form.sendConfirmation,
            internalNotes: form.internalNotes || null,
        };

        try {
            if (isEditing) {
                await updateAppointment.mutateAsync({ id: initialData.id, ...payload });
            } else {
                await createAppointment.mutateAsync(payload);
            }
            onSuccess?.();
            onClose();
        } catch (error) {
            console.error('Error saving appointment:', error);
        }
    };

    const isValid = form.title && form.scheduledAt && (form.customerId || form.tempClientName || searchClient);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                {isEditing ? 'Editar Cita' : 'Nueva Cita'}
                            </h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                Programa una cita
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {/* Cliente */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                            <User size={12} className="mr-1.5" /> Cliente
                        </label>
                        
                        {!form.customerId ? (
                            <div className="space-y-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input
                                        type="text"
                                        value={searchClient}
                                        onChange={(e) => {
                                            setSearchClient(e.target.value);
                                            setShowClientDropdown(true);
                                        }}
                                        onFocus={() => setShowClientDropdown(true)}
                                        placeholder="Buscar cliente o escribir nombre nuevo..."
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20"
                                    />
                                    
                                    {showClientDropdown && searchClient.length >= 1 && (
                                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                                            {loadingCustomers ? (
                                                <div className="p-4 text-center">
                                                    <Loader2 className="animate-spin mx-auto text-primary-500" size={20} />
                                                </div>
                                            ) : filteredCustomers.length > 0 ? (
                                                <>
                                                    {filteredCustomers.map((c: any) => (
                                                        <button
                                                            key={c.id}
                                                            onClick={() => handleSelectCustomer(c)}
                                                            className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-100 dark:border-slate-800 last:border-0"
                                                        >
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{c.name}</p>
                                                                <p className="text-xs text-slate-400">{c.phone || c.whatsapp}</p>
                                                            </div>
                                                            <User size={16} className="text-slate-300" />
                                                        </button>
                                                    ))}
                                                    <button
                                                        onClick={handleUseTempClient}
                                                        className="w-full p-3 text-left hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors text-xs font-bold text-primary-600"
                                                    >
                                                        + Usar "{searchClient}" como cliente temporal
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    onClick={handleUseTempClient}
                                                    className="w-full p-4 text-left hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors text-sm font-bold text-primary-600"
                                                >
                                                    + Crear cliente: "{searchClient}"
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {searchClient && !form.customerId && (
                                    <input
                                        type="tel"
                                        value={form.tempClientPhone}
                                        onChange={(e) => setForm(prev => ({ ...prev, tempClientPhone: e.target.value }))}
                                        placeholder="Teléfono/WhatsApp (opcional)"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20"
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-500/10 border border-primary-200 dark:border-primary-500/20 rounded-xl">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center text-white text-sm font-black">
                                        {selectedCustomer?.name?.substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedCustomer?.name}</p>
                                        <p className="text-xs text-slate-500">{selectedCustomer?.phone || selectedCustomer?.whatsapp}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setForm(prev => ({ ...prev, customerId: '', assetId: '' }));
                                        setSearchClient('');
                                    }}
                                    className="text-xs font-bold text-primary-600 hover:text-primary-700"
                                >
                                    Cambiar
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Activo (solo si hay cliente seleccionado) */}
                    {form.customerId && (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                                <Car size={12} className="mr-1.5" /> {terminology.assetLabel} (opcional)
                            </label>
                            {loadingAssets ? (
                                <Loader2 className="animate-spin text-slate-400" size={20} />
                            ) : customerAssets.length > 0 ? (
                                <select
                                    value={form.assetId}
                                    onChange={(e) => setForm(prev => ({ ...prev, assetId: e.target.value }))}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20"
                                >
                                    <option value="">Sin {terminology.assetLabel.toLowerCase()} específico</option>
                                    {customerAssets.map((a: any) => (
                                        <option key={a.id} value={a.id}>
                                            {a.field1} {a.field2} {a.field4 ? `| ${a.field4}` : ''}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <p className="text-xs text-slate-400 italic">Este cliente no tiene {terminology.assetPlural.toLowerCase()} registrados.</p>
                            )}
                        </div>
                    )}

                    {/* Activo temporal (si no hay cliente) */}
                    {!form.customerId && searchClient && (
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                                <Car size={12} className="mr-1.5" /> {terminology.assetLabel} (opcional)
                            </label>
                            <input
                                type="text"
                                value={form.tempAssetInfo}
                                onChange={(e) => setForm(prev => ({ ...prev, tempAssetInfo: e.target.value }))}
                                placeholder={`Ej: Toyota Corolla Blanco`}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20"
                            />
                        </div>
                    )}

                    {/* Fecha y Hora */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                                <Calendar size={12} className="mr-1.5" /> Fecha y Hora
                            </label>
                            <input
                                type="datetime-local"
                                value={form.scheduledAt}
                                onChange={(e) => setForm(prev => ({ ...prev, scheduledAt: e.target.value }))}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20"
                            />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                                <Clock size={12} className="mr-1.5" /> Duración
                            </label>
                            <select
                                value={form.duration}
                                onChange={(e) => setForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20"
                            >
                                <option value={30}>30 minutos</option>
                                <option value={60}>1 hora</option>
                                <option value={90}>1.5 horas</option>
                                <option value={120}>2 horas</option>
                                <option value={180}>3 horas</option>
                            </select>
                        </div>
                    </div>

                    {/* Motivo */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            Motivo de la Cita *
                        </label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Ej: Cambio de aceite, Revisión de frenos..."
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                    </div>

                    {/* Descripción/Notas */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            Notas adicionales
                        </label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Detalles adicionales..."
                            rows={2}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                        />
                    </div>

                    {/* Opciones de notificación */}
                    <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-xl space-y-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center">
                            <Bell size={12} className="mr-1.5" /> Notificaciones
                        </p>
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center">
                                <MessageSquare size={14} className="mr-2 text-green-500" />
                                Enviar confirmación por WhatsApp
                            </span>
                            <input
                                type="checkbox"
                                checked={form.sendConfirmation}
                                onChange={(e) => setForm(prev => ({ ...prev, sendConfirmation: e.target.checked }))}
                                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                            />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                Recordatorio 24h antes
                            </span>
                            <input
                                type="checkbox"
                                checked={form.reminder24h}
                                onChange={(e) => setForm(prev => ({ ...prev, reminder24h: e.target.checked }))}
                                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                            />
                        </label>
                        <label className="flex items-center justify-between cursor-pointer">
                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                Recordatorio 1h antes
                            </span>
                            <input
                                type="checkbox"
                                checked={form.reminder1h}
                                onChange={(e) => setForm(prev => ({ ...prev, reminder1h: e.target.checked }))}
                                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                            />
                        </label>
                    </div>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!isValid || createAppointment.isPending || updateAppointment.isPending}
                        className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-primary-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {createAppointment.isPending || updateAppointment.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        <span>
                            {createAppointment.isPending || updateAppointment.isPending 
                                ? 'Guardando...' 
                                : isEditing ? 'Guardar Cambios' : 'Crear Cita'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
