import { BusinessType } from '@prisma/client';

export type ServicePreset = {
    name: string;
    description?: string;
    price: number; // Precio base en USD
    estimatedTime: number; // Minutos
};

export type ProductPreset = {
    name: string;
    sku: string;
    description?: string;
    salePrice: number;
    costPrice: number;
    unit: string;
    stock: number;
    minStock: number;
};

export type CategoryPreset = {
    name: string;
    type: 'product' | 'service' | 'expense';
    color: string; // Tailwind Hex
    services?: ServicePreset[];
    products?: ProductPreset[];
};

// Categorías de Gastos Transversales (Comunes a todos los rubros)
export const COMMON_EXPENSE_CATEGORIES: CategoryPreset[] = [
    { name: 'Nómina y Salarios', type: 'expense', color: '#EF4444' }, // Red-500
    { name: 'Alquiler y Servicios', type: 'expense', color: '#F97316' }, // Orange-500
    { name: 'Herramientas y Equipo', type: 'expense', color: '#8B5CF6' }, // Violet-500
    { name: 'Publicidad y Marketing', type: 'expense', color: '#EC4899' }, // Pink-500
    { name: 'Impuestos y Legal', type: 'expense', color: '#64748B' }, // Slate-500
    { name: 'Insumos de Oficina', type: 'expense', color: '#10B981' }, // Emerald-500
];

