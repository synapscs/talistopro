import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../lib/db';
import { auth } from '../auth';
import { seedOrganizationData } from '../services/organization-seeder';
import type { AppEnv } from '../types/env';

const setupSchema = z.object({
    organizationId: z.string(),
    name: z.string().min(2),
    businessType: z.enum(['AUTOMOTIVE', 'ELECTRONICS', 'MANUFACTURING', 'OTHER']),
    country: z.enum(['VE', 'CO', 'MX', 'OTHER']),
    tradeName: z.string().optional(),
    taxId: z.string().optional(),
    taxRegime: z.string().optional(),
    address: z.string().optional(),
    phoneNumber: z.string().optional(),
    whatsappNumber: z.string().optional(),
});

const WORKFLOW_PRESETS: Record<string, any[]> = {
    AUTOMOTIVE: [
        { name: 'Recepción', order: 1, color: '#6366F1', isInitial: true, notifyCustomer: true, notificationMsg: 'Vehículo recibido en taller.' },
        { name: 'Diagnóstico', order: 2, color: '#F59E0B' },
        { name: 'En Reparación', order: 3, color: '#3B82F6' },
        { name: 'Control de Calidad', order: 4, color: '#10B981' },
        { name: 'Listo para Entrega', order: 5, color: '#8B5CF6', notifyCustomer: true, notificationMsg: 'Su vehículo ya está listo.' },
        { name: 'Entregado', order: 6, color: '#6B7280', isFinal: true },
    ],
    ELECTRONICS: [
        { name: 'Ingreso', order: 1, color: '#6366F1', isInitial: true, notifyCustomer: true, notificationMsg: 'Equipo recibido.' },
        { name: 'En Revisión', order: 2, color: '#F59E0B' },
        { name: 'Presupuestado', order: 3, color: '#8B5CF6' },
        { name: 'Reparando', order: 4, color: '#3B82F6' },
        { name: 'Pruebas Finales', order: 5, color: '#10B981', notifyCustomer: true, notificationMsg: 'Reparación terminada.' },
        { name: 'Entregado', order: 6, color: '#6B7280', isFinal: true },
    ],
    OTHER: [
        { name: 'Nuevo', order: 1, color: '#6366F1', isInitial: true },
        { name: 'En Proceso', order: 2, color: '#3B82F6' },
        { name: 'Finalizado', order: 3, color: '#10B981', isFinal: true },
    ]
};

// Rutas encadenadas para inferencia de tipos Hono RPC
export const onboarding = new Hono<AppEnv>()
    /**
     * Endpoint de Setup Inicial
     * Crea la data base para un nuevo Tenant (Organization + Settings + Workflow Presets)
     */
    .post('/setup', zValidator('json', setupSchema), async (c) => {
        const { organizationId, name, businessType, country, tradeName, address, phoneNumber, whatsappNumber, taxId, taxRegime } = c.req.valid('json');

        const session = await auth.api.getSession({
            headers: c.req.raw.headers
        });

        if (!session) {
            return c.json({ error: 'No authenticated session' }, 401);
        }

        try {
            const result = await prisma.$transaction(async (tx) => {
                // 1. Actualizar Organización creada previamente por Better-Auth
                const org = await tx.organization.update({
                    where: { id: organizationId },
                    data: {
                        businessType,
                        country: country === 'OTHER' ? 'OT' : country,
                        primaryCurrency: country === 'VE' ? 'USD' : (country === 'CO' ? 'COP' : (country === 'MX' ? 'MXN' : 'USD')),
                        secondaryCurrency: country === 'VE' ? 'VES' : null,
                        timezone: country === 'VE' ? 'America/Caracas' : (country === 'CO' ? 'America/Bogota' : (country === 'MX' ? 'America/Mexico_City' : 'UTC')),
                    }
                });

                // 2. Crear Settings base
                await tx.organizationSettings.create({
                    data: {
                        organizationId: org.id,
                        taxName: country === 'VE' ? 'IVA' : (country === 'CO' ? 'IVA' : (country === 'MX' ? 'IVA' : 'TAX')),
                        taxRate: country === 'MX' ? 16 : (country === 'CO' ? 19 : (country === 'VE' ? 16 : 0)),
                        tradeName,
                        address,
                        phoneNumber,
                        whatsappNumber,
                        taxId,
                        taxRegime,
                    }
                });

                // 3. Crear Workflow por defecto según rubro
                const presets = WORKFLOW_PRESETS[businessType] || WORKFLOW_PRESETS.OTHER;

                await tx.workflowStage.createMany({
                    data: presets.map(p => ({
                        ...p,
                        organizationId: org.id
                    }))
                });

                // Nota: Better-Auth ya vincula automáticamente al creador como OWNER en la tabla Member
                // por lo que no es necesario crear el Member aquí.

                return org;
            });

            // 5. Sembrar datos iniciales (Categorías, Servicios, Productos) dependientes del rubro
            try {
                // Pasamos force=false, exchangeRate=1 (ya que los DB guardan USD base)
                await seedOrganizationData(result.id, result.businessType, false, 1);
            } catch (seedError) {
                console.error('[Onboarding] Error non-fatal during seeding:', seedError);
                // No detenemos el onboarding si el seed falla, pero lo registramos
            }

            return c.json({ success: true, organization: result });
        } catch (error) {
            console.error('Onboarding Setup Error:', error);
            return c.json({ error: 'Failed to complete setup' }, 500);
        }
    })
    .get('/resolve-slug/:slug', async (c) => {
        const slug = c.req.param('slug');
        const org = await prisma.organization.findUnique({
            where: { slug },
            include: {
                members: true
            }
        });

        if (!org) {
            return c.json({ exists: false, id: null, isOrphan: false });
        }

        return c.json({
            exists: true,
            id: org.id,
            isOrphan: org.members.length === 0
        });
    });
