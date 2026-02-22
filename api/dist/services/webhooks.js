export class WebhookService {
    /**
     * Envía un evento a un endpoint de webhook de n8n.
     */
    async trigger(endpointId, payload) {
        const url = `https://n8n.talistopro.com/webhook/${endpointId}`;
        console.log(`[Webhook] Disparando evento a n8n: ${endpointId}`);
        try {
            // Usamos fetch para enviar el evento al sistema de automatización
            await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-TaListo-Event': 'system_event'
                },
                body: JSON.stringify({
                    ...payload,
                    timestamp: new Date().toISOString()
                })
            });
        }
        catch (error) {
            console.error('[Webhook] Error disparando webhook:', error);
            // No lanzamos el error para no bloquear el flujo principal
        }
    }
    /**
     * Dispara automatización de nueva orden.
     */
    async orderCreated(order) {
        return this.trigger('order-created', {
            orderId: order.id,
            customer: order.customerName,
            total: order.total
        });
    }
}
export const webhooks = new WebhookService();
