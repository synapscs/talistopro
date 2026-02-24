import { prisma } from '../lib/db';
import { HTTPException } from 'hono/http-exception';
import { recordAudit } from '../lib/audit';
import { whatsapp } from './whatsapp';
import type { Context } from 'hono';

function replaceMessageVariables(message: string, data: {
    customerName: string;
    orderNumber: string;
    assetInfo: string;
    assetField4: string;
    stageName: string;
    total: string;
    organizationName: string;
}): string {
    return message
        .replace(/{cliente}/gi, data.customerName)
        .replace(/{orden}/gi, data.orderNumber)
        .replace(/{vehiculo}/gi, data.assetInfo)
        .replace(/{placa}/gi, data.assetField4)
        .replace(/{etapa}/gi, data.stageName)
        .replace(/{total}/gi, data.total)
        .replace(/{taller}/gi, data.organizationName);
}

export const OrderService = {
    async getOrders(organizationId: string) {
        return prisma.serviceOrder.findMany({
            where: { organizationId },
            include: {
                customer: true,
                asset: true,
                currentStage: true,
                items: true
            },
            orderBy: { createdAt: 'desc' }
        });
    },

    async createOrder(c: Context, organizationId: string, data: any) {
        try {
            return await prisma.$transaction(async (tx) => {
                const year = new Date().getFullYear();
                const count = await tx.serviceOrder.count({
                    where: {
                        organizationId,
                        createdAt: {
                            gte: new Date(`${year}-01-01`),
                            lt: new Date(`${year + 1}-01-01`),
                        }
                    }
                });
                const orderNumber = `OS-${year}-${(count + 1).toString().padStart(4, '0')}`;

                const order = await tx.serviceOrder.create({
                    data: {
                        orderNumber,
                        description: data.description,
                        diagnosis: data.diagnosis,
                        internalNotes: data.internalNotes,
                        priority: data.priority,
                        estimatedDate: (data.estimatedDate && data.estimatedDate.trim() !== "") ? new Date(data.estimatedDate) : null,
                        assignedToId: data.assignedToId || null,
                        customerId: data.customerId,
                        assetId: data.assetId,
                        organizationId,
                        subtotal: data.subtotal,
                        taxAmount: data.taxAmount,
                        discountAmount: data.discountAmount,
                        total: data.total,
                        currentStageId: data.currentStageId,
                        photos: data.photos && data.photos.length > 0 ? {
                            create: data.photos.map((url: string, index: number) => ({
                                url,
                                type: 'entry',
                                order: index
                            }))
                        } : undefined,
                        checklist: data.checklist && data.checklist.length > 0 ? {
                            create: data.checklist.map((item: any) => ({
                                category: item.category,
                                item: item.item,
                                condition: item.condition,
                                notes: item.notes,
                                checked: item.checked
                            }))
                        } : undefined,
                        items: data.items && data.items.length > 0 ? {
                            create: data.items.map((item: any) => ({
                                type: item.type,
                                name: item.name,
                                unitPrice: item.price,
                                quantity: item.quantity,
                                total: item.price * item.quantity,
                                productId: item.productId,
                                serviceId: item.serviceId
                            }))
                        } : undefined,
                    }
                });

                if (data.items && data.items.length > 0) {
                    for (const item of data.items) {
                        if (item.type === 'product' && item.productId) {
                            await tx.product.update({
                                where: { id: item.productId, organizationId },
                                data: { stock: { decrement: item.quantity } }
                            });

                            await recordAudit(c, 'STOCK_ADJUSTMENT', 'Product', item.productId, {
                                orderId: order.id,
                                orderNumber: order.orderNumber,
                                quantityChanged: -item.quantity,
                                reason: 'Auto-deduction from Order'
                            });
                        }
                    }
                }

                return order;
            });
        } catch (error) {
            console.error('[OrderService] Error creating order:', error);
            throw new HTTPException(500, { message: 'Failed to create order' });
        }
    },

    async updateOrder(c: Context, organizationId: string, id: string, data: any) {
        try {
            const oldOrder = await prisma.serviceOrder.findUnique({
                where: { id, organizationId },
                select: { currentStageId: true, internalNotes: true }
            });

            let statusUpdate = undefined;
            if (data.currentStageId) {
                const stage = await prisma.workflowStage.findFirst({
                    where: { id: data.currentStageId, organizationId }
                });
                if (stage) {
                    if (stage.isInitial) statusUpdate = 'RECEIVED';
                    else if (stage.isFinal) statusUpdate = 'READY';
                    else statusUpdate = 'IN_PROGRESS';
                }
            }

            const updatedOrder = await prisma.serviceOrder.update({
                where: { id, organizationId },
                data: {
                    description: data.description,
                    diagnosis: data.diagnosis,
                    internalNotes: data.internalNotes,
                    priority: data.priority,
                    estimatedDate: (data.estimatedDate && data.estimatedDate.trim() !== "") ? new Date(data.estimatedDate) : undefined,
                    assignedToId: data.assignedToId,
                    currentStageId: data.currentStageId,
                    status: statusUpdate as any,
                    subtotal: data.subtotal,
                    taxAmount: data.taxAmount,
                    discountAmount: data.discountAmount,
                    total: data.total,
                    checklist: data.checklist ? {
                        deleteMany: {},
                        create: data.checklist.map((item: any) => ({
                            category: item.category,
                            item: item.item,
                            condition: item.condition,
                            notes: item.notes,
                            checked: item.checked ?? true
                        }))
                    } : undefined,
                },
                include: {
                    currentStage: true,
                    checklist: true,
                    items: true,
                    customer: true,
                    asset: true
                }
            });

            if (oldOrder && data.currentStageId && oldOrder.currentStageId !== data.currentStageId) {
                await recordAudit(c, 'STAGE_CHANGE', 'ServiceOrder', id, {
                    from: oldOrder.currentStageId,
                    to: data.currentStageId,
                    stageName: updatedOrder.currentStage?.name
                });

                const newStage = await prisma.workflowStage.findFirst({
                    where: { id: data.currentStageId, organizationId }
                });

                if (newStage?.notifyCustomer && updatedOrder.customer) {
                    const settings = await prisma.organizationSettings.findUnique({
                        where: { organizationId },
                        select: {
                            whatsappEnabled: true,
                            evolutionInstance: true,
                        },
                    });

                    const org = await prisma.organization.findUnique({
                        where: { id: organizationId },
                        select: { name: true },
                    });

                    if (settings?.whatsappEnabled && settings.evolutionInstance) {
                        const phone = updatedOrder.customer.whatsapp || updatedOrder.customer.phone;
                        
                        if (phone) {
                            const defaultMessage = `Hola {cliente}, te informamos que tu orden #{orden} ha avanzado a la etapa: *{etapa}*.`;
                            const messageTemplate = newStage.notificationMsg || defaultMessage;
                            
                            const message = replaceMessageVariables(messageTemplate, {
                                customerName: updatedOrder.customer.name,
                                orderNumber: updatedOrder.orderNumber,
                                assetInfo: `${updatedOrder.asset?.field1 || ''} ${updatedOrder.asset?.field2 || ''}`.trim(),
                                assetField4: updatedOrder.asset?.field4 || '',
                                stageName: newStage.name,
                                total: `$${Number(updatedOrder.total).toFixed(2)}`,
                                organizationName: org?.name || 'Taller',
                            });

                            try {
                                await whatsapp.sendMessage(phone, message, settings.evolutionInstance);

                                await prisma.notificationLog.create({
                                    data: {
                                        type: 'WHATSAPP_AUTO_STAGE',
                                        recipient: phone,
                                        message: message,
                                        status: 'sent',
                                        organizationId,
                                    },
                                });

                                console.log(`[OrderService] WhatsApp notification sent to ${phone} for stage ${newStage.name}`);
                            } catch (whatsappError) {
                                console.error('[OrderService] Failed to send WhatsApp notification:', whatsappError);
                                
                                await prisma.notificationLog.create({
                                    data: {
                                        type: 'WHATSAPP_AUTO_STAGE',
                                        recipient: phone,
                                        message: message,
                                        status: 'failed',
                                        error: String(whatsappError),
                                        organizationId,
                                    },
                                });
                            }
                        }
                    }
                }
            }

            if (oldOrder && data.internalNotes && oldOrder.internalNotes !== data.internalNotes) {
                await recordAudit(c, 'NOTES_UPDATE', 'ServiceOrder', id, {
                    hasNotes: true
                });
            }

            return updatedOrder;
        } catch (error) {
            console.error('[OrderService] Error updating order:', error);
            throw new HTTPException(500, { message: 'Failed to update order' });
        }
    },

    async deleteOrder(c: Context, organizationId: string, id: string) {
        try {
            await recordAudit(c, 'DELETE', 'ServiceOrder', id);
            await prisma.serviceOrder.delete({
                where: { id, organizationId }
            });
            return { success: true };
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to delete order' });
        }
    }
};
