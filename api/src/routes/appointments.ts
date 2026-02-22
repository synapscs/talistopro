import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { AppointmentService } from '../services/appointments';
import type { AppEnv } from '../types/env';

const appointmentSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    scheduledAt: z.string(),
    duration: z.number().default(60),
    customerId: z.string(),
    status: z.enum(['SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).default('SCHEDULED'),
});

// Rutas encadenadas para inferencia de tipos Hono RPC
const appointments = new Hono<AppEnv>()
    .get('/', async (c) => {
        const orgId = c.get('orgId');
        const { start, end } = c.req.query();

        const list = await AppointmentService.getAppointments(orgId, start, end);
        return c.json(list);
    })
    .post('/', zValidator('json', appointmentSchema), async (c) => {
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const appointment = await AppointmentService.createAppointment(orgId, data);
        return c.json(appointment, 201);
    })
    .patch('/:id', zValidator('json', appointmentSchema.partial()), async (c) => {
        const id = c.req.param('id');
        const data = c.req.valid('json');
        const orgId = c.get('orgId');

        const appointment = await AppointmentService.updateAppointment(orgId, id, data);
        return c.json(appointment);
    })
    .delete('/:id', async (c) => {
        const id = c.req.param('id');
        const orgId = c.get('orgId');

        const result = await AppointmentService.deleteAppointment(orgId, id);
        return c.json(result);
    });

export { appointments };
