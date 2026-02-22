import { Phone, MapPin, Edit, Trash2, Mail, MessageCircle, User } from 'lucide-react';

interface CustomerCardProps {
    customer: any;
    onClick: () => void;
    onEdit: (e: React.MouseEvent) => void;
    onDelete?: (e: React.MouseEvent) => void;
}

export const CustomerCard = ({ customer, onClick, onEdit, onDelete }: CustomerCardProps) => {
    return (
        <div
            onClick={onClick}
            className="group bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-300/50 dark:border-slate-800/80 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all relative overflow-hidden cursor-pointer"
        >
            {/* Aspecto de Identidad (Top) */}
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-2xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                    <User size={22} className="hidden group-hover:block" />
                    <span className="font-black text-sm uppercase group-hover:hidden">{customer.name.substring(0, 2)}</span>
                </div>
                <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registrado</span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white mt-0.5">
                        {new Date(customer.createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            {/* Nombre y Detalles (Middle) */}
            <div className="mb-4">
                <h3 className="font-black text-slate-900 dark:text-white uppercase text-sm tracking-tight mb-1 line-clamp-1 group-hover:text-primary-600 transition-colors">
                    {customer.name}
                </h3>
                <div className="flex items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <MapPin size={10} className="mr-1.5 text-primary-500" />
                    {customer.city ? `${customer.city}, ${customer.state}` : 'Ubicación no registrada'}
                </div>
            </div>

            {/* Contacto y Acciones (Footer) */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center space-x-3 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    <div className="flex items-center text-slate-700 dark:text-slate-300">
                        <Phone size={12} className="mr-1.5 text-primary-500" /> {customer.phone}
                    </div>
                </div>

                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <button
                        onClick={onEdit}
                        className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-all"
                        title="Editar"
                    >
                        <Edit size={14} />
                    </button>
                    {onDelete && (
                        <button
                            onClick={onDelete}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all"
                            title="Eliminar"
                        >
                            <Trash2 size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Indicators (Bottom Right Absolute as Icons) */}
            <div className="absolute top-2 right-2 flex space-x-1 opacity-30 group-hover:opacity-100 transition-opacity">
                {customer.notifyWhatsapp && (
                    <MessageCircle size={10} className="text-emerald-500" />
                )}
                {customer.email && (
                    <Mail size={10} className="text-indigo-500" />
                )}
            </div>
        </div>
    );
};
