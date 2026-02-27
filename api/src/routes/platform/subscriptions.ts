import { OpenAPIHono, z } from '@hono/zod-openapi';
import { PlatformSubscriptionService } from '../../services/platform/subscriptions';
import { platformAuthGuard } from '../../middleware/platform-auth';
import type { AppEnv } from '../../types/env';

const app = new OpenAPIHono<AppEnv>();
app.use('/*', platformAuthGuard);

app.post('/:orgId/assign', async (c) => {
  const { orgId } = c.req.param();
  const { planId } = await c.req.json();
  const result = await PlatformSubscriptionService.assignPlan(orgId, planId);
  return c.json(result);
});

app.put('/:orgId/change-plan', async (c) => {
  const { orgId } = c.req.param();
  const { newPlanId } = await c.req.json();
  const result = await PlatformSubscriptionService.changePlan(orgId, newPlanId);
  return c.json(result);
});

app.delete('/:orgId/cancel', async (c) => {
  const { orgId } = c.req.param();
  const { reason } = await c.req.json();
  const result = await PlatformSubscriptionService.cancelSubscription(orgId, reason);
  return c.json(result);
});

app.get('/:orgId/validate', async (c) => {
  const { orgId } = c.req.param();
  const result = await PlatformSubscriptionService.validateLimits(orgId);
  return c.json(result);
});

app.get('/:orgId', async (c) => {
  const { orgId } = c.req.param();
  const result = await PlatformSubscriptionService.getSubscription(orgId);
  return c.json(result);
});

export const platformSubscriptionsRouter = app;