import { Hono } from 'hono';
import { prisma } from '../lib/db';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
const inventory = new Hono();
const productSchema = z.object({
    sku: z.string().min(1),
    name: z.string().min(1),
    salePrice: z.number().min(0),
    stock: z.number().int().min(0),
    minStock: z.number().int().min(0).optional(),
    categoryId: z.string().optional(),
    organizationId: z.string(),
});
const serviceSchema = z.object({
    name: z.string().min(1),
    price: z.number().min(0),
    estimatedTime: z.number().int().min(0).optional(),
    categoryId: z.string().optional(),
    organizationId: z.string(),
});
// -- PRODUCTOS --
inventory.get('/products', async (c) => {
    const orgId = c.req.query('organizationId');
    if (!orgId)
        return c.json({ error: 'organizationId is required' }, 400);
    const list = await prisma.product.findMany({
        where: { organizationId: orgId },
        include: { category: true },
        orderBy: { name: 'asc' }
    });
    return c.json(list);
});
inventory.post('/products', zValidator('json', productSchema), async (c) => {
    const data = c.req.valid('json');
    try {
        const product = await prisma.product.create({
            data: {
                id: crypto.randomUUID(),
                sku: data.sku,
                name: data.name,
                salePrice: data.salePrice,
                stock: data.stock,
                minStock: data.minStock,
                categoryId: data.categoryId,
                organizationId: data.organizationId,
            }
        });
        return c.json(product, 201);
    }
    catch (error) {
        return c.json({ error: 'Failed to create product' }, 500);
    }
});
// -- SERVICIOS --
inventory.get('/services', async (c) => {
    const orgId = c.req.query('organizationId');
    if (!orgId)
        return c.json({ error: 'organizationId is required' }, 400);
    const list = await prisma.service.findMany({
        where: { organizationId: orgId },
        include: { category: true },
        orderBy: { name: 'asc' }
    });
    return c.json(list);
});
inventory.post('/services', zValidator('json', serviceSchema), async (c) => {
    const data = c.req.valid('json');
    try {
        const service = await prisma.service.create({
            data: {
                id: crypto.randomUUID(),
                name: data.name,
                price: data.price,
                estimatedTime: data.estimatedTime,
                categoryId: data.categoryId,
                organizationId: data.organizationId,
            }
        });
        return c.json(service, 201);
    }
    catch (error) {
        return c.json({ error: 'Failed to create service' }, 500);
    }
});
export { inventory };
