import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { CategoryService } from '../services/categories';
import type { AppEnv } from '../types/env';

const categorySchema = z.object({
    name: z.string().min(1),
    type: z.enum(['product', 'service', 'expense']),
    color: z.string().default('#6366F1'),
});

// Rutas encadenadas para inferencia de tipos Hono RPC
const categories = new Hono<AppEnv>()
    // Listar categorías por tipo
    .get('/', async (c) => {
        const orgId = c.get('orgId');
        const type = c.req.query('type') as any;

        const items = await CategoryService.getCategories(orgId, type);
        return c.json(items);
    })
    // Crear categoría
    .post('/', zValidator('json', categorySchema), async (c) => {
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const item = await CategoryService.createCategory(orgId, data);
        return c.json(item, 201);
    })
    // Actualizar categoría
    .put('/:id', zValidator('json', categorySchema.partial()), async (c) => {
        const id = c.req.param('id');
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const item = await CategoryService.updateCategory(orgId, id, data);
        return c.json(item);
    })
    // Eliminar categoría
    .delete('/:id', async (c) => {
        const id = c.req.param('id');
        const orgId = c.get('orgId');

        const result = await CategoryService.deleteCategory(orgId, id);
        return c.json(result);
    });

export { categories };
