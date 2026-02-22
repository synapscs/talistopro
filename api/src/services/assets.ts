import { prisma } from '../lib/db';
import { HTTPException } from 'hono/http-exception';

export const AssetService = {
    async getAssets(organizationId: string, customerId?: string, customerName?: string) {
        // Build dynamic where filter to support filtering by customerId or by customer name
        const where: any = { organizationId };
        if (customerId) {
            where.customerId = customerId;
        }
        if (customerName) {
            where.customer = { name: { contains: customerName, mode: 'insensitive' } };
        }
        return prisma.asset.findMany({
            where,
            include: { customer: true },
            orderBy: { createdAt: 'desc' }
        });
    },

    async createAsset(organizationId: string, data: any) {
        try {
            const payload = {
                ...data,
                organizationId,
                nextAppointmentAt: data.nextAppointmentAt ? new Date(data.nextAppointmentAt) : undefined,
            };
            // Elimina campos undefined para evitar overrides no deseados
            Object.keys(payload).forEach((k) => (payload as any)[k] === undefined && delete (payload as any)[k]);
            return await prisma.asset.create({
                data: payload
            });
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to create asset' });
        }
    },

    async updateAsset(organizationId: string, id: string, data: any) {
        try {
            const payload = {
                ...data,
            };
            if (payload.nextAppointmentAt) {
                payload.nextAppointmentAt = new Date(payload.nextAppointmentAt);
            }
            // Remove undefined values to avoid accidental null overwrites
            Object.keys(payload).forEach((k) => (payload as any)[k] === undefined && delete (payload as any)[k]);
            return await prisma.asset.update({
                where: { id, organizationId },
                data: payload
            });
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to update asset' });
        }
    },

    async deleteAsset(organizationId: string, id: string) {
        try {
            await prisma.asset.delete({
                where: { id, organizationId }
            });
            return { success: true };
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to delete asset' });
        }
    }
};
