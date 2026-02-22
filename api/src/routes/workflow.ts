import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../lib/db';
import type { AppEnv } from '../types/env';

const stageSchema = z.object({
    id: z.string().optional().nullable(),
    name: z.string(),
    description: z.string().nullish(), // null or undefined
    order: z.number(),
    color: z.string().default('#6366F1'),
    icon: z.string().nullish(),
    notifyCustomer: z.boolean().default(false),
    notificationMsg: z.string().nullish(),
    isInitial: z.boolean().default(false),
    isFinal: z.boolean().default(false),
});

const stagesSyncSchema = z.array(stageSchema);

// Rutas encadenadas para inferencia de tipos Hono RPC
export const workflow = new Hono<AppEnv>()
    // Obtener etapas por organización
    .get('/', async (c) => {
        const orgId = c.get('orgId');
        const stages = await prisma.workflowStage.findMany({
            where: { organizationId: orgId },
            orderBy: { order: 'asc' }
        });
        return c.json(stages);
    })
    // Sincronizar lote de etapas (Permite crear, editar y reordenar todo en un paso)
    .post('/sync', zValidator('json', stagesSyncSchema, (result, c) => {
        if (!result.success) {
            console.error('Workflow Validation Error:', JSON.stringify(result.error.flatten(), null, 2));
            return c.json({ error: 'Validation Failed', details: result.error.flatten() }, 400);
        }
    }), async (c) => {
        const orgId = c.get('orgId');
        const stagesInput = c.req.valid('json');

        try {
            const result = await prisma.$transaction(async (tx) => {
                // 1. Identificar etapas existentes en la BD para esta Org
                const existingStages = await tx.workflowStage.findMany({
                    where: { organizationId: orgId },
                    select: { id: true }
                });
                const existingIds = new Set(existingStages.map(s => s.id));

                // 2. Separar las etapas entrantes en: A actualizar (tienen ID válido) y A crear (sin ID o ID nuevo)
                const stagesToUpdate = stagesInput.filter(s => s.id && existingIds.has(s.id));
                const stagesToCreate = stagesInput.filter(s => !s.id || !existingIds.has(s.id));

                // 3. Identificar IDs que ya no vienen en el input -> Eliminar
                const inputIds = new Set(stagesInput.filter(s => s.id).map(s => s.id));
                const idsToDelete = [...existingIds].filter(id => !inputIds.has(id));

                if (idsToDelete.length > 0) {
                    await tx.workflowStage.deleteMany({
                        where: {
                            id: { in: idsToDelete },
                            organizationId: orgId
                        }
                    });
                }

                // 4. Actualizar existentes (Estrategia de dos pasos para evitar colisión de Unique Constraint en 'order')

                // Paso 4.1: Mover temporalmente el orden para liberar los índices 1..N
                let tempOrder = 10000;
                for (const stage of stagesToUpdate) {
                    if (stage.id) {
                        await tx.workflowStage.update({
                            where: { id: stage.id },
                            data: { order: tempOrder++ }
                        });
                    }
                }

                // Paso 4.2: Actualizar con los valores finales
                for (const stage of stagesToUpdate) {
                    if (stage.id) {
                        await tx.workflowStage.update({
                            where: { id: stage.id },
                            data: {
                                name: stage.name,
                                description: stage.description,
                                order: stage.order, // Ahora es seguro asignar el orden final
                                color: stage.color,
                                icon: stage.icon,
                                notifyCustomer: stage.notifyCustomer,
                                notificationMsg: stage.notificationMsg,
                                isInitial: stage.isInitial,
                                isFinal: stage.isFinal
                            }
                        });
                    }
                }

                // 5. Crear nuevas
                for (const stage of stagesToCreate) {
                    // Removemos el ID temporal si existe, dejamos que Prisma genere uno nuevo
                    const { id, ...createData } = stage;
                    await tx.workflowStage.create({
                        data: {
                            ...createData as any,
                            organizationId: orgId
                        }
                    });
                }

                // 6. Retornar todas las etapas actualizadas
                return await tx.workflowStage.findMany({
                    where: { organizationId: orgId },
                    orderBy: { order: 'asc' }
                });
            });

            return c.json(result);
        } catch (error: unknown) {
            console.error('Workflow Sync Error:', error);
            const message = error instanceof Error ? error.message : 'Error desconocido';
            return c.json({ error: message }, 500);
        }
    })
    // Eliminar una etapa individual (Validación de Propiedad)
    .delete('/:id', async (c) => {
        const id = c.req.param('id');
        const orgId = c.get('orgId');
        try {
            await prisma.workflowStage.delete({
                where: {
                    id,
                    organizationId: orgId // Seguridad activa
                }
            });
            return c.json({ success: true });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Error desconocido';
            return c.json({ error: message }, 500);
        }
    });
