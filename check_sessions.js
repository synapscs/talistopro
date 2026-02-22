const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- DIAGNÓSTICO DE SESIONES Y USUARIOS ---');
    const sessions = await prisma.session.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
            user: {
                select: {
                    id: true,
                    email: true,
                    name: true
                }
            }
        }
    });

    console.log('Sesiones Recientes:', JSON.stringify(sessions, null, 2));

    const orphanOrgs = await prisma.organization.findMany({
        where: {
            members: {
                none: {}
            }
        },
        select: {
            id: true,
            name: true,
            slug: true,
            createdAt: true
        }
    });

    console.log('Organizaciones Huérfanas:', JSON.stringify(orphanOrgs, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
