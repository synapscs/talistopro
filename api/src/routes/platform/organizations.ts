import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { PlatformOrganizationsService } from '../../services/platform/organizations';
import { platformAdminGuard } from '../../middleware/platform-guards';
import type { AppEnv } from '../../types/env';

const organizations = new OpenAPIHono<AppEnv>();

organizations.use('/*', platformAdminGuard);

const ErrorSchema = z.object({
    error: z.string(),
}).openapi('Error');

const MessageSchema = z.object({
    message: z.string(),
}).openapi('Message');

const PlanSchema = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    monthlyPrice: z.number(),
    maxMembers: z.number(),
    maxOrdersPerMonth: z.number(),
}).nullable().openapi('Plan');

const OrganizationListSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    businessType: z.string().nullable(),
    country: z.string().nullable(),
    plan: PlanSchema,
    planId: z.string().nullable(),
    subscriptionStatus: z.string().nullable(),
    trialEndsAt: z.date().or(z.string()).nullable(),
    createdAt: z.date().or(z.string()),
    memberCount: z.number(),
    usage: z.any().nullable(),
}).openapi('OrganizationListItem');

const PaginatedOrganizationsSchema = z.object({
    data: z.array(OrganizationListSchema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
}).openapi('PaginatedOrganizations');

const OrganizationDetailSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    businessType: z.string().nullable(),
    country: z.string().nullable(),
    primaryColor: z.string(),
    themeKey: z.string(),
    plan: PlanSchema,
    planId: z.string().nullable(),
    subscriptionStatus: z.string().nullable(),
    trialEndsAt: z.date().or(z.string()).nullable(),
    settings: z.any().nullable(),
    members: z.array(z.any()),
    createdAt: z.date().or(z.string()),
    stats: z.object({
        members: z.number(),
        items: z.number(),
        orders: z.number(),
    }),
}).openapi('OrganizationDetail');

const UpdateOrganizationSchema = z.object({
    name: z.string().optional(),
    slug: z.string().optional(),
    businessType: z.string().optional(),
    country: z.string().optional(),
    planId: z.string().nullable().optional(),
}).openapi('UpdateOrganization');

const listRoute = createRoute({
    method: 'get',
    path: '/',
    request: {
        query: z.object({
            plan: z.string().optional(),
            status: z.string().optional(),
            search: z.string().optional(),
            page: z.string().optional(),
            limit: z.string().optional(),
        }),
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: PaginatedOrganizationsSchema,
                },
            },
            description: 'Listado paginado de organizaciones',
        },
        401: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Unauthorized',
        },
        403: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Forbidden - Platform Admin required',
        },
    },
});

const getOneRoute = createRoute({
    method: 'get',
    path: '/{id}',
    request: {
        params: z.object({
            id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
        }),
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: OrganizationDetailSchema,
                },
            },
            description: 'Detalle de la organización',
        },
        404: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Organización no encontrada',
        },
    },
});

const updateRoute = createRoute({
    method: 'put',
    path: '/{id}',
    request: {
        params: z.object({
            id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
        }),
        body: {
            content: {
                'application/json': {
                    schema: UpdateOrganizationSchema,
                },
            },
        },
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.any(),
                },
            },
            description: 'Organización actualizada',
        },
        404: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Organización no encontrada',
        },
    },
});

const suspendRoute = createRoute({
    method: 'post',
    path: '/{id}/suspend',
    request: {
        params: z.object({
            id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
        }),
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: MessageSchema,
                },
            },
            description: 'Organización suspendida',
        },
        404: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Organización no encontrada',
        },
    },
});

const activateRoute = createRoute({
    method: 'post',
    path: '/{id}/activate',
    request: {
        params: z.object({
            id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
        }),
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: MessageSchema,
                },
            },
            description: 'Organización activada',
        },
        404: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Organización no encontrada',
        },
    },
});

const usageRoute = createRoute({
    method: 'get',
    path: '/{id}/usage',
    request: {
        params: z.object({
            id: z.string().openapi({ param: { name: 'id', in: 'path' } }),
        }),
    },
    responses: {
        200: {
            content: {
                'application/json': {
                    schema: z.object({
                        ordersThisMonth: z.number(),
                        trackedUsage: z.number(),
                    }),
                },
            },
            description: 'Uso de la organización',
        },
        404: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Organización no encontrada',
        },
    },
});

organizations.openapi(listRoute, async (c) => {
    const query = c.req.valid('query');
    
    const filters = {
        plan: query.plan,
        status: query.status,
        search: query.search,
        page: query.page ? parseInt(query.page) : 1,
        limit: query.limit ? parseInt(query.limit) : 20,
    };
    
    const result = await PlatformOrganizationsService.getAllOrganizations(filters);
    return c.json(result as any, 200);
});

organizations.openapi(getOneRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    const org = await PlatformOrganizationsService.getOrganizationById(id);
    return c.json(org as any, 200);
});

organizations.openapi(updateRoute, async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    
    const result = await PlatformOrganizationsService.updateOrganization(id, data);
    return c.json(result, 200);
});

organizations.openapi(suspendRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    await PlatformOrganizationsService.suspendOrganization(id);
    return c.json({ message: 'Organization suspended successfully' }, 200);
});

organizations.openapi(activateRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    await PlatformOrganizationsService.activateOrganization(id);
    return c.json({ message: 'Organization activated successfully' }, 200);
});

organizations.openapi(usageRoute, async (c) => {
    const { id } = c.req.valid('param');
    
    const usage = await PlatformOrganizationsService.getOrganizationUsage(id);
    return c.json(usage, 200);
});

export { organizations };
