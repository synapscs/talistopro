import React, { useState } from 'react';
import { X, Send, User, Loader2, MessageSquare, FileText, CheckCircle, Clock } from 'lucide-react';
import { client } from '../../lib/api-client';

interface CustomerWhatsAppModalProps {
    customer: {
        id: string;
        name: string;
        phone: string;
        whatsapp?: string;
    };
    organizationName?: string;
    onClose: () => void;
}

export const CustomerWhatsAppModal: React.FC<CustomerWhatsAppModalProps> = ({
    customer,
    organizationName = 'el taller',
    onClose,
}) => {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    const phone = customer.whatsapp || customer.phone || '';

    const templates = [
        {
            icon: FileText,
            label: 'Saludo',
            text: `Hola ${customer.name}, te escribimos desde ${organizationName}. ¿En qué podemos ayudarte?`,
        },
        {
            icon: Clock,
            label: 'Seguimiento',
            text: `Hola ${customer.name}, te escribimos para dar seguimiento a tu última visita. ¿Cómo ha estado todo?`,
        },
        {
            icon: CheckCircle,
            label: 'Promoción',
            text: `Hola ${customer.name}, tenemos una promoción especial para ti en ${organizationName}. ¿Te gustaría conocer más detalles?`,
        },
    ];

    const handleApplyTemplate = (text: string) => {
        setMessage(text);
    };

    const handleSend = async () => {
        if (!message.trim()) return;

        setIsSending(true);
        
        try {
            const res = await client.api.notifications.whatsapp.$post({
                json: {
                    phone,
                    message: message.trim(),
                    customerId: customer.id,
                },
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error((error as any).message || 'Error al enviar');
            }
            
            onClose();
        } catch (error) {
            console.error('Error sending message:', error);
            alert(error instanceof Error ? error.message : 'Error al enviar el mensaje');
        } finally {
            setIsSending(false);
        }
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
                                <p className="text-sm font-bold text-slate-900 dark:text-white">{customer.name}</p>
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
                        disabled={!message.trim() || isSending}
                        className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-black uppercase text-xs tracking-widest transition-all shadow-lg shadow-green-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSending ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Send size={16} />
                        )}
                        <span>{isSending ? 'Enviando...' : 'Enviar WhatsApp'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
