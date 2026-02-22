import React, { useState } from 'react';
import { X, Send, User, Loader2, MessageSquare, FileText, CheckCircle, Clock } from 'lucide-react';
import { useSendOrderMessage } from '../../../../hooks/useApi';
import { formatCurrency } from '../../../../lib/finance';
import { useAuthStore } from '../../../../stores/useAuthStore';
import { getEffectiveTerminology } from '../../../../lib/terminology';
import { OrderFull } from '../../../../types/api';

interface WhatsAppMessageModalProps {
    order: OrderFull;
    onClose: () => void;
}

export const WhatsAppMessageModal: React.FC<WhatsAppMessageModalProps> = ({ order, onClose }) => {
    const { organization } = useAuthStore();
    const term = getEffectiveTerminology(organization?.businessType, organization?.customTerminology);
    const sendMessage = useSendOrderMessage();

    const [message, setMessage] = useState('');
    const [saveToHistory, setSaveToHistory] = useState(true);

    const phone = order.customer?.whatsapp || order.customer?.phone || '';
    const customerName = order.customer?.name || 'Cliente';
    const assetInfo = `${order.asset?.field1 || ''} ${order.asset?.field2 || ''}`.trim();
    const total = formatCurrency(Number(order.total), organization?.primaryCurrency || 'USD', organization?.country || 'VE');

    const templates = [
        {
            icon: FileText,
            label: 'Enviar Cuenta',
            text: `Hola ${customerName}, te enviamos el detalle de tu orden #${order.orderNumber}.\n\n${term.assetLabel}: ${assetInfo}\nTotal: ${total}\n\n¿Tienes alguna pregunta?`,
        },
        {
            icon: Clock,
            label: 'Confirmar Cita',
            text: `Hola ${customerName}, te escribimos desde ${organization?.name || 'el taller'} para confirmar tu cita. Tu ${term.assetLabel.toLowerCase()} ${assetInfo} está listo para ser atendido.`,
        },
        {
            icon: CheckCircle,
            label: 'Trabajo Listo',
            text: `Hola ${customerName}, ¡buenas noticias! Tu ${term.assetLabel.toLowerCase()} ${assetInfo} está listo. Puedes pasar a recogerlo cuando gustes.`,
        },
    ];

    const handleApplyTemplate = (text: string) => {
        setMessage(text);
    };

    const handleSend = async () => {
        if (!message.trim()) return;

        try {
            await sendMessage.mutateAsync({
                orderId: order.id,
                message: message.trim(),
                saveToHistory,
            });
            onClose();
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const insertVariable = (variable: string) => {
        setMessage((prev) => prev + variable);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                            <MessageSquare size={24} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                Enviar Mensaje
                            </h2>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                vía WhatsApp
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all text-slate-500">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 rounded-2xl p-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center text-white">
                                <User size={18} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{customerName}</p>
                                <p className="text-xs text-green-600 dark:text-green-400 font-mono">{phone}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-2">
                            Plantillas Rápidas
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {templates.map((t, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleApplyTemplate(t.text)}
                                    className="flex items-center space-x-2 px-3 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                                >
                                    <t.icon size={14} />
                                    <span>{t.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 block mb-2">
                            Mensaje
                        </label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="Escribe tu mensaje aquí..."
                            rows={5}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-green-500/20 transition-all resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-wrap">
                            <span className="text-[9px] font-black text-slate-400 uppercase">Variables:</span>
                            {[
                                { label: 'Cliente', value: customerName },
                                { label: 'Orden', value: `#${order.orderNumber}` },
                                { label: term.assetLabel, value: assetInfo },
                                { label: 'Total', value: total },
                            ].map((v, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => insertVariable(v.value)}
                                    className="text-[9px] font-bold text-primary-600 bg-primary-50 dark:bg-primary-500/10 px-2 py-1 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-500/20 transition-all"
                                >
                                    {v.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <label className="flex items-center space-x-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={saveToHistory}
                            onChange={(e) => setSaveToHistory(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                            Guardar en historial de la orden
                        </span>
                    </label>
                </div>

                <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSend}
                        disabled={!message.trim() || sendMessage.isPending}
                        className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-green-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sendMessage.isPending ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Send size={16} />
                        )}
                        <span>{sendMessage.isPending ? 'Enviando...' : 'Enviar WhatsApp'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
