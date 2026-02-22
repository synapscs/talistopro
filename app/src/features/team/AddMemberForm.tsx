import React, { useState } from 'react';
import { X, User, Shield, Lock, Save, Loader2, UserPlus } from 'lucide-react';
import { useCreateMember } from '../../hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import { CreateMemberInput, Member } from '../../types/api';

interface AddMemberFormProps {
    onClose: () => void;
}

export const AddMemberForm = ({ onClose }: AddMemberFormProps) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<CreateMemberInput>({
        name: '',
        email: '',
        role: 'technician',
        password: '',
    });

    const mutation = useCreateMember();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData, {
            onSuccess: () => onClose()
        });
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-primary-600 rounded-2xl text-white shadow-lg shadow-primary-600/20">
                        <UserPlus size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Anadir Miembro</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Acceso directo al equipo de trabajo.</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all text-slate-500">
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                {mutation.isError && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-600 text-[10px] font-black uppercase tracking-widest">
                        {mutation.error.message || 'Error al añadir miembro'}
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                            <User size={12} className="mr-2 text-primary-500" /> Nombre Completo
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ej: Juan Perez"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 px-5 text-xs focus:ring-2 focus:ring-primary-500/20 outline-none transition-all font-bold"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                            <Shield size={12} className="mr-2 text-primary-500" /> Rol en la Empresa
                        </label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 px-5 text-xs focus:ring-2 focus:ring-primary-500/20 outline-none transition-all font-black uppercase tracking-widest"
                        >
                            <option value="admin">Administrador</option>
                            <option value="operator">Operador / Recepcion</option>
                            <option value="technician">Tecnico / Especialista</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                            <Lock size={12} className="mr-2 text-primary-500" /> Contrasena Temporal
                        </label>
                        <input
                            type="text"
                            required
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="Minimo 6 caracteres"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 px-5 text-xs focus:ring-2 focus:ring-primary-500/20 outline-none transition-all font-bold"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                            Email de Acceso
                        </label>
                        <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="usuario@taller.com"
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 px-5 text-xs focus:ring-2 focus:ring-primary-500/20 outline-none transition-all font-bold"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={mutation.isPending}
                        className="flex items-center space-x-3 bg-primary-600 hover:bg-primary-500 text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary-600/20 active:scale-95 disabled:opacity-50"
                    >
                        {mutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        <span>{mutation.isPending ? 'Guardando...' : 'Anadir al Equipo'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};
