import { Context, Next } from "hono";
import { auth } from "../auth";

/**
 * Middleware que protege las rutas de la API extrayendo y validando 
 * la organización activa del usuario autenticado.
 */
export const tenantGuard = async (c: Context, next: Next) => {
    // Excluir rutas de autenticación del TenantGuard
    if (c.req.path.startsWith("/api/auth")) {
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

    // Guardar en el contexto de Hono para uso en los controladores
    c.set("orgId", orgId);
    c.set("user", session.user);
    c.set("session", session.session);

    await next();
};
