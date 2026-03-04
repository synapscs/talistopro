import { OpenAPIHono, z } from '@hono/zod-openapi';
import { PlansService } from '../../services/platform/plans';
import { platformAuthGuard } from '../../middleware/platform-auth';
import type { AppEnv } from '../../types/env';

const app = new OpenAPIHono<AppEnv>();
app.use('/*', platformAuthGuard);

const createPlanSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  monthlyPrice: z.number().positive(),
  yearlyPrice: z.number().positive().optional(),
  activationFee: z.number().min(0),
  maxMembers: z.number().int().positive(),
  maxPhotosPerOrder: z.number().int().positive(),
  maxOrdersPerMonth: z.number().int().positive(),
  whatsappEnabled: z.boolean().optional(),
  n8nEnabled: z.boolean().optional(),
  apiEnabled: z.boolean().optional(),
  reportsEnabled: z.boolean().optional(),
  integrationsEnabled: z.boolean().optional(),
  metadata: z.any().optional()
});

const updatePlanSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  monthlyPrice: z.number().positive().optional(),
  yearlyPrice: z.number().positive().optional(),
  activationFee: z.number().min(0).optional(),
  maxMembers: z.number().int().positive().optional(),
  maxPhotosPerOrder: z.number().int().positive().optional(),
  maxOrdersPerMonth: z.number().int().positive().optional(),
  whatsappEnabled: z.boolean().optional(),
  n8nEnabled: z.boolean().optional(),
  apiEnabled: z.boolean().optional(),
  reportsEnabled: z.boolean().optional(),
  integrationsEnabled: z.boolean().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  metadata: z.any().optional()
});

app.post('/', async (c) => {
  const body = await c.req.json();
  const validated = createPlanSchema.parse(body);
  
  const result = await PlansService.createPlan(validated);
  return c.json(result, 201);
});

app.get('/', async (c) => {
  const includeInactive = c.req.query('includeInactive') === 'true';
  const result = await PlansService.getAllPlans(includeInactive);
  return c.json(result);
});

app.get('/stats', async (c) => {
  const stats = await PlansService.getPlanStats();
  return c.json(stats);
});

app.get('/:id', async (c) => {
  const { id } = c.req.param();
  const result = await PlansService.getPlanById(id);
  return c.json(result);
});

app.put('/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const validated = updatePlanSchema.parse(body);
  
  const result = await PlansService.updatePlan(id, validated);
  return c.json(result);
});

app.delete('/:id', async (c) => {
  const { id } = c.req.param();
  const result = await PlansService.deletePlan(id);
  return c.json(result);
});

app.post('/:id/deactivate', async (c) => {
  const { id } = c.req.param();
  const result = await PlansService.deactivatePlan(id);
  return c.json(result);
});

app.post('/:id/activate', async (c) => {
  const { id } = c.req.param();
  const result = await PlansService.activatePlan(id);
  return c.json(result);
});

export const plansRouter = app;
