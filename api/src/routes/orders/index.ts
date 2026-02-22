import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { getDetail } from './get-detail';
import { sendMessage } from './send-message';
import { OrderService } from '../../services/orders';
import type { AppEnv } from '../../types/env';

const orderSchema = z.object({
    description: z.string().min(1),
    customerId: z.string(),
    assetId: z.string(),
    organizationId: z.string().optional(),
    diagnosis: z.string().optional(),
    internalNotes: z.string().optional(),
    priority: z.number().default(2),
    estimatedDate: z.string().optional().nullable(),
    assignedToId: z.string().optional().nullable(),
    subtotal: z.number().default(0),
    taxAmount: z.number().default(0),
    discountAmount: z.number().default(0),
    total: z.number().default(0),
    currentStageId: z.string().optional(),
    photos: z.array(z.string()).optional(),
    checklist: z.array(z.object({
        category: z.string(),
        item: z.string(),
        condition: z.enum(['good', 'regular', 'bad', 'na']),
        notes: z.string().optional(),
        checked: z.boolean().default(true)
    })).optional(),
    items: z.array(z.object({
        type: z.enum(['product', 'service']),
        name: z.string(),
        price: z.number(),
        quantity: z.number(),
        productId: z.string().optional().nullable(),
        serviceId: z.string().optional().nullable(),
    })).optional(),
});

// Rutas encadenadas para inferencia de tipos Hono RPC
const orders = new Hono<AppEnv>()
    .get('/', async (c) => {
        const orgId = c.get('orgId');
        const list = await OrderService.getOrders(orgId);
        return c.json(list);
    })
    .route('/', getDetail)
    .route('/', sendMessage)
    .post('/', zValidator('json', orderSchema.omit({ organizationId: true })), async (c) => {
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const order = await OrderService.createOrder(c, orgId, data);
        return c.json(order, 201);
    })
    .put('/:id', zValidator('json', orderSchema.partial().omit({ organizationId: true })), async (c) => {
        const id = c.req.param('id');
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const order = await OrderService.updateOrder(c, orgId, id, data);
        return c.json(order);
    })
    .delete('/:id', async (c) => {
        const id = c.req.param('id');
        const orgId = c.get('orgId');

        const result = await OrderService.deleteOrder(c, orgId, id);
        return c.json(result);
    });

export { orders };
