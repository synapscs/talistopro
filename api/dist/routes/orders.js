import { Hono } from 'hono';
import { prisma } from '../lib/db';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
const orders = new Hono();
const orderSchema = z.object({
    description: z.string().min(1),
    customerId: z.string(),
    assetId: z.string(),
    organizationId: z.string(),
    totalUsd: z.number().default(0),
});
orders.get('/', async (c) => {
    const orgId = c.req.query('organizationId');
    if (!orgId)
        return c.json({ error: 'organizationId is required' }, 400);
    const list = await prisma.serviceOrder.findMany({
        where: { organizationId: orgId },
        include: {
            customer: true,
            asset: true,
            currentStage: true
        },
        orderBy: { createdAt: 'desc' }
    });
    return c.json(list);
});
orders.post('/', zValidator('json', orderSchema), async (c) => {
    const data = c.req.valid('json');
    try {
        // Generar un número de orden simple (ej: OS-123)
        const count = await prisma.serviceOrder.count({
            where: { organizationId: data.organizationId }
        });
        const orderNumber = `OS-${(count + 1).toString().padStart(4, '0')}`;
        const order = await prisma.serviceOrder.create({
            data: {
                id: crypto.randomUUID(),
                orderNumber,
                description: data.description,
                customerId: data.customerId,
                assetId: data.assetId,
                organizationId: data.organizationId,
                totalUsd: data.totalUsd,
            }
        });
        return c.json(order, 201);
    }
    catch (error) {
        console.error(error);
        return c.json({ error: 'Failed to create order' }, 500);
    }
});
export { orders };