export const BUSINESS_SEEDS: Record<BusinessType, CategoryPreset[]> = {
    AUTOMOTIVE: [
        {
            name: 'Mantenimiento Preventivo',
            type: 'service',
            color: '#3B82F6', // Blue-500
            services: [
                { name: 'Cambio de Aceite y Filtro', description: 'Incluye revisión de 10 puntos', price: 45, estimatedTime: 45 },
                { name: 'Afinación Mayor', description: 'Cambio de bujías, filtros y limpieza de inyectores', price: 120, estimatedTime: 180 },
                { name: 'Rotación de Neumáticos', description: 'Ajuste de presión y balanceo básico', price: 25, estimatedTime: 30 },
            ]
        },
        {
            name: 'Mecánica de Frenos',
            type: 'service',
            color: '#EF4444', // Red-500
            services: [
                { name: 'Cambio de Pastillas Delanteras', description: 'Instalación de pastillas nuevas', price: 60, estimatedTime: 60 },
                { name: 'Rectificación de Discos', description: 'Maquinado de discos por par', price: 40, estimatedTime: 90 },
                { name: 'Purga de Sistema de Frenos', description: 'Cambio de líquido de frenos DOT4', price: 35, estimatedTime: 45 },
            ]
        },
        {
            name: 'Diagnóstico y Scanner',
            type: 'service',
            color: '#F59E0B', // Amber-500
            services: [
                { name: 'Escaneo Computarizado', description: 'Lectura de códigos OBDII', price: 20, estimatedTime: 20 },
                { name: 'Diagnóstico Eléctrico', description: 'Revisión de alternador y batería', price: 30, estimatedTime: 45 },
            ]
        },
        {
            name: 'Lubricantes y Fluidos',
            type: 'product',
            color: '#10B981', // Emerald-500
            products: [
                { name: 'Aceite 10W30 Sintético', sku: 'OIL-1030-S', salePrice: 12, costPrice: 8, unit: 'litro', stock: 24, minStock: 5 },
                { name: 'Líquido de Frenos DOT4', sku: 'BRK-DOT4', salePrice: 8, costPrice: 4, unit: 'unidad', stock: 10, minStock: 2 },
                { name: 'Refrigerante 50/50', sku: 'COOL-5050', salePrice: 15, costPrice: 9, unit: 'galón', stock: 12, minStock: 3 },
            ]
        },
        {
            name: 'Filtros y Repuestos',
            type: 'product',
            color: '#6366F1', // Indigo-500
            products: [
                { name: 'Filtro de Aceite Universal', sku: 'FLT-OIL-UNIV', salePrice: 10, costPrice: 5, unit: 'unidad', stock: 20, minStock: 10 },
                { name: 'Pastillas de Freno Cerámicas', sku: 'BRK-PAD-CER', salePrice: 45, costPrice: 28, unit: 'set', stock: 8, minStock: 2 },
            ]
        },
        ...COMMON_EXPENSE_CATEGORIES
    ],
    ELECTRONICS: [
        {
            name: 'Reparación de Hardware',
            type: 'service',
            color: '#EF4444', // Red-500
            services: [
                { name: 'Cambio de Pantalla (Genérica)', description: 'Instalación incluida', price: 65, estimatedTime: 60 },
                { name: 'Cambio de Batería', description: 'Sustitución de batería interna', price: 35, estimatedTime: 30 },
                { name: 'Reparación de Puerto de Carga', description: 'Micro-soldadura de pin de carga', price: 25, estimatedTime: 90 },
            ]
        },
        {
            name: 'Software y Sistema',
            type: 'service',
            color: '#6366F1', // Indigo-500
            services: [
                { name: 'Reinstalación de Sistema Operativo', description: 'Limpieza total y drivers', price: 30, estimatedTime: 120 },
                { name: 'Respaldo de Información (Backup)', description: 'Hasta 500GB', price: 20, estimatedTime: 60 },
                { name: 'Eliminación de Virus / Malware', description: 'Optimización de sistema', price: 25, estimatedTime: 90 },
            ]
        },
        {
            name: 'Micro-electrónica',
            type: 'service',
            color: '#14B8A6', // Teal-500
            services: [
                { name: 'Baño Químico (Equipos Mojados)', description: 'Limpieza por ultrasonido', price: 40, estimatedTime: 180 },
                { name: 'Reballing de Chip de Video', description: 'Reparación avanzada de placa', price: 85, estimatedTime: 300 },
            ]
        },
        {
            name: 'Pantallas y Displays',
            type: 'product',
            color: '#F97316', // Orange-500
            products: [
                { name: 'Pantalla iPhone 11 (Incell)', sku: 'SCR-IP11-IN', salePrice: 45, costPrice: 30, unit: 'unidad', stock: 5, minStock: 2 },
                { name: 'Pantalla Samsung A51 (OLED)', sku: 'SCR-SA51-OL', salePrice: 60, costPrice: 42, unit: 'unidad', stock: 3, minStock: 1 },
            ]
        },
        {
            name: 'Componentes y Accesorios',
            type: 'product',
            color: '#8B5CF6', // Violet-500
            products: [
                { name: 'Cargador Rápido 20W USB-C', sku: 'ACC-CHG-20W', salePrice: 15, costPrice: 7, unit: 'unidad', stock: 15, minStock: 5 },
                { name: 'Cable de Datos Reforzado', sku: 'ACC-CBL-DATA', salePrice: 10, costPrice: 3, unit: 'unidad', stock: 30, minStock: 10 },
            ]
        },
        ...COMMON_EXPENSE_CATEGORIES
    ],
    MANUFACTURING: [
        {
            name: 'Servicios de Producción',
            type: 'service',
            color: '#10B981', // Emerald-500
            services: [
                { name: 'Corte por Metro Lineal', description: 'Corte precisión CNC', price: 5, estimatedTime: 15 },
                { name: 'Ensamble de Piezas', description: 'Costo por hora hombre', price: 20, estimatedTime: 60 },
                { name: 'Acabado y Pintura', description: 'Aplicación de recubrimiento', price: 15, estimatedTime: 45 },
            ]
        },
        {
            name: 'Diseño y Prototipado',
            type: 'service',
            color: '#3B82F6', // Blue-500
            services: [
                { name: 'Modelado 3D', description: 'Diseño CAD avanzado', price: 45, estimatedTime: 120 },
                { name: 'Prototipo Inicial', description: 'Prueba de concepto', price: 100, estimatedTime: 480 },
            ]
        },
        {
            name: 'Insumos y Materia Prima',
            type: 'product',
            color: '#F43F5E', // Rose-500
            products: [
                { name: 'Lámina de Acero 2mm', sku: 'MAT-STL-2MM', salePrice: 85, costPrice: 50, unit: 'pliego', stock: 10, minStock: 2 },
                { name: 'Filamento PETG 1kg', sku: 'MAT-3D-PETG', salePrice: 25, costPrice: 15, unit: 'rollo', stock: 8, minStock: 3 },
            ]
        },
        ...COMMON_EXPENSE_CATEGORIES
    ],
    OTHER: [
        {
            name: 'Servicios Generales',
            type: 'service',
            color: '#64748B', // Slate-500
            services: [
                { name: 'Hora de Consultoría Técnico', price: 50, estimatedTime: 60 },
                { name: 'Soporte Remoto', price: 30, estimatedTime: 45 },
            ]
        },
        {
            name: 'Productos Varios',
            type: 'product',
            color: '#94A3B8', // Slate-400
            products: [
                { name: 'Producto Genérico A', sku: 'GEN-A', salePrice: 10, costPrice: 5, unit: 'unidad', stock: 100, minStock: 10 },
            ]
        },
        ...COMMON_EXPENSE_CATEGORIES
    ]
};
