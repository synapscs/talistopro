const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- DIAGNÓSTICO DE ORGANIZACIONES ---');
    const orgs = await prisma.organization.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
            settings: true,
            members: {
                select: {
                    userId: true,
                    role: true
                }
            }
        }
    });

    console.log(JSON.stringify(orgs, null, 2));
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
