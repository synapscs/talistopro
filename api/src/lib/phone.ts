/**
 * Utilitario para formatear números de teléfono al estándar E.164
 * Apto para integraciones con WhatsApp / Evolution-API.
 */
export const formatToE164 = (phone: string, country: string = 'VE'): string => {
    // 1. Eliminar todo lo que no sea número o el símbolo +
    let cleaned = phone.replace(/[^\d+]/g, '');

    // 2. Si ya empieza con +, asumimos que el usuario sabe lo que hace (formato internacional manual)
    if (cleaned.startsWith('+')) {
        return cleaned;
    }

    // 3. Quitar ceros a la izquierda iniciales (ej: 0412 -> 412)
    cleaned = cleaned.replace(/^0+/, '');

    // 4. Mapeo de prefijos según el país de la organización
    const prefixes: Record<string, string> = {
        VE: '58',
        CO: '57',
        MX: '52',
    };

    const prefix = prefixes[country] || '58'; // VE por defecto

    // 5. Si el número ya empieza con el prefijo, no lo duplicamos (heurística simple)
    // Ejemplo: Si es VE (58) y el número es 58412..., lo dejamos así.
    if (cleaned.startsWith(prefix)) {
        return `+${cleaned}`;
    }

    // 6. Retornar con el prefijo y el símbolo +
    return `+${prefix}${cleaned}`;
};
