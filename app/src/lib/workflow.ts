import { BusinessType } from './terminology';

export interface WorkflowStage {
    id: string;
    name: string;
    color: string;
    notifyCustomer: boolean;
    requiresApproval?: boolean;
}

export const DEFAULT_WORKFLOWS: Record<BusinessType, WorkflowStage[]> = {
    AUTOMOTIVE: [
        { id: 'REC', name: 'Recepción', color: '#6366F1', notifyCustomer: false },
        { id: 'DIA', name: 'Diagnóstico', color: '#8B5CF6', notifyCustomer: true },
        { id: 'PRE', name: 'Presupuesto', color: '#EC4899', notifyCustomer: true },
        { id: 'REP', name: 'En Reparación', color: '#3B82F6', notifyCustomer: true },
        { id: 'QA', name: 'Control de Calidad', color: '#10B981', notifyCustomer: false },
        { id: 'RDY', name: 'Listo para Entrega', color: '#22C55E', notifyCustomer: true },
        { id: 'DLV', name: 'Entregado', color: '#64748B', notifyCustomer: false },
    ],
    ELECTRONICS: [
        { id: 'REC', name: 'Recibido', color: '#6366F1', notifyCustomer: false },
        { id: 'INS', name: 'Inspección Técncia', color: '#8B5CF6', notifyCustomer: true },
        { id: 'QUO', name: 'Cotización', color: '#EC4899', notifyCustomer: true },
        { id: 'FIX', name: 'En Laboratorio', color: '#3B82F6', notifyCustomer: true },
        { id: 'TST', name: 'Pruebas', color: '#10B981', notifyCustomer: false },
        { id: 'RDY', name: 'Listo para Retiro', color: '#22C55E', notifyCustomer: true },
    ],
    MANUFACTURING: [
        { id: 'REC', name: 'Recepción Pieza', color: '#6366F1', notifyCustomer: false },
        { id: 'EVL', name: 'Evaluación Técnica', color: '#8B5CF6', notifyCustomer: true },
        { id: 'PRC', name: 'En Proceso', color: '#3B82F6', notifyCustomer: true },
        { id: 'QA', name: 'Control QA', color: '#10B981', notifyCustomer: false },
        { id: 'CMP', name: 'Terminado', color: '#22C55E', notifyCustomer: true },
    ],
    OTHER: [
        { id: 'REC', name: 'Recibido', color: '#6366F1', notifyCustomer: false },
        { id: 'PRC', name: 'En Proceso', color: '#3B82F6', notifyCustomer: true },
        { id: 'RDY', name: 'Listo', color: '#22C55E', notifyCustomer: true },
    ]
};
