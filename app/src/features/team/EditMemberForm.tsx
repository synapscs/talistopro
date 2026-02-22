import React, { useState, useEffect } from 'react';
import { X, User, Shield, Save, Loader2 } from 'lucide-react';
import { useUpdateMember } from '../../hooks/useApi';
import { useQueryClient } from '@tanstack/react-query';
import { Member, UpdateMemberInput } from '../../types/api';

interface EditMemberFormProps {
    member: Member;
    onClose: () => void;
}

export const EditMemberForm = ({ member, onClose }: EditMemberFormProps) => {
    const queryClient = useQueryClient();
    const [role, setRole] = useState<Member['role']>(member.role);

    const mutation = useUpdateMember();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate({ id: member.id, role }, {
            onSuccess: () => onClose()
        });
    };

    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="p-8 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                        <User size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Editar Miembro</h2>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{member.user?.name}</p>
                    </div>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all text-slate-500">
                    <X size={20} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Email de Acceso</span>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{member.user?.email}</span>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center">
                            <Shield size={12} className="mr-2 text-primary-500" /> Rol en la Empresa
                        </label>
                        <select
                            value={role}
                            onChange={(e) => setRole(e.target.value as Member['role'])}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3.5 px-5 text-xs focus:ring-2 focus:ring-primary-500/20 outline-none transition-all font-black uppercase tracking-widest"
                        >
                            <option value="admin">Administrador</option>
                            <option value="operator">Operador / Recepcion</option>
                            <option value="technician">Tecnico / Especialista</option>
                        </select>
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
                        <span>{mutation.isPending ? 'Actualizando...' : 'Guardar Cambios'}</span>
                    </button>
                </div>
            </form>
        </div>
    );
};
