import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear planes iniciales (usando upsert para evitar duplicados)
  for (const planData of [
    {
      name: 'Básico',
      description: 'Plan básico para pequeños talleres y servicios técnicos',
      monthlyPrice: 20.00,
      activationFee: 30.00,
      maxMembers: 2,
      maxPhotosPerOrder: 3,
      maxOrdersPerMonth: 50,
      whatsappEnabled: false,
      n8nEnabled: false,
      apiEnabled: false,
      reportsEnabled: true,
      integrationsEnabled: false,
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'Pro',
      description: 'Plan para talleres en crecimiento con integraciones completas',
      monthlyPrice: 45.00,
      activationFee: 60.00,
      maxMembers: 5,
      maxPhotosPerOrder: 6,
      maxOrdersPerMonth: 100,
      whatsappEnabled: true,
      n8nEnabled: true,
      apiEnabled: true,
      reportsEnabled: true,
      integrationsEnabled: true,
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'Elite',
      description: 'Plan completo para talleres establecidos con alto volumen',
      monthlyPrice: 80.00,
      activationFee: 60.00,
      maxMembers: 10,
      maxPhotosPerOrder: 15,
      maxOrdersPerMonth: 300,
      whatsappEnabled: true,
      n8nEnabled: true,
      apiEnabled: true,
      reportsEnabled: true,
      integrationsEnabled: true,
      isActive: true,
      sortOrder: 3,
    },
  ]) {
    await prisma.plan.upsert({
      where: { name: planData.name },
      update: planData,
      create: planData,
    });
  }

  console.log(`✅ Se crearon/actualizaron 3 planes`);

  // Crear usuario platform admin inicial (si no existe)
  // Nota: El email debe existir en .env como PLATFORM_ADMIN_EMAIL
  const platformAdminEmail = process.env.PLATFORM_ADMIN_EMAIL || 'admin@talinto.pro';
  
  try {
    // Buscar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { email: platformAdminEmail },
    });

    if (!existingUser) {
      // Crear usuario inicial
      const adminUser = await prisma.user.create({
        data: {
          email: platformAdminEmail,
          name: 'Platform Admin',
          isPlatformAdmin: true,
          emailVerified: true,
        },
      });

      console.log(`✅ Usuario platform admin creado: ${adminUser.email}`);

      // Crear PlatformAdmin
      const platformAdmin = await prisma.platformAdmin.create({
        data: {
          userId: adminUser.id,
          role: 'admin',
          permissions: ['all'],
        },
      });

      console.log(`✅ Plataform admin role asignado a: ${platformAdmin.userId}`);
    } else {
      // Si el usuario existe pero no es platform admin, actualizarlo
      if (!existingUser.isPlatformAdmin) {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: { isPlatformAdmin: true },
        });
        console.log(`✅ Usuario existente actualizado a platform admin: ${existingUser.email}`);

        // Crear PlatformAdmin si no existe
        const existingPlatformAdmin = await prisma.platformAdmin.findUnique({
          where: { userId: existingUser.id },
        });

        if (!existingPlatformAdmin) {
          await prisma.platformAdmin.create({
            data: {
              userId: existingUser.id,
              role: 'admin',
              permissions: ['all'],
            },
          });
        }
      } else {
        console.log(`ℹ️ Platform admin ya existe: ${existingUser.email}`);
      }
    }
  } catch (error: any) {
    console.error(`⚠️ Error creando platform admin: ${error.message}`);
    if (error.code !== 'P2002') { // No ignorar errores de duplicado
      throw error;
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error ejecutando seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });