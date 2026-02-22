export class WhatsAppService {
    baseUrl;
    apiKey;
    constructor() {
        this.baseUrl = process.env.EVOLUTION_URL || 'https://api.evolution.talistopro.com';
        this.apiKey = process.env.EVOLUTION_API_KEY || '';
    }
    /**
     * Envía un mensaje de texto simple.
     */
    async sendMessage(number, text, instance) {
        console.log(`[WhatsApp] Enviando mensaje a ${number} desde instancia ${instance}`);
        // Si no hay API Key, simulamos éxito para el entorno de desarrollo
        if (!this.apiKey) {
            return { status: 'success', message: 'Simulated WhatsApp message sent' };
        }
        try {
            const response = await fetch(`${this.baseUrl}/message/sendText/${instance}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': this.apiKey
                },
                body: JSON.stringify({
                    number: number,
                    text: text,
                    linkPreview: false
                })
            });
            return await response.json();
        }
        catch (error) {
            console.error('[WhatsApp] Error enviando mensaje:', error);
            throw error;
        }
    }
    /**
     * Envía una notificación de cambio de estado de orden.
     */
    async notifyOrderStatus(phone, customer, orderId, status, instance) {
        const text = `Hola ${customer}, te informamos que tu orden #${orderId} ha cambiado al estado: *${status}*. Puedes consultar más detalles en tu portal.`;
        return this.sendMessage(phone, text, instance);
    }
}
export const whatsapp = new WhatsAppService();
