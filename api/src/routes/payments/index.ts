import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { PaymentService } from '../../services/payments';
import { recordAudit } from '../../lib/audit';
import type { AppEnv } from '../../types/env';

const paymentSchema = z.object({
    orderId: z.string(),
    amount: z.number().min(0),
    currency: z.enum(['USD', 'VES', 'COP', 'MXN']).default('USD'),
    exchangeRate: z.number().min(0).optional(),
    method: z.enum(['CASH', 'CARD', 'TRANSFER', 'MOBILE_PAYMENT', 'ZELLE', 'OTHER']),
    reference: z.string().optional(),
    notes: z.string().optional(),
});

const payments = new Hono<AppEnv>()
    .get('/', async (c) => {
        const orgId = c.get('orgId');
        const orderId = c.req.query('orderId');

        const list = await PaymentService.getPayments(orgId, orderId);
        return c.json(list);
    })

    .get('/:id', async (c) => {
        const orgId = c.get('orgId');
        const id = c.req.param('id');

        const payment = await PaymentService.getPaymentById(orgId, id);

        if (!payment) {
            return c.json({ error: 'Pago no encontrado' }, 404);
        }

        return c.json(payment);
    })

    .post('/', zValidator('json', paymentSchema), async (c) => {
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const payment = await PaymentService.createPayment(orgId, data);
        await recordAudit(c, 'CREATE', 'Payment', payment.id, { amount: data.amount, method: data.method });

        return c.json(payment, 201);
    })

    .put('/:id', zValidator('json', paymentSchema.partial()), async (c) => {
        const id = c.req.param('id');
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const payment = await PaymentService.updatePayment(orgId, id, data);
        await recordAudit(c, 'UPDATE', 'Payment', id, data);

        return c.json(payment);
    })

    .delete('/:id', async (c) => {
        const id = c.req.param('id');
        const orgId = c.get('orgId');

        const result = await PaymentService.deletePayment(orgId, id);
        await recordAudit(c, 'DELETE', 'Payment', id);

        return c.json(result);
    });

export { payments };