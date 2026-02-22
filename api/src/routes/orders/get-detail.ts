import { Hono } from 'hono';
import { prisma } from '../../lib/db';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import type { AppEnv } from '../../types/env';

const paramsSchema = z.object({
    orderId: z.string().uuid(),
});

// Ruta encadenada para inferencia de tipos Hono RPC
const getDetail = new Hono<AppEnv>()
    .get('/:orderId', zValidator('param', paramsSchema), async (c) => {
        const { orderId } = c.req.valid('param');
        const orgId = c.get('orgId');

        try {
            // 1. Consulta Profunda de la Orden
            const order = await prisma.serviceOrder.findUnique({
                where: {
                    id: orderId,
                    organizationId: orgId
                },
                include: {
                    customer: true,
                    asset: true,
                    items: {
                        orderBy: { createdAt: 'asc' }
                    },
                    photos: {
                        orderBy: { order: 'asc' }
                    },
                    checklist: {
                        orderBy: { category: 'asc' }
                    },
                    payments: {
                        orderBy: { createdAt: 'desc' }
                    },
                    statusHistory: {
                        orderBy: { createdAt: 'desc' }
                    },
                    currentStage: true,
                    assignedTo: {
                        include: {
                            user: true
                        }
                    }
                }
            });

            if (!order) {
                return c.json({ error: 'Orden no encontrada o acceso denegado' }, 404);
            }

            // 2. Consulta de Configuración de Workflow del Tenant
            const workflowConfig = await prisma.workflowStage.findMany({
                where: { organizationId: orgId },
                orderBy: { order: 'asc' }
            });

            // 3. Consulta de Logs de Auditoría (Activity History)
            const auditLogs = await prisma.auditLog.findMany({
                where: {
                    organizationId: orgId,
                    entityId: orderId,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            image: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });

            // 4. Retorno Unificado (Evita N+1 en el Frontend)
            return c.json({
                order,
                workflowConfig,
                auditLogs
            });

        } catch (error) {
            console.error(`[GET_ORDER_DETAIL] Error:`, error);
            return c.json({ error: 'Error interno al recuperar el detalle de la orden' }, 500);
        }
    });

export { getDetail };
