import { Context, Next } from 'hono';
import { prisma } from '../lib/db';
import { auth } from '../auth';
import { HTTPException } from 'hono/http-exception';

export const platformAdminGuard = async (c: Context, next: Next) => {
    const session = await auth.api.getSession({
        headers: c.req.raw.headers,
    });
    
    if (!session?.user?.id) {
        throw new HTTPException(401, { message: 'Unauthorized - No session found' });
    }
    
    const platformAdmin = await prisma.platformAdmin.findUnique({
        where: { userId: session.user.id }
    });
    
    if (!platformAdmin) {
        throw new HTTPException(403, { message: 'Forbidden - Platform Admin required' });
    }
    
    c.set('platformAdmin', platformAdmin);
    c.set('isPlatformAdmin', true);
    c.set('userId', session.user.id);
    c.set('user', session.user);
    c.set('session', session.session);
    
    await next();
};

export const permissionGuard = (requiredPermission: string) => {
    return async (c: Context, next: Next) => {
        const platformAdmin = c.get('platformAdmin');
        const permissions = platformAdmin?.permissions as string[] || [];
        
        if (!permissions.includes('all') && !permissions.includes(requiredPermission)) {
            throw new HTTPException(403, { message: 'Forbidden - Insufficient permissions' });
        }
        
        await next();
    };
};