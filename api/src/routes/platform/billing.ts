import { OpenAPIHono, z } from '@hono/zod-openapi';
import { PlatformBillingService } from '../../services/platform/billing';
import { platformAuthGuard } from '../../middleware/platform-auth';
import type { AppEnv } from '../../types/env';

const app = new OpenAPIHono<AppEnv>();
app.use('/*', platformAuthGuard);

app.post('/invoices/:orgId', async (c) => {
  const { orgId } = c.req.param();
  const body = await c.req.json();
  const { year, month } = body;
  
  const result = await PlatformBillingService.generateMonthlyInvoice(
    orgId, 
    {
      start: new Date(year, month, 1),
      end: new Date(year, month + 1, 1)
    }
  );
  return c.json(result);
});

app.get('/invoices', async (c) => {
  const { status, organizationId, page, limit } = c.req.query();
  
  const result = await PlatformBillingService.getAllInvoices({
    status,
    organizationId,
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined
  });
  return c.json(result);
});

app.post('/invoices/:id/pay', async (c) => {
  const { id } = c.req.param();
  const result = await PlatformBillingService.markInvoicePaid(id);
  return c.json(result);
});

export const platformBillingRouter = app;