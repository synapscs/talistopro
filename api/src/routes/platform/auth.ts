import { OpenAPIHono, z } from '@hono/zod-openapi';
import { PlatformAuthService } from '../../services/platform/auth';
import type { AppEnv } from '../../types/env';

// Minimal platform-admin auth router with login/me/logout using token
const app = new OpenAPIHono<AppEnv>();

// Login endpoint - accepts POST to /api/platform/auth
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

// Get current user - accepts GET to /api/platform/auth
app.get('/me', async (c) => {
  const authHeader = c.req.header('Authorization');
  console.log('[API] /me - Authorization header:', authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('[API] /me - Invalid or missing Authorization header');
    console.log('[API] /me - Full headers:', JSON.stringify(c.req.header()));
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const token = authHeader.slice(7);
  console.log('[API] /me - Token received, length:', token.length);
  console.log('[API] /me - Token starts with:', token.substring(0, 50));

  const payload = PlatformAuthService.verifyToken(token);
  console.log('[API] /me - Token verification result:', payload ? 'SUCCESS' : 'FAILED');

  if (!payload) {
    console.log('[API] /me - Token verification failed');
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  console.log('[API] /me - User:', payload.email);
  return c.json({ success: true, user: { email: payload.email } });
});

// Logout endpoint - accepts POST to /api/platform/auth/logout
app.post('/logout', async (c) => {
  // Stateless: logout handled client-side by discarding token
  return c.json({ success: true });
});

export { app as platformAuthRouter };
