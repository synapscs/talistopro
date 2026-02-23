import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { InvoiceService } from '../../services/invoices';
import { recordAudit } from '../../lib/audit';
import type { AppEnv } from '../../types/env';

const invoiceSchema = z.object({
    orderId: z.string(),
});

const invoiceUpdateSchema = z.object({
    customerName: z.string().optional(),
    customerDoc: z.string().optional(),
    customerAddress: z.string().optional(),
    status: z.enum(['PENDING', 'PARTIAL', 'PAID', 'REFUNDED']).optional(),
});

const invoices = new Hono<AppEnv>()
    .get('/', async (c) => {
        const orgId = c.get('orgId');
        const status = c.req.query('status');
        const customerId = c.req.query('customerId');
        const start = c.req.query('start');
        const end = c.req.query('end');

        const list = await InvoiceService.getInvoices(orgId, { status, customerId, start, end });
        return c.json(list);
    })

    .get('/:id', async (c) => {
        const orgId = c.get('orgId');
        const id = c.req.param('id');

        const invoice = await InvoiceService.getInvoiceById(orgId, id);

        if (!invoice) {
            return c.json({ error: 'Factura no encontrada' }, 404);
        }

        return c.json(invoice);
    })

    .get('/order/:orderId', async (c) => {
        const orgId = c.get('orgId');
        const orderId = c.req.param('orderId');

        const invoice = await InvoiceService.getInvoiceByOrder(orgId, orderId);

        if (!invoice) {
            return c.json(null);
        }

        return c.json(invoice);
    })

    .post('/', zValidator('json', invoiceSchema), async (c) => {
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const invoice = await InvoiceService.createInvoice(orgId, data, c);

        return c.json(invoice, 201);
    })

    .put('/:id', zValidator('json', invoiceUpdateSchema.partial()), async (c) => {
        const id = c.req.param('id');
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const invoice = await InvoiceService.updateInvoice(orgId, id, data, c);

        return c.json(invoice);
    })

    .patch('/:id/status', zValidator('json', z.object({ status: z.enum(['PENDING', 'PARTIAL', 'PAID', 'REFUNDED']) })), async (c) => {
        const id = c.req.param('id');
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const invoice = await InvoiceService.updateInvoiceStatus(orgId, id, data.status);

        return c.json(invoice);
    })

    .delete('/:id', async (c) => {
        const id = c.req.param('id');
        const orgId = c.get('orgId');

        const result = await InvoiceService.deleteInvoice(orgId, id, c);

        return c.json(result);
    });

export { invoices };