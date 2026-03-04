import type { Context } from 'hono';

/**
 * Variables inyectadas por TenantGuard en el contexto de Hono.
 * Todos los routers que usen tenantGuard deben tipar con AppEnv.
 */
export type AppEnv = {
    Variables: {
        orgId: string;
        user: {
            id: string;
            email: string;
            name: string;
            image?: string | null;
            emailVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
        session: {
            id: string;
            token: string;
            expiresAt: Date;
            userId: string;
            activeOrganizationId: string | null;
        };
        platformAdmin?: {
            email: string;
            sub: string;
        };
        platformAdminId?: string;
    };
};

/** Contexto tipado para handlers protegidos por tenantGuard */
export type AppContext = Context<AppEnv>;
