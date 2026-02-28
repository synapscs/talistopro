import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { AppointmentService } from '../services/appointments';
import { whatsapp } from '../services/whatsapp';
import { prisma } from '../lib/db';
import type { AppEnv } from '../types/env';

const appointments = new OpenAPIHono<AppEnv>();

// --- SCHEMAS ---

const AppointmentStatusSchema = z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).openapi('AppointmentStatus');

const AppointmentSchema = z.object({
    id: z.string().uuid(),
    title: z.string().min(1),
    description: z.string().optional().nullable(),
    scheduledAt: z.date().or(z.string()),
    duration: z.number().default(60),
    endTime: z.date().or(z.string()),
    status: AppointmentStatusSchema,
    customerId: z.string().uuid().optional().nullable(),
    tempClientName: z.string().optional().nullable(),
    tempClientPhone: z.string().optional().nullable(),
    assetId: z.string().uuid().optional().nullable(),
    tempAssetInfo: z.string().optional().nullable(),
    reminder24h: z.boolean().default(true),
    reminder1h: z.boolean().default(false),
    reminderSent24: z.boolean().default(false),
    reminderSent1h: z.boolean().default(false),
    confirmationSent: z.boolean().default(false),
    confirmedAt: z.date().or(z.string()).optional().nullable(),
    confirmedByReply: z.boolean().default(false),
    sendConfirmation: z.boolean().default(true),
    serviceOrderId: z.string().uuid().optional().nullable(),
    convertedAt: z.date().or(z.string()).optional().nullable(),
    internalNotes: z.string().optional().nullable(),
    organizationId: z.string().uuid(),
    createdAt: z.date().or(z.string()),
    updatedAt: z.date().or(z.string()),
}).openapi('Appointment');

const CreateAppointmentSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional().nullable(),
    scheduledAt: z.string(),
    duration: z.number().default(60),
    status: AppointmentStatusSchema.optional(),
    customerId: z.string().uuid().optional().nullable(),
    tempClientName: z.string().optional().nullable(),
    tempClientPhone: z.string().optional().nullable(),
    assetId: z.string().uuid().optional().nullable(),
    tempAssetInfo: z.string().optional().nullable(),
    reminder24h: z.boolean().default(true),
    reminder1h: z.boolean().default(false),
    sendConfirmation: z.boolean().default(true),
    internalNotes: z.string().optional().nullable(),
}).openapi('CreateAppointment');

const UpdateAppointmentSchema = CreateAppointmentSchema.partial().openapi('UpdateAppointment');

const SuccessSchema = z.object({ success: z.boolean() }).openapi('Success');
const ErrorSchema = z.object({ error: z.string() }).openapi('Error');

// --- ROUTES ---

const listRoute = createRoute({
    method: 'get',
    path: '/',
    request: {
        query: z.object({
            start: z.string().optional(),
            end: z.string().optional(),
            status: AppointmentStatusSchema.optional(),
            customerId: z.string().uuid().optional(),
        }),
    },
    responses: {
        200: {
            content: { 'application/json': { schema: z.array(AppointmentSchema) } },
            description: 'Listado de citas',
        },
    },
});

const getOneRoute = createRoute({
    method: 'get',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
    },
    responses: {
        200: {
            content: { 'application/json': { schema: AppointmentSchema } },
            description: 'Detalle de la cita',
        },
        404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'No encontrado' },
    },
});

const createRouteDef = createRoute({
    method: 'post',
    path: '/',
    request: {
        body: { content: { 'application/json': { schema: CreateAppointmentSchema } } },
    },
    responses: {
        201: {
            content: { 'application/json': { schema: AppointmentSchema } },
            description: 'Cita creada',
        },
    },
});

const updateRoute = createRoute({
    method: 'patch',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
        body: { content: { 'application/json': { schema: UpdateAppointmentSchema } } },
    },
    responses: {
        200: {
            content: { 'application/json': { schema: AppointmentSchema } },
            description: 'Cita actualizada',
        },
        404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'No encontrado' },
    },
});

const deleteRoute = createRoute({
    method: 'delete',
    path: '/{id}',
    request: {
        params: z.object({ id: z.string().uuid() }),
    },
    responses: {
        200: {
            content: { 'application/json': { schema: SuccessSchema } },
            description: 'Cita eliminada',
        },
        404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'No encontrado' },
    },
});

