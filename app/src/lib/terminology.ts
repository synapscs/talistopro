export type BusinessType = 'AUTOMOTIVE' | 'ELECTRONICS' | 'MANUFACTURING' | 'OTHER';

export interface AssetField {
    label: string;
    placeholder?: string;
    required: boolean;
}

export interface TerminologyPreset {
    assetLabel: string;
    assetPlural: string;
    orderLabel: string;
    orderPlural: string;
    technicianLabel: string;
    workshopLabel: string;
    partLabel: string;
    partPlural: string;
    checkLabel: string;
    assetFields: {
        field1: AssetField;
        field2: AssetField;
        field3: AssetField;
        field4: AssetField;
        field5: AssetField;
        field6: AssetField;
    };
    categoryTypeColors?: {
        product: string;
        service: string;
        expense: string;
    };
}

export const TERMINOLOGY_PRESETS: Record<BusinessType, TerminologyPreset> = {
    AUTOMOTIVE: {
        assetLabel: 'Vehículo',
        assetPlural: 'Vehículos',
        orderLabel: 'Orden de Servicio',
        orderPlural: 'Órdenes de Servicio',
        technicianLabel: 'Técnico',
        workshopLabel: 'Taller',
        partLabel: 'Repuesto',
        partPlural: 'Repuestos',
        checkLabel: 'Revisión Técnica',
        assetFields: {
            field1: { label: 'Marca', placeholder: 'Ej: Toyota', required: true },
            field2: { label: 'Modelo', placeholder: 'Ej: Corolla', required: true },
            field3: { label: 'Año', placeholder: 'Ej: 2022', required: false },
            field4: { label: 'Placa', placeholder: 'Ej: ABC-123', required: true },
            field5: { label: 'Color', placeholder: 'Ej: Gris Plata', required: false },
            field6: { label: 'Kilometraje', placeholder: 'Ej: 50,000 km', required: false },
        },
        categoryTypeColors: {
            product: '#6366F1', // Indigo
            service: '#10B981', // Emerald
            expense: '#F59E0B', // Amber
        }
    },
    ELECTRONICS: {
        assetLabel: 'Equipo',
        assetPlural: 'Equipos',
        orderLabel: 'Ticket de Reparación',
        orderPlural: 'Tickets de Reparación',
        technicianLabel: 'Técnico Especialista',
        workshopLabel: 'Centro de Soporte',
        partLabel: 'Componente',
        partPlural: 'Componentes',
        checkLabel: 'Diagnóstico',
        assetFields: {
            field1: { label: 'Tipo de Dispositivo', placeholder: 'Ej: Smartphone', required: true },
            field2: { label: 'Marca', placeholder: 'Ej: Samsung', required: true },
            field3: { label: 'Modelo', placeholder: 'Ej: Galaxy S23', required: true },
            field4: { label: 'Serial/IMEI', placeholder: 'Número único', required: false },
            field5: { label: 'Color', placeholder: 'Ej: Phantom Black', required: false },
            field6: { label: 'Estado Físico', placeholder: 'Ej: Pantalla rota', required: false },
        },
        categoryTypeColors: {
            product: '#3B82F6', // Blue
            service: '#8B5CF6', // Violet
            expense: '#EF4444', // Red
        }
    },
    MANUFACTURING: {
        assetLabel: 'Proyecto/Pieza',
        assetPlural: 'Proyectos/Piezas',
        orderLabel: 'Orden de Trabajo',
        orderPlural: 'Órdenes de Trabajo',
        technicianLabel: 'Operario',
        workshopLabel: 'Planta de Producción',
        partLabel: 'Insumo',
        partPlural: 'Insumos',
        checkLabel: 'Control de Calidad',
        assetFields: {
            field1: { label: 'Referencia', placeholder: 'Código interno', required: true },
            field2: { label: 'Descripción', placeholder: 'Nombre de la pieza', required: true },
            field3: { label: 'Material', placeholder: 'Ej: Acero Inox', required: false },
            field4: { label: 'Dimensiones', placeholder: 'Ej: 20x10 cm', required: false },
            field5: { label: 'Cant. Requerida', placeholder: 'Ej: 100 unidades', required: false },
            field6: { label: 'Especificación', placeholder: 'Notas técnicas', required: false },
        },
        categoryTypeColors: {
            product: '#0EA5E9', // Sky
            service: '#6366F1', // Indigo
            expense: '#8B5CF6', // Violet
        }
    },
    OTHER: {
        assetLabel: 'Artículo',
        assetPlural: 'Artículos',
        orderLabel: 'Orden de Servicio',
        orderPlural: 'Órdenes de Servicio',
        technicianLabel: 'Responsable',
        workshopLabel: 'Negocio',
        partLabel: 'Producto',
        partPlural: 'Productos',
        checkLabel: 'Inspección',
        assetFields: {
            field1: { label: 'Descripción', placeholder: 'Nombre del artículo', required: true },
            field2: { label: 'Categoría', placeholder: 'Categoría', required: false },
            field3: { label: 'Identificador', placeholder: 'Código/Serial', required: false },
            field4: { label: 'Propiedad 4', placeholder: '-', required: false },
            field5: { label: 'Propiedad 5', placeholder: '-', required: false },
            field6: { label: 'Observaciones', placeholder: 'Notas', required: false },
        },
        categoryTypeColors: {
            product: '#64748B', // Slate
            service: '#94A3B8', // Slate light
            expense: '#CBD5E1', // Slate lighter
        }
    }
};

/**
 * Obtiene la terminología efectiva realizando un merge entre los presets y la personalizada.
 */
export function getEffectiveTerminology(
    businessType: BusinessType = 'OTHER',
    customTerminology: Partial<TerminologyPreset> = {}
): TerminologyPreset {
    // Normalizar: businessType puede llegar como null desde el store durante la hidratación inicial
    const safeType = businessType && TERMINOLOGY_PRESETS[businessType] ? businessType : 'OTHER';
    const preset = TERMINOLOGY_PRESETS[safeType];
    const custom = customTerminology || {};

    // Deep merge manual para evitar dependencias extra
    return {
        ...preset,
        ...custom,
        assetFields: {
            field1: { ...preset.assetFields.field1, ...(custom.assetFields?.field1 || {}) },
            field2: { ...preset.assetFields.field2, ...(custom.assetFields?.field2 || {}) },
            field3: { ...preset.assetFields.field3, ...(custom.assetFields?.field3 || {}) },
            field4: { ...preset.assetFields.field4, ...(custom.assetFields?.field4 || {}) },
            field5: { ...preset.assetFields.field5, ...(custom.assetFields?.field5 || {}) },
            field6: { ...preset.assetFields.field6, ...(custom.assetFields?.field6 || {}) },
        },
        categoryTypeColors: {
            ...preset.categoryTypeColors,
            ...(custom.categoryTypeColors || {})
        } as TerminologyPreset['categoryTypeColors']
    };
}
