import React, { useState, useEffect } from 'react';
import { X, ArrowRight, User, Car, Wrench, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useCreateOrder, useMembers, useUpdateAppointment, useCustomers, useAssets } from '../../../hooks/useApi';
import { useAuthStore } from '../../../stores/useAuthStore';
import { getEffectiveTerminology } from '../../../lib/terminology';
import { format } from 'date-fns';

interface ConvertToOrderModalProps {
    appointment: any;
    onClose: () => void;
    onSuccess?: (orderId: string) => void;
}

export const ConvertToOrderModal: React.FC<ConvertToOrderModalProps> = ({
    appointment,
    onClose,
    onSuccess
}) => {
    const { organization } = useAuthStore();
    const terminology = getEffectiveTerminology(organization?.businessType, organization?.customTerminology);
    const createOrder = useCreateOrder();
    const updateAppointment = useUpdateAppointment();
    const { data: members } = useMembers();
    const { data: customers } = useCustomers();

    const [step, setStep] = useState<'validate' | 'enrich' | 'creating'>('validate');
    
    // Estado para cliente
    const [useExistingCustomer, setUseExistingCustomer] = useState(!!appointment.customerId);
    const [selectedCustomerId, setSelectedCustomerId] = useState(appointment.customerId || '');
    const [searchPhone, setSearchPhone] = useState(appointment.tempClientPhone || '');
    const [newCustomerName, setNewCustomerName] = useState(appointment.tempClientName || '');
    
    // Estado para activo
    const [useExistingAsset, setUseExistingAsset] = useState(!!appointment.assetId);
    const [selectedAssetId, setSelectedAssetId] = useState(appointment.assetId || '');
    const [newAssetField1, setNewAssetField1] = useState('');
    const [newAssetField2, setNewAssetField2] = useState('');
    const [newAssetField4, setNewAssetField4] = useState('');

    // Estado para orden
    const [priority, setPriority] = useState(2);
    const [assignedToId, setAssignedToId] = useState('');
    const [description, setDescription] = useState(appointment.title || '');

    // Buscar assets del cliente seleccionado
    const { data: customerAssets } = useAssets(undefined, selectedCustomerId || undefined);

    // Buscar cliente existente por teléfono
    const foundCustomer = customers?.find((c: any) => 
        c.phone === searchPhone || c.whatsapp === searchPhone
    );

    useEffect(() => {
        if (foundCustomer && !selectedCustomerId) {
            setSelectedCustomerId(foundCustomer.id);
            setUseExistingCustomer(true);
        }
    }, [foundCustomer]);

    const priorities = [
        { value: 1, label: 'Baja', color: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' },
        { value: 2, label: 'Normal', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
        { value: 3, label: 'Alta', color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' },
        { value: 4, label: 'Urgente', color: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
    ];

    const handleConvert = async () => {
        if (!selectedCustomerId && !newCustomerName) return;
        
        setStep('creating');

        try {
            // 1. Crear o usar cliente
            let customerId = selectedCustomerId;
            
            if (!customerId && newCustomerName) {
                // Crear cliente nuevo
                const customerRes = await fetch('/api/customers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: newCustomerName,
                        phone: searchPhone || undefined,
                    }),
                });
                if (!customerRes.ok) throw new Error('Error creando cliente');
                const newCustomer = await customerRes.json();
                customerId = newCustomer.id;
            }

            // 2. Crear o usar activo
            let assetId = selectedAssetId;
            
            if (!assetId && newAssetField1 && newAssetField2) {
                // Crear activo nuevo
                const assetRes = await fetch('/api/assets', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        field1: newAssetField1,
                        field2: newAssetField2,
                        field4: newAssetField4 || undefined,
                        customerId,
                    }),
                });
                if (!assetRes.ok) throw new Error('Error creando activo');
                const newAsset = await assetRes.json();
                assetId = newAsset.id;
            }

            // 3. Crear orden de servicio
            const orderData = {
                customerId,
                assetId: assetId || undefined,
                description: description || appointment.title,
                priority,
                assignedToId: assignedToId || undefined,
                items: [],
                subtotal: 0,
                taxAmount: 0,
                discountAmount: 0,
                total: 0,
            };

            const order = await createOrder.mutateAsync(orderData as any);

            // 4. Vincular cita con orden
            await updateAppointment.mutateAsync({
                id: appointment.id,
                serviceOrderId: order.id,
                status: 'COMPLETED',
                convertedAt: new Date().toISOString(),
            } as any);

            onSuccess?.(order.id);
            onClose();
        } catch (error) {
            console.error('Error converting appointment:', error);
            setStep('enrich');
            alert('Error al convertir la cita. Por favor intenta de nuevo.');
        }
    };

    const canProceed = () => {
        if (!useExistingCustomer && !newCustomerName) return false;
        if (!useExistingAsset && (!newAssetField1 || !newAssetField2)) return false;
        return true;
    };

    const renderValidateStep = () => (
        <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                    <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                            Verificación de Datos
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">
                            Antes de crear la orden, verifica que los datos del cliente y {terminology.assetLabel.toLowerCase()} sean correctos.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">
                    Datos heredados de la cita
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cliente</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {appointment.customer?.name || appointment.tempClientName || 'Sin cliente'}
                        </p>
                        {appointment.tempClientPhone && (
                            <p className="text-xs text-slate-400 mt-1">{appointment.tempClientPhone}</p>
                        )}
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{terminology.assetLabel}</p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                            {appointment.asset 
                                ? `${appointment.asset.field1} ${appointment.asset.field2}`
                                : appointment.tempAssetInfo || 'Sin activo'}
                        </p>
                    </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Motivo de la Cita</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300">{appointment.title}</p>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={() => setStep('enrich')}
                    className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-bold text-sm transition-all"
                >
                    <span>Continuar</span>
                    <ArrowRight size={16} />
                </button>
            </div>
        </div>
    );

    const renderEnrichStep = () => (
        <div className="space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
            {/* Cliente */}
            <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center">
                    <User size={12} className="mr-1.5" /> Cliente
                </h4>

                {!appointment.customerId && (
                    <div className="space-y-3">
                        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3">
                            <p className="text-[10px] font-bold text-slate-400 mb-2">Teléfono de contacto:</p>
                            <input
                                type="tel"
                                value={searchPhone}
                                onChange={(e) => setSearchPhone(e.target.value)}
                                placeholder="Buscar por teléfono..."
                                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
                            />
                            {foundCustomer && (
                                <div className="mt-2 p-2 bg-green-50 dark:bg-green-500/10 rounded-lg border border-green-200 dark:border-green-500/20">
                                    <p className="text-xs font-bold text-green-700 dark:text-green-400">
                                        ✓ Cliente encontrado: {foundCustomer.name}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {foundCustomer || appointment.customerId ? (
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl">
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {foundCustomer?.name || appointment.customer?.name}
                            </p>
                            <p className="text-xs text-slate-500">
                                {foundCustomer?.phone || foundCustomer?.whatsapp || appointment.customer?.phone}
                            </p>
                        </div>
                        <CheckCircle size={20} className="text-green-500" />
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-xs text-slate-500">No se encontró cliente. Crea uno nuevo:</p>
                        <input
                            type="text"
                            value={newCustomerName}
                            onChange={(e) => setNewCustomerName(e.target.value)}
                            placeholder="Nombre completo del cliente"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                    </div>
                )}
            </div>

            {/* Activo */}
            <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center">
                    <Car size={12} className="mr-1.5" /> {terminology.assetLabel}
                </h4>

                {appointment.assetId ? (
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-xl">
                        <div>
                            <p className="text-sm font-bold text-slate-900 dark:text-white">
                                {appointment.asset?.field1} {appointment.asset?.field2}
                            </p>
                            <p className="text-xs text-slate-500">{appointment.asset?.field4}</p>
                        </div>
                        <CheckCircle size={20} className="text-green-500" />
                    </div>
                ) : customerAssets && customerAssets.length > 0 ? (
                    <select
                        value={selectedAssetId}
                        onChange={(e) => {
                            if (e.target.value === '_new') {
                                setUseExistingAsset(false);
                                setSelectedAssetId('');
                            } else {
                                setUseExistingAsset(true);
                                setSelectedAssetId(e.target.value);
                            }
                        }}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                        <option value="">Seleccionar {terminology.assetLabel.toLowerCase()}</option>
                        {customerAssets.map((a: any) => (
                            <option key={a.id} value={a.id}>
                                {a.field1} {a.field2} {a.field4 ? `| ${a.field4}` : ''}
                            </option>
                        ))}
                        <option value="_new">+ Crear nuevo {terminology.assetLabel.toLowerCase()}</option>
                    </select>
                ) : (
                    <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl">
                        <p className="text-xs text-slate-500">Crear nuevo {terminology.assetLabel.toLowerCase()}:</p>
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                value={newAssetField1}
                                onChange={(e) => setNewAssetField1(e.target.value)}
                                placeholder={terminology.assetFields?.field1?.label || 'Marca'}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
                            />
                            <input
                                type="text"
                                value={newAssetField2}
                                onChange={(e) => setNewAssetField2(e.target.value)}
                                placeholder={terminology.assetFields?.field2?.label || 'Modelo'}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
                            />
                        </div>
                        <input
                            type="text"
                            value={newAssetField4}
                            onChange={(e) => setNewAssetField4(e.target.value)}
                            placeholder={terminology.assetFields?.field4?.label || 'Placa/Serial'}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
                        />
                    </div>
                )}
            </div>

            {/* Descripción */}
            <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center">
                    <Wrench size={12} className="mr-1.5" /> Descripción del Servicio
                </h4>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Descripción del trabajo a realizar..."
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500/20 resize-none"
                />
            </div>

            {/* Prioridad y Técnico */}
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        Prioridad
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {priorities.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => setPriority(p.value)}
                                className={`py-2 rounded-lg text-xs font-bold transition-all ${
                                    priority === p.value 
                                        ? `${p.color} ring-2 ring-offset-1 ring-primary-500/30`
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                }`}
                            >
                                {p.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        {terminology.technicianLabel}
                    </label>
                    <select
                        value={assignedToId}
                        onChange={(e) => setAssignedToId(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-500/20"
                    >
                        <option value="">Sin asignar</option>
                        {members?.map((m: any) => (
                            <option key={m.id} value={m.id}>
                                {m.user?.name} ({m.role})
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                            <ArrowRight size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                Convertir a Orden
                            </h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                Cita del {format(new Date(appointment.scheduledAt), "d 'de' MMMM 'a las' HH:mm", { locale: undefined })}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {step === 'validate' && renderValidateStep()}
                    {step === 'enrich' && renderEnrichStep()}
                    {step === 'creating' && (
                        <div className="py-12 flex flex-col items-center justify-center">
                            <Loader2 className="animate-spin text-primary-600 mb-4" size={40} />
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                Creando orden de servicio...
                            </p>
                        </div>
                    )}
                </div>

                {step === 'enrich' && (
                    <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <button
                            onClick={() => setStep('validate')}
                            className="px-6 py-3 text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                        >
                            ← Atrás
                        </button>
                        <button
                            onClick={handleConvert}
                            disabled={!canProceed() || createOrder.isPending}
                            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-primary-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {createOrder.isPending ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <CheckCircle size={16} />
                            )}
                            <span>{createOrder.isPending ? 'Creando...' : 'Crear Orden de Servicio'}</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
