import { prisma } from '../../lib/db';
import { HTTPException } from 'hono/http-exception';

export const PlansService = {
  async createPlan(data: {
    name: string;
    description?: string;
    monthlyPrice: number;
    yearlyPrice?: number;
    activationFee: number;
    maxMembers: number;
    maxPhotosPerOrder: number;
    maxOrdersPerMonth: number;
    whatsappEnabled?: boolean;
    n8nEnabled?: boolean;
    apiEnabled?: boolean;
    reportsEnabled?: boolean;
    integrationsEnabled?: boolean;
    metadata?: any;
  }) {
    const existingPlan = await prisma.plan.findUnique({
      where: { name: data.name }
    });

    if (existingPlan) {
      throw new HTTPException(400, { message: 'Ya existe un plan con ese nombre' });
    }

    const plan = await prisma.plan.create({
      data: {
        name: data.name,
        description: data.description,
        monthlyPrice: data.monthlyPrice,
        yearlyPrice: data.yearlyPrice,
        activationFee: data.activationFee,
        maxMembers: data.maxMembers,
        maxPhotosPerOrder: data.maxPhotosPerOrder,
        maxOrdersPerMonth: data.maxOrdersPerMonth,
        whatsappEnabled: data.whatsappEnabled ?? false,
        n8nEnabled: data.n8nEnabled ?? false,
        apiEnabled: data.apiEnabled ?? false,
        reportsEnabled: data.reportsEnabled ?? true,
        integrationsEnabled: data.integrationsEnabled ?? false,
        metadata: data.metadata,
        isActive: true
      }
    });

    return plan;
  },

  async getAllPlans(includeInactive: boolean = false) {
    const where = includeInactive ? {} : { isActive: true };

    const plans = await prisma.plan.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { organizations: true }
        }
      }
    });

    return plans.map(plan => ({
      ...plan,
      subscribersCount: plan._count.organizations
    }));
  },

  async getPlanById(id: string) {
    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { organizations: true }
        },
        organizations: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            slug: true,
            subscriptionStatus: true
          }
        }
      }
    });

    if (!plan) {
      throw new HTTPException(404, { message: 'Plan no encontrado' });
    }

    return {
      ...plan,
      subscribersCount: plan._count.organizations
    };
  },

  async updatePlan(id: string, data: {
    name?: string;
    description?: string;
    monthlyPrice?: number;
    yearlyPrice?: number;
    activationFee?: number;
    maxMembers?: number;
    maxPhotosPerOrder?: number;
    maxOrdersPerMonth?: number;
    whatsappEnabled?: boolean;
    n8nEnabled?: boolean;
    apiEnabled?: boolean;
    reportsEnabled?: boolean;
    integrationsEnabled?: boolean;
    isActive?: boolean;
    sortOrder?: number;
    metadata?: any;
  }) {
    const plan = await prisma.plan.findUnique({
      where: { id }
    });

    if (!plan) {
      throw new HTTPException(404, { message: 'Plan no encontrado' });
    }

    if (data.name && data.name !== plan.name) {
      const existingPlan = await prisma.plan.findUnique({
        where: { name: data.name }
      });

      if (existingPlan) {
        throw new HTTPException(400, { message: 'Ya existe un plan con ese nombre' });
      }
    }

    const updated = await prisma.plan.update({
      where: { id },
      data
    });

    return updated;
  },

  async deletePlan(id: string) {
    const plan = await prisma.plan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { organizations: true }
        }
      }
    });

    if (!plan) {
      throw new HTTPException(404, { message: 'Plan no encontrado' });
    }

    if (plan._count.organizations > 0) {
      throw new HTTPException(400, { 
        message: `No se puede eliminar el plan. Hay ${plan._count.organizations} organizaciones suscritas.` 
      });
    }

    await prisma.plan.delete({
      where: { id }
    });

    return { success: true, message: 'Plan eliminado correctamente' };
  },

  async deactivatePlan(id: string) {
    const plan = await prisma.plan.findUnique({
      where: { id }
    });

    if (!plan) {
      throw new HTTPException(404, { message: 'Plan no encontrado' });
    }

    const updated = await prisma.plan.update({
      where: { id },
      data: { isActive: false }
    });

    return updated;
  },

  async activatePlan(id: string) {
    const plan = await prisma.plan.findUnique({
      where: { id }
    });

    if (!plan) {
      throw new HTTPException(404, { message: 'Plan no encontrado' });
    }

    const updated = await prisma.plan.update({
      where: { id },
      data: { isActive: true }
    });

    return updated;
  },

  async getPlanStats() {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { organizations: true }
        }
      }
    });

    const stats = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      subscribers: plan._count.organizations,
      monthlyRevenue: plan._count.organizations * Number(plan.monthlyPrice),
      yearlyRevenue: plan.yearlyPrice 
        ? plan._count.organizations * Number(plan.yearlyPrice)
        : null
    }));

    const totalRevenue = stats.reduce((sum, plan) => sum + plan.monthlyRevenue, 0);

    return {
      plans: stats,
      totalRevenue
    };
  }
};
