import { Hono } from 'hono';
import { prisma } from '../lib/db';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
const assets = new Hono();
const assetSchema = z.object({
    field1: z.string().min(1),
    field2: z.string().min(1),
    field3: z.string().optional(),
    field4: z.string().optional(),
    field5: z.string().optional(),
    field6: z.string().optional(),
    customerId: z.string(),
    organizationId: z.string(),
});
assets.get('/', async (c) => {
    const orgId = c.req.query('organizationId');
    const customerId = c.req.query('customerId');
    if (!orgId)
        return c.json({ error: 'organizationId is required' }, 400);
    const list = await prisma.asset.findMany({
        where: {
            organizationId: orgId,
            ...(customerId ? { customerId } : {})
        },
        include: { customer: true },
        orderBy: { createdAt: 'desc' }
    });
    return c.json(list);
});
assets.post('/', zValidator('json', assetSchema), async (c) => {
    const data = c.req.valid('json');
    try {
        const asset = await prisma.asset.create({
            data: {
                id: crypto.randomUUID(),
                field1: data.field1,
                field2: data.field2,
                field3: data.field3,
                field4: data.field4,
                field5: data.field5,
                field6: data.field6,
                customerId: data.customerId,
                organizationId: data.organizationId,
            }
        });
        return c.json(asset, 201);
    }
    catch (error) {
        return c.json({ error: 'Failed to create asset' }, 500);
    }
});
export { assets };
