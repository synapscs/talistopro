import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../lib/db';
import type { AppEnv } from '../types/env';

const dateRangeSchema = z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    period: z.enum(['today', 'week', 'month', 'quarter', 'year']).optional(),
});

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
    })

    .get('/financial-metrics', zValidator('query', dateRangeSchema), async (c) => {
        const orgId = c.get('orgId');
        const query = c.req.valid('query');
        
        const { startDate, endDate, period } = query;
        
        let dateFilter: any = {};
        
        if (period) {
            const now = new Date();
            switch (period) {
                case 'today':
                    dateFilter = {
                        gte: new Date(now.setHours(0, 0, 0, 0)),
                        lte: new Date(now.setHours(23, 59, 59, 999))
                    };
                    break;
                case 'week':
                    const weekStart = new Date(now);
                    weekStart.setDate(now.getDate() - now.getDay());
                    weekStart.setHours(0, 0, 0, 0);
                    dateFilter = { gte: weekStart };
                    break;
                case 'month':
                    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    dateFilter = { gte: monthStart };
                    break;
                case 'quarter':
                    const quarter = Math.floor(now.getMonth() / 3);
                    const quarterStart = new Date(now.getFullYear(), quarter * 3, 1);
                    dateFilter = { gte: quarterStart };
                    break;
                case 'year':
                    const yearStart = new Date(now.getFullYear(), 0, 1);
                    dateFilter = { gte: yearStart };
                    break;
            }
        } else if (startDate && endDate) {
            dateFilter = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        }

        const [
            ordersMetrics,
            invoicesMetrics,
            paymentsMetrics,
            expensesMetrics,
            revenueByService,
            revenueByPaymentMethod,
            monthlyRevenue,
        ] = await Promise.all([
            // Órdenes: completadas, pendientes, ingresos totales
            prisma.serviceOrder.groupBy({
                by: ['status'],
                where: {
                    organizationId: orgId,
                    ...(dateFilter ? { createdAt: dateFilter } : {})
                },
                _count: { id: true },
                _sum: { total: true }
            }),

            // Facturas: emitidas, pagadas, pendientes, reembolsadas
            prisma.invoice.groupBy({
                by: ['status'],
                where: {
                    organizationId: orgId,
                    ...(dateFilter ? { createdAt: dateFilter } : {})
                },
                _count: { id: true },
                _sum: { total: true }
            }),

            // Pagos: totales por método
            prisma.payment.groupBy({
                by: ['method'],
                where: {
                    serviceOrder: { organizationId: orgId },
                    ...(dateFilter ? { createdAt: dateFilter } : {})
                },
                _count: { id: true },
                _sum: { amountUsd: true }
            }),

            // Gastos: totales
            prisma.expense.aggregate({
                where: {
                    organizationId: orgId,
                    ...(dateFilter ? { date: dateFilter } : {})
                },
                _sum: { amount: true }
            }),

            // Ingresos por servicio (OrderItems agrupados por tipo)
            prisma.orderItem.groupBy({
                by: ['type'],
                where: {
                    serviceOrder: {
                        organizationId: orgId
                    },
                    ...(dateFilter ? { serviceOrder: { createdAt: dateFilter } } : {})
                },
                _sum: { total: true }
            }),

            // Ingresos por mes (últimos 12 meses)
            prisma.$queryRaw<Array<{ month: string; total: number }>>`
                SELECT 
                    TO_CHAR(created_at, 'YYYY-MM') as month,
                    SUM(total) as total
                FROM service_orders
                WHERE organization_id = ${orgId}
                    AND status != 'CANCELLED'
                    AND created_at >= NOW() - INTERVAL '12 months'
                GROUP BY TO_CHAR(created_at, 'YYYY-MM')
                ORDER BY month DESC
            `,

            // Órdenes por día (últimos 30 días)
            prisma.$queryRaw<Array<{ date: string; count: number; total: number }>>`
                SELECT 
                    DATE(created_at) as date,
                    COUNT(*) as count,
                    COALESCE(SUM(total), 0) as total
                FROM service_orders
                WHERE organization_id = ${orgId}
                    AND status != 'CANCELLED'
                    AND created_at >= NOW() - INTERVAL '30 days'
                GROUP BY DATE(created_at)
                ORDER BY date ASC
            `
        ]);

        const totalInvoices = invoicesMetrics.reduce((sum, item) => sum + item._count.id, 0);
        const paidInvoices = invoicesMetrics.find(item => item.status === 'PAID')?._sum.total || 0;
        const pendingInvoices = invoicesMetrics.find(item => item.status === 'PENDING')?._sum.total || 0;
        const partialInvoices = invoicesMetrics.find(item => item.status === 'PARTIAL')?._sum.total || 0;

        const completedOrders = ordersMetrics.find(item => item.status === 'DELIVERED')?._sum.total || 0;
        const totalOrders = ordersMetrics.reduce((sum, item) => sum + item._sum.total || 0, 0);

        const totalExpenses = Number(expensesMetrics._sum.amount || 0);
        const totalPayments = paymentsMetrics.reduce((sum, item) => sum + Number(item._sum.amountUsd || 0), 0);
        const totalRevenue = Number(completedOrders);
        
        const profit = totalRevenue - totalExpenses;
        const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;

        return c.json({
            summary: {
                totalRevenue,
                totalExpenses,
                profit,
                profitMargin,
                totalInvoices,
                totalOrders: ordersMetrics.reduce((sum, item) => sum + item._count.id, 0),
                completedOrders: ordersMetrics.find(item => item.status === 'DELIVERED')?._count.id || 0,
                pendingOrders: ordersMetrics.find(item => item.status === 'RECEIVED')?._count.id || 0,
                averageOrderValue: totalRevenue > 0 ? totalRevenue / (ordersMetrics.reduce((sum, item) => sum + item._count.id, 0) || 1) : 0
            },
            invoices: {
                total: totalInvoices,
                paid: paidInvoices,
                pending: pendingInvoices,
                partial: partialInvoices,
                collected: totalPayments,
                outstanding: totalInvoices > 0 ? (totalInvoices - totalPayments) : 0
            },
            revenueByService: revenueByService.map(item => ({
                type: item.type,
                total: Number(item._sum.total || 0)
            })),
            paymentMethods: paymentsMetrics.map(item => ({
                method: item.method,
                count: item._count.id,
                total: Number(item._sum.amountUsd || 0)
            })),
            monthlyRevenue: (monthlyRevenue || []).map(item => ({
                month: item.month,
                total: Number(item.total)
            })),
            dailyRevenue: (ordersMetrics as any).map(item => ({
                date: item.date,
                count: item.count,
                total: Number(item.total)
            }))
        });
    })

    .get('/top-services', zValidator('query', dateRangeSchema.partial()), async (c) => {
        const orgId = c.get('orgId');
        const query = c.req.valid('query');
        
        let dateFilter: any = {};
        if (query.startDate && query.endDate) {
            dateFilter = {
                gte: new Date(query.startDate),
                lte: new Date(query.endDate)
            };
        }

        const topServices = await prisma.orderItem.groupBy({
            by: ['name'],
            where: {
                serviceOrder: {
                    organizationId: orgId
                },
                ...(dateFilter ? { serviceOrder: { createdAt: dateFilter } } : {})
            },
            _count: { id: true },
            _sum: { total: true },
            orderBy: {
                _count: { id: 'desc' as const }
            },
            take: 10
        });

        return c.json(topServices.map(item => ({
            name: item.name,
            count: item._count.id,
            total: Number(item._sum.total || 0)
        })));
    })

    .get('/top-customers', zValidator('query', dateRangeSchema.partial()), async (c) => {
        const orgId = c.get('orgId');
        const query = c.req.valid('query');
        
        let dateFilter: any = {};
        if (query.startDate && query.endDate) {
            dateFilter = {
                gte: new Date(query.startDate),
                lte: new Date(query.endDate)
            };
        }

        const topCustomers = await prisma.serviceOrder.groupBy({
            by: ['customerId'],
            where: {
                organizationId: orgId,
                status: 'DELIVERED',
                ...(dateFilter ? { createdAt: dateFilter } : {})
            },
            _count: { id: true },
            _sum: { total: true },
            orderBy: {
                _sum: { total: 'desc' as const }
            },
            take: 10
        });

        const customerIds = topCustomers.map(item => item.customerId);
        const customers = await prisma.customer.findMany({
            where: { id: { in: customerIds } },
            select: { id: true, name: true, phone: true }
        });

        const customerMap = new Map(customers.map(c => [c.id, c]));

        return c.json(topCustomers.map(item => {
            const customer = customerMap.get(item.customerId);
            return {
                customerId: item.customerId,
                customerName: customer?.name || 'Desconocido',
                phone: customer?.phone,
                orderCount: item._count.id,
                totalSpent: Number(item._sum.total || 0)
            };
        }));
    });

export { dashboard };