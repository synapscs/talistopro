import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, Wrench, Package, Loader2 } from 'lucide-react';
import { client } from '../../../../../lib/api-client';
import { formatCurrency, parseDecimal, formatDecimal } from '../../../../../lib/finance';
import { useAuthStore } from '../../../../../stores/useAuthStore';
import { getEffectiveTerminology } from '../../../../../lib/terminology';

interface QuickAddItemProps {
    onAdd: (item: any) => void;
    onClose: () => void;
}

export const QuickAddItem = ({ onAdd, onClose }: QuickAddItemProps) => {
    const { organization } = useAuthStore();
    const term = getEffectiveTerminology(organization?.businessType, organization?.customTerminology);
    const country = organization?.country || 'VE';
    const currency = organization?.primaryCurrency || 'USD';

    const [type, setType] = useState<'service' | 'product'>('service');
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [qty, setQty] = useState('1');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchItems = async () => {
            if (name.length < 2 || selectedId) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                const res = type === 'service'
                    ? await client.api.inventory.services.$get()
                    : await client.api.inventory.products.$get();

                if (!res.ok) throw new Error();
                const all = await res.json();
                const filtered = all.filter((i: any) =>
                    i.name.toLowerCase().includes(name.toLowerCase()) ||
                    (i.sku && i.sku.toLowerCase().includes(name.toLowerCase()))
                ).slice(0, 5);

                setSuggestions(filtered);
                setShowSuggestions(true);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };

        const timer = setTimeout(fetchItems, 300);
        return () => clearTimeout(timer);
    }, [name, type, selectedId]);

    const handleSelect = (item: any) => {
        setName(item.name);
        setPrice(formatDecimal(item.salePrice || item.price || 0));
        setSelectedId(item.id);
        setShowSuggestions(false);
    };

    const handleAdd = () => {
        if (!name || !price) return;
        const numericPrice = parseDecimal(price);
        const numericQty = Number(qty) || 1;

        onAdd({
            id: `temp-${Date.now()}`,
            type,
            name,
            price: numericPrice,
            quantity: numericQty,
            serviceId: type === 'service' ? selectedId : undefined,
            productId: type === 'product' ? selectedId : undefined
        });

        // Reset
        setName('');
        setPrice('');
        setQty('1');
        setSelectedId(null);
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 animate-in fade-in zoom-in-95 duration-200 shadow-xl" ref={containerRef}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-100 dark:border-slate-800">
                    <button
                        onClick={() => { setType('service'); setSelectedId(null); setName(''); }}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center space-x-1.5 ${type === 'service' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Wrench size={12} /> <span>Servicio</span>
                    </button>
                    <button
                        onClick={() => { setType('product'); setSelectedId(null); setName(''); }}
                        className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center space-x-1.5 ${type === 'product' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Package size={12} /> <span>{term.partLabel}</span>
                    </button>
                </div>
                <button onClick={onClose} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                    <X size={16} />
                </button>
            </div>

            <div className="grid grid-cols-12 gap-3 items-end relative">
                <div className="col-span-12 md:col-span-6 relative">
                    <label className="text-[8px] font-black text-slate-400 uppercase ml-1">Descripción / Catálogo</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => { setName(e.target.value); setSelectedId(null); }}
                            onFocus={() => setShowSuggestions(suggestions.length > 0)}
                            placeholder="Buscar o escribir nombre..."
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 font-medium"
                        />
                        {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-primary-500" size={12} />}
                    </div>

                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1">
                            {suggestions.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => handleSelect(item)}
                                    className="w-full flex items-center justify-between p-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b last:border-0 border-slate-100 dark:border-slate-800"
                                >
                                    <div>
                                        <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200">{item.name}</p>
                                        <p className="text-[9px] text-slate-400 font-mono uppercase italic">{item.sku || 'Sin SKU'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[11px] font-black text-primary-600">{formatCurrency(item.salePrice || item.price || 0, currency, country)}</p>
                                        {type === 'product' && <p className="text-[9px] text-slate-400">Stock: {item.stock}</p>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="col-span-4 md:col-span-2">
                    <label className="text-[8px] font-black text-slate-400 uppercase ml-1 text-center block">Cant.</label>
                    <input
                        type="number"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-center font-bold"
                    />
                </div>

                <div className="col-span-5 md:col-span-3">
                    <label className="text-[8px] font-black text-slate-400 uppercase ml-1 text-right block">Precio Unit.</label>
                    <input
                        type="text"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary-500/20 text-right font-mono font-bold"
                    />
                </div>

                <div className="col-span-3 md:col-span-1">
                    <button
                        onClick={handleAdd}
                        disabled={!name || !price}
                        className="w-full h-[36px] flex items-center justify-center bg-primary-600 text-white rounded-xl hover:bg-primary-500 transition-all shadow-lg shadow-primary-600/20 active:scale-95 disabled:opacity-50"
                    >
                        <Plus size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};
