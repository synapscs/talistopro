import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { AssetService } from '../services/assets';
import type { AppEnv } from '../types/env';

const assetSchema = z.object({
    field1: z.string().min(1),
    field2: z.string().min(1),
    field3: z.string().optional(),
    field4: z.string().optional(),
    field5: z.string().optional(),
    field6: z.string().optional(),
    photoUrl: z.string().optional(),
    nextAppointmentAt: z.string().optional(),
    notes: z.string().optional(),
    customerId: z.string(),
    organizationId: z.string().optional(),
});

// Rutas encadenadas para inferencia de tipos Hono RPC
const assets = new Hono<AppEnv>()
    .get('/', async (c) => {
        const orgId = c.get('orgId');
        const customerId = c.req.query('customerId');
        const customerName = c.req.query('customerName');

        const list = await AssetService.getAssets(orgId, customerId, customerName);
        return c.json(list);
    })
    .post('/', zValidator('json', assetSchema.omit({ organizationId: true })), async (c) => {
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const asset = await AssetService.createAsset(orgId, data);
        return c.json(asset, 201);
    })
    .put('/:id', zValidator('json', assetSchema.partial().omit({ organizationId: true })), async (c) => {
        const id = c.req.param('id');
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const asset = await AssetService.updateAsset(orgId, id, data);
        return c.json(asset);
    })
    .delete('/:id', async (c) => {
        const id = c.req.param('id');
        const orgId = c.get('orgId');

        const result = await AssetService.deleteAsset(orgId, id);
        return c.json(result);
    });

export { assets };
