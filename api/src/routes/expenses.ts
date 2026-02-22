import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { ExpenseService } from '../services/expenses';
import { SupplierService } from '../services/suppliers';
import type { AppEnv } from '../types/env';

const expenseSchema = z.object({
    description: z.string().min(1),
    amount: z.number().positive(),
    amountLocal: z.number().optional(),
    categoryId: z.string().optional(),
    supplierId: z.string().optional(),
    organizationId: z.string(),
});

const supplierSchema = z.object({
    name: z.string().min(1),
    taxName: z.string().optional(),
    taxId: z.string().optional(),
    type: z.string().optional(),
    active: z.boolean().optional(),
    notes: z.string().optional(),
    phone: z.string().optional(),
    whatsapp: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    contact: z.string().optional(),
    url: z.string().optional(),
    paymentMethod1: z.string().optional(),
    paymentMethod2: z.string().optional(),
    organizationId: z.string(),
});

// Rutas encadenadas para inferencia de tipos Hono RPC
export const expenses = new Hono<AppEnv>()
    // -- GASTOS --
    .get('/', async (c) => {
        const orgId = c.get('orgId');
        const items = await ExpenseService.getExpenses(orgId);
        return c.json(items);
    })
    .post('/', zValidator('json', expenseSchema.omit({ organizationId: true })), async (c) => {
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const item = await ExpenseService.createExpense(orgId, data);
        return c.json(item);
    })
    .put('/:id', zValidator('json', expenseSchema.partial().omit({ organizationId: true })), async (c) => {
        const id = c.req.param('id');
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const item = await ExpenseService.updateExpense(orgId, id, data);
        return c.json(item);
    })
    .delete('/:id', async (c) => {
        const id = c.req.param('id');
        const orgId = c.get('orgId');

        const result = await ExpenseService.deleteExpense(c, orgId, id);
        return c.json(result);
    })
    // -- PROVEEDORES --
    .get('/suppliers', async (c) => {
        const orgId = c.get('orgId');
        const items = await SupplierService.getSuppliers(orgId);
        return c.json(items);
    })
    .post('/suppliers', zValidator('json', supplierSchema.omit({ organizationId: true })), async (c) => {
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const item = await SupplierService.createSupplier(orgId, data);
        return c.json(item);
    })
    .put('/suppliers/:id', zValidator('json', supplierSchema.omit({ organizationId: true })), async (c) => {
        const id = c.req.param('id');
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const item = await SupplierService.updateSupplier(orgId, id, data);
        return c.json(item);
    })
    .delete('/suppliers/:id', async (c) => {
        const id = c.req.param('id');
        const orgId = c.get('orgId');

        const result = await SupplierService.deleteSupplier(c, orgId, id);
        return c.json(result);
    });
