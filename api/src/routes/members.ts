import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../lib/db';
import { randomUUID } from 'crypto';
import type { AppEnv } from '../types/env';

const memberSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    role: z.enum(['admin', 'operator', 'technician']),
    password: z.string().min(6),
});

// Rutas encadenadas para inferencia de tipos Hono RPC
export const members = new Hono<AppEnv>()
    // Listar miembros de la organización
    .get('/', async (c) => {
        const orgId = c.get('orgId');
        const membersList = await prisma.member.findMany({
            where: { organizationId: orgId },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        });
        return c.json(membersList);
    })
    // Añadir miembro directamente (Crear usuario + Vincular a Org como Member)
    .post('/', zValidator('json', memberSchema), async (c) => {
        const orgId = c.get('orgId');
        const { name, email, role, password } = c.req.valid('json');

        try {
            const result = await prisma.$transaction(async (tx) => {
                // 1. Verificar si el usuario ya existe
                let user = await tx.user.findUnique({ where: { email } });

                if (!user) {
                    // Crear usuario si no existe
                    user = await tx.user.create({
                        data: {
                            id: randomUUID(),
                            name,
                            email,
                            emailVerified: true,
                        }
                    });
                }

                // 2. Verificar si ya es miembro de esta organización
                const existingMember = await tx.member.findUnique({
                    where: {
                        userId_organizationId: {
                            userId: user.id,
                            organizationId: orgId
                        }
                    }
                });

                if (existingMember) {
                    throw new Error('El usuario ya es miembro de esta organización');
                }

                // 3. Crear el miembro
                const newMember = await tx.member.create({
                    data: {
                        userId: user.id,
                        organizationId: orgId,
                        role: role,
                    },
                    include: { user: true }
                });

                return newMember;
            });

            return c.json(result, 201);
        } catch (error: unknown) {
            console.error('Error adding member:', error);
            const message = error instanceof Error ? error.message : 'Error al añadir miembro';
            return c.json({ error: message }, 500);
        }
    })
    // Actualizar un miembro (Solo el rol)
    .patch('/:id', zValidator('json', z.object({
        role: z.enum(['admin', 'operator', 'technician']),
    })), async (c) => {
        const memberId = c.req.param('id');
        const orgId = c.get('orgId');
        const { role } = c.req.valid('json');

        try {
            const member = await prisma.member.findUnique({
                where: { id: memberId }
            });

            if (!member) return c.json({ error: 'Miembro no encontrado' }, 404);
            if (member.organizationId !== orgId) return c.json({ error: 'No autorizado' }, 403);

            if (member.role === 'owner') {
                return c.json({ error: 'No se puede editar al Propietario de la organización' }, 403);
            }

            const updatedMember = await prisma.member.update({
                where: { id: memberId },
                data: { role },
                include: { user: true }
            });

            return c.json(updatedMember);
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error desconocido';
            return c.json({ error: message }, 500);
        }
    })
    // Eliminar/Remover miembro (Protegiendo al Owner)
    .delete('/:id', async (c) => {
        const memberId = c.req.param('id');
        const orgId = c.get('orgId');

        try {
            const member = await prisma.member.findUnique({
                where: { id: memberId }
            });

            if (!member) return c.json({ error: 'Miembro no encontrado' }, 404);
            if (member.organizationId !== orgId) return c.json({ error: 'No autorizado' }, 403);

            // Bloqueo estricto: No se puede tocar al Owner
            if (member.role === 'owner') {
                return c.json({ error: 'No se puede eliminar al Propietario de la organización' }, 403);
            }

            await prisma.member.delete({ where: { id: memberId } });
            return c.json({ success: true });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error desconocido';
            return c.json({ error: message }, 500);
        }
    });
