import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { CustomerService } from '../services/customers';
import type { AppEnv } from '../types/env';

const customers = new OpenAPIHono<AppEnv>();

// --- SCHEMAS ---

const ErrorSchema = z.object({
    error: z.string(),
}).openapi('Error');

const MessageSchema = z.object({
    message: z.string(),
}).openapi('Message');

const CustomerSchema = z.object({
    id: z.string().uuid().openapi({ example: '8af00648-0bcf-43c4-beab-347bd8d85991' }),
    name: z.string().min(1).openapi({ example: 'Juan Pérez' }),
    phone: z.string().min(5).openapi({ example: '+584121234567' }),
    whatsapp: z.string().optional().nullable().openapi({ example: '+584121234567' }),
    email: z.string().email().optional().nullable().or(z.literal('')).openapi({ example: 'juan@example.com' }),
    documentType: z.string().optional().nullable().openapi({ example: 'V' }),
    documentNumber: z.string().optional().nullable().openapi({ example: '12345678' }),
    address: z.string().optional().nullable().openapi({ example: 'Av. Las Mercedes' }),
    city: z.string().optional().nullable().openapi({ example: 'Caracas' }),
    state: z.string().optional().nullable().openapi({ example: 'Miranda' }),
    notes: z.string().optional().nullable().openapi({ example: 'Cliente recurrente' }),
    notifyWhatsapp: z.boolean().default(true).openapi({ example: true }),
    notifyEmail: z.boolean().default(false).openapi({ example: false }),
    organizationId: z.string().uuid().openapi({ example: 'uuid-org-123' }),
    createdAt: z.date().or(z.string()).openapi({ example: '2024-01-01T00:00:00Z' }),
    updatedAt: z.date().or(z.string()).openapi({ example: '2024-01-01T00:00:00Z' }),
}).openapi('Customer');

const CreateCustomerSchema = CustomerSchema.omit({
    id: true,
    organizationId: true,
    createdAt: true,
    updatedAt: true
}).openapi('CreateCustomer');

const UpdateCustomerSchema = CreateCustomerSchema.partial().openapi('UpdateCustomer');

// --- ROUTES DEFINITIONS ---

const listRoute = createRoute({
    method: 'get',
    path: '/',
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.array(CustomerSchema),
                },
            },
            description: 'Listado de clientes de la organización',
        },
    },
});

const createRouteDef = createRoute({
    method: 'post',
    path: '/',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: CreateCustomerSchema,
                },
            },
        },
    },
    responses: {
        201: {
            content: {
                'application/json': {
                    schema: CustomerSchema,
                },
            },
            description: 'Cliente creado con éxito',
        },
        500: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Error del servidor',
        }
    },
});

const getOneRoute = createRoute({
    method: 'get',
    path: '/{id}',
    request: {
        params: z.object({
            id: z.string().uuid().openapi({ param: { name: 'id', in: 'path' } }),
        }),
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: CustomerSchema,
                },
            },
            description: 'Detalle del cliente',
        },
        404: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Cliente no encontrado',
        },
    },
});

const updateRoute = createRoute({
    method: 'put',
    path: '/{id}',
    request: {
        params: z.object({
            id: z.string().uuid().openapi({ param: { name: 'id', in: 'path' } }),
        }),
        body: {
            content: {
                'application/json': {
                    schema: UpdateCustomerSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: MessageSchema,
                },
            },
            description: 'Cliente actualizado',
        },
        404: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Cliente no encontrado',
        },
        500: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Error del servidor',
        }
    },
});

const deleteRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    request: {
        params: z.object({
            id: z.string().uuid().openapi({ param: { name: 'id', in: 'path' } }),
        }),
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: MessageSchema,
                },
            },
            description: 'Cliente eliminado',
        },
        404: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Cliente no encontrado',
        },
        500: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Error del servidor',
        }
    },
});

// --- IMPLEMENTATION ---

customers.openapi(listRoute, async (c) => {
    const orgId = c.get('orgId');
    const list = await CustomerService.getCustomers(orgId);
    return c.json(list as any, 200);
});

customers.openapi(createRouteDef, async (c) => {
    const data = c.req.valid('json');
    const orgId = c.get('orgId');

    const customer = await CustomerService.createCustomer(orgId, data);
    return c.json(customer as any, 201);
});

customers.openapi(getOneRoute, async (c) => {
    const { id } = c.req.valid('param');
    const orgId = c.get('orgId');

    const customer = await CustomerService.getCustomerById(orgId, id);

    if (!customer) return c.json({ error: 'Not found' }, 404);
    return c.json(customer as any, 200);
});

customers.openapi(updateRoute, async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const orgId = c.get('orgId');

    const result = await CustomerService.updateCustomer(orgId, id, data);

    if (!result) return c.json({ error: 'Not found' }, 404);
    return c.json(result, 200);
});

customers.openapi(deleteRoute, async (c) => {
    const { id } = c.req.valid('param');
    const orgId = c.get('orgId');

    const result = await CustomerService.deleteCustomer(orgId, id);

    if (!result) return c.json({ error: 'Not found' }, 404);
    return c.json(result, 200);
});

export { customers };
