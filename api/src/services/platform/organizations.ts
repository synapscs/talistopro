import { prisma } from '../../lib/db';
import { HTTPException } from 'hono/http-exception';

export const PlatformOrganizationsService = {
    async getAllOrganizations(filters?: {
        plan?: string;
        status?: string;
        search?: string;
        page?: number;
        limit?: number;
    }) {
        const where: any = {};
        
        if (filters?.plan) {
            const plans = await prisma.plan.findMany({
                where: { name: { contains: filters.plan, mode: 'insensitive' } },
                select: { id: true }
            });
            if (plans.length > 0) {
                where.planId = { in: plans.map(p => p.id) };
            }
        }
        
        if (filters?.status) {
            where.subscriptionStatus = filters.status;
        }
        
        if (filters?.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { slug: { contains: filters.search, mode: 'insensitive' } }
            ];
        }
        
        const skip = filters?.page && filters?.limit ? (filters.page - 1) * filters.limit : 0;
        const take = filters?.limit || 50;
        
        const [organizations, total] = await Promise.all([
            prisma.organization.findMany({
                where,
                include: {
                    settings: true,
                    plan: true,
                    _count: {
                        select: { id: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take,
            }),
            prisma.organization.count({ where })
        ]);
        
        return {
            data: organizations.map(org => ({
                id: org.id,
                name: org.name,
                slug: org.slug,
                businessType: org.businessType,
                country: org.country,
                plan: org.plan || null,
                planId: org.planId || null,
                subscriptionStatus: org.subscriptionStatus || 'trial',
                trialEndsAt: org.trialEndsAt,
                settings: org.settings || null,
                createdAt: org.createdAt,
                updatedAt: org.updatedAt,
                memberCount: org._count.id,
                usage: null
            })),
            total,
            page: filters?.page || 1,
            limit: filters?.limit || 50,
            totalPages: Math.ceil(total / (filters?.limit || 50))
        };
    },

    async getOrganizationById(id: string) {
        const org = await prisma.organization.findUnique({
            where: { id },
            include: {
                settings: true,
                plan: true,
                members: {
                    include: { user: true }
                },
                _count: {
                    select: { id: true, items: true, serviceOrders: true }
                }
            }
        });
        
        if (!org) {
            throw new HTTPException(404, { message: 'Organization not found' });
        }
        
        return {
            id: org.id,
            name: org.name,
            slug: org.slug,
            businessType: org.businessType,
            country: org.country,
            primaryColor: org.primaryColor,
            themeKey: org.themeKey,
            plan: org.plan || null,
            planId: org.planId || null,
            subscriptionStatus: org.subscriptionStatus || 'trial',
            trialEndsAt: org.trialEndsAt,
            settings: org.settings || null,
            members: org.members || [],
            createdAt: org.createdAt,
            updatedAt: org.updatedAt,
            stats: {
                members: org._count.id || 0,
                items: org._count.items || 0,
                orders: org._count.serviceOrders || 0
            }
        };
    },

    async updateOrganization(id: string, data: any) {
        const org = await prisma.organization.findUnique({
            where: { id }
        });
        
        if (!org) {
            throw new HTTPException(404, { message: 'Organization not found' });
        }
        
        return await prisma.organization.update({
            where: { id },
            data: {
                name: data.name,
                slug: data.slug,
                businessType: data.businessType,
                country: data.country,
                planId: data.planId,
            }
        });
    },

    async suspendOrganization(id: string) {
        return await prisma.organization.update({
            where: { id },
            data: {
                subscriptionStatus: 'suspended'
            }
        });
    },

    async activateOrganization(id: string) {
        const org = await prisma.organization.findUnique({
            where: { id }
        });
        
        if (!org) {
            throw new HTTPException(404, { message: 'Organization not found' });
        }
        
        // Reactivar si tiene un plan activo
        const data: any = { subscriptionStatus: 'active' };
        
        if (org.planId) {
            // Verificar si el trial no ha expirado
            if (org.trialEndsAt && org.trialEndsAt > new Date()) {
                data.trialEndsAt = null;
            }
        }
        
        return await prisma.organization.update({
            where: { id },
            data
        });
    },

    async deleteOrganization(id: string) {
        return await prisma.organization.delete({
            where: { id }
        });
    },

    async getOrganizationUsage(organizationId: string) {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        
        const [ordersCount, currentUsage] = await Promise.all([
            prisma.serviceOrder.count({
                where: {
                    organizationId,
                    status: { not: 'CANCELLED' },
                    createdAt: {
                        gte: monthStart,
                        lt: monthEnd
                    }
                }
            }),
            prisma.usageLog.findFirst({
                where: {
                    organizationId,
                    periodStart: monthStart,
                    metric: 'orders_count'
                }
            })
        ]);
        
        return {
            ordersThisMonth: ordersCount,
            trackedUsage: currentUsage?.value || 0
        };
    }
};