export interface FinanceConfig {
    primaryCurrency: string;
    secondaryCurrency: string | null;
    exchangeRate: number;
    taxRate: number; // Ej: 0.16 para 16%
}

export const calculateTotal = (subtotal: number, config: FinanceConfig) => {
    const tax = subtotal * config.taxRate;
    const totalUsd = subtotal + tax;
    const totalLocal = config.secondaryCurrency ? totalUsd * config.exchangeRate : null;

    return {
        subtotal,
        tax,
        totalUsd,
        totalLocal,
    };
};

export const formatCurrency = (amount: number, currency: string, country: string = 'VE') => {
    const locales: Record<string, string> = {
        'VE': 'es-VE',
        'CO': 'es-CO',
        'MX': 'es-MX',
        'US': 'en-US'
    };

    return new Intl.NumberFormat(locales[country] || 'en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
};

/**
 * Formatea un número a string con 2 decimales usando coma como separador (Regla LatAm).
 * Ej: 10 -> "10,00", 10.5 -> "10,50"
 */
export const formatDecimal = (amount: number): string => {
    return new Intl.NumberFormat('es-VE', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

/**
 * Parsea un string que puede contener coma o punto como separador a un número válido.
 * Ej: "10,50" -> 10.5, "10.50" -> 10.5
 */
export const parseDecimal = (value: string): number => {
    if (!value) return 0;
    // Reemplazar coma por punto para que parseFloat funcione
    const normalized = value.replace(',', '.');
    // Eliminar todo lo que no sea número o punto
    const clean = normalized.replace(/[^0-9.]/g, '');
    const numeric = parseFloat(clean);
    return isNaN(numeric) ? 0 : numeric;
};
