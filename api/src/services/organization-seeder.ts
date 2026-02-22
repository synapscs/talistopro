import { BusinessType } from '@prisma/client';
import { prisma } from '../lib/db';
import { BUSINESS_SEEDS, CategoryPreset } from '../lib/constants/business-presets';

/**
 * Seeds an organization with default categories, services, and products based on its business type.
 * @param organizationId The ID of the organization to seed.
 * @param businessType The type of business (AUTOMOTIVE, ELECTRONICS, etc.)
 * @param force If true, it will seed even if categories already exist.
 * @param exchangeRate Rate to convert seed prices from USD to local currency (1 = no conversion).
 */
export async function seedOrganizationData(
    organizationId: string,
    businessType: BusinessType,
    force: boolean = false,
    exchangeRate: number = 1
) {
    try {
        // 1. Verificar si ya existen categorías (Garantía de Idempotencia)
        if (!force) {
            const existingCategories = await prisma.category.findFirst({
                where: { organizationId }
            });
            if (existingCategories) {
                console.log(`[Seeder] Organization ${organizationId} already has categories. Skipping seed.`);
                return { success: false, message: 'La organización ya tiene datos configurados.' };
            }
        }

        // Helper: convertir precio USD a moneda local (redondeo para COP/MXN)
        const convertPrice = (usdPrice: number): number => {
            if (exchangeRate <= 1) return usdPrice;
            return Math.round(usdPrice * exchangeRate);
        };

        // 2. Obtener el preset correspondiente
        const presets: CategoryPreset[] = BUSINESS_SEEDS[businessType] || BUSINESS_SEEDS.OTHER;

        // 3. Ejecutar transacción masiva
        await prisma.$transaction(async (tx) => {
            for (const catPreset of presets) {
                // Crear Categoría
                const category = await tx.category.create({
                    data: {
                        name: catPreset.name,
                        type: catPreset.type,
                        color: catPreset.color,
                        organizationId
                    }
                });

                // Crear Servicios si existen (precios convertidos)
                if (catPreset.services && catPreset.services.length > 0) {
                    await tx.service.createMany({
                        data: catPreset.services.map(s => ({
                            name: s.name,
                            description: s.description,
                            price: convertPrice(s.price),
                            estimatedTime: s.estimatedTime,
                            categoryId: category.id,
                            organizationId,
                            isActive: true
                        }))
                    });
                }

                // Crear Productos si existen (precios convertidos)
                if (catPreset.products && catPreset.products.length > 0) {
                    await tx.product.createMany({
                        data: catPreset.products.map(p => ({
                            name: p.name,
                            sku: p.sku,
                            description: p.description,
                            salePrice: convertPrice(p.salePrice),
                            costPrice: convertPrice(p.costPrice),
                            unit: p.unit,
                            stock: p.stock,
                            minStock: p.minStock,
                            categoryId: category.id,
                            organizationId,
                            isActive: true
                        }))
                    });
                }
            }
        });

        const rateInfo = exchangeRate > 1 ? ` (prices converted at rate ${exchangeRate})` : '';
        console.log(`[Seeder] Organization ${organizationId} seeded successfully with ${businessType} presets${rateInfo}.`);
        return { success: true, message: 'Sembrado completado con éxito.' };

    } catch (error) {
        console.error(`[Seeder] Error seeding organization ${organizationId}:`, error);
        throw error;
    }
}

