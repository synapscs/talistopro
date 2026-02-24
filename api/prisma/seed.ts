import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Crear planes de suscripción
    console.log('Creating subscription plans...');
    const basicPlan = await prisma.plan.upsert({
        where: { name: 'Básico' },
        update: {},
        create: {
            name: 'Básico',
            description: 'Para talleres pequeños',
            monthlyPrice: 29.00,
            yearlyPrice: 290.00,
            activationFee: 0.00,
            maxMembers: 3,
            maxPhotosPerOrder: 10,
            maxOrdersPerMonth: 50,
            whatsappEnabled: false,
            n8nEnabled: false,
            apiEnabled: false,
            reportsEnabled: true,
            integrationsEnabled: false,
            sortOrder: 1,
        },
    });

    const proPlan = await prisma.plan.upsert({
        where: { name: 'Pro' },
        update: {},
        create: {
            name: 'Pro',
            description: 'Para talleres en crecimiento',
            monthlyPrice: 79.00,
            yearlyPrice: 790.00,
            activationFee: 0.00,
            maxMembers: 10,
            maxPhotosPerOrder: 50,
            maxOrdersPerMonth: 500,
            whatsappEnabled: true,
            n8nEnabled: false,
            apiEnabled: false,
            reportsEnabled: true,
            integrationsEnabled: true,
            sortOrder: 2,
        },
    });

    const elitePlan = await prisma.plan.upsert({
        where: { name: 'Elite' },
        update: {},
        create: {
            name: 'Elite',
            description: 'Para talleres grandes',
            monthlyPrice: 199.00,
            yearlyPrice: 1990.00,
            activationFee: 0.00,
            maxMembers: -1,
            maxPhotosPerOrder: -1,
            maxOrdersPerMonth: -1,
            whatsappEnabled: true,
            n8nEnabled: true,
            apiEnabled: true,
            reportsEnabled: true,
            integrationsEnabled: true,
            sortOrder: 3,
        },
    });

    console.log('✅ Created plans:', { basic: basicPlan.id, pro: proPlan.id, elite: elitePlan.id });

    // 2. Crear un platform admin (usuario de ejemplo)
    console.log('Creating platform admin user...');
    const platformAdminUserId = generateUUID();
    const platformAdminUser = await prisma.user.upsert({
        where: { email: 'admin@talistopro.com' },
        update: {},
        create: {
            id: platformAdminUserId,
            email: 'admin@talistopro.com',
            name: 'Platform Admin',
            emailVerified: true,
            isPlatformAdmin: true,
        },
    });

    const platformAdmin = await prisma.platformAdmin.upsert({
        where: { userId: platformAdminUser.id },
        update: {},
        create: {
            userId: platformAdminUser.id,
            role: 'admin',
            permissions: ['all'],
        },
    });

    console.log('✅ Created platform admin:', platformAdminUser.email);

    // 3. Crear un plan de prueba
    console.log('Creating test organization...');
    const testOrg = await prisma.organization.findFirst();
    
    if (testOrg && !testOrg.planId) {
        await prisma.organization.update({
            where: { id: testOrg.id },
            data: {
                planId: proPlan.id,
                subscriptionStatus: 'trial',
                trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
            },
        });
        console.log('✅ Assigned Pro plan to existing organization');
    }

    console.log('🎉 Seed completed!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
