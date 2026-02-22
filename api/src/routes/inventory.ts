import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { InventoryService } from '../services/inventory';
import type { AppEnv } from '../types/env';

const productSchema = z.object({
    sku: z.string().min(1),
    name: z.string().min(1),
    description: z.string().optional(),
    costPrice: z.number().default(0),
    salePrice: z.number().min(0),
    stock: z.number().int().min(0),
    minStock: z.number().int().min(0).optional(),
    maxStock: z.number().int().optional(),
    unit: z.string().default('unidad'),
    categoryId: z.string().optional(),
    organizationId: z.string(),
});

const serviceSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    price: z.number().min(0),
    estimatedTime: z.number().int().min(0).optional(),
    categoryId: z.string().optional(),
    organizationId: z.string(),
});

// Rutas encadenadas para inferencia de tipos Hono RPC
const inventory = new Hono<AppEnv>()
    // -- PRODUCTOS --
    .get('/products', async (c) => {
        const orgId = c.get('orgId');

        const list = await prisma.product.findMany({
            where: { organizationId: orgId },
            include: { category: true },
            orderBy: { name: 'asc' }
        });
        return c.json(list);
    })
    .post('/products', zValidator('json', productSchema.omit({ organizationId: true })), async (c) => {
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        try {
            const product = await prisma.product.create({
                data: {
                    sku: data.sku,
                    name: data.name,
                    description: data.description,
                    costPrice: data.costPrice,
                    salePrice: data.salePrice,
                    stock: data.stock,
                    minStock: data.minStock,
                    maxStock: data.maxStock,
                    unit: data.unit,
                    categoryId: data.categoryId,
                    organizationId: orgId,
                    isActive: true,
                }
            });
            return c.json(product, 201);
        } catch (error) {
            console.error('Error creating product:', error);
            return c.json({ error: 'Failed to create product' }, 500);
        }
    })
    .put('/products/:id', zValidator('json', productSchema.partial().omit({ organizationId: true })), async (c) => {
        const id = c.req.param('id');
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const product = await InventoryService.updateProduct(c, orgId, id, data);
        return c.json(product);
    })
    .delete('/products/:id', async (c) => {
        const id = c.req.param('id');
        const orgId = c.get('orgId');

        const result = await InventoryService.deleteProduct(c, orgId, id);
        return c.json(result);
    })
    // -- SERVICIOS --
    .get('/services', async (c) => {
        const orgId = c.get('orgId');

        const list = await InventoryService.getServices(orgId);
        return c.json(list);
    })
    .post('/services', zValidator('json', serviceSchema.omit({ organizationId: true })), async (c) => {
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const service = await InventoryService.createService(orgId, data);
        return c.json(service, 201);
    })
    .put('/services/:id', zValidator('json', serviceSchema.partial().omit({ organizationId: true })), async (c) => {
        const id = c.req.param('id');
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const service = await InventoryService.updateService(orgId, id, data);
        return c.json(service);
    })
    .delete('/services/:id', async (c) => {
        const id = c.req.param('id');
        const orgId = c.get('orgId');

        const result = await InventoryService.deleteService(c, orgId, id);
        return c.json(result);
    });

export { inventory };
