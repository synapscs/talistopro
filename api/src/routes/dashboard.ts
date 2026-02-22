import { Hono } from 'hono';
import { prisma } from '../lib/db';
import type { AppEnv } from '../types/env';

// Ruta encadenada para inferencia de tipos Hono RPC
const dashboard = new Hono<AppEnv>()
    .get('/stats', async (c) => {
        const orgId = c.get('orgId');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const [
            totalCustomers,
            activeOrders,
            appointmentsToday,
            totalRevenue,
            lowStockCount
        ] = await Promise.all([
            prisma.customer.count({ where: { organizationId: orgId } }),
            prisma.serviceOrder.count({
                where: {
                    organizationId: orgId,
                    status: { notIn: ['DELIVERED', 'CANCELLED'] }
                }
            }),
            prisma.appointment.count({
                where: {
                    organizationId: orgId,
                    scheduledAt: {
                        gte: today,
                        lt: tomorrow
                    }
                }
            }),
            prisma.serviceOrder.aggregate({
                where: {
                    organizationId: orgId,
                    status: { not: 'CANCELLED' }
                },
                _sum: { total: true }
            }),
            prisma.product.count({
                where: {
                    organizationId: orgId,
                    stock: { lte: prisma.product.fields.minStock }
                }
            })
        ]);

        return c.json({
            totalCustomers,
            activeOrders,
            appointmentsToday,
            totalRevenue: Number(totalRevenue._sum.total || 0),
            lowStockCount
        });
    });

export { dashboard };
