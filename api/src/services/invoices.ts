import { prisma } from '../lib/db';
import { HTTPException } from 'hono/http-exception';
import { recordAudit } from '../lib/audit';

export const InvoiceService = {
    async generateInvoiceNumber(organizationId: string): Promise<string> {
        const year = new Date().getFullYear();
        const count = await prisma.invoice.count({
            where: {
                organizationId,
                createdAt: {
                    gte: new Date(`${year}-01-01`),
                    lt: new Date(`${year + 1}-01-01`)
                }
            }
        });
        return `FAC-${year}-${(count + 1).toString().padStart(4, '0')}`;
    },

    async getInvoices(organizationId: string, filters?: { status?: string; customerId?: string; start?: string; end?: string }) {
        const where: any = { organizationId };

        if (filters?.status) {
            where.status = filters.status;
        }

        if (filters?.customerId) {
            where.customerId = filters.customerId;
        }

        if (filters?.start && filters?.end) {
            where.createdAt = {
                gte: new Date(filters.start),
                lte: new Date(filters.end)
            };
        }

        return prisma.invoice.findMany({
            where,
            include: {
                customer: {
                    select: {
                        name: true,
                        phone: true,
                        documentType: true,
                        documentNumber: true
                    }
                },
                serviceOrder: {
                    select: {
                        orderNumber: true,
                        items: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    async getInvoiceById(organizationId: string, id: string) {
        return prisma.invoice.findFirst({
            where: { id, organizationId },
            include: {
                customer: true,
                serviceOrder: {
                    include: {
                        items: true,
                        asset: true
                    }
                }
            }
        });
    },

    async getInvoiceByOrder(organizationId: string, orderId: string) {
        return prisma.invoice.findFirst({
            where: { 
                organizationId,
                serviceOrderId: orderId 
            },
            include: {
                customer: true,
                serviceOrder: {
                    include: {
                        items: true,
                        asset: true
                    }
                }
            }
        });
    },

    async createInvoice(organizationId: string, data: any, context?: any) {
        try {
            return await prisma.$transaction(async (tx) => {
                const { orderId } = data;

                const order = await tx.serviceOrder.findFirst({
                    where: { id: orderId, organizationId },
                    include: {
                        customer: true,
                        items: true
                    }
                });

                if (!order) {
                    throw new HTTPException(404, { message: 'Orden no encontrada' });
                }

                if (!order.items || order.items.length === 0) {
                    throw new HTTPException(400, { message: 'La orden debe tener items para generar una factura' });
                }

                const existingInvoice = await tx.invoice.findFirst({
                    where: { serviceOrderId: orderId }
                });

                if (existingInvoice) {
                    throw new HTTPException(400, { message: 'Ya existe una factura para esta orden' });
                }

                const settings = await tx.organizationSettings.findUnique({
                    where: { organizationId }
                });

                const invoiceNumber = await this.generateInvoiceNumber(organizationId);
                const subtotal = Number(order.subtotal);
                const taxRate = Number(settings?.taxRate || 16) / 100;
                const taxAmount = subtotal * taxRate;
                const total = subtotal + taxAmount;

                const invoice = await tx.invoice.create({
                    data: {
                        invoiceNumber,
                        customerName: order.customer.name,
                        customerDoc: order.customer.documentNumber || `${order.customer.documentType} ${order.customer.documentNumber}`,
                        customerAddress: order.customer.address,
                        subtotal,
                        taxRate,
                        taxAmount,
                        total,
                        currencyPrimary: settings?.primaryCurrency || 'USD',
                        totalPrimary: total,
                        currencySecondary: settings?.secondaryCurrency || null,
                        totalSecondary: settings?.secondaryCurrency ? total * Number(settings.exchangeRate || 1) : null,
                        exchangeRate: settings?.exchangeRate || null,
                        status: 'PENDING',
                        customerId: order.customerId,
                        serviceOrderId: orderId,
                        organizationId
                    },
                    include: {
                        customer: true,
                        serviceOrder: {
                            include: {
                                items: true,
                                asset: true
                            }
                        }
                    }
                });

                if (context) {
                    await recordAudit(context, 'CREATE', 'Invoice', invoice.id, { 
                        invoiceNumber, 
                        orderId,
                        total 
                    });
                }

                return invoice;
            });
        } catch (error) {
            console.error('[InvoiceService] Error creating invoice:', error);
            if (error instanceof HTTPException) throw error;
            throw new HTTPException(500, { message: 'Error al crear factura' });
        }
    },

    async updateInvoice(organizationId: string, id: string, data: any, context?: any) {
        try {
            const existing = await prisma.invoice.findFirst({
                where: { id, organizationId }
            });

            if (!existing) {
                throw new HTTPException(404, { message: 'Factura no encontrada' });
            }

            const updated = await prisma.invoice.update({
                where: { id },
                data: {
                    customerName: data.customerName,
                    customerDoc: data.customerDoc,
                    customerAddress: data.customerAddress,
                    status: data.status
                },
                include: {
                    customer: true,
                    serviceOrder: {
                        include: {
                            items: true,
                            asset: true
                        }
                    }
                }
            });

            if (context) {
                await recordAudit(context, 'UPDATE', 'Invoice', id, data);
            }

            return updated;
        } catch (error) {
            console.error('[InvoiceService] Error updating invoice:', error);
            if (error instanceof HTTPException) throw error;
            throw new HTTPException(500, { message: 'Error al actualizar factura' });
        }
    },

    async deleteInvoice(organizationId: string, id: string, context?: any) {
        try {
            const existing = await prisma.invoice.findFirst({
                where: { id, organizationId }
            });

            if (!existing) {
                throw new HTTPException(404, { message: 'Factura no encontrada' });
            }

            await prisma.invoice.delete({
                where: { id }
            });

            if (context) {
                await recordAudit(context, 'DELETE', 'Invoice', id, { 
                    invoiceNumber: existing.invoiceNumber 
                });
            }

            return { success: true };
        } catch (error) {
            console.error('[InvoiceService] Error deleting invoice:', error);
            throw new HTTPException(500, { message: 'Error al eliminar factura' });
        }
    },

    async updateInvoiceStatus(organizationId: string, id: string, status: 'PENDING' | 'PARTIAL' | 'PAID') {
        const existing = await prisma.invoice.findFirst({
            where: { id, organizationId },
            include: { serviceOrder: true }
        });

        if (!existing) {
            throw new HTTPException(404, { message: 'Factura no encontrada' });
        }

        return prisma.invoice.update({
            where: { id },
            data: { status }
        });
    }
};