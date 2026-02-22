import { Context } from "hono";
import { prisma } from "./db";

/**
 * Registra una acción sensible en el Log de Auditoría.
 */
export const recordAudit = async (
    c: Context,
    action: string,
    entity: string,
    entityId: string | null = null,
    details: Record<string, unknown> | null = null
) => {
    try {
        const orgId = c.get("orgId");
        const user = c.get("user");

        if (!orgId) {
            console.warn("[Audit] Intento de registro sin Organization ID en contexto");
            return;
        }

        await prisma.auditLog.create({
            data: {
                action,
                entity,
                entityId,
                details: details ? JSON.parse(JSON.stringify(details)) : null,
                userId: user?.id || null,
                organizationId: orgId,
            }
        });
    } catch (error) {
        console.error("[Audit] Error al grabar log de auditoría:", error);
    }
};
