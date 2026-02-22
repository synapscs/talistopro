import { useEffect, useState } from 'react';
import { Share2, MessageSquare, Zap, CheckCircle2, AlertCircle, Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useQueryClient } from '@tanstack/react-query';
import { useSettings, useUpdateSettings } from '../../hooks/useApi';

export const IntegrationSettings = () => {
    const orgId = useAuthStore(s => s.organization?.id);
    const queryClient = useQueryClient();

    const { data: settings, isLoading } = useSettings();
    const mutation = useUpdateSettings();

    const [formData, setFormData] = useState({
        whatsappEnabled: false,
        evolutionUrl: '',
        evolutionInstance: '',
        evolutionApiKey: '',
        n8nEnabled: false,
        n8nWebhookUrl: ''
    });

    useEffect(() => {
        if (settings) {
            setFormData({
                whatsappEnabled: settings.whatsappEnabled || false,
                evolutionUrl: settings.evolutionUrl || '',
                evolutionInstance: settings.evolutionInstance || '',
                evolutionApiKey: settings.evolutionApiKey || '',
                n8nEnabled: settings.n8nEnabled || false,
                n8nWebhookUrl: settings.n8nWebhookUrl || ''
            });
        }
    }, [settings]);

    const handleSave = () => mutation.mutate(formData);

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Integraciones</h1>
                    <p className="text-slate-500 dark:text-slate-400">Configuración técnica de WhatsApp y Automatizaciones.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={mutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2"
                >
                    {mutation.isPending ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    <span>Guardar Cambios</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Evolution API Panel */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">Evolution-API</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Conexión WhatsApp</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 mb-4">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">Activar Notificaciones</span>
                            <button
                                onClick={() => setFormData({ ...formData, whatsappEnabled: !formData.whatsappEnabled })}
                                className={`w-12 h-6 rounded-full transition-all relative ${formData.whatsappEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.whatsappEnabled ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Evolution URL</label>
                                <input
                                    type="text"
                                    value={formData.evolutionUrl}
                                    onChange={e => setFormData({ ...formData, evolutionUrl: e.target.value })}
                                    placeholder="https://eo.tudominio.com"
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Instancia</label>
                                    <input
                                        type="text"
                                        value={formData.evolutionInstance}
                                        onChange={e => setFormData({ ...formData, evolutionInstance: e.target.value })}
                                        placeholder="NombreInstancia"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">API Key</label>
                                    <input
                                        type="password"
                                        value={formData.evolutionApiKey}
                                        onChange={e => setFormData({ ...formData, evolutionApiKey: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Automation Panel */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="flex items-center space-x-4 mb-6">
                        <div className="p-3 bg-primary-600/10 rounded-2xl text-primary-600">
                            <Zap size={24} />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">n8n / Webhooks</h3>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Automatización Externa</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 mb-4">
                            <span className="text-sm font-bold text-slate-900 dark:text-white">Activar Automatización</span>
                            <button
                                onClick={() => setFormData({ ...formData, n8nEnabled: !formData.n8nEnabled })}
                                className={`w-12 h-6 rounded-full transition-all relative ${formData.n8nEnabled ? 'bg-primary-600' : 'bg-slate-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.n8nEnabled ? 'left-7' : 'left-1'}`} />
                            </button>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Webhook URL (n8n)</label>
                            <div className="relative">
                                <Share2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                <input
                                    type="text"
                                    value={formData.n8nWebhookUrl}
                                    onChange={e => setFormData({ ...formData, n8nWebhookUrl: e.target.value })}
                                    placeholder="https://n8n.tuempresa.com/webhook/..."
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-12 pr-4 text-xs outline-none focus:ring-1 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
