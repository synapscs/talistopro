import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../lib/db';
import { whatsapp } from '../services/whatsapp';
import { recordAudit } from '../lib/audit';
import { HTTPException } from 'hono/http-exception';
import type { AppEnv } from '../types/env';

const appointmentSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    scheduledAt: z.string(),
    duration: z.number().default(60),
    status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).default('SCHEDULED'),
    // Cliente registrado (opcional)
    customerId: z.string().optional().nullable(),
    // Cliente temporal (identidad progresiva)
    tempClientName: z.string().optional().nullable(),
    tempClientPhone: z.string().optional().nullable(),
    // Activo (opcional)
    assetId: z.string().optional().nullable(),
    tempAssetInfo: z.string().optional().nullable(),
    // Recordatorios
    reminder24h: z.boolean().default(true),
    reminder1h: z.boolean().default(false),
    // Confirmación
    sendConfirmation: z.boolean().default(true),
    internalNotes: z.string().optional().nullable(),
});

const appointments = new Hono<AppEnv>()
    .get('/', async (c) => {
        const orgId = c.get('orgId');
        const start = c.req.query('start');
        const end = c.req.query('end');
        const status = c.req.query('status');
        const customerId = c.req.query('customerId');

        const where: any = { organizationId: orgId };

        if (start && end) {
            where.scheduledAt = {
                gte: new Date(start),
                lte: new Date(end)
            };
        }

        if (status) {
            where.status = status;
        }

        if (customerId) {
            where.customerId = customerId;
        }

        const list = await prisma.appointment.findMany({
            where,
            include: {
                customer: true,
                asset: true,
                serviceOrder: { select: { id: true, orderNumber: true } }
            },
            orderBy: { scheduledAt: 'asc' }
        });

        return c.json(list);
    })

    .get('/:id', async (c) => {
        const orgId = c.get('orgId');
        const id = c.req.param('id');

        const appointment = await prisma.appointment.findFirst({
            where: { id, organizationId: orgId },
            include: {
                customer: true,
                asset: true,
                serviceOrder: { include: { items: true } }
            }
        });

        if (!appointment) {
            throw new HTTPException(404, { message: 'Cita no encontrada' });
        }

        return c.json(appointment);
    })

    .post('/', zValidator('json', appointmentSchema), async (c) => {
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const scheduledAt = new Date(data.scheduledAt);
        const endTime = new Date(scheduledAt.getTime() + (data.duration || 60) * 60000);

        const appointment = await prisma.appointment.create({
            data: {
                title: data.title,
                description: data.description,
                scheduledAt,
                duration: data.duration || 60,
                endTime,
                status: data.status || 'SCHEDULED',
                customerId: data.customerId || null,
                tempClientName: data.tempClientName || null,
                tempClientPhone: data.tempClientPhone || null,
                assetId: data.assetId || null,
                tempAssetInfo: data.tempAssetInfo || null,
                reminder24h: data.reminder24h ?? true,
                reminder1h: data.reminder1h ?? false,
                sendConfirmation: data.sendConfirmation ?? true,
                internalNotes: data.internalNotes || null,
                organizationId: orgId,
            },
            include: { customer: true, asset: true }
        });

        // Si hay assetId, actualizar nextAppointmentAt del asset
        if (data.assetId) {
            await prisma.asset.update({
                where: { id: data.assetId },
                data: {
                    nextAppointmentAt: scheduledAt,
                    nextAppointmentNote: data.title
                }
            });
        }

        // Enviar confirmación por WhatsApp si está habilitado
        if (data.sendConfirmation) {
            const settings = await prisma.organizationSettings.findUnique({
                where: { organizationId: orgId },
                select: { whatsappEnabled: true, evolutionInstance: true }
            });

            const phone = data.tempClientPhone || appointment.customer?.whatsapp || appointment.customer?.phone;

            if (settings?.whatsappEnabled && settings.evolutionInstance && phone) {
                try {
                    const org = await prisma.organization.findUnique({
                        where: { id: orgId },
                        select: { name: true }
                    });

                    const message = `Hola ${data.tempClientName || appointment.customer?.name || 'Cliente'}, 📅

Tu cita en ${org?.name || 'nuestro taller'} está programada:

📅 Fecha: ${scheduledAt.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}
🕐 Hora: ${scheduledAt.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
📝 Motivo: ${data.title}

Responde *CONFIRMAR* para confirmar tu cita.

Si necesitas reagendar, contáctanos.`;

                    await whatsapp.sendMessage(phone, message, settings.evolutionInstance);

                    await prisma.appointment.update({
                        where: { id: appointment.id },
                        data: { confirmationSent: true }
                    });

                    await prisma.notificationLog.create({
                        data: {
                            type: 'APPOINTMENT_CONFIRMATION',
                            recipient: phone,
                            message,
                            status: 'sent',
                            organizationId: orgId
                        }
                    });
                } catch (error) {
                    console.error('[APPOINTMENT] Error sending confirmation:', error);
                }
            }
        }

        await recordAudit(c, 'CREATE', 'Appointment', appointment.id, { title: data.title });

        return c.json(appointment, 201);
    })

    .patch('/:id', zValidator('json', appointmentSchema.partial()), async (c) => {
        const id = c.req.param('id');
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const updateData: any = { ...data };

        if (data.scheduledAt) {
            const scheduledAt = new Date(data.scheduledAt);
            updateData.scheduledAt = scheduledAt;
            updateData.endTime = new Date(scheduledAt.getTime() + (data.duration || 60) * 60000);
        }

        if (data.duration && !data.scheduledAt) {
            const existing = await prisma.appointment.findFirst({
                where: { id, organizationId: orgId },
                select: { scheduledAt: true }
            });
            if (existing) {
                updateData.endTime = new Date(existing.scheduledAt.getTime() + data.duration * 60000);
            }
        }

        const appointment = await prisma.appointment.update({
            where: { id, organizationId: orgId },
            data: updateData,
            include: { customer: true, asset: true }
        });

        await recordAudit(c, 'UPDATE', 'Appointment', id, data);

        return c.json(appointment);
    })

    .post('/:id/confirm', async (c) => {
        const id = c.req.param('id');
        const orgId = c.get('orgId');

        const appointment = await prisma.appointment.findFirst({
            where: { id, organizationId: orgId },
            include: { customer: true }
        });

        if (!appointment) {
            throw new HTTPException(404, { message: 'Cita no encontrada' });
        }

        const updated = await prisma.appointment.update({
            where: { id },
            data: {
                status: 'CONFIRMED',
                confirmedAt: new Date(),
            }
        });

        await recordAudit(c, 'CONFIRM', 'Appointment', id, { status: 'CONFIRMED' });

        return c.json(updated);
    })

    .post('/:id/send-reminder', async (c) => {
        const id = c.req.param('id');
        const orgId = c.get('orgId');
        const { type } = await c.req.json().catch(() => ({ type: '24h' }));

        const appointment = await prisma.appointment.findFirst({
            where: { id, organizationId: orgId },
            include: { customer: true }
        });

        if (!appointment) {
            throw new HTTPException(404, { message: 'Cita no encontrada' });
        }

        const settings = await prisma.organizationSettings.findUnique({
            where: { organizationId: orgId },
            select: { whatsappEnabled: true, evolutionInstance: true }
        });

        const phone = appointment.tempClientPhone || appointment.customer?.whatsapp || appointment.customer?.phone;

        if (!settings?.whatsappEnabled || !settings.evolutionInstance || !phone) {
            throw new HTTPException(400, { message: 'WhatsApp no está configurado o el cliente no tiene teléfono' });
        }

        const org = await prisma.organization.findUnique({
            where: { id: orgId },
            select: { name: true }
        });

        const timeStr = appointment.scheduledAt.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' });
        const dateStr = appointment.scheduledAt.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' });

        const message = type === '1h'
            ? `Hola ${appointment.tempClientName || appointment.customer?.name}, 📋

Tu cita es en aproximadamente 1 hora:

🕐 ${timeStr}
📝 ${appointment.title}

¡Te esperamos en ${org?.name || 'nuestro taller'}!`
            : `Hola ${appointment.tempClientName || appointment.customer?.name}, 📋

Te recordamos que tienes una cita programada:

📅 ${dateStr} a las ${timeStr}
📝 ${appointment.title}

¡Te esperamos en ${org?.name || 'nuestro taller'}!`;

        await whatsapp.sendMessage(phone, message, settings.evolutionInstance);

        await prisma.appointment.update({
            where: { id },
            data: type === '1h' ? { reminderSent1h: true } : { reminderSent24: true }
        });

        await prisma.notificationLog.create({
            data: {
                type: type === '1h' ? 'APPOINTMENT_REMINDER_1H' : 'APPOINTMENT_REMINDER_24H',
                recipient: phone,
                message,
                status: 'sent',
                organizationId: orgId
            }
        });

        return c.json({ success: true });
    })

    .delete('/:id', async (c) => {
        const id = c.req.param('id');
        const orgId = c.get('orgId');

        await prisma.appointment.delete({
            where: { id, organizationId: orgId }
        });

        await recordAudit(c, 'DELETE', 'Appointment', id);

        return c.json({ success: true });
    });

export { appointments };
