import { prisma } from '../../lib/db';

export const DashboardStatsService = {
  async getOverviewStats() {
    const [
      totalOrganizations,
      activeSubscriptions,
      trialSubscriptions,
      suspendedSubscriptions,
      pendingPayments,
      monthlyRevenue
    ] = await Promise.all([
      prisma.organization.count(),
      
      prisma.organization.count({
        where: { subscriptionStatus: 'active' }
      }),
      
      prisma.organization.count({
        where: { subscriptionStatus: 'trial' }
      }),
      
      prisma.organization.count({
        where: { subscriptionStatus: 'suspended' }
      }),
      
      prisma.paymentVerification.count({
        where: { status: 'pending' }
      }),
      
      this.calculateMonthlyRevenue()
    ]);

    return {
      totalOrganizations,
      activeSubscriptions,
      trialSubscriptions,
      suspendedSubscriptions,
      pendingPayments,
      monthlyRevenue
    };
  },

  async calculateMonthlyRevenue() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const paidInvoices = await prisma.platformInvoice.findMany({
      where: {
        status: 'paid',
        paidAt: {
          gte: monthStart,
          lt: monthEnd
        }
      },
      select: {
        total: true
      }
    });

    const total = paidInvoices.reduce((sum, invoice) => {
      return sum + Number(invoice.total);
    }, 0);

    return total;
  },

  async getOrganizationsGrowth(months: number = 6) {
    const now = new Date();
    const result = [];

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);

      const count = await prisma.organization.count({
        where: {
          createdAt: {
            gte: monthStart,
            lt: monthEnd
          }
        }
      });

      result.push({
        month: monthStart.toISOString().substring(0, 7),
        count
      });
    }

    return result;
  },

  async getRevenueByPlan() {
    const organizations = await prisma.organization.findMany({
      where: {
        subscriptionStatus: 'active',
        planId: { not: null }
      },
      include: {
        plan: true
      }
    });

    const revenueByPlan: Record<string, { name: string; count: number; revenue: number }> = {};

    organizations.forEach(org => {
      if (org.plan) {
        const planName = org.plan.name;
        if (!revenueByPlan[planName]) {
          revenueByPlan[planName] = {
            name: planName,
            count: 0,
            revenue: 0
          };
        }
        revenueByPlan[planName].count++;
        revenueByPlan[planName].revenue += Number(org.plan.monthlyPrice);
      }
    });

    return Object.values(revenueByPlan);
  },

  async getRecentActivity(limit: number = 10) {
    const [
      recentOrganizations,
      recentPayments,
      recentVerifications
    ] = await Promise.all([
      prisma.organization.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          subscriptionStatus: true,
          plan: {
            select: {
              name: true
            }
          }
        }
      }),

      prisma.platformInvoice.findMany({
        take: limit,
        orderBy: { paidAt: 'desc' },
        where: {
          status: 'paid',
          paidAt: { not: null }
        },
        select: {
          id: true,
          invoiceNumber: true,
          total: true,
          paidAt: true,
          organization: {
            select: {
              name: true
            }
          }
        }
      }),

      prisma.paymentVerification.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          status: true,
          createdAt: true,
          amount: true,
          platformInvoice: {
            select: {
              invoiceNumber: true,
              organization: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      })
    ]);

    return {
      recentOrganizations,
      recentPayments,
      recentVerifications
    };
  },

  async getPaymentVerificationStats() {
    const [pending, verified, rejected] = await Promise.all([
      prisma.paymentVerification.count({ where: { status: 'pending' } }),
      prisma.paymentVerification.count({ where: { status: 'verified' } }),
      prisma.paymentVerification.count({ where: { status: 'rejected' } })
    ]);

    return {
      pending,
      verified,
      rejected,
      total: pending + verified + rejected
    };
  }
};
