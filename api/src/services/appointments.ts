import { prisma } from '../lib/db';
import { HTTPException } from 'hono/http-exception';

export const AppointmentService = {
    async getAppointments(organizationId: string, start?: string, end?: string, status?: string, customerId?: string) {
        const where: any = { organizationId };

        if (start && end) {
            where.scheduledAt = {
                gte: new Date(start),
                lte: new Date(end)
            };
        }

        if (status) {
            where.status = status;
        }

        if (customerId) {
            where.customerId = customerId;
        }

        return prisma.appointment.findMany({
            where,
            include: {
                customer: true,
                asset: true,
                serviceOrder: { select: { id: true, orderNumber: true } }
            },
            orderBy: { scheduledAt: 'asc' }
        });
    },

    async getAppointmentById(organizationId: string, id: string) {
        return prisma.appointment.findFirst({
            where: { id, organizationId },
            include: {
                customer: true,
                asset: true,
                serviceOrder: { include: { items: true } }
            }
        });
    },

    async createAppointment(organizationId: string, data: any) {
        try {
            const scheduledAt = new Date(data.scheduledAt);
            const endTime = new Date(scheduledAt.getTime() + (data.duration || 60) * 60000);

            const appointment = await prisma.appointment.create({
                data: {
                    title: data.title,
                    description: data.description,
                    scheduledAt,
                    duration: data.duration || 60,
                    endTime,
                    status: data.status || 'SCHEDULED',
                    customerId: data.customerId || null,
                    tempClientName: data.tempClientName || null,
                    tempClientPhone: data.tempClientPhone || null,
                    assetId: data.assetId || null,
                    tempAssetInfo: data.tempAssetInfo || null,
                    reminder24h: data.reminder24h ?? true,
                    reminder1h: data.reminder1h ?? false,
                    sendConfirmation: data.sendConfirmation ?? true,
                    internalNotes: data.internalNotes || null,
                    organizationId,
                },
                include: { customer: true, asset: true }
            });

            // Actualizar nextAppointmentAt del asset si hay assetId
            if (data.assetId) {
                await prisma.asset.update({
                    where: { id: data.assetId },
                    data: {
                        nextAppointmentAt: scheduledAt,
                        nextAppointmentNote: data.title
                    }
                });
            }

            return appointment;
        } catch (error) {
            console.error('[AppointmentService] Error creating appointment:', error);
            throw new HTTPException(500, { message: 'Failed to create appointment' });
        }
    },

    async updateAppointment(organizationId: string, id: string, data: any) {
        try {
            const updateData: any = { ...data };

            if (data.scheduledAt) {
                const scheduledAt = new Date(data.scheduledAt);
                updateData.scheduledAt = scheduledAt;
                updateData.endTime = new Date(scheduledAt.getTime() + (data.duration || 60) * 60000);
            }

            if (data.duration && !data.scheduledAt) {
                const existing = await prisma.appointment.findFirst({
                    where: { id, organizationId },
                    select: { scheduledAt: true }
                });
                if (existing) {
                    updateData.endTime = new Date(existing.scheduledAt.getTime() + data.duration * 60000);
                }
            }

            return await prisma.appointment.update({
                where: { id, organizationId },
                data: updateData,
                include: { customer: true, asset: true }
            });
        } catch (error) {
            console.error('[AppointmentService] Error updating appointment:', error);
            throw new HTTPException(500, { message: 'Failed to update appointment' });
        }
    },

    async confirmAppointment(organizationId: string, id: string) {
        return prisma.appointment.update({
            where: { id, organizationId },
            data: {
                status: 'CONFIRMED',
                confirmedAt: new Date(),
            }
        });
    },

    async deleteAppointment(organizationId: string, id: string) {
        try {
            await prisma.appointment.delete({
                where: { id, organizationId }
            });
            return { success: true };
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to delete appointment' });
        }
    }
};
