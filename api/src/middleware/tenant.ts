import { Context, Next } from "hono";
import { auth } from "../auth";
import { prisma } from "../lib/db";

/**
 * Middleware que protege las rutas de la API extrayendo y validando 
 * la organización activa del usuario autenticado.
 * 
 * Seguridad Multi-Tenant:
 * - Verifica sesión válida
 * - Valida que el usuario sea miembro activo de la organización
 * - Aísla datos entre tenants
 */
export const tenantGuard = async (c: Context, next: Next) => {
    if (c.req.path.startsWith("/api/auth")) {
        return await next();
    }

    if (c.req.path.startsWith("/api/platform")) {
        return await next();
    }

    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    });

    if (!session) {
        return c.json({ error: "Unauthorized - No session found" }, 401);
    }

    const orgId = session.session.activeOrganizationId;

    if (!orgId) {
        return c.json({ error: "Forbidden - No active organization selected" }, 403);
    }

    const member = await prisma.member.findUnique({
        where: {
            userId_organizationId: {
                userId: session.user.id,
                organizationId: orgId
            }
        }
    });

    if (!member) {
        return c.json({ error: "Forbidden - Not a member of this organization" }, 403);
    }

    c.set("orgId", orgId);
    c.set("user", session.user);
    c.set("session", session.session);
    c.set("memberRole", member.role);

    await next();
};
