import { prisma } from '../lib/db';
import { HTTPException } from 'hono/http-exception';
import { recordAudit } from '../lib/audit';
import type { Context } from 'hono';

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

    async createAppointment(c: Context, organizationId: string, data: any) {
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

            // Secure update: ensure asset belongs to the same organization
            if (data.assetId) {
                await prisma.asset.updateMany({
                    where: { id: data.assetId, organizationId },
                    data: {
                        nextAppointmentAt: scheduledAt,
                        nextAppointmentNote: data.title
                    }
                });
            }

            await recordAudit(c, 'CREATE', 'Appointment', appointment.id, { 
                title: appointment.title, 
                scheduledAt: appointment.scheduledAt 
            });

            return appointment;
        } catch (error) {
            console.error('[AppointmentService] Error creating appointment:', error);
            throw new HTTPException(500, { message: 'Failed to create appointment' });
        }
    },

    async updateAppointment(c: Context, organizationId: string, id: string, data: any) {
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

            const updated = await prisma.appointment.updateMany({
                where: { id, organizationId },
                data: updateData,
            });

            if (updated.count === 0) {
                throw new HTTPException(404, { message: 'Appointment not found' });
            }

            const appointment = await prisma.appointment.findFirst({
                where: { id, organizationId },
                include: { customer: true, asset: true }
            });

            await recordAudit(c, 'UPDATE', 'Appointment', id, data);

            return appointment;
        } catch (error) {
            console.error('[AppointmentService] Error updating appointment:', error);
            throw new HTTPException(500, { message: 'Failed to update appointment' });
        }
    },

    async confirmAppointment(c: Context, organizationId: string, id: string) {
        const updated = await prisma.appointment.updateMany({
            where: { id, organizationId },
            data: {
                status: 'CONFIRMED',
                confirmedAt: new Date(),
            }
        });

        if (updated.count === 0) {
            throw new HTTPException(404, { message: 'Appointment not found' });
        }

        await recordAudit(c, 'UPDATE', 'Appointment', id, { status: 'CONFIRMED' });

        return prisma.appointment.findFirst({
            where: { id, organizationId }
        });
    },

    async deleteAppointment(c: Context, organizationId: string, id: string) {
        try {
            const deleted = await prisma.appointment.deleteMany({
                where: { id, organizationId }
            });

            if (deleted.count === 0) {
                throw new HTTPException(404, { message: 'Appointment not found' });
            }

            await recordAudit(c, 'DELETE', 'Appointment', id);

            return { success: true };
        } catch (error) {
            console.error('[AppointmentService] Error deleting appointment:', error);
            throw new HTTPException(500, { message: 'Failed to delete appointment' });
        }
    }
};
