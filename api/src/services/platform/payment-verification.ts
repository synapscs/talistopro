import { prisma } from '../../lib/db';
import { HTTPException } from 'hono/http-exception';

export const PaymentVerificationService = {
  async submitPayment(data: {
    platformInvoiceId: string;
    paymentMethod: string;
    amount: number;
    currency: string;
    exchangeRate?: number;
    referenceNumber?: string;
    receiptUrl?: string;
    notes?: string;
  }) {
    const invoice = await prisma.platformInvoice.findUnique({
      where: { id: data.platformInvoiceId },
      include: { organization: true }
    });

    if (!invoice) {
      throw new HTTPException(404, { message: 'Factura no encontrada' });
    }

    if (invoice.status === 'paid') {
      throw new HTTPException(400, { message: 'Esta factura ya está pagada' });
    }

    const verification = await prisma.paymentVerification.create({
      data: {
        platformInvoiceId: data.platformInvoiceId,
        paymentMethod: data.paymentMethod,
        amount: data.amount,
        currency: data.currency as any,
        exchangeRate: data.exchangeRate,
        referenceNumber: data.referenceNumber,
        receiptUrl: data.receiptUrl,
        notes: data.notes,
        status: 'pending'
      },
      include: {
        platformInvoice: {
          include: { organization: true }
        }
      }
    });

    return verification;
  },

  async getAllVerifications(filters?: {
    status?: string;
    platformInvoiceId?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.platformInvoiceId) {
      where.platformInvoiceId = filters.platformInvoiceId;
    }

    const skip = filters?.page && filters?.limit ? (filters.page - 1) * filters.limit : 0;
    const take = filters?.limit || 50;

    const [verifications, total] = await Promise.all([
      prisma.paymentVerification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          platformInvoice: {
            include: { organization: true }
          },
          verifiedBy: {
            include: { user: true }
          }
        }
      }),
      prisma.paymentVerification.count({ where })
    ]);

    return {
      data: verifications,
      total,
      page: filters?.page || 1,
      limit: filters?.limit || 50
    };
  },

  async getVerificationById(id: string) {
    const verification = await prisma.paymentVerification.findUnique({
      where: { id },
      include: {
        platformInvoice: {
          include: { 
            organization: {
              include: { plan: true }
            }
          }
        },
        verifiedBy: {
          include: { user: true }
        }
      }
    });

    if (!verification) {
      throw new HTTPException(404, { message: 'Verificación no encontrada' });
    }

    return verification;
  },

  async verifyPayment(
    verificationId: string, 
    verifiedById: string, 
    notes?: string
  ) {
    const verification = await prisma.paymentVerification.findUnique({
      where: { id: verificationId },
      include: { platformInvoice: true }
    });

    if (!verification) {
      throw new HTTPException(404, { message: 'Verificación no encontrada' });
    }

    if (verification.status !== 'pending') {
      throw new HTTPException(400, { 
        message: `Esta verificación ya fue procesada (estado: ${verification.status})` 
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedVerification = await tx.paymentVerification.update({
        where: { id: verificationId },
        data: {
          status: 'verified',
          verifiedById,
          verifiedAt: new Date(),
          notes: notes || verification.notes
        },
        include: {
          platformInvoice: {
            include: { organization: true }
          },
          verifiedBy: { include: { user: true } }
        }
      });

      await tx.platformInvoice.update({
        where: { id: verification.platformInvoiceId },
        data: {
          status: 'paid',
          paidAt: new Date()
        }
      });

      return updatedVerification;
    });

    return result;
  },

  async rejectPayment(
    verificationId: string, 
    verifiedById: string, 
    rejectionReason: string
  ) {
    const verification = await prisma.paymentVerification.findUnique({
      where: { id: verificationId }
    });

    if (!verification) {
      throw new HTTPException(404, { message: 'Verificación no encontrada' });
    }

    if (verification.status !== 'pending') {
      throw new HTTPException(400, { 
        message: `Esta verificación ya fue procesada (estado: ${verification.status})` 
      });
    }

    const result = await prisma.paymentVerification.update({
      where: { id: verificationId },
      data: {
        status: 'rejected',
        verifiedById,
        verifiedAt: new Date(),
        rejectionReason
      },
      include: {
        platformInvoice: {
          include: { organization: true }
        },
        verifiedBy: { include: { user: true } }
      }
    });

    return result;
  },

  async getPendingCount() {
    const count = await prisma.paymentVerification.count({
      where: { status: 'pending' }
    });
    return count;
  },

  async getByInvoiceId(platformInvoiceId: string) {
    const verifications = await prisma.paymentVerification.findMany({
      where: { platformInvoiceId },
      orderBy: { createdAt: 'desc' },
      include: {
        verifiedBy: {
          include: { user: true }
        }
      }
    });

    return verifications;
  }
};
