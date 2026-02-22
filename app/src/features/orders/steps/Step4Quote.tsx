import React, { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../../stores/useAuthStore';
import { Wrench, Package, Plus, Trash2, Receipt, DollarSign, Search, Loader2 } from 'lucide-react';
import { getEffectiveTerminology } from '../../../lib/terminology';
import { formatCurrency, formatDecimal, parseDecimal } from '../../../lib/finance';
import { client } from '../../../lib/api-client';

interface Step4Props {
    data: any;
    onUpdate: (data: any) => void;
    onNext: () => void;
}

export const Step4Quote = ({ data, onUpdate, onNext }: Step4Props) => {
    const { organization } = useAuthStore();
    const terminology = getEffectiveTerminology(organization?.businessType, organization?.customTerminology);
    const { partLabel, partPlural } = terminology;

    const primaryCurrency = organization?.primaryCurrency || 'USD';

    // Internal state for selected item
    const [newItemType, setNewItemType] = useState<'service' | 'product'>('service');
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [newItemQty, setNewItemQty] = useState('1');
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

    // Search and Suggestions
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Fetch catalog items based on type and search query
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (newItemName.length < 2 || selectedItemId) {
                setSuggestions([]);
                return;
            }

            setIsLoadingSuggestions(true);
            try {
                const response = newItemType === 'service'
                    ? await client.api.inventory.services.$get()
                    : await client.api.inventory.products.$get();

                if (!response.ok) throw new Error('Error al cargar catálogo');
                const allItems = await response.json();

                const filtered = allItems.filter((item: any) =>
                    item.name.toLowerCase().includes(newItemName.toLowerCase()) ||
                    (item.sku && item.sku.toLowerCase().includes(newItemName.toLowerCase()))
                ).slice(0, 5);

                setSuggestions(filtered);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
            } finally {
                setIsLoadingSuggestions(false);
            }
        };

        const timer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timer);
    }, [newItemName, newItemType, selectedItemId]);

    // Totals calculation
    useEffect(() => {
        const items = data.items || [];
        const subtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
        const taxRate = Number(organization?.taxRate) || 16;
        const taxAmount = (subtotal * taxRate) / 100;
        const total = subtotal + taxAmount;

        if (subtotal !== data.subtotal || taxAmount !== data.taxAmount || total !== data.total) {
            onUpdate({ subtotal, taxAmount, total });
        }
    }, [data.items, organization, onUpdate, data.subtotal, data.taxAmount, data.total]);

    // Handle selection from catalog
    const handleSelectSuggestion = (item: any) => {
        setNewItemName(item.name);
        setNewItemPrice(formatDecimal(item.salePrice || item.price || 0));
        setSelectedItemId(item.id);
        setShowSuggestions(false);
    };

    const handleAddItem = () => {
        const price = parseDecimal(newItemPrice);
        const quantity = parseDecimal(newItemQty) || 1;

        if (!newItemName) return;

        const currentItems = data.items || [];
        const newItem = {
            id: Date.now().toString(),
            type: newItemType,
            name: newItemName,
            price: price,
            quantity: quantity,
            total: price * quantity,
            serviceId: newItemType === 'service' ? selectedItemId : undefined,
            productId: newItemType === 'product' ? selectedItemId : undefined
        };

        onUpdate({ items: [...currentItems, newItem] });

        // Reset
        setNewItemName('');
        setNewItemPrice('');
        setNewItemQty('1');
        setSelectedItemId(null);
    };

    const removeItem = (id: string) => {
        const currentItems = data.items || [];
        onUpdate({ items: currentItems.filter((item: any) => item.id !== id) });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Cotización y Servicios</h3>
                <p className="text-xs text-slate-500 font-medium tracking-tight">Selecciona mano de obra y {partPlural.toLowerCase()} de tu catálogo.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900/50 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 space-y-4 shadow-sm relative">
                        <div className="flex space-x-1 bg-white dark:bg-slate-950 p-1 rounded-xl w-fit border border-slate-100 dark:border-slate-800">
                            <button
                                onClick={() => { setNewItemType('service'); setSelectedItemId(null); setNewItemName(''); }}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${newItemType === 'service' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : 'bg-slate-50 dark:bg-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            >
                                <Wrench size={14} /> <span>Servicio</span>
                            </button>
                            <button
                                onClick={() => { setNewItemType('product'); setSelectedItemId(null); setNewItemName(''); }}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2 ${newItemType === 'product' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-50 dark:bg-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                            >
                                <Package size={14} /> <span>{partLabel}</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-12 gap-3 items-end" ref={searchRef}>
                            <div className="col-span-12 md:col-span-6 relative">
                                <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Buscar en Catálogo</label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                        <Search size={14} />
                                    </div>
                                    <input
                                        type="text"
                                        value={newItemName}
                                        onChange={(e) => { setNewItemName(e.target.value); setSelectedItemId(null); }}
                                        onFocus={() => setShowSuggestions(suggestions.length > 0)}
                                        placeholder={newItemType === 'service' ? "Escribe para buscar servicios..." : `Escribe para buscar ${partPlural.toLowerCase()}...`}
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary-500/20"
                                    />
                                    {isLoadingSuggestions && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            <Loader2 size={14} className="animate-spin text-primary-500" />
                                        </div>
                                    )}
                                </div>

                                {/* Search Suggestions Dropdown */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                                        {suggestions.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => handleSelectSuggestion(item)}
                                                className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b last:border-0 border-slate-100 dark:border-slate-800"
                                            >
                                                <div>
                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.name}</p>
                                                    {item.sku && <p className="text-[9px] text-slate-400 font-mono">SKU: {item.sku}</p>}
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs font-black text-primary-600 dark:text-primary-400">
                                                        {formatCurrency(item.salePrice || item.price || 0, primaryCurrency, organization?.country)}
                                                    </p>
                                                    {newItemType === 'product' && <p className="text-[9px] text-slate-400">Stock: {item.stock}</p>}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="col-span-4 md:col-span-2">
                                <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Cant.</label>
                                <input
                                    type="number"
                                    value={newItemQty}
                                    onChange={(e) => setNewItemQty(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-center"
                                />
                            </div>
                            <div className="col-span-5 md:col-span-3">
                                <label className="text-[9px] font-bold text-slate-400 ml-1 uppercase">Precio Unit.</label>
                                <input
                                    type="text"
                                    value={newItemPrice}
                                    onChange={(e) => setNewItemPrice(e.target.value.replace(/[^0-9,.]/g, ''))}
                                    onBlur={(e) => {
                                        const numeric = parseDecimal(e.target.value);
                                        setNewItemPrice(formatDecimal(numeric));
                                    }}
                                    placeholder="0.00"
                                    className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-right font-mono"
                                />
                            </div>
                            <div className="col-span-3 md:col-span-1">
                                <button
                                    onClick={handleAddItem}
                                    className="w-full h-[38px] flex items-center justify-center bg-primary-600 dark:bg-primary-500 text-white rounded-xl hover:bg-primary-500 dark:hover:bg-primary-400 transition-all shadow-md shadow-primary-600/20 active:scale-95"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Items Agregados</label>
                        {(!data.items || data.items.length === 0) ? (
                            <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                                <Receipt className="mx-auto text-slate-300 mb-2" size={32} />
                                <p className="text-xs text-slate-400">No hay items en la cotización aún.</p>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                                {data.items.map((item: any) => (
                                    <div key={item.id} className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                                        <div className="flex items-center space-x-4">
                                            <div className={`p-2 rounded-lg ${item.type === 'service' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                                                {item.type === 'service' ? <Wrench size={14} /> : <Package size={14} />}
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight">{item.name}</p>
                                                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">
                                                    Cant: {item.quantity} x {formatCurrency(item.price, primaryCurrency, organization?.country)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span className="font-mono font-bold text-sm text-slate-700 dark:text-slate-300">
                                                {formatCurrency(item.quantity * item.price, primaryCurrency, organization?.country)}
                                            </span>
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-slate-300 hover:text-red-500 transition-colors bg-transparent p-1.5 hover:bg-red-50 rounded-lg"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-indigo-500"></div>

                        <h4 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center text-primary-600 dark:text-primary-400">
                            <DollarSign size={16} className="mr-2" /> Resumen
                        </h4>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                                <span>Subtotal</span>
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{formatCurrency(data.subtotal || 0, primaryCurrency, organization?.country)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                                <span>{organization?.taxName} ({organization?.taxRate}%)</span>
                                <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{formatCurrency(data.taxAmount || 0, primaryCurrency, organization?.country)}</span>
                            </div>
                            <div className="h-px bg-slate-100 dark:bg-white/10 my-4"></div>
                            <div className="flex justify-between items-end">
                                <span className="text-sm font-black uppercase tracking-widest text-slate-400">Total {primaryCurrency}</span>
                                <span className="text-2xl font-black font-mono tracking-tighter text-slate-900 dark:text-white">
                                    {formatCurrency(data.total || 0, primaryCurrency, organization?.country)}
                                </span>
                            </div>
                            {organization?.biCurrencyEnabled && organization?.secondaryCurrency && (
                                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total {organization.secondaryCurrency}</span>
                                    <span className="text-sm font-black text-primary-600 dark:text-primary-400 italic font-mono">
                                        {formatCurrency((data.total || 0) * Number(organization.exchangeRate || 1), organization.secondaryCurrency, organization.country)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
