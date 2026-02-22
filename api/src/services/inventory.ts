import { prisma } from '../lib/db';
import { HTTPException } from 'hono/http-exception';
import { recordAudit } from '../lib/audit';
import type { Context } from 'hono';

export const InventoryService = {
    // --- PRODUCTS ---
    async getProducts(organizationId: string) {
        return prisma.product.findMany({
            where: { organizationId },
            include: { category: true },
            orderBy: { name: 'asc' }
        });
    },

    async createProduct(organizationId: string, data: any) {
        try {
            return await prisma.product.create({
                data: {
                    ...data,
                    organizationId,
                    isActive: true,
                }
            });
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to create product' });
        }
    },

    async updateProduct(c: Context, organizationId: string, id: string, data: any) {
        try {
            let oldRecord = null;
            if (data.stock !== undefined) {
                oldRecord = await prisma.product.findUnique({ where: { id, organizationId } });
            }

            const product = await prisma.product.update({
                where: { id, organizationId },
                data
            });

            if (oldRecord && oldRecord.stock !== data.stock) {
                await recordAudit(c, 'STOCK_ADJUSTMENT', 'Product', id, {
                    oldStock: oldRecord.stock,
                    newStock: data.stock,
                    reason: 'Manual Update'
                });
            }

            return product;
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to update product' });
        }
    },

    async deleteProduct(c: Context, organizationId: string, id: string) {
        try {
            await recordAudit(c, 'DELETE', 'Product', id);
            await prisma.product.delete({
                where: { id, organizationId }
            });
            return { success: true };
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to delete product' });
        }
    },

    // --- SERVICES ---
    async getServices(organizationId: string) {
        return prisma.service.findMany({
            where: { organizationId },
            include: { category: true },
            orderBy: { name: 'asc' }
        });
    },

    async createService(organizationId: string, data: any) {
        try {
            return await prisma.service.create({
                data: {
                    ...data,
                    organizationId,
                    isActive: true,
                }
            });
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to create service' });
        }
    },

    async updateService(organizationId: string, id: string, data: any) {
        try {
            return await prisma.service.update({
                where: { id, organizationId },
                data
            });
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to update service' });
        }
    },

    async deleteService(c: Context, organizationId: string, id: string) {
        try {
            await recordAudit(c, 'DELETE', 'Service', id);
            await prisma.service.delete({
                where: { id, organizationId }
            });
            return { success: true };
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to delete service' });
        }
    }
};
