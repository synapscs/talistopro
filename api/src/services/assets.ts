import { prisma } from '../lib/db';
import { HTTPException } from 'hono/http-exception';

export const AssetService = {
    async getAssets(organizationId: string, customerId?: string) {
        return prisma.asset.findMany({
            where: {
                organizationId,
                ...(customerId ? { customerId } : {})
            },
            include: { customer: true },
            orderBy: { createdAt: 'desc' }
        });
    },

    async createAsset(organizationId: string, data: any) {
        try {
            return await prisma.asset.create({
                data: {
                    ...data,
                    organizationId,
                }
            });
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to create asset' });
        }
    },

    async updateAsset(organizationId: string, id: string, data: any) {
        try {
            return await prisma.asset.update({
                where: { id, organizationId },
                data: {
                    ...data
                }
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
