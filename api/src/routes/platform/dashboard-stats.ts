import { OpenAPIHono } from '@hono/zod-openapi';
import { DashboardStatsService } from '../../services/platform/dashboard-stats';
import { platformAuthGuard } from '../../middleware/platform-auth';
import type { AppEnv } from '../../types/env';

const app = new OpenAPIHono<AppEnv>();
app.use('/*', platformAuthGuard);

app.get('/overview', async (c) => {
  const stats = await DashboardStatsService.getOverviewStats();
  return c.json(stats);
});

app.get('/organizations-growth', async (c) => {
  const months = c.req.query('months');
  const stats = await DashboardStatsService.getOrganizationsGrowth(
    months ? parseInt(months) : 6
  );
  return c.json(stats);
});

app.get('/revenue-by-plan', async (c) => {
  const stats = await DashboardStatsService.getRevenueByPlan();
  return c.json(stats);
});

app.get('/recent-activity', async (c) => {
  const limit = c.req.query('limit');
  const activity = await DashboardStatsService.getRecentActivity(
    limit ? parseInt(limit) : 10
  );
  return c.json(activity);
});

app.get('/payment-verifications', async (c) => {
  const stats = await DashboardStatsService.getPaymentVerificationStats();
  return c.json(stats);
});

export const dashboardStatsRouter = app;
