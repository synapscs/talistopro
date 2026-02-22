import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '../lib/db';
import { formatToE164 } from '../lib/phone';
import { seedOrganizationData } from '../services/organization-seeder';
import type { AppEnv } from '../types/env';

const settingsSchema = z.object({
    // Organization fields
    name: z.string().optional(),
    businessType: z.enum(['AUTOMOTIVE', 'ELECTRONICS', 'MANUFACTURING', 'OTHER']).optional(),
    country: z.enum(['VE', 'CO', 'MX', 'OTHER']).optional(),
    primaryCurrency: z.enum(['USD', 'VES', 'COP', 'MXN']).optional(),
    secondaryCurrency: z.enum(['USD', 'VES', 'COP', 'MXN', '']).optional(),
    timezone: z.string().optional(),
    primaryColor: z.string().optional(),
    themeKey: z.string().optional(),
    logo: z.string().optional(),

    // OrganizationSettings fields
    taxId: z.string().optional(),
    taxRegime: z.string().optional(),
    address: z.string().optional(),
    phoneNumber: z.string().optional(),
    whatsappNumber: z.string().optional(),
    email: z.string().optional(),
    taxRate: z.number().optional(),
    taxName: z.string().optional(),
    biCurrencyEnabled: z.boolean().optional(),
    exchangeInverted: z.boolean().optional(),
    exchangeRate: z.number().optional(),
    exchangeRateSource: z.string().optional(),
    autoUpdateRate: z.boolean().optional(),
    whatsappEnabled: z.boolean().optional(),
    evolutionInstance: z.string().optional(),
    evolutionApiKey: z.string().optional(),
    evolutionApiToken: z.string().optional(),

    // Plantillas y Terminología
    bookingReminderMsg: z.string().optional(),
    bookingReminderEnabled: z.boolean().optional(),
    pendingPaymentMsg: z.string().optional(),
    pendingPaymentEnabled: z.boolean().optional(),
    customTerminology: z.record(z.unknown()).optional(),
});

// Rutas encadenadas para inferencia de tipos Hono RPC
export const settings = new Hono<AppEnv>()
    .get('/', async (c) => {
        const orgId = c.get('orgId');
        const org = await prisma.organization.findUnique({
            where: { id: orgId },
            include: { settings: true }
        });

        if (!org) return c.json({ error: 'Organization not found' }, 404);

        // Flattening for the frontend
        const flattened = {
            ...org,
            ...(org.settings || {}),
            id: org.id, // Ensure we use the organization ID
            country: org.country === 'OT' ? 'OTHER' : org.country,
        };

        return c.json(flattened);
    })
    .patch('/', zValidator('json', settingsSchema, (result, c) => {
        if (!result.success) {
            console.error('Settings Validation Error:', JSON.stringify(result.error.flatten(), null, 2));
            return c.json({ error: 'Validation Failed', details: result.error.flatten() }, 400);
        }
    }), async (c) => {
        const orgId = c.get('orgId');
        const data = c.req.valid('json');

        // Separate organization fields from settings fields
        const orgFields = ['name', 'businessType', 'country', 'primaryCurrency', 'secondaryCurrency', 'timezone', 'primaryColor', 'themeKey', 'logo'];
        const updateOrgData: Record<string, unknown> = {};
        const updateSettingsData: Record<string, unknown> = {};

        Object.keys(data).forEach(key => {
            const typedKey = key as keyof typeof data;
            if (orgFields.includes(key)) {
                if (key === 'secondaryCurrency' && data[typedKey] === '') {
                    updateOrgData[key] = null;
                } else if (key === 'country' && data[typedKey] === 'OTHER') {
                    updateOrgData[key] = 'OT';
                } else {
                    updateOrgData[key] = data[typedKey];
                }
            } else {
                let value: unknown = data[typedKey];

                // Aplicar formateo E.164 a campos telefónicos
                if (key === 'phoneNumber' || key === 'whatsappNumber') {
                    const country = (updateOrgData.country as string) || 'VE';
                    value = formatToE164(value as string, country);
                }

                updateSettingsData[key] = value;
            }
        });

        try {
            const result = await prisma.$transaction(async (tx) => {
                const updatedOrg = await tx.organization.update({
                    where: { id: orgId },
                    data: updateOrgData,
                });

                if (Object.keys(updateSettingsData).length > 0) {
                    await tx.organizationSettings.upsert({
                        where: { organizationId: orgId },
                        create: {
                            organizationId: orgId,
                            ...updateSettingsData
                        },
                        update: updateSettingsData
                    });
                }

                return updatedOrg;
            });

            return c.json(result);
        } catch (error: unknown) {
            console.error('Update Settings Error:', error);
            const message = error instanceof Error ? error.message : 'Error desconocido';
            return c.json({ error: message }, 500);
        }
    })
    .post('/seed-presets', zValidator('json', z.object({
        businessType: z.enum(['AUTOMOTIVE', 'ELECTRONICS', 'MANUFACTURING', 'OTHER']).optional(),
        force: z.boolean().optional().default(false)
    })), async (c) => {
        const orgId = c.get('orgId');
        const { businessType, force } = c.req.valid('json');

        try {
            let typeToSeed = businessType;

            if (!typeToSeed) {
                const org = await prisma.organization.findUnique({
                    where: { id: orgId },
                    select: { businessType: true }
                });
                typeToSeed = (org?.businessType as any) || 'OTHER';
            }

            const result = await seedOrganizationData(orgId, typeToSeed!, force);
            return c.json(result);
        } catch (error: unknown) {
            console.error('Manual Seeding Error:', error);
            const message = error instanceof Error ? error.message : 'Error desconocido';
            return c.json({ success: false, error: message }, 500);
        }
    });
