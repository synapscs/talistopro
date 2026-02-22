import { prisma } from '../lib/db';
import { HTTPException } from 'hono/http-exception';

export const AppointmentService = {
    async getAppointments(organizationId: string, start?: string, end?: string) {
        return prisma.appointment.findMany({
            where: {
                organizationId,
                ...(start && end ? {
                    scheduledAt: {
                        gte: new Date(start),
                        lte: new Date(end)
                    }
                } : {})
            },
            include: {
                customer: true
            },
            orderBy: { scheduledAt: 'asc' }
        });
    },

    async createAppointment(organizationId: string, data: any) {
        try {
            return await prisma.appointment.create({
                data: {
                    ...data,
                    scheduledAt: new Date(data.scheduledAt),
                    organizationId,
                },
                include: { customer: true }
            });
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to create appointment' });
        }
    },

    async updateAppointment(organizationId: string, id: string, data: any) {
        try {
            return await prisma.appointment.update({
                where: { id, organizationId },
                data: {
                    ...data,
                    scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : undefined,
                },
                include: { customer: true }
            });
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to update appointment' });
        }
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
