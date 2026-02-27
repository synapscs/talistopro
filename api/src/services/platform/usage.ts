import { prisma } from '../../lib/db';

export const PlatformUsageService = {
  /**
   * Registrar creación de orden (evento de uso)
   */
  async trackOrderCreation(organizationId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const existing = await prisma.usageLog.findFirst({
      where: {
        organizationId,
        metric: 'orders_count',
        periodStart: monthStart,
        periodEnd: monthEnd
      }
    });

    if (existing) {
      await prisma.usageLog.update({
        where: { id: existing.id },
        data: { value: existing.value + 1 }
      });
    } else {
      await prisma.usageLog.create({
        data: {
          organizationId,
          metric: 'orders_count',
          value: 1,
          periodStart: monthStart,
          periodEnd: monthEnd
        }
      });
    }

    await this.checkLimitsAndNotify(organizationId);
  },

  /**
   * Obtener uso mensual
   */
  async getMonthlyUsage(
    organizationId: string, 
    month: number, 
    year: number
  ) {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 1);

    const logs = await prisma.usageLog.findMany({
      where: {
        organizationId,
        periodStart: monthStart,
        periodEnd: monthEnd
      }
    });

    return logs.reduce((acc, log) => ({
      ...acc,
      [log.metric]: log.value
    }), {} as Record<string, number>);
  },

  /**
   * Verificar límites y notificar
   */
  async checkLimitsAndNotify(organizationId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { plan: true }
    });

    if (!org || !org.plan) return;

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

    const orderCount = await prisma.usageLog.findFirst({
      where: {
        organizationId,
        metric: 'orders_count',
        periodStart: monthStart,
        periodEnd: monthEnd
      }
    });

    const currentOrders = orderCount?.value || 0;
    const limit = org.plan.maxOrdersPerMonth;
    const percentage = (currentOrders / limit) * 100;

    if (percentage >= 100) {
      await prisma.organization.update({
        where: { id: organizationId },
        data: { subscriptionStatus: 'suspended' }
      });
    } else if (percentage >= 90) {
      await this.sendAlert(
        organizationId, 
        `URGENTE: Has usado el ${percentage.toFixed(1)}% de tu límite mensual (${currentOrders}/${limit} órdenes)`
      );
    } else if (percentage >= 75) {
      await this.sendAlert(
        organizationId,
        `ALERTA: Has usado el ${percentage.toFixed(1)}% de tu límite mensual (${currentOrders}/${limit} órdenes)`
      );
    }
  },

  /**
   * Enviar alerta
   */
  async sendAlert(
    organizationId: string, 
    message: string
  ) {
    console.log(`[ALERT ${organizationId}] ${message}`);
  }
};