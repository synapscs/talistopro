import { prisma } from '../lib/db';
import { HTTPException } from 'hono/http-exception';
import { recordAudit } from '../lib/audit';
import type { Context } from 'hono';

export const PaymentService = {
    async getPayments(organizationId: string, orderId?: string) {
        const where: any = { organizationId };
        
        if (orderId) {
            where.serviceOrderId = orderId;
        }

        return prisma.payment.findMany({
            where,
            include: {
                serviceOrder: {
                    select: {
                        id: true,
                        orderNumber: true,
                        customer: {
                            select: {
                                name: true,
                                phone: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    async getPaymentById(organizationId: string, id: string) {
        return prisma.payment.findFirst({
            where: { id, organizationId },
            include: {
                serviceOrder: {
                    include: {
                        customer: true,
                        items: true
                    }
                }
            }
        });
    },

    async createPayment(c: Context, organizationId: string, data: any) {
        try {
            return await prisma.$transaction(async (tx) => {
                const { orderId, amount, currency, method, reference, notes } = data;

                const order = await tx.serviceOrder.findFirst({
                    where: { id: orderId, organizationId },
                    include: { payments: true }
                });

                if (!order) {
                    throw new HTTPException(404, { message: 'Orden no encontrada' });
                }

                const currentPaid = (order.payments || []).reduce((sum: number, p: any) => sum + Number(p.amountUsd), 0);
                const newTotalPaid = currentPaid + amount;

                const newPayment = await tx.payment.create({
                    data: {
                        amount,
                        amountUsd: currency === 'USD' ? amount : amount / data.exchangeRate,
                        currency,
                        exchangeRate: data.exchangeRate || 1,
                        method,
                        reference,
                        notes,
                        serviceOrderId: orderId
                    }
                });

                const orderTotal = Number(order.total);
                let paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING';

                if (newTotalPaid >= orderTotal) {
                    paymentStatus = 'PAID';
                } else if (newTotalPaid > 0) {
                    paymentStatus = 'PARTIAL';
                }

                await tx.serviceOrder.updateMany({
                    where: { id: orderId, organizationId },
                    data: {
                        amountPaid: newTotalPaid,
                        paymentStatus
                    }
                });

                await recordAudit(c, 'CREATE', 'Payment', newPayment.id, { 
                    amount, 
                    currency, 
                    orderNumber: order.orderNumber 
                });

                return await tx.payment.findUnique({
                    where: { id: newPayment.id },
                    include: {
                        serviceOrder: {
                            select: {
                                id: true,
                                orderNumber: true,
                                customer: {
                                    select: {
                                        name: true,
                                        phone: true
                                    }
                                }
                            }
                        }
                    }
                });
            });
        } catch (error) {
            console.error('[PaymentService] Error creating payment:', error);
            throw new HTTPException(500, { message: 'Error al crear pago' });
        }
    },

    async updatePayment(c: Context, organizationId: string, id: string, data: any) {
        try {
            const updated = await prisma.payment.updateMany({
                where: { id, organizationId },
                data: {
                    amount: data.amount,
                    amountUsd: data.currency === 'USD' ? data.amount : data.amount / data.exchangeRate,
                    currency: data.currency,
                    exchangeRate: data.exchangeRate,
                    method: data.method,
                    reference: data.reference,
                    notes: data.notes
                }
            });

            if (updated.count === 0) {
                throw new HTTPException(404, { message: 'Pago no encontrado' });
            }

            const existingPayment = await prisma.payment.findFirst({
                where: { id, organizationId },
                include: { serviceOrder: true }
            });

            await this.updateOrderPaymentStatus(organizationId, existingPayment.serviceOrderId);

            await recordAudit(c, 'UPDATE', 'Payment', id, data);

            return await prisma.payment.findFirst({
                where: { id, organizationId },
                include: {
                    serviceOrder: {
                        select: {
                            id: true,
                            orderNumber: true,
                            customer: {
                                select: {
                                    name: true,
                                    phone: true
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('[PaymentService] Error updating payment:', error);
            throw new HTTPException(500, { message: 'Error al actualizar pago' });
        }
    },

    async deletePayment(c: Context, organizationId: string, id: string) {
        try {
            const existingPayment = await prisma.payment.findFirst({
                where: { id, organizationId }
            });

            if (!existingPayment) {
                throw new HTTPException(404, { message: 'Pago no encontrado' });
            }

            const orderId = existingPayment.serviceOrderId;

            await prisma.payment.deleteMany({
                where: { id, organizationId }
            });

            await this.updateOrderPaymentStatus(organizationId, orderId);

            await recordAudit(c, 'DELETE', 'Payment', id);

            return { success: true };
        } catch (error) {
            console.error('[PaymentService] Error deleting payment:', error);
            throw new HTTPException(500, { message: 'Error al eliminar pago' });
        }
    },

    async updateOrderPaymentStatus(organizationId: string, orderId: string) {
        const order = await prisma.serviceOrder.findFirst({
            where: { id: orderId, organizationId },
            include: { payments: true }
        });

        if (!order) {
            throw new HTTPException(404, { message: 'Orden no encontrada' });
        }

        const totalPaid = (order.payments || []).reduce((sum: number, p: any) => sum + Number(p.amountUsd), 0);
        const orderTotal = Number(order.total);
        
        let paymentStatus: 'PENDING' | 'PARTIAL' | 'PAID' = 'PENDING';
        
        if (totalPaid >= orderTotal) {
            paymentStatus = 'PAID';
        } else if (totalPaid > 0) {
            paymentStatus = 'PARTIAL';
        }
        
        await prisma.serviceOrder.updateMany({
            where: { id: orderId, organizationId },
            data: {
                amountPaid: totalPaid,
                paymentStatus
            }
        });
    }
};
