import { prisma } from '../../lib/db';
import { HTTPException } from 'hono/http-exception';

export const PlatformBillingService = {
  /**
   * Generar factura mensual para una organización
   */
  async generateMonthlyInvoice(organizationId: string, period: { start: Date, end: Date }) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { plan: true }
    });

    if (!org || !org.plan) {
      throw new HTTPException(404, { message: 'Organización o plan no encontrado' });
    }

    const monthlyPrice = Number(org.plan.monthlyPrice);
    const year = period.start.getFullYear();
    const month = String(period.start.getMonth() + 1).padStart(2, '0');
    const invoiceNumber = `SAAS-${year}${month}-${org.id.substring(0, 6).toUpperCase()}`;

    const subtotal = monthlyPrice;
    const taxRate = 0.16;
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    const invoice = await prisma.platformInvoice.create({
      data: {
        invoiceNumber,
        subscriptionId: org.id,
        monthlyFee: monthlyPrice,
        activationFee: Number(org.plan.activationFee || 0),
        taxAmount,
        total,
        currency: 'USD',
        periodStart: period.start,
        periodEnd: period.end,
        dueDate: new Date(period.end.getTime() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return invoice;
  },

  /**
   * Obtener todas las facturas
   */
  async getAllInvoices(filters?: {
    status?: string;
    organizationId?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.organizationId) {
      where.subscriptionId = filters.organizationId;
    }

    const skip = filters?.page && filters?.limit ? (filters.page - 1) * filters.limit : 0;
    const take = filters?.limit || 50;

    const [invoices, total] = await Promise.all([
      prisma.platformInvoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.platformInvoice.count({ where })
    ]);

    return {
      data: invoices,
      total,
      page: filters?.page || 1,
      limit: filters?.limit || 50
    };
  },

  /**
   * Marcar factura como pagada
   */
  async markInvoicePaid(invoiceId: string) {
    return await prisma.platformInvoice.update({
      where: { id: invoiceId },
      data: {
        status: 'paid',
        paidAt: new Date()
      }
    });
  }
};