/** Payload mínimo para el evento de webhook de nueva orden */
interface OrderWebhookPayload {
    id: string;
    customerName?: string;
    total?: number | string;
}

export class WebhookService {
    /**
     * Envía un evento a un endpoint de webhook de n8n.
     */
    async trigger(endpointId: string, payload: Record<string, unknown>): Promise<void> {
        const url = `https://n8n.talistopro.com/webhook/${endpointId}`;

        try {
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
        } catch (error) {
            console.error('[Webhook] Error disparando webhook:', error);
            // No lanzamos el error para no bloquear el flujo principal
        }
    }

    /**
     * Dispara automatización de nueva orden.
     */
    async orderCreated(order: OrderWebhookPayload) {
        return this.trigger('order-created', {
            orderId: order.id,
            customer: order.customerName,
            total: order.total
        });
    }
}

export const webhooks = new WebhookService();
