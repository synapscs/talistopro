import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../../lib/db';
import { whatsapp } from '../../services/whatsapp';
import { recordAudit } from '../../lib/audit';
import { HTTPException } from 'hono/http-exception';
import type { AppEnv } from '../../types/env';

const paramsSchema = z.object({
    orderId: z.string(),
});

const messageSchema = z.object({
    message: z.string().min(1),
    saveToHistory: z.boolean().default(true),
});

const sendMessage = new Hono<AppEnv>()
    .post('/:orderId/send-message', zValidator('param', paramsSchema), zValidator('json', messageSchema), async (c) => {
        const { orderId } = c.req.valid('param');
        const { message, saveToHistory } = c.req.valid('json');
        const orgId = c.get('orgId');
        const userId = c.get('userId');

        try {
            const order = await prisma.serviceOrder.findUnique({
                where: { id: orderId, organizationId: orgId },
                include: {
                    customer: true,
                    asset: true,
                },
            });

            if (!order) {
                throw new HTTPException(404, { message: 'Orden no encontrada' });
            }

            if (!order.customer?.whatsapp && !order.customer?.phone) {
                throw new HTTPException(400, { message: 'El cliente no tiene número de WhatsApp configurado' });
            }

            const settings = await prisma.organizationSettings.findUnique({
                where: { organizationId: orgId },
                select: {
                    whatsappEnabled: true,
                    evolutionInstance: true,
                },
            });

            if (!settings?.whatsappEnabled || !settings.evolutionInstance) {
                throw new HTTPException(400, { message: 'WhatsApp no está configurado para esta organización' });
            }

            const phone = order.customer.whatsapp || order.customer.phone;
            const result = await whatsapp.sendMessage(phone, message, settings.evolutionInstance);

            await prisma.notificationLog.create({
                data: {
                    type: 'WHATSAPP_MANUAL',
                    recipient: phone,
                    message: message,
                    status: 'sent',
                    organizationId: orgId,
                },
            });

            if (saveToHistory) {
                await recordAudit(c, 'CUSTOMER_MESSAGE', 'ServiceOrder', orderId, {
                    channel: 'whatsapp',
                    message: message.substring(0, 200) + (message.length > 200 ? '...' : ''),
                    recipient: phone,
                });
            }

            return c.json({ success: true, result });
        } catch (error) {
            if (error instanceof HTTPException) throw error;
            console.error('[SEND_MESSAGE] Error:', error);
            throw new HTTPException(500, { message: 'Error al enviar el mensaje' });
        }
    });

export { sendMessage };
