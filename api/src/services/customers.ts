import { prisma } from '../lib/db';
import { formatToE164 } from '../lib/phone';
import { HTTPException } from 'hono/http-exception';

export const CustomerService = {
    async getCustomers(organizationId: string) {
        return prisma.customer.findMany({
            where: { organizationId },
            orderBy: { createdAt: 'desc' }
        });
    },

    async getCustomerById(organizationId: string, id: string) {
        return prisma.customer.findFirst({
            where: { id, organizationId }
        });
    },

    async createCustomer(organizationId: string, data: any) {
        try {
            const org = await prisma.organization.findUnique({
                where: { id: organizationId },
                select: { country: true }
            });

            return await prisma.customer.create({
                data: {
                    ...data,
                    phone: formatToE164(data.phone, org?.country || 'VE'),
                    whatsapp: data.whatsapp ? formatToE164(data.whatsapp, org?.country || 'VE') : null,
                    organizationId,
                }
            });
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to create customer' });
        }
    },

    async updateCustomer(organizationId: string, id: string, data: any) {
        try {
            const org = await prisma.organization.findUnique({
                where: { id: organizationId },
                select: { country: true }
            });

            const res = await prisma.customer.updateMany({
                where: { id, organizationId },
                data: {
                    ...data,
                    phone: data.phone ? formatToE164(data.phone, org?.country || 'VE') : undefined,
                    whatsapp: data.whatsapp ? formatToE164(data.whatsapp, org?.country || 'VE') : undefined,
                }
            });

            if (res.count === 0) {
                return null;
            }
            return { message: 'Customer updated successfully' };
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to update customer' });
        }
    },

    async deleteCustomer(organizationId: string, id: string) {
        try {
            const deleted = await prisma.customer.deleteMany({
                where: { id, organizationId }
            });

            if (deleted.count === 0) {
                return null;
            }
            return { message: 'Customer deleted successfully' };
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to delete customer' });
        }
    }
};
