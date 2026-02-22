import React from 'react';
import { User, Phone, MessageSquare, Mail, MapPin } from 'lucide-react';

interface CustomerCardProps {
    customer: any;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer }) => {
    if (!customer) return null;

    return (
        <div className="group bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Expediente Cliente</p>
                <div className="p-2 bg-primary-100 dark:bg-primary-500/10 text-primary-600 rounded-xl group-hover:rotate-12 transition-transform">
                    <User size={16} />
                </div>
            </div>

            <div className="flex items-start space-x-4 mb-6">
                <div className="w-14 h-14 bg-primary-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary-500/20 shrink-0 group-hover:scale-110 transition-transform">
                    {customer.name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-black text-lg text-slate-900 dark:text-white leading-tight truncate group-hover:text-primary-600 transition-colors uppercase tracking-tight">{customer.name}</h3>
                    <div className="flex items-center mt-1 text-slate-500">
                        <Phone size={12} className="mr-1 text-primary-500" />
                        <span className="text-xs font-mono font-bold tracking-widest">{customer.phone}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-auto">
                <a
                    href={`https://wa.me/${customer.whatsapp?.replace(/\D/g, '') || customer.phone?.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center py-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                >
                    <MessageSquare size={14} className="mr-2" /> WhatsApp
                </a>
                <button className="flex items-center justify-center py-2.5 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-700 transition-all border border-slate-200 dark:border-slate-700">
                    <Mail size={14} className="mr-2" /> Email
                </button>
            </div>

            {customer.address && (
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-start">
                    <MapPin size={12} className="text-primary-500 mt-0.5 mr-2 shrink-0" />
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed font-bold uppercase tracking-tight">
                        {customer.address}
                    </p>
                </div>
            )}
        </div>
    );
};
