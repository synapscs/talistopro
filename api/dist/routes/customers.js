import { Hono } from 'hono';
import { prisma } from '../lib/db';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
const customers = new Hono();
// Esquema de validación para creación/actualización
const customerSchema = z.object({
    name: z.string().min(1),
    phone: z.string().min(5),
    whatsapp: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    documentType: z.string().optional(),
    documentNumber: z.string().optional(),
    organizationId: z.string(), // Temporalmente requerido hasta tener middleware de auth completo
});
// Listar clientes de una organización
customers.get('/', async (c) => {
    const orgId = c.req.query('organizationId');
    if (!orgId)
        return c.json({ error: 'organizationId is required' }, 400);
    const list = await prisma.customer.findMany({
        where: { organizationId: orgId },
        include: { assets: true },
        orderBy: { createdAt: 'desc' }
    });
    return c.json(list);
});
// Crear cliente
customers.post('/', zValidator('json', customerSchema), async (c) => {
    const data = c.req.valid('json');
    try {
        const customer = await prisma.customer.create({
            data: {
                id: crypto.randomUUID(), // Usando UUIDv7/randomUUID
                name: data.name,
                phone: data.phone,
                whatsapp: data.whatsapp,
                email: data.email,
                documentType: data.documentType,
                documentNumber: data.documentNumber,
                organizationId: data.organizationId,
            }
        });
        return c.json(customer, 201);
    }
    catch (error) {
        console.error('Error creating customer:', error);
        return c.json({ error: 'Failed to create customer' }, 500);
    }
});
// Obtener cliente por ID
customers.get('/:id', async (c) => {
    const id = c.req.param('id');
    const customer = await prisma.customer.findUnique({
        where: { id },
        include: { assets: true, serviceOrders: true }
    });
    if (!customer)
        return c.json({ error: 'Customer not found' }, 404);
    return c.json(customer);
});
export { customers };
