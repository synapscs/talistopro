import { prisma } from '../../lib/db';
import { HTTPException } from 'hono/http-exception';

export const PlatformSubscriptionService = {
  /**
   * Asignar un plan a una organización
   */
  async assignPlan(
    organizationId: string, 
    planId: string
  ) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { plan: true }
    });

    if (!org) {
      throw new HTTPException(404, { message: 'Organización no encontrada' });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      throw new HTTPException(404, { message: 'Plan no encontrado' });
    }

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        planId,
        subscriptionStatus: 'active',
        trialEndsAt: null
      },
      include: { plan: true }
    });

    return updated;
  },

  /**
   * Cambiar el plan de una organización
   */
  async changePlan(
    organizationId: string, 
    newPlanId: string
  ) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!org) {
      throw new HTTPException(404, { message: 'Organización no encontrada' });
    }

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        planId: newPlanId,
        subscriptionStatus: 'active'
      },
      include: { plan: true }
    });

    return updated;
  },

  /**
   * Cancelar suscripción
   */
  async cancelSubscription(
    organizationId: string,
    reason?: string
  ) {
    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        subscriptionStatus: 'cancelled'
      }
    });

    return {
      success: true,
      organizationId,
      subscriptionStatus: 'cancelled',
      reason
    };
  },

  /**
   * Obtener suscripción de una organización
   */
  async getSubscription(organizationId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        plan: true,
        settings: true
      }
    });

    if (!org) {
      throw new HTTPException(404, { message: 'Organización no encontrada' });
    }

    return {
      organizationId: org.id,
      name: org.name,
      plan: org.plan,
      subscriptionStatus: org.subscriptionStatus,
      trialEndsAt: org.trialEndsAt,
      createdAt: org.createdAt
    };
  },

  /**
   * Validar límites del plan
   */
  async validateLimits(organizationId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { plan: true }
    });

    if (!org || !org.plan) {
      throw new HTTPException(404, { message: 'Organización o plan no encontrado' });
    }

    const memberCount = await prisma.member.count({
      where: { organizationId }
    });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const orderCount = await prisma.serviceOrder.count({
      where: {
        organizationId,
        createdAt: { gte: monthStart }
      }
    });

    const limits = {
      maxMembers: org.plan.maxMembers,
      maxOrdersPerMonth: org.plan.maxOrdersPerMonth,
      maxPhotosPerOrder: org.plan.maxPhotosPerOrder
    };

    const usage = {
      members: memberCount,
      ordersThisMonth: orderCount,
      photosPerOrder: 0
    };

    const violations: string[] = [];

    if (usage.members > limits.maxMembers) {
      violations.push(`Excedido límite de miembros (${usage.members}/${limits.maxMembers})`);
    }

    if (usage.ordersThisMonth > limits.maxOrdersPerMonth) {
      violations.push(`Excedido límite de órdenes mensuales (${usage.ordersThisMonth}/${limits.maxOrdersPerMonth})`);
    }

    return {
      isValid: violations.length === 0,
      limits,
      usage,
      violations
    };
  }
};