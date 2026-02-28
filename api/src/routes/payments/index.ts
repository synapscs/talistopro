import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { PaymentService } from '../../services/payments';
import type { AppEnv } from '../../types/env';

const payments = new OpenAPIHono<AppEnv>();

// --- SCHEMAS ---

const PaymentMethodSchema = z.enum(['CASH', 'CARD', 'TRANSFER', 'MOBILE_PAYMENT', 'ZELLE', 'OTHER']).openapi('PaymentMethod');
const CurrencySchema = z.enum(['USD', 'VES', 'COP', 'MXN']).openapi('Currency');

const PaymentSchema = z.object({
    id: z.string().uuid(),
    amount: z.number().min(0),
    amountUsd: z.number().min(0),
    currency: CurrencySchema,
    exchangeRate: z.number().min(0).nullable(),
    method: PaymentMethodSchema,
    reference: z.string().optional().nullable(),
    notes: z.string().optional().nullable(),
    serviceOrderId: z.string().uuid(),
    createdAt: z.date().or(z.string()),
}).openapi('Payment');

const CreatePaymentSchema = z.object({
    orderId: z.string().uuid(),
    amount: z.number().min(0),
    currency: CurrencySchema.default('USD'),
    exchangeRate: z.number().min(0).optional(),
    method: PaymentMethodSchema,
    reference: z.string().optional(),
    notes: z.string().optional(),
}).openapi('CreatePayment');

const UpdatePaymentSchema = CreatePaymentSchema.partial().openapi('UpdatePayment');

const SuccessSchema = z.object({ success: z.boolean() }).openapi('Success');
const ErrorSchema = z.object({ error: z.string() }).openapi('Error');

// --- ROUTES ---

const listRoute = createRoute({
    method: 'get',
    path: '/',
    request: {
        query: z.object({
            orderId: z.string().uuid().optional(),
        }),
    },
    responses: {
        200: {
            content: { 'application/json': { schema: z.array(PaymentSchema) } },
            description: 'Listado de pagos',
        },
    },
});

const getOneRoute = createRoute({
    method: 'get',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
    },
    responses: {
        200: {
            content: { 'application/json': { schema: PaymentSchema } },
            description: 'Detalle del pago',
        },
        404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'No encontrado' },
    },
});

const createRouteDef = createRoute({
    method: 'post',
    path: '/',
    request: {
        body: { content: { 'application/json': { schema: CreatePaymentSchema } } },
    },
    responses: {
        201: {
            content: { 'application/json': { schema: PaymentSchema } },
            description: 'Pago creado',
        },
    },
});

const updateRoute = createRoute({
    method: 'put',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
        body: { content: { 'application/json': { schema: UpdatePaymentSchema } } },
    },
    responses: {
        200: {
            content: { 'application/json': { schema: PaymentSchema } },
            description: 'Pago actualizado',
        },
        404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'No encontrado' },
    },
});

const deleteRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
    },
    responses: {
        200: {
            content: { 'application/json': { schema: SuccessSchema } },
            description: 'Pago eliminado',
        },
        404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'No encontrado' },
    },
});

// --- IMPLEMENTATION ---

payments.openapi(listRoute, async (c) => {
    const orgId = c.get('orgId');
    const { orderId } = c.req.valid('query');
    const list = await PaymentService.getPayments(orgId, orderId);
    return c.json(list as any, 200);
});

payments.openapi(getOneRoute, async (c) => {
    const orgId = c.get('orgId');
    const { id } = c.req.valid('param');
    const payment = await PaymentService.getPaymentById(orgId, id);
    if (!payment) return c.json({ error: 'Not found' }, 404);
    return c.json(payment as any, 200);
});

payments.openapi(createRouteDef, async (c) => {
    const orgId = c.get('orgId');
    const data = c.req.valid('json');
    const payment = await PaymentService.createPayment(c as any, orgId, data);
    return c.json(payment as any, 201);
});

payments.openapi(updateRoute, async (c) => {
    const orgId = c.get('orgId');
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const payment = await PaymentService.updatePayment(c as any, orgId, id, data);
    return c.json(payment as any, 200);
});

payments.openapi(deleteRoute, async (c) => {
    const orgId = c.get('orgId');
    const { id } = c.req.valid('param');
    await PaymentService.deletePayment(orgId, id);
    return c.json({ success: true }, 200);
});

export { payments };
