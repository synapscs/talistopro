import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { prisma } from '../lib/db';
import { whatsapp } from '../services/whatsapp';
import { recordAudit } from '../lib/audit';
import { HTTPException } from 'hono/http-exception';
import type { AppEnv } from '../types/env';

const notifications = new OpenAPIHono<AppEnv>();

// --- SCHEMAS ---

const SendMessageSchema = z.object({
    phone: z.string(),
    message: z.string().min(1),
    customerId: z.string().uuid().optional(),
}).openapi('SendMessage');

const SuccessSchema = z.object({
    success: z.boolean(),
    result: z.any().optional()
}).openapi('NotificationSuccess');

// --- ROUTES ---

const sendWhatsappRoute = createRoute({
    method: 'post',
    path: '/whatsapp',
    request: {
        body: { content: { 'application/json': { schema: SendMessageSchema } } }
    },
    responses: {
        200: {
            content: { 'application/json': { schema: SuccessSchema } },
            description: 'Mensaje enviado'
        },
        400: { description: 'Configuración inválida' },
        500: { description: 'Error de servidor' }
    }
});

// --- IMPLEMENTATION ---

notifications.openapi(sendWhatsappRoute, async (c) => {
    const { phone, message, customerId } = c.req.valid('json');
    const orgId = c.get('orgId');
    const user = c.get('user');

    try {
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

        const result = await whatsapp.sendMessage(phone, message, settings.evolutionInstance);

        await prisma.notificationLog.create({
            data: {
                type: 'WHATSAPP_CUSTOMER',
                recipient: phone,
                message: message,
                status: 'sent',
                organizationId: orgId,
            },
        });

        if (customerId) {
            await recordAudit(c as any, 'CUSTOMER_MESSAGE', 'Customer', customerId, {
                channel: 'whatsapp',
                message: message.substring(0, 200) + (message.length > 200 ? '...' : ''),
                recipient: phone,
            });
        }

        return c.json({ success: true, result }, 200);
    } catch (error) {
        if (error instanceof HTTPException) throw error;
        console.error('[SEND_CUSTOMER_MESSAGE] Error:', error);
        throw new HTTPException(500, { message: 'Error al enviar el mensaje' });
    }
});

export { notifications };