const confirmRoute = createRoute({
    method: 'post',
    path: '/{id}/confirm',
    request: {
        params: z.object({ id: z.string().uuid() }),
    },
    responses: {
        200: {
            content: { 'application/json': { schema: AppointmentSchema } },
            description: 'Cita confirmada',
        },
        404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'No encontrado' },
    },
});

const sendReminderRoute = createRoute({
    method: 'post',
    path: '/{id}/send-reminder',
    request: {
        params: z.object({ id: z.string().uuid() }),
        body: { content: { 'application/json': { schema: z.object({ type: z.enum(['24h', '1h']) }) } } },
    },
    responses: {
        200: {
            content: { 'application/json': { schema: SuccessSchema } },
            description: 'Recordatorio enviado',
        },
        404: { content: { 'application/json': { schema: ErrorSchema } }, description: 'No encontrado' },
    },
});

// --- IMPLEMENTATION ---

appointments.openapi(listRoute, async (c) => {
    const orgId = c.get('orgId');
    const query = c.req.valid('query');
    const list = await AppointmentService.getAppointments(orgId, query.start, query.end, query.status, query.customerId);
    return c.json(list as any, 200);
});

appointments.openapi(getOneRoute, async (c) => {
    const orgId = c.get('orgId');
    const { id } = c.req.valid('param');
    const appointment = await AppointmentService.getAppointmentById(orgId, id);
    if (!appointment) return c.json({ error: 'Not found' }, 404);
    return c.json(appointment as any, 200);
});

appointments.openapi(createRouteDef, async (c) => {
    const orgId = c.get('orgId');
    const data = c.req.valid('json');
    const appointment = await AppointmentService.createAppointment(c as any, orgId, data);

    if (data.sendConfirmation) {
        const settings = await prisma.organizationSettings.findUnique({
            where: { organizationId: orgId },
            select: { whatsappEnabled: true, evolutionInstance: true }
        });

        const phone = data.tempClientPhone || (appointment as any).customer?.whatsapp || (appointment as any).customer?.phone;

        if (settings?.whatsappEnabled && settings.evolutionInstance && phone) {
            try {
                const org = await prisma.organization.findUnique({
                    where: { id: orgId },
                    select: { name: true }
                });

                const scheduledAt = new Date(appointment.scheduledAt);
                const message = `Hola ${data.tempClientName || (appointment as any).customer?.name || 'Cliente'}, 📅

Tu cita en ${org?.name || 'nuestro taller'} está programada:

📅 Fecha: ${scheduledAt.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}
🕐 Hora: ${scheduledAt.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
📝 Motivo: ${data.title}

Responde *CONFIRMAR* para confirmar tu cita.

Si necesitas reagendar, contáctanos.`;

                await whatsapp.sendMessage(phone, message, settings.evolutionInstance);

                await prisma.appointment.updateMany({
                    where: { id: appointment.id, organizationId: orgId },
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

    return c.json(appointment as any, 201);
});

appointments.openapi(updateRoute, async (c) => {
    const orgId = c.get('orgId');
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const appointment = await AppointmentService.updateAppointment(c as any, orgId, id, data);
    return c.json(appointment as any, 200);
});

appointments.openapi(deleteRoute, async (c) => {
    const orgId = c.get('orgId');
    const { id } = c.req.valid('param');
    await AppointmentService.deleteAppointment(c as any, orgId, id);
    return c.json({ success: true }, 200);
});

appointments.openapi(confirmRoute, async (c) => {
    const orgId = c.get('orgId');
    const { id } = c.req.valid('param');
    const appointment = await AppointmentService.confirmAppointment(c as any, orgId, id);
    if (!appointment) return c.json({ error: 'Not found' }, 404);
    return c.json(appointment as any, 200);
});

appointments.openapi(sendReminderRoute, async (c) => {
    const orgId = c.get('orgId');
    const { id } = c.req.valid('param');
    const { type } = c.req.valid('json');

    const appointment = await AppointmentService.getAppointmentById(orgId, id);
    if (!appointment) return c.json({ error: 'Not found' }, 404);

    const settings = await prisma.organizationSettings.findUnique({
        where: { organizationId: orgId },
        select: { whatsappEnabled: true, evolutionInstance: true }
    });

    const phone = appointment.tempClientPhone || appointment.customer?.whatsapp || appointment.customer?.phone;

    if (!settings?.whatsappEnabled || !settings.evolutionInstance || !phone) {
        return c.json({ error: 'WhatsApp not configured' }, 400);
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

    await prisma.appointment.updateMany({
        where: { id, organizationId: orgId },
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

    return c.json({ success: true }, 200);
});

export { appointments };
