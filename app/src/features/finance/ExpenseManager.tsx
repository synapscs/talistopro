import { useState } from 'react';
import {
    Plus,
    Search,
    TrendingDown,
    Building2,
    Calendar as CalendarIcon,
    Filter,
    MoreVertical,
    ArrowDownCircle,
    Users2,
    Tag,
    DollarSign,
    Loader2,
    Users,
    Trash2,
    Edit3,
    ExternalLink,
    Phone,
    Mail,
    MapPin
} from 'lucide-react';
import { useExpenses, useSuppliers, useCreateExpense, useUpdateExpense, useDeleteExpense, useDeleteSupplier } from '../../hooks/useApi';
import { SupplierForm } from './SupplierForm';
import { ExpenseForm } from './ExpenseForm';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const ExpenseManager = () => {
    const queryClient = useQueryClient();
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddExpense, setShowAddExpense] = useState(false);
    const [editingExpense, setEditingExpense] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'expenses' | 'suppliers'>('expenses');
    const [showSupplierForm, setShowSupplierForm] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState<any>(null);

    // Queries (Aislamiento de seguridad manejado por el servidor)
    const { data: expenses, isLoading } = useExpenses();
    const { data: suppliers } = useSuppliers();

    // Mutations
    const createExpense = useCreateExpense();
    const updateExpense = useUpdateExpense();
    const deleteExpense = useDeleteExpense();
    const deleteSupplier = useDeleteSupplier();

    const totalGastos = expenses?.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0) || 0;

    if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-indigo-500" size={32} /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate">Gastos y Proveedores</h1>
                    <p className="text-slate-500 dark:text-slate-400">Gestiona tus egresos operativos y proveedores.</p>
                </div>
                <div className="flex items-center space-x-3">
                    {activeTab === 'expenses' ? (
                        <button
                            onClick={() => { setEditingExpense(null); setShowAddExpense(true); }}
                            className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 px-6 rounded-2xl shadow-lg shadow-primary-600/20 transition-all flex items-center space-x-2"
                        >
                            <Plus size={18} />
                            <span>Registrar Gasto</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => { setEditingSupplier(null); setShowSupplierForm(true); }}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-2xl shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2"
                        >
                            <Plus size={18} />
                            <span>Nuevo Proveedor</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center space-x-1 bg-white/50 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit">
                <button
                    onClick={() => setActiveTab('expenses')}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'expenses' ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Gastos
                </button>
                <button
                    onClick={() => setActiveTab('suppliers')}
                    className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'suppliers' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                >
                    Proveedores
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/5 rounded-full blur-2xl group-hover:bg-red-500/10 transition-all" />
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                            <TrendingDown size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Egresos</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">${totalGastos.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-500">
                            <Users2 size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Proveedores Activos</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{suppliers?.filter((s: any) => s.active).length || 0}</h3>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                    <div className="flex items-center space-x-4">
                        <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                            <ArrowDownCircle size={24} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Gasto Promedio</p>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                                ${expenses?.length ? (totalGastos / expenses.length).toFixed(0) : 0}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder={activeTab === 'expenses' ? "Buscar gastos..." : "Buscar proveedores..."}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <button className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                            <Filter size={18} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {activeTab === 'expenses' ? (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-950/50">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Gasto / Concepto</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Proveedor</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoría</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Monto</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {expenses?.filter((e: any) => e.description.toLowerCase().includes(searchTerm.toLowerCase())).map((expense: any) => (
                                    <tr key={expense.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors group">
                                        <td className="px-6 py-4 space-y-1">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{expense.description}</p>
                                            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider tabular-nums">ID: {expense.id.slice(0, 8)}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-200 dark:border-slate-700">
                                                    <Building2 size={14} />
                                                </div>
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                                    {expense.supplier?.name || '--'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2 text-slate-500">
                                                <CalendarIcon size={14} />
                                                <span className="text-xs font-medium italic">
                                                    {format(new Date(expense.date), 'dd MMM, yyyy', { locale: es })}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                                {expense.category?.name || 'Varios'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-black text-red-500 tabular-nums">
                                                -${Number(expense.amount).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-1 opacity-0 group-hover:opacity-100 transition-all">
                                                <button
                                                    onClick={() => { setEditingExpense(expense); setShowAddExpense(true); }}
                                                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm('¿Eliminar este registro de gasto?')) {
                                                            await deleteExpense.mutateAsync(expense.id);
                                                        }
                                                    }}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(!expenses || expenses.length === 0) && (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <p className="text-slate-500 italic text-sm text-balance">No hay gastos registrados que coincidan.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50 dark:bg-slate-950/50">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Proveedor / Empresa</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Contacto</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Ubicación</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {suppliers?.filter((s: any) => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.taxName?.toLowerCase().includes(searchTerm.toLowerCase())).map((supplier: any) => (
                                    <tr key={supplier.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs border border-indigo-500/20">
                                                    {supplier.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{supplier.name}</p>
                                                    {supplier.taxName && <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{supplier.taxName}</p>}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 space-y-1">
                                            <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                                                <Phone size={12} className="text-slate-400" />
                                                <span>{supplier.phone || supplier.whatsapp || '--'}</span>
                                            </div>
                                            {supplier.email && (
                                                <div className="flex items-center space-x-2 text-[10px] text-slate-500">
                                                    <Mail size={12} className="text-slate-400" />
                                                    <span>{supplier.email}</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2 text-xs text-slate-600 dark:text-slate-400 italic">
                                                <MapPin size={12} />
                                                <span>{supplier.city ? `${supplier.city}, ${supplier.state || ''}` : 'No definido'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${supplier.active ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                                {supplier.active ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-1">
                                                <button
                                                    onClick={() => { setEditingSupplier(supplier); setShowSupplierForm(true); }}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <Edit3 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => { if (confirm('¿Eliminar proveedor?')) deleteSupplier.mutate(supplier.id); }}
                                                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {(!suppliers || suppliers.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <p className="text-slate-500 italic text-sm">No hay proveedores registrados.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Modals */}
            {showAddExpense && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <ExpenseForm
                        onClose={() => {
                            setShowAddExpense(false);
                            setEditingExpense(null);
                        }}
                        initialData={editingExpense}
                    />
                </div>
            )}

            {showSupplierForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <SupplierForm
                        onClose={() => {
                            setShowSupplierForm(false);
                            setEditingSupplier(null);
                        }}
                        initialData={editingSupplier}
                    />
                </div>
            )}
        </div>
    );
};
