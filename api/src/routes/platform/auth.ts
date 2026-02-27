import { OpenAPIHono, z } from '@hono/zod-openapi';
import { PlatformAuthService } from '../../services/platform/auth';
import type { AppEnv } from '../../types/env';

// Minimal platform-admin auth router with login/me/logout using token
const app = new OpenAPIHono<AppEnv>();

// Lightweight payload for login
app.post('/login', async (c) => {
  const body = await c.req.json().catch(() => ({} as any));
  const email = body?.email;
  const password = body?.password;
  const adminEmail = process.env.PLATFORM_ADMIN_EMAIL;
  const adminPassword = process.env.PLATFORM_ADMIN_PASSWORD;
  if (!email || !password) {
    return c.json({ success: false, error: 'Missing credentials' }, 400);
  }
  if (email !== adminEmail || password !== adminPassword) {
    return c.json({ success: false, error: 'Invalid credentials' }, 401);
  }
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24; // 24h
  const token = PlatformAuthService.signToken({ email, sub: 'platform-admin', exp });
  return c.json({ success: true, token, user: { email } });
});

app.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  const token = authHeader.slice(7);
  const payload = PlatformAuthService.verifyToken(token);
  if (!payload) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }
  return c.json({ success: true, user: { email: payload.email } });
});

app.post('/logout', async (c) => {
  // Stateless: logout handled client-side by discarding token
  return c.json({ success: true });
});

export { app as platformAuthRouter };
