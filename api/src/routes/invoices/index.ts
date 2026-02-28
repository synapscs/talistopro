import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { InvoiceService } from '../../services/invoices';
import type { AppEnv } from '../../types/env';

const invoices = new OpenAPIHono<AppEnv>();

// --- SCHEMAS ---

const InvoiceStatusSchema = z.enum(['PENDING', 'PARTIAL', 'PAID', 'REFUNDED']).openapi('InvoiceStatus');

const InvoiceSchema = z.object({
    id: z.string().uuid(),
    invoiceNumber: z.string(),
    customerName: z.string(),
    customerDoc: z.string().optional().nullable(),
    customerAddress: z.string().optional().nullable(),
    subtotal: z.number(),
    taxRate: z.number(),
    taxAmount: z.number(),
    total: z.number(),
    currencyPrimary: z.string(),
    totalPrimary: z.number(),
    currencySecondary: z.string().optional().nullable(),
    totalSecondary: z.number().optional().nullable(),
    exchangeRate: z.number().optional().nullable(),
    status: InvoiceStatusSchema,
    customerId: z.string().uuid(),
    serviceOrderId: z.string().uuid(),
    createdAt: z.date().or(z.string()),
}).openapi('Invoice');

const CreateInvoiceSchema = z.object({
    orderId: z.string().uuid(),
}).openapi('CreateInvoice');

const UpdateInvoiceSchema = z.object({
    customerName: z.string().optional(),
    customerDoc: z.string().optional(),
    customerAddress: z.string().optional(),
    status: InvoiceStatusSchema.optional(),
}).openapi('UpdateInvoice');

const SuccessSchema = z.object({ success: z.boolean() }).openapi('Success');
const ErrorSchema = z.object({ error: z.string() }).openapi('Error');

// --- ROUTES ---

const listRoute = createRoute({
    method: 'get',
    path: '/',
    request: {
        query: z.object({
            status: InvoiceStatusSchema.optional(),
            customerId: z.string().uuid().optional(),
            start: z.string().optional(),
            end: z.string().optional(),
        }),
    },
    responses: {
        200: {
            content: { 'application/json': { schema: z.array(InvoiceSchema) } },
            description: 'Listado de facturas',
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
            content: { 'application/json': { schema: InvoiceSchema } },
            description: 'Detalle de la factura',
        },
        404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'No encontrado' },
    },
});

const getByOrderRoute = createRoute({
    method: 'get',
    path: '/order/{orderId}',
    request: {
        params: z.object({ orderId: z.string().uuid() }),
    },
    responses: {
        200: {
            content: { 'application/json': { schema: InvoiceSchema.nullable() } },
            description: 'Factura por orden',
        },
    },
});

const createRouteDef = createRoute({
    method: 'post',
    path: '/',
    request: {
        body: { content: { 'application/json': { schema: CreateInvoiceSchema } } },
    },
    responses: {
        201: {
            content: { 'application/json': { schema: InvoiceSchema } },
            description: 'Factura creada',
        },
    },
});

const updateRoute = createRoute({
    method: 'put',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
        body: { content: { 'application/json': { schema: UpdateInvoiceSchema } } },
    },
    responses: {
        200: {
            content: { 'application/json': { schema: InvoiceSchema } },
            description: 'Factura actualizada',
        },
        404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'No encontrado' },
    },
});

const updateStatusRoute = createRoute({
    method: 'patch',
    path: '/{id}/status',
    request: {
        params: z.object({ id: z.string().uuid() }),
        body: { content: { 'application/json': { schema: z.object({ status: InvoiceStatusSchema }) } } },
    },
    responses: {
        200: {
            content: { 'application/json': { schema: InvoiceSchema } },
            description: 'Estado actualizado',
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
            description: 'Factura eliminada',
        },
        404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'No encontrado' },
    },
});

// --- IMPLEMENTATION ---

invoices.openapi(listRoute, async (c) => {
    const orgId = c.get('orgId');
    const query = c.req.valid('query');
    const list = await InvoiceService.getInvoices(orgId, query);
    return c.json(list as any, 200);
});

invoices.openapi(getOneRoute, async (c) => {
    const orgId = c.get('orgId');
    const { id } = c.req.valid('param');
    const invoice = await InvoiceService.getInvoiceById(orgId, id);
    if (!invoice) return c.json({ error: 'Not found' }, 404);
    return c.json(invoice as any, 200);
});

invoices.openapi(getByOrderRoute, async (c) => {
    const orgId = c.get('orgId');
    const { orderId } = c.req.valid('param');
    const invoice = await InvoiceService.getInvoiceByOrder(orgId, orderId);
    return c.json(invoice as any, 200);
});

invoices.openapi(createRouteDef, async (c) => {
    const orgId = c.get('orgId');
    const data = c.req.valid('json');
    const invoice = await InvoiceService.createInvoice(orgId, data, c);
    return c.json(invoice as any, 201);
});

invoices.openapi(updateRoute, async (c) => {
    const orgId = c.get('orgId');
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const invoice = await InvoiceService.updateInvoice(orgId, id, data, c);
    return c.json(invoice as any, 200);
});

invoices.openapi(updateStatusRoute, async (c) => {
    const orgId = c.get('orgId');
    const { id } = c.req.valid('param');
    const { status } = c.req.valid('json');
    const invoice = await InvoiceService.updateInvoiceStatus(orgId, id, status);
    return c.json(invoice as any, 200);
});

invoices.openapi(deleteRoute, async (c) => {
    const orgId = c.get('orgId');
    const { id } = c.req.valid('param');
    await InvoiceService.deleteInvoice(orgId, id, c);
    return c.json({ success: true }, 200);
});

export { invoices };
