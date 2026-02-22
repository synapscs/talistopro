import { prisma } from '../lib/db';
import { HTTPException } from 'hono/http-exception';
import { recordAudit } from '../lib/audit';
import type { Context } from 'hono';

export const ExpenseService = {
    async getExpenses(organizationId: string) {
        return prisma.expense.findMany({
            where: { organizationId },
            include: { category: true, supplier: true },
            orderBy: { date: 'desc' },
        });
    },

    async createExpense(organizationId: string, data: any) {
        try {
            return await prisma.expense.create({
                data: {
                    ...data,
                    organizationId,
                }
            });
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to create expense' });
        }
    },

    async updateExpense(organizationId: string, id: string, data: any) {
        try {
            return await prisma.expense.update({
                where: { id, organizationId },
                data
            });
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to update expense' });
        }
    },

    async deleteExpense(c: Context, organizationId: string, id: string) {
        try {
            await recordAudit(c, 'DELETE', 'Expense', id);
            await prisma.expense.delete({
                where: { id, organizationId }
            });
            return { success: true };
        } catch (error) {
            throw new HTTPException(500, { message: 'Failed to delete expense' });
        }
    }
};
