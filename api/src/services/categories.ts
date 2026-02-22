import { prisma } from '../lib/db';
import { HTTPException } from 'hono/http-exception';

type CategoryType = 'product' | 'service' | 'expense';

export const CategoryService = {
    async getCategories(organizationId: string, type?: CategoryType) {
        return prisma.category.findMany({
            where: {
                organizationId,
                ...(type ? { type } : {})
            },
            orderBy: { name: 'asc' },
        });
    },

    async createCategory(organizationId: string, data: { name: string; type: CategoryType; color: string }) {
        try {
            return await prisma.category.create({
                data: {
                    ...data,
                    organizationId,
                }
            });
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to create category' });
        }
    },

    async updateCategory(organizationId: string, id: string, data: { name?: string; type?: CategoryType; color?: string }) {
        try {
            return await prisma.category.update({
                where: { id, organizationId },
                data
            });
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to update category' });
        }
    },

    async deleteCategory(organizationId: string, id: string) {
        try {
            await prisma.category.delete({
                where: { id, organizationId }
            });
            return { success: true };
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to delete category' });
        }
    }
};
