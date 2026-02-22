import React from 'react';
import { Plus, Search, AlertTriangle, TrendingDown, DollarSign, Loader2, Edit, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useProducts, useDeleteProduct } from '../../hooks/useApi';
import { Product } from '../../types/api';
import { getEffectiveTerminology } from '../../lib/terminology';
import { formatCurrency } from '../../lib/finance';
import { ProductForm } from './ProductForm';

export const InventoryManager = () => {
    const { organization } = useAuthStore();
    const exchangeRate = organization?.exchangeRate || 1;
    const primaryCurrency = organization?.primaryCurrency || 'USD';
    const isBiCurrency = organization?.biCurrencyEnabled === true;

    // Obtener terminología dinámica sincronizada
    const terminology = getEffectiveTerminology(organization?.businessType, organization?.customTerminology);
    const { partLabel, partPlural } = terminology;

    // Hooks reales para Inventario
    const { data: products, isLoading } = useProducts();
    const deleteProduct = useDeleteProduct();

    const [showForm, setShowForm] = React.useState(false);
    const [editingProduct, setEditingProduct] = React.useState<Product | null>(null);
    const [search, setSearch] = React.useState('');

    const lowStockCount = (products as Product[] | undefined)?.filter((p) => (p.stock <= (p.minStock || 0)) && p.stock > 0).length || 0;
    const outOfStockCount = (products as Product[] | undefined)?.filter((p) => p.stock === 0).length || 0;
    const totalInventoryValue = (products as Product[] | undefined)?.reduce((acc, p) => acc + (p.stock * Number(p.salePrice)), 0) || 0;

    const filteredProducts = (products as Product[] | undefined)?.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    ) || [];

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 space-y-4">
                <Loader2 className="animate-spin text-primary-600" size={40} />
                <p className="text-slate-500 font-bold">Cargando inventario...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white truncate">Inventario de {partPlural}</h1>
                    <p className="text-slate-500 dark:text-slate-400">Controla tu stock y precios en {isBiCurrency ? `${primaryCurrency}/${organization?.secondaryCurrency}` : primaryCurrency}.</p>
                </div>
                <button
                    onClick={() => { setEditingProduct(null); setShowForm(true); }}
                    className="flex items-center justify-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-xl shadow-primary-600/20 active:scale-95"
                >
                    <Plus size={18} />
                    <span>Agregar {partLabel}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-red-50 dark:bg-red-500/10 p-4 rounded-xl border border-red-100 dark:border-red-500/20 flex items-center space-x-4">
                    <div className="p-2 bg-red-500 rounded-lg text-white">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">Agotados</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">{outOfStockCount}</p>
                    </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-500/10 p-4 rounded-xl border border-amber-100 dark:border-amber-500/20 flex items-center space-x-4">
                    <div className="p-2 bg-amber-500 rounded-lg text-white">
                        <TrendingDown size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Stock Bajo</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">{lowStockCount}</p>
                    </div>
                </div>
                <div className="bg-indigo-50 dark:bg-indigo-500/10 p-4 rounded-xl border border-indigo-100 dark:border-indigo-500/20 flex items-center space-x-4">
                    <div className="p-2 bg-indigo-500 rounded-lg text-white">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Valor Total ({primaryCurrency})</p>
                        <p className="text-xl font-black text-slate-900 dark:text-white">
                            {formatCurrency(totalInventoryValue, primaryCurrency, organization?.country)}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                    <div className="relative max-w-sm w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o SKU..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                                <th className="px-6 py-4 text-center">SKU</th>
                                <th className="px-6 py-4">{partLabel} / Marca</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4">Precio ({primaryCurrency})</th>
                                {isBiCurrency && <th className="px-6 py-4">Precio ({organization?.secondaryCurrency})</th>}
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">
                                        No se encontraron {partPlural.toLowerCase()} con los criterios de búsqueda.
                                    </td>
                                </tr>
                            ) : (filteredProducts as Product[]).map((prod) => (
                                <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 text-center font-mono text-[10px] text-slate-500">{prod.sku}</td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-sm text-slate-900 dark:text-white">{prod.name}</p>
                                        <p className="text-[10px] text-slate-500">{prod.category?.name || 'General'}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`
                                            px-2 py-1 text-[10px] font-bold rounded-full
                                            ${prod.stock === 0 ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' :
                                                prod.stock <= (prod.minStock || 0) ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                                                    'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'}
                                        `}>
                                            {prod.stock} unids.
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                                        {formatCurrency(Number(prod.salePrice), primaryCurrency, organization?.country)}
                                    </td>
                                    {isBiCurrency && organization?.secondaryCurrency && (
                                        <td className="px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400 italic">
                                            {formatCurrency(Number(prod.salePrice) * Number(exchangeRate), organization.secondaryCurrency, organization.country)}
                                        </td>
                                    )}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => { setEditingProduct(prod); setShowForm(true); }}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-primary-600 transition-colors"
                                                title="Editar"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    if (window.confirm('¿Eliminar este artículo del inventario?')) {
                                                        await deleteProduct.mutateAsync(prod.id);
                                                    }
                                                }}
                                                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Formulario de Producto */}
            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <ProductForm
                        onClose={() => {
                            setShowForm(false);
                            setEditingProduct(null);
                        }}
                        initialData={editingProduct}
                    />
                </div>
            )}
        </div>
    );
};
