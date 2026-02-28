import { OpenAPIHono } from '@hono/zod-openapi';
import { prisma } from '../../lib/db';
import { platformAuthGuard } from '../../middleware/platform-auth';
import type { AppEnv } from '../../types/env';

const debug = new OpenAPIHono<AppEnv>();

debug.use('/*', platformAuthGuard);

debug.get('/', async (c) => {
  try {
    // Check database connection
    await prisma.$connect();

    // Count organizations
    const orgCount = await prisma.organization.count();

    // Count plans
    const planCount = await prisma.plan.count();

    const result = {
      organizations: orgCount,
      plans: planCount,
      databaseConnected: true
    };

    return c.json(result);
  } catch (error: any) {
    console.error('Debug error:', error);
    return c.json({
      error: error.message,
      stack: error.stack
    }, 500);
  }
});

export { debug };
