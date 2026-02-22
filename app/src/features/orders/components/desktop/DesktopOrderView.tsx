import React from 'react';
import { ChevronLeft, Printer, Share2, MoreVertical, Clock, Image as ImageIcon, ClipboardList, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CustomerCard } from '../shared/CustomerCard';
import { AssetCard } from '../shared/AssetCard';
import { OrderTotalsWidget } from './OrderTotalsWidget';
import { TechnicianWidget } from './TechnicianWidget';
import { WorkflowStatusBar } from './WorkflowStatusBar';
import { OrderItemsTable } from './OrderItemsTable';

interface DesktopOrderViewProps {
    order: any;
    workflowConfig: any[];
}

export const DesktopOrderView: React.FC<DesktopOrderViewProps> = ({ order, workflowConfig }) => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 space-y-6">
            {/* 1. Header Superior */}
            <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate('/dashboard/orders')}
                        className="p-2 hover:bg-white dark:hover:bg-slate-900 rounded-xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <div className="flex items-center space-x-3 mb-1">
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">#{order.orderNumber}</h1>
                            <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                                {order.status}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                            <Clock size={12} className="mr-1" /> Creado el {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>

                <div className="flex items-center space-x-3">
                    <button className="flex items-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors">
                        <Printer size={16} className="mr-2" /> Imprimir
                    </button>
                    <button className="flex items-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-colors">
                        <Share2 size={16} className="mr-2" /> Compartir
                    </button>
                    <button className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 transition-colors">
                        <MoreVertical size={16} />
                    </button>
                </div>
            </div>

            {/* 2. Barra de Workflow Dinámica */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm">
                <WorkflowStatusBar currentStageId={order.currentStageId} stages={workflowConfig} />
            </div>

            {/* 3. Grid Principal */}
            <div className="grid grid-cols-3 gap-6">
                {/* Columna Izquierda (2/3): Información Técnica */}
                <div className="col-span-2 space-y-6 text-slate-900 dark:text-white">
                    {/* Tarjeta de Cliente y Activo */}
                    <div className="grid grid-cols-2 gap-6">
                        <CustomerCard customer={order.customer} />
                        <AssetCard asset={order.asset} />
                    </div>

                    {/* Descripción y Diagnóstico */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                        <h2 className="text-lg font-black text-slate-900 dark:text-white mb-6 tracking-tight border-l-4 border-indigo-500 pl-4 uppercase">Expediente Técnico</h2>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 italic">Motivo de Ingreso</h4>
                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                                        {order.description}
                                    </p>
                                </div>
                                {order.diagnosis && (
                                    <div>
                                        <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 italic">Diagnóstico Técnico</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-bold border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                                            {order.diagnosis}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-white dark:bg-slate-800/30 rounded-3xl p-6 border-2 border-slate-100 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center space-x-2 mb-4">
                                    <ClipboardList size={16} className="text-indigo-500" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Revisiones Realizadas</h4>
                                </div>
                                {order.checklist?.length > 0 ? (
                                    <div className="space-y-2">
                                        {order.checklist.slice(0, 4).map((item: any) => (
                                            <div key={item.id} className="flex items-center justify-between text-xs">
                                                <span className="text-slate-500">{item.item}</span>
                                                <span className={`font-black ${item.status === 'OK' ? 'text-emerald-500' : 'text-amber-500'}`}>{item.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2 text-slate-400 italic text-xs py-4">
                                        <AlertTriangle size={14} />
                                        <span>Sin checklist registrado</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Tabla de Items/Servicios */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">Servicios y Repuestos</h2>
                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{order.items?.length || 0} ITEMS</span>
                        </div>
                        <OrderItemsTable items={order.items || []} />
                    </div>
                </div>

                {/* Columna Derecha (1/3): Contexto y Finanzas */}
                <div className="space-y-6">
                    <OrderTotalsWidget order={order} />

                    <TechnicianWidget assignedTo={order.assignedTo} />

                    {/* Galería de Evidencia (Miniaturas) */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Evidencia Visual</p>
                            <ImageIcon size={14} className="text-slate-300" />
                        </div>
                        {order.photos?.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2">
                                {order.photos.slice(0, 6).map((photo: any) => (
                                    <div key={photo.id} className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all">
                                        <img src={photo.url} alt="Evidencia" className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-8 text-center bg-white dark:bg-slate-800/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 shadow-sm">
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 italic uppercase font-black">Sin registros fotográficos</p>
                            </div>
                        )}
                    </div>

                    {/* Timeline (Placeholder) */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 italic">Historial de Actividad</p>
                        <div className="space-y-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100 dark:before:bg-slate-800">
                            <div className="relative pl-8">
                                <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-indigo-500 border-4 border-white dark:border-slate-900 z-10 shadow-lg shadow-indigo-500/20"></div>
                                <p className="text-xs font-bold text-slate-900 dark:text-white">Orden Creada</p>
                                <p className="text-[10px] text-slate-400">Hoy, 10:30 AM</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
