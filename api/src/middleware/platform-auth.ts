import { Context, Next } from 'hono';
import { PlatformAuthService } from '../services/platform/auth';

export const platformAuthGuard = async (c: Context, next: Next) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized - No token' }, 401);
  }
  const token = authHeader.substring(7);
  const payload = PlatformAuthService.verifyToken(token);
  if (!payload) {
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }
  c.set('platformAdmin', payload);
  c.set('platformAdminId', payload.sub);
  await next();
};
