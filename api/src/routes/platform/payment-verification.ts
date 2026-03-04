import { OpenAPIHono, z } from '@hono/zod-openapi';
import { PaymentVerificationService } from '../../services/platform/payment-verification';
import { platformAuthGuard } from '../../middleware/platform-auth';
import type { AppEnv } from '../../types/env';

const app = new OpenAPIHono<AppEnv>();
app.use('/*', platformAuthGuard);

const submitPaymentSchema = z.object({
  platformInvoiceId: z.string(),
  paymentMethod: z.enum(['transfer', 'zelle', 'cash', 'card', 'mobile_payment']),
  amount: z.number().positive(),
  currency: z.enum(['USD', 'VES', 'COP', 'MXN']),
  exchangeRate: z.number().optional(),
  referenceNumber: z.string().optional(),
  receiptUrl: z.string().optional(),
  notes: z.string().optional()
});

const verifyPaymentSchema = z.object({
  notes: z.string().optional()
});

const rejectPaymentSchema = z.object({
  rejectionReason: z.string().min(1, 'La razón de rechazo es requerida')
});

app.post('/submit', async (c) => {
  const body = await c.req.json();
  const validated = submitPaymentSchema.parse(body);
  
  const result = await PaymentVerificationService.submitPayment(validated);
  return c.json(result, 201);
});

app.get('/', async (c) => {
  const { status, platformInvoiceId, page, limit } = c.req.query();
  
  const result = await PaymentVerificationService.getAllVerifications({
    status,
    platformInvoiceId,
    page: page ? parseInt(page) : undefined,
    limit: limit ? parseInt(limit) : undefined
  });
  return c.json(result);
});

app.get('/pending/count', async (c) => {
  const count = await PaymentVerificationService.getPendingCount();
  return c.json({ count });
});

app.get('/:id', async (c) => {
  const { id } = c.req.param();
  const result = await PaymentVerificationService.getVerificationById(id);
  return c.json(result);
});

app.post('/:id/verify', async (c) => {
  const { id } = c.req.param();
  const adminId = c.get('platformAdminId');
  
  if (!adminId) {
    return c.json({ error: 'No autorizado' }, 401);
  }

  const body = await c.req.json();
  const validated = verifyPaymentSchema.parse(body);
  
  const result = await PaymentVerificationService.verifyPayment(
    id, 
    adminId,
    validated.notes
  );
  return c.json(result);
});

app.post('/:id/reject', async (c) => {
  const { id } = c.req.param();
  const adminId = c.get('platformAdminId');
  
  if (!adminId) {
    return c.json({ error: 'No autorizado' }, 401);
  }

  const body = await c.req.json();
  const validated = rejectPaymentSchema.parse(body);
  
  const result = await PaymentVerificationService.rejectPayment(
    id, 
    adminId,
    validated.rejectionReason
  );
  return c.json(result);
});

app.get('/invoice/:invoiceId', async (c) => {
  const { invoiceId } = c.req.param();
  const result = await PaymentVerificationService.getByInvoiceId(invoiceId);
  return c.json(result);
});

export const paymentVerificationRouter = app;
