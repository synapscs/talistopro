import { BusinessType } from '../terminology';

export type ChecklistItemCondition = 'good' | 'regular' | 'bad' | 'na';

export interface ChecklistCategory {
    id: string;
    label: string;
    items: string[];
}

export interface ChecklistTemplate {
    categories: ChecklistCategory[];
}

export const CHECKLIST_PRESETS: Record<BusinessType, ChecklistTemplate> = {
    AUTOMOTIVE: {
        categories: [
            {
                id: 'exterior',
                label: 'Inspección Exterior',
                items: [
                    'Parachoques (Delantero/Trasero)',
                    'Capó y Maletero',
                    'Puertas y Manillas',
                    'Vidrios y Cristales',
                    'Luces e Indicadores',
                    'Neumáticos y Rines',
                    'Pintura (Rayones/Abolladuras)'
                ]
            },
            {
                id: 'interior',
                label: 'Inspección Interior',
                items: [
                    'Tablero y Consola',
                    'Asientos y Tapicería',
                    'Alfombras y Techo',
                    'Radio, Pantalla y Sonido',
                    'Aire Acondicionado'
                ]
            },
            {
                id: 'mechanical_basic',
                label: 'Mecánica Básica',
                items: [
                    'Nivel de Aceite',
                    'Nivel de Refrigerante',
                    'Estado de Batería',
                    'Líquido de Frenos',
                    'Ruidos Extraños (Motor)'
                ]
            },
            {
                id: 'accessories',
                label: 'Accesorios y Emergencia',
                items: [
                    'Gato Hidráulico',
                    'Herramientas Básicas',
                    'Caucho de Repuesto',
                    'Extintor',
                    'Triángulos de Seguridad'
                ]
            }
        ]
    },
    ELECTRONICS: {
        categories: [
            {
                id: 'physical_state',
                label: 'Estado Físico del Equipo',
                items: [
                    'Pantalla (Rayones/Roturas)',
                    'Carcasa / Chasis',
                    'Teclado / Botones Físicos',
                    'Bisagras (Laptops)',
                    'Tornillería Completa'
                ]
            },
            {
                id: 'connectivity',
                label: 'Puertos y Conectividad',
                items: [
                    'Puerto de Carga / DC Jack',
                    'Puertos USB / HDMI / SD',
                    'Jack de Audio',
                    'Slot de SIM / MicroSD'
                ]
            },
            {
                id: 'functionality',
                label: 'Pruebas Funcionales',
                items: [
                    'Encendido y Arranque',
                    'Touch / Trackpad',
                    'Wifi y Bluetooth',
                    'Audio y Micrófono',
                    'Cámaras (Si aplica)'
                ]
            },
            {
                id: 'accessories',
                label: 'Accesorios de Entrega',
                items: [
                    'Cargador / Adaptador',
                    'Cables Adicionales',
                    'Funda / Estuche',
                    'Batería (Si es extraíble)'
                ]
            }
        ]
    },
    MANUFACTURING: {
        categories: [
            {
                id: 'general',
                label: 'Inspección de Recepción',
                items: [
                    'Estado Físico General',
                    'Limpieza y Contaminación',
                    'Integridad de Materiales',
                    'Dimensiones Preliminares',
                    'Funcionamiento Mecánico'
                ]
            }
        ]
    },
    OTHER: {
        categories: [
            {
                id: 'general',
                label: 'Inspección General',
                items: [
                    'Estado Visual',
                    'Funcionamiento Básico',
                    'Limpieza / Higiene',
                    'Accesorios Recibidos'
                ]
            }
        ]
    }
};

/**
 * Obtiene el template de checklist correspondiente al tipo de negocio.
 */
export function getChecklistTemplate(businessType: BusinessType = 'OTHER'): ChecklistTemplate {
    return CHECKLIST_PRESETS[businessType] || CHECKLIST_PRESETS.OTHER;
}
