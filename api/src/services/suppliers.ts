import { prisma } from '../lib/db';
import { HTTPException } from 'hono/http-exception';
import { recordAudit } from '../lib/audit';
import { formatToE164 } from '../lib/phone';
import type { Context } from 'hono';

export const SupplierService = {
    async getSuppliers(organizationId: string) {
        return prisma.supplier.findMany({
            where: { organizationId },
        });
    },

    async createSupplier(organizationId: string, data: any) {
        try {
            const org = await prisma.organization.findUnique({
                where: { id: organizationId },
                select: { country: true }
            });

            return await prisma.supplier.create({
                data: {
                    ...data,
                    phone: data.phone ? formatToE164(data.phone, org?.country || 'VE') : null,
                    whatsapp: data.whatsapp ? formatToE164(data.whatsapp, org?.country || 'VE') : null,
                    organizationId,
                }
            });
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to create supplier' });
        }
    },

    async updateSupplier(organizationId: string, id: string, data: any) {
        try {
            const org = await prisma.organization.findUnique({
                where: { id: organizationId },
                select: { country: true }
            });

            return await prisma.supplier.update({
                where: { id, organizationId },
                data: {
                    ...data,
                    phone: data.phone ? formatToE164(data.phone, org?.country || 'VE') : null,
                    whatsapp: data.whatsapp ? formatToE164(data.whatsapp, org?.country || 'VE') : null,
                }
            });
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to update supplier' });
        }
    },

    async deleteSupplier(c: Context, organizationId: string, id: string) {
        try {
            await recordAudit(c, 'DELETE', 'Supplier', id);
            await prisma.supplier.delete({
                where: { id, organizationId }
            });
            return { success: true };
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to delete supplier' });
        }
    }
};
