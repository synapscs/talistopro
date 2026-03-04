import { OpenAPIHono, z } from '@hono/zod-openapi';
import { SupportTicketService } from '../../services/platform/support-tickets';
import { platformAuthGuard } from '../../middleware/platform-auth';
import type { AppEnv } from '../../types/env';

const app = new OpenAPIHono<AppEnv>();
app.use('/*', platformAuthGuard);

const createTicketSchema = z.object({
  organizationId: z.string(),
  subject: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['technical', 'billing', 'other']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional()
});

const updateTicketSchema = z.object({
  subject: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  category: z.enum(['technical', 'billing', 'other']).optional(),
  priority: z.enum(['low', 'normal', 'high', 'urgent']).optional(),
  status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional()
});

const assignTicketSchema = z.object({
  adminId: z.string()
});

const resolveTicketSchema = z.object({
  resolution: z.string().min(1, 'La resolución es requerida')
});

app.post('/', async (c) => {
  const body = await c.req.json();
  const validated = createTicketSchema.parse(body);
  
  const result = await SupportTicketService.createTicket(validated);
  return c.json(result, 201);
});

app.get('/', async (c) => {
  const { 
    status, 
    organizationId, 
    category, 
    priority,
    assignedToId,
    page, 
    limit 
  } = c.req.query();
  
  const result = await SupportTicketService.getAllTickets({
    status,
    organizationId,
    category,
    priority,
    assignedToId,
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined
  });
  return c.json(result);
});

app.get('/stats', async (c) => {
  const stats = await SupportTicketService.getStats();
  return c.json(stats);
});

app.get('/:id', async (c) => {
  const { id } = c.req.param();
  const result = await SupportTicketService.getTicketById(id);
  return c.json(result);
});

app.put('/:id', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const validated = updateTicketSchema.parse(body);
  
  const result = await SupportTicketService.updateTicket(id, validated);
  return c.json(result);
});

app.post('/:id/assign', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const validated = assignTicketSchema.parse(body);
  
  const result = await SupportTicketService.assignTicket(id, validated.adminId);
  return c.json(result);
});

app.post('/:id/resolve', async (c) => {
  const { id } = c.req.param();
  const body = await c.req.json();
  const validated = resolveTicketSchema.parse(body);
  
  const result = await SupportTicketService.resolveTicket(id, validated.resolution);
  return c.json(result);
});

app.post('/:id/close', async (c) => {
  const { id } = c.req.param();
  const result = await SupportTicketService.closeTicket(id);
  return c.json(result);
});

export const supportTicketsRouter = app;
