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
        
        try {
            const [organizations, total] = await Promise.all([
                prisma.organization.findMany({
                    where,
                    include: {
                        settings: true
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
                    plan: null,
                    planId: null,
                    subscriptionStatus: org.subscriptionStatus || 'trial',
                    trialEndsAt: org.trialEndsAt,
                    settings: org.settings || null,
                    createdAt: org.createdAt,
                    updatedAt: org.updatedAt,
                    memberCount: 0,
                    usage: null
                })),
                total,
                page: filters?.page || 1,
                limit: filters?.limit || 50,
                totalPages: Math.ceil(total / (filters?.limit || 50))
            };
        } catch (error: any) {
            console.error('Error fetching organizations:', error);
            throw new HTTPException(500, { message: 'Error al cargar organizaciones' });
        }
    },

    async getOrganizationById(id: string) {
        const org = await prisma.organization.findUnique({
            where: { id },
            include: {
                plan: true,
                settings: true,
                members: {
                    take: 5,
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!org) {
            throw new HTTPException(404, { message: 'Organización no encontrada' });
        }

        const memberCount = await prisma.member.count({
            where: { organizationId: id }
        });

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const ordersThisMonth = await prisma.serviceOrder.count({
            where: {
                organizationId: id,
                createdAt: { gte: monthStart }
            }
        });

        const totalOrders = await prisma.serviceOrder.count({
            where: { organizationId: id }
        });

        const totalItems = await prisma.product.count({
            where: { organizationId: id }
        }) + await prisma.service.count({
            where: { organizationId: id }
        });

        return {
            id: org.id,
            name: org.name,
            slug: org.slug,
            businessType: org.businessType,
            country: org.country,
            primaryColor: org.primaryColor,
            themeKey: org.themeKey,
            plan: org.plan ? {
                id: org.plan.id,
                name: org.plan.name,
                description: org.plan.description,
                monthlyPrice: Number(org.plan.monthlyPrice),
                maxMembers: org.plan.maxMembers,
                maxOrdersPerMonth: org.plan.maxOrdersPerMonth,
            } : null,
            planId: org.planId,
            subscriptionStatus: org.subscriptionStatus,
            trialEndsAt: org.trialEndsAt,
            settings: org.settings,
            members: org.members,
            createdAt: org.createdAt,
            stats: {
                members: memberCount,
                items: totalItems,
                orders: totalOrders
            },
            usage: {
                ordersThisMonth
            }
        };
    },

    async updateOrganization(id: string, data: any) {
        const org = await prisma.organization.findUnique({
            where: { id }
        });

        if (!org) {
            throw new HTTPException(404, { message: 'Organización no encontrada' });
        }

        const updateData: any = {};
        
        if (data.name !== undefined) updateData.name = data.name;
        if (data.slug !== undefined) updateData.slug = data.slug;
        if (data.businessType !== undefined) updateData.businessType = data.businessType;
        if (data.country !== undefined) updateData.country = data.country;
        if (data.planId !== undefined) {
            updateData.planId = data.planId;
            updateData.subscriptionStatus = data.planId ? 'active' : null;
        }

        const updated = await prisma.organization.update({
            where: { id },
            data: updateData,
            include: { plan: true }
        });

        return updated;
    },

    async suspendOrganization(id: string) {
        const org = await prisma.organization.findUnique({
            where: { id }
        });

        if (!org) {
            throw new HTTPException(404, { message: 'Organización no encontrada' });
        }

        await prisma.organization.update({
            where: { id },
            data: { subscriptionStatus: 'suspended' }
        });

        return { message: 'Organización suspendida correctamente' };
    },

    async activateOrganization(id: string) {
        const org = await prisma.organization.findUnique({
            where: { id }
        });

        if (!org) {
            throw new HTTPException(404, { message: 'Organización no encontrada' });
        }

        await prisma.organization.update({
            where: { id },
            data: { subscriptionStatus: 'active' }
        });

        return { message: 'Organización activada correctamente' };
    },

    async getOrganizationUsage(id: string) {
        const org = await prisma.organization.findUnique({
            where: { id },
            include: { plan: true }
        });

        if (!org) {
            throw new HTTPException(404, { message: 'Organización no encontrada' });
        }

        const memberCount = await prisma.member.count({
            where: { organizationId: id }
        });

        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const orderCount = await prisma.serviceOrder.count({
            where: {
                organizationId: id,
                createdAt: { gte: monthStart }
            }
        });

        return {
            ordersThisMonth: orderCount,
            trackedUsage: memberCount + orderCount
        };
    },
};