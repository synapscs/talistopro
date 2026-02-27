# PLAN DE IMPLEMENTACIÓN - SaaS Platform-Admin

**Versión:** 1.0  
**Fecha:** 27 de Febrero, 2026  
**Estado:** Borrador para Revisión

---

## 📋 RESUMEN EJECUTIVO

Este plan detalla la implementación completa de la aplicación SaaS Administrativa (platform-admin) para TaListoPro. El desarrollo se dividirá en 3 fases principales con un total estimado de **6-9 semanas**.

### Objetivos de Alto Nivel

1. **Corrección de Autenticación Platform-Admin** - Implementar login/logout/me funcionales con JWT
2. **Servicios Backend de SUSCRIPCIÓN, FACTURACIÓN Y USO** - Gestión de planes, facturación mensual y tracking de uso
3. **Frontend Core Platform-Admin** - Dashboard principal y gestión de organizaciones

---

## 🎯 FASE 1: CORRECCIÓN AUTH (1-2 semanas)

### Estado Actual
- ✅ Archivos creados: `api/src/services/platform/auth.ts`, `api/src/middleware/platform-auth.ts`, `api/src/routes/platform/auth.ts`
- ✅ Rutas registradas en `api/src/index.ts`
- ⚠️ Faltan: Variables de entorno, tests, y frontend de autenticación

### Tareas de Backend

#### T1.1: Configurar Variables de Entorno
**Archivo:** `.env.template`

```bash
# Platform Admin Credentials
PLATFORM_ADMIN_EMAIL=admin@talisto.pro
PLATFORM_ADMIN_PASSWORD=changeme123

# JWT Secret (CHANGE IN PRODUCTION!)
PLATFORM_JWT_SECRET=change-me-to-secure-random-string-in-production

# Token Expiration (hours)
PLATFORM_TOKEN_EXPIRATION_HOURS=24
```

**Criterio de Aceptación:**
- [ ] `.env.template` actualizado con variables necesarias
- [ ] Documentación en HANDOFF.md sobre secretos en producción

---

#### T1.2: Crear Tests de Autenticación
**Archivo:** `api/src/_tests/platform/auth.test.ts`

```typescript
describe('Platform Auth Service', () => {
  test('debe generar y validar token correctamente', async () => {
    const payload = { email: 'admin@talisto.pro', sub: 'platform-admin' };
    const token = signToken({ ...payload, exp: Math.floor(Date.now() / 1000) + 3600 });
    const verified = verifyToken(token);
    expect(verified).not.toBeNull();
    expect(verified.email).toBe('admin@talisto.pro');
  });

  test('debe rechazar tokens expirados', () => {
    const token = signToken({ email: 'test', exp: Math.floor(Date.now() / 1000) - 3600 });
    expect(verifyToken(token)).toBeNull();
  });

  test('debe validar login válido', async () => {
    process.env.PLATFORM_ADMIN_EMAIL = 'admin@talisto.pro';
    process.env.PLATFORM_ADMIN_PASSWORD = 'test123';
    // Test login endpoint...
  });
});
```

**Criterio de Aceptación:**
- [ ] Tests unitarios pasan (signToken, verifyToken)
- [ ] Tests de integración pasan (login/me/logout)
- [ ] Cobertura > 80% en auth service

---

#### T1.3: Validar Endpoints de Auth
**Endpoints a probar:**

| Método | Ruta | Payload | Respuesta Esperada |
|:-------|:------|:---------|:-------------------|
| POST | `/api/platform/auth/login` | `{ email, password }` | `{ success: true, token, user }` |
| GET | `/api/platform/auth/me` | Authorization: Bearer <token> | `{ success: true, user }` |
| POST | `/api/platform/auth/logout` | - | `{ success: true }` |

**Casos de prueba:**
- ✅ Login con credenciales correctas
- ❌ Login con email incorrecto
- ❌ Login con password incorrecto
- ❌ Access a /me sin token
- ✅ Access a /me con token válido
- ❌ Access con token expirado
- ❌ Access con token manipulado

**Criterio de Aceptación:**
- [ ] Todos los casos de prueba pasan
- [ ] Documentación OpenAPI actualizada
- [ ] Código de estado correctos (200, 401, 403)

---

### Tareas de Frontend

#### T1.4: Crear Hook de Autenticación Platform
**Archivo:** `app/src/stores/usePlatformAuthStore.ts`

```typescript
import { create } from 'zustand';

interface PlatformAuthState {
  isAuthenticated: boolean;
  user: { email: string } | null;
  token: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  me: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const usePlatformAuthStore = create<PlatformAuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  token: null,

  login: async (email: string, password: string) => {
    const response = await fetch('/api/platform/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    if (!data.success) throw new Error(data.error);
    
    set({ 
      isAuthenticated: true, 
      user: data.user, 
      token: data.token 
    });
    
    // Guardar token en localStorage
    localStorage.setItem('platform_token', data.token);
  },

  logout: async () => {
    await fetch('/api/platform/auth/logout', { method: 'POST' });
    set({ isAuthenticated: false, user: null, token: null });
    localStorage.removeItem('platform_token');
  },

  me: async () => {
    const token = localStorage.getItem('platform_token');
    if (!token) return;
    
    const response = await fetch('/api/platform/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const data = await response.json();
    if (!data.success) {
      localStorage.removeItem('platform_token');
      set({ isAuthenticated: false, user: null, token: null });
      return;
    }
    
    set({ 
      isAuthenticated: true, 
      user: data.user, 
      token 
    });
  },

  initialize: async () => {
    await get().me();
  }
}));
```

**Criterio de Aceptación:**
- [ ] Store implementado con todas las acciones
- [ ] Token persiste en localStorage
- [ ] Validación expiración de token
- [ ] Tests unitarios del store

---

#### T1.5: Crear Página de Login Platform
**Archivo:** `app/src/features/platform/auth/PlatformLoginPage.tsx`

```typescript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatformAuthStore } from '../../../stores/usePlatformAuthStore';

export default function PlatformLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = usePlatformAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/platform/dashboard');
    } catch (err: any) {
      setError(err.message || 'Error en login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform Admin</h1>
          <p className="text-gray-600">TaListoPro SaaS Administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

**Criterio de Aceptación:**
- [ ] UI implementada con diseño responsive
- [ ] Validación de formularios
- [ ] Handling de errores
- [ ] Loading states
- [ ] Redirección al dashboard tras login exitoso

---

#### T1.6: Crear Protected Route
**Archivo:** `app/src/features/platform/auth/PlatformProtectedRoute.tsx`

```typescript
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlatformAuthStore } from '../../../stores/usePlatformAuthStore';

interface Props {
  children: React.ReactNode;
}

export default function PlatformProtectedRoute({ children }: Props) {
  const { isAuthenticated, initialize } = usePlatformAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/platform/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
```

**Criterio de Aceptación:**
- [ ] Validación de autenticación
- [ ] Redirección a login si no autenticado
- [ ] Carga de sesión desde localStorage

---

#### T1.7: Registrar Rutas en el Router
**Archivo:** `app/src/config/navigation.tsx`

```typescript
// Agregar rutas de platform admin
{
  path: '/platform/login',
  element: <PlatformLoginPage />,
},
{
  path: '/platform',
  element: <PlatformProtectedRoute />,
  children: [
    {
      path: 'dashboard',
      element: <PlatformDashboard />,
    },
    // ... más rutas de platform
  ],
}
```

**Criterio de Aceptación:**
- [ ] Rutas registradas en el router
- [ ] Rutas protegidas con PlatformProtectedRoute
- [ ] Ruta de login accesible sin autenticación

---

### Entregables Fase 1

| Entregable | Ubicación | Estado |
|:-----------|:---------|:--------|
| Backend Auth Service | `api/src/services/platform/auth.ts` | ✅ Hecho |
| Backend Auth Middleware | `api/src/middleware/platform-auth.ts` | ✅ Hecho |
| Backend Auth Routes | `api/src/routes/platform/auth.ts` | ✅ Hecho |
| Variables de Entorno | `.env.template` | ⏳ Pendiente |
| Tests de Auth | `api/src/_tests/platform/auth.test.ts` | ⏳ Pendiente |
| Frontend Auth Store | `app/src/stores/usePlatformAuthStore.ts` | ⏳ Pendiente |
| Login Page | `app/src/features/platform/auth/PlatformLoginPage.tsx` | ⏳ Pendiente |
| Protected Route | `app/src/features/platform/auth/PlatformProtectedRoute.tsx` | ⏳ Pendiente |
| Router Configuration | `app/src/config/navigation.tsx` | ⏳ Pendiente |

---

## 🎯 FASE 2: SERVICIOS BACKEND (2-3 semanas)

### 2.1 Servicio de Suscripciones

**Archivo:** `api/src/services/platform/subscriptions.ts`

```typescript
import { prisma } from '../../lib/db';
import { HTTPException } from 'hono/http-exception';

export const PlatformSubscriptionService = {
  /**
   * Asignar un plan a una organización
   */
  async assignPlan(
    organizationId: string, 
    planId: string
  ) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { plan: true }
    });

    if (!org) {
      throw new HTTPException(404, { message: 'Organización no encontrada' });
    }

    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      throw new HTTPException(404, { message: 'Plan no encontrado' });
    }

    // Actualizar organización con el plan
    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        planId,
        subscriptionStatus: 'active',
        trialEndsAt: null
      },
      include: { plan: true }
    });

    return updated;
  },

  /**
   * Cambiar el plan de una organización
   */
  async changePlan(
    organizationId: string, 
    newPlanId: string
  ) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    if (!org) {
      throw new HTTPException(404, { message: 'Organización no encontrada' });
    }

    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        planId: newPlanId,
        subscriptionStatus: 'active'
      },
      include: { plan: true }
    });

    return updated;
  },

  /**
   * Cancelar suscripción
   */
  async cancelSubscription(
    organizationId: string,
    reason?: string
  ) {
    const updated = await prisma.organization.update({
      where: { id: organizationId },
      data: {
        subscriptionStatus: 'cancelled'
      }
    });

    return {
      success: true,
      organizationId,
      subscriptionStatus: 'cancelled',
      reason
    };
  },

  /**
   * Obtener suscripción de una organización
   */
  async getSubscription(organizationId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        plan: true,
        settings: true
      }
    });

    if (!org) {
      throw new HTTPException(404, { message: 'Organización no encontrada' });
    }

    return {
      organizationId: org.id,
      name: org.name,
      plan: org.plan,
      subscriptionStatus: org.subscriptionStatus,
      trialEndsAt: org.trialEndsAt,
      createdAt: org.createdAt
    };
  },

  /**
   * Validar límites del plan
   */
  async validateLimits(organizationId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { plan: true }
    });

    if (!org || !org.plan) {
      throw new HTTPException(404, { message: 'Organización o plan no encontrado' });
    }

    // Contar miembros
    const memberCount = await prisma.member.count({
      where: { organizationId }
    });

    // Contar órdenes este mes
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const orderCount = await prisma.serviceOrder.count({
      where: {
        organizationId,
        createdAt: { gte: monthStart }
      }
    });

    const limits = {
      maxMembers: org.plan.maxMembers,
      maxOrdersPerMonth: org.plan.maxOrdersPerMonth,
      maxPhotosPerOrder: org.plan.maxPhotosPerOrder
    };

    const usage = {
      members: memberCount,
      ordersThisMonth: orderCount,
      photosPerOrder: 0 // Implementar según necesidad
    };

    const violations: string[] = [];

    if (usage.members > limits.maxMembers) {
      violations.push(`Excedido límite de miembros (${usage.members}/${limits.maxMembers})`);
    }

    if (usage.ordersThisMonth > limits.maxOrdersPerMonth) {
      violations.push(`Excedido límite de órdenes mensuales (${usage.ordersThisMonth}/${limits.maxOrdersPerMonth})`);
    }

    return {
      isValid: violations.length === 0,
      limits,
      usage,
      violations
    };
  }
};
```

**Endpoints a crear:**
- `POST /api/platform/subscriptions/:orgId/assign` - Asignar plan
- `PUT /api/platform/subscriptions/:orgId/change-plan` - Cambiar plan
- `DELETE /api/platform/subscriptions/:orgId/cancel` - Cancelar suscripción
- `GET /api/platform/subscriptions/:orgId` - Obtener suscripción
- `GET /api/platform/subscriptions/:orgId/validate` - Validar límites

**Criterio de Aceptación:**
- [ ] Servicio implementado con todos los métodos
- [ ] Endpoints RESTful creados
- [ ] Tests de servicios (unitarios)
- [ ] Tests de integración (end-to-end)
- [ ] Documentación OpenAPI

---

### 2.2 Servicio de Usage Tracking

**Archivo:** `api/src/services/platform/usage.ts`

```typescript
import { prisma } from '../../lib/db';

export const PlatformUsageService = {
  /**
   * Registrar creación de orden (evento de uso)
   */
  async trackOrderCreation(organizationId: string) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Buscar o crear UsageLog para este mes
    const existing = await prisma.usageLog.findFirst({
      where: {
        organizationId,
        metric: 'orders_count',
        periodStart: monthStart,
        periodEnd: monthEnd
      }
    });

    if (existing) {
      await prisma.usageLog.update({
        where: { id: existing.id },
        data: { value: existing.value + 1 }
      });
    } else {
      await prisma.usageLog.create({
        data: {
          organizationId,
          metric: 'orders_count',
          value: 1,
          periodStart: monthStart,
          periodEnd: monthEnd
        }
      });
    }

    // Verificar límites
    await this.checkLimitsAndNotify(organizationId);
  },

  /**
   * Obtener uso mensual
   */
  async getMonthlyUsage(
    organizationId: string, 
    month: number, 
    year: number
  ) {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 1);

    const logs = await prisma.usageLog.findMany({
      where: {
        organizationId,
        periodStart: monthStart,
        periodEnd: monthEnd
      }
    });

    return logs.reduce((acc, log) => ({
      ...acc,
      [log.metric]: log.value
    }), {} as Record<string, number>);
  },

  /**
   * Verificar límites y notificar
   */
  async checkLimitsAndNotify(organizationId: string) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { plan: true }
    });

    if (!org || !org.plan) return;

    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const monthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

    const orderCount = await prisma.usageLog.findFirst({
      where: {
        organizationId,
        metric: 'orders_count',
        periodStart: monthStart,
        periodEnd: monthEnd
      }
    });

    const currentOrders = orderCount?.value || 0;
    const limit = org.plan.maxOrdersPerMonth;
    const percentage = (currentOrders / limit) * 100;

    // Niveles de alerta
    if (percentage >= 100) {
      // Límite excedido - suspender
      await prisma.organization.update({
        where: { id: organizationId },
        data: { subscriptionStatus: 'suspended' }
      });
    } else if (percentage >= 90) {
      // Alerta crítica
      await this.sendAlert(
        organizationId, 
        `'URGENTE: Has usado el ${percentage.toFixed(1)}% de tu límite mensual (${currentOrders}/${limit} órdenes)`
      );
    } else if (percentage >= 75) {
      // Alerta alta
      await this.sendAlert(
        organizationId,
        `ALERTA: Has usado el ${percentage.toFixed(1)}% de tu límite mensual (${currentOrders}/${limit} órdenes)`
      );
    }
  },

  /**
   * Enviar alerta (TODO: integrar con sistema de notificaciones)
   */
  async sendAlert(
    organizationId: string, 
    message: string
  ) {
    // Implementar envío de alerta por email/in-app notification
    console.log(`[ALERT ${organizationId}] ${message}`);
  }
};
```

**Criterio de Aceptación:**
- [ ] Servicio de tracking implementado
- [ ] Integración con endpoints de órdenes (hook en create)
- [ ] Sistema de alertas funcional
- [ ] Tests de tracking

---

### 2.3 Servicio de Billing

**Archivo:** `api/src/services/platform/billing.ts`

```typescript
import { prisma } from '../../lib/db';
import { HTTPException } from 'hono/http-exception';

export const PlatformBillingService = {
  /**
   * Generar factura mensual para una organización
   */
  async generateMonthlyInvoice(organizationId: string, period: { start: Date, end: Date }) {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: { plan: true }
    });

    if (!org || !org.plan) {
      throw new HTTPException(404, { message: 'Organización o plan no encontrado' });
    }

    // Verificar que el plan tenga precio mensual
    const monthlyPrice = Number(org.plan.monthlyPrice);
    
    // Generar número de factura
    const year = period.start.getFullYear();
    const month = String(period.start.getMonth() + 1).padStart(2, '0');
    const invoiceNumber = `SAAS-${year}${month}-${org.id.substring(0, 4).toUpperCase()}`;

    // Calcular totales
    const subtotal = monthlyPrice;
    const taxRate = 0.16; // 16% IVA
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    // Crear factura
    const invoice = await prisma.platformInvoice.create({
      data: {
        invoiceNumber,
        subscriptionId: org.id,
        monthlyFee: monthlyPrice,
        activationFee: Number(org.plan.activationFee || 0),
        taxAmount,
        total,
        currency: 'USD',
        periodStart: period.start,
        periodEnd: period.end,
        dueDate: new Date(period.end.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 días después
      }
    });

    return invoice;
  },

  /**
   * Obtener todas las facturas
   */
  async getAllInvoices(filters?: {
    status?: string;
    organizationId?: string;
    page?: number;
    limit?: number;
  }) {
    const where: any = {};
    
    if (filters?.status) {
      where.status = filters.status;
    }
    
    if (filters?.organizationId) {
      where.subscriptionId = filters.organizationId;
    }

    const skip = filters?.page && filters?.limit ? (filters.page - 1) * filters.limit : 0;
    const take = filters?.limit || 50;

    const [invoices, total] = await Promise.all([
      prisma.platformInvoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.platformInvoice.count({ where })
    ]);

    return {
      data: invoices,
      total,
      page: filters?.page || 1,
      limit: filters?.limit || 50
    };
  },

  /**
   * Marcar factura como pagada
   */
  async markInvoicePaid(invoiceId: string) {
    return await prisma.platformInvoice.update({
      where: { id: invoiceId },
      data: {
        status: 'paid',
        paidAt: new Date()
      }
    });
  }
};
```

**Endpoints a crear:**
- `POST /api/platform/billing/invoices/:orgId` - Generar factura
- `GET /api/platform/billing/invoices` - Listar facturas
- `GET /api/platform/billing/invoices/:id` - Ver detalle
- `POST /api/platform/billing/invoices/:id/pay` - Marcar como pagada

**Criterio de Aceptación:**
- [ ] Servicio de facturación implementado
- [ ] Cálculos de totales correctos (subtotal, tax, total)
- [ ] Números de factura generados correctamente
- [ ] Tests de billing

---

### 2.4 Job Scheduler para Tracking

**Archivo:** `api/src/jobs/usage-tracker.ts`

```typescript
import cron from 'node-cron';
import { prisma } from '../lib/db';
import { PlatformUsageService } from '../services/platform/usage';

// Programar tarea diaria a medianoche
export function startUsageTrackingJob() {
  // Ejecutar todos los días a las 00:00 para actualizar logs de uso
  cron.schedule('0 0 * * *', async () => {
    console.log('[Usage Tracker] Processing daily usage updates...');
    
    try {
      // Obtener todas las organizaciones activas
      const organizations = await prisma.organization.findMany({
        where: {
          subscriptionStatus: 'active' || 'trial'
        },
        include: {
          plan: true
        }
      });

      for (const org of organizations) {
        // Verificar y actualizar límites
        await PlatformUsageService.checkLimitsAndNotify(org.id);
      }

      console.log('[Usage Tracker] Completed daily update');
    } catch (error) {
      console.error('[Usage Tracker] Error:', error);
    }
  });

  console.log('[Usage Tracker] Daily job scheduled at 00:00');
}

// Exportar función para testing
export async function triggerManualUsageCheck(orgId: string) {
  await PlatformUsageService.checkLimitsAndNotify(orgId);
}
```

**Criterio de Aceptación:**
- [ ] Job scheduler configurado
- [ ] Ejecución manual (para testing)
- [ ] Logs de ejecución

---

### 2.5 Integrar Rutas en Main Router

**Archivo:** `api/src/routes/platform/subscriptions.ts`

```typescript
import { OpenAPIHono, z } from '@hono/zod-openapi';
import { PlatformSubscriptionService } from '../../services/platform/subscriptions';
import { platformAuthGuard } from '../../middleware/platform-auth';

const app = new OpenAPIHono();
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

app.get('/:orgId', async (c) => {
  const { orgId } = c.req.param();
  const result = await PlatformSubscriptionService.getSubscription(orgId);
  return c.json(result);
});

export { app as platformSubscriptionsRouter };
```

**Archivo:** `api/src/routes/platform/billing.ts`

```typescript
import { OpenAPIHono } from '@hono/zod-openapi';
import { PlatformBillingService } from '../../services/platform/billing';
import { platformAuthGuard } from '../../middleware/platform-auth';

const app = new OpenAPIHono();
app.use('/*', platformAuthGuard);

app.post('/invoices/:orgId', async (c) => {
  const { orgId } = c.req.param();
  const { year, month } = await c.req.json();
  const result = await PlatformBillingService.generateMonthlyInvoice(
    orgId, 
    {
      start: new Date(year, month, 1),
      end: new Date(year, month + 1, 1)
    }
  );
  return c.json(result);
});

export { app as platformBillingRouter };
```

**Archivo:** `api/src/index.ts` - Actualizar

```typescript
import { platformSubscriptionsRouter } from './routes/platform/subscriptions';
import { platformBillingRouter } from './routes/platform/billing';

// Agregar rutas
app.route('/api/platform/subscriptions', platformSubscriptionsRouter);
app.route('/api/platform/billing', platformBillingRouter);
```

---

### Entregables Fase 2

| Componente | Ubicación | Estado |
|:-----------|:---------|:--------|
| Subscription Service | `api/src/services/platform/subscriptions.ts` | ⏳ Pendiente |
| Usage Service | `api/src/services/platform/usage.ts` | ⏳ Pendiente |
| Billing Service | `api/src/services/platform/billing.ts` | ⏳ Pendiente |
| Subscription Routes | `api/src/routes/platform/subscriptions.ts` | ⏳ Pendiente |
| Billing Routes | `api/src/routes/platform/billing.ts` | ⏳ Pendiente |
| Usage Tracker Job | `api/src/jobs/usage-tracker.ts` | ⏳ Pendiente |
| Tests | `api/src/_tests/platform/*.test.ts` | ⏳ Pendiente |
| Router Updates | `api/src/index.ts` | ⏳ Pendiente |

---

## 🎯 FASE 3: FRONTEND CORE (3-4 semanas)

### 3.1 Estructura de Directorios

```
app/src/features/platform/
├── auth/
│   ├── PlatformLoginPage.tsx
│   ├── PlatformProtectedRoute.tsx
│   └── index.ts
├── layout/
│   ├── PlatformLayout.tsx
│   ├── PlatformSidebar.tsx
│   └── PlatformHeader.tsx
├── dashboard/
│   ├── PlatformDashboard.tsx
│   ├── DashboardStats.tsx
│   └── charts/
│       ├── RevenueChart.tsx
│       └── OrganizationsGrowthChart.tsx
├── organizations/
│   ├── OrganizationsList.tsx
│   ├── OrganizationDetail.tsx
│   ├── OrganizationStats.tsx
│   └── components/
│       ├── OrganizationCard.tsx
│       └── OrganizationFilters.tsx
└── shared/
    ├── LoadingSpinner.tsx
    └── EmptyState.tsx
```

---

### 3.2 Layout Platform-Admin

**Archivo:** `app/src/features/platform/layout/PlatformLayout.tsx`

```typescript
import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import PlatformSidebar from './PlatformSidebar';
import PlatformHeader from './PlatformHeader';

export default function PlatformLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <PlatformSidebar />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <PlatformHeader />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

**Archivo:** `app/src/features/platform/layout/PlatformSidebar.tsx`

```typescript
import { NavLink } from 'react-router-dom';

export default function PlatformSidebar() {
  const menuItems = [
    {
      path: '/platform/dashboard',
      icon: '📊',
      label: 'Dashboard'
    },
    {
      path: '/platform/organizations',
      icon: '🏢',
      label: 'Organizaciones'
    },
    {
      path: '/platform/subscriptions',
      icon: '💳',
      label: 'Suscripciones'
    },
    {
      path: '/platform/billing',
      icon: '📄',
      label: 'Facturación'
    }
  ];

  return (
    <div className="w-64 bg-indigo-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-indigo-800">
        <h1 className="text-xl font-bold">Platform Admin</h1>
        <p className="text-indigo-300 text-sm">TaListoPro SaaS</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-indigo-800 text-white'
                  : 'text-indigo-300 hover:bg-indigo-800'
              }`
            }
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-indigo-800">
        <div className="text-sm text-indigo-300">
          <div className="font-medium">Admin User</div>
          <div className="text-xs">admin@talisto.pro</div>
        </div>
      </div>
    </div>
  );
}
```

**Archivo:** `app/src/features/platform/layout/PlatformHeader.tsx`

```typescript
import { useNavigate } from 'react-router-dom';
import { usePlatformAuthStore } from '../../stores/usePlatformAuthStore';

export default function PlatformHeader() {
  const { logout, user } = usePlatformAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/platform/login');
  };

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Platform Dashboard</h2>
          <p className="text-sm text-gray-600">Bienvenido, {user?.email}</p>
        </div>

        <button
          onClick={handleLogout}
          className="text-gray-600 hover:text-gray-900"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
```

---

### 3.3 Dashboard Principal

**Archivo:** `app/src/features/platform/dashboard/PlatformDashboard.tsx`

```typescript
import { useEffect, useState } from 'react';

export default function PlatformDashboard() {
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    activeSubscriptions: 0,
    trialSubscriptions: 0,
    monthlyRevenue: 0
  });

  useEffect(() => {
    // Cargar estadísticas
    loadStats();
  }, []);

  const loadStats = async () => {
    const response = await fetch('/api/platform/organizations?limit=1000');
    const data = await response.json();
    
    setStats({
      totalOrganizations: data.total,
      activeSubscriptions: data.data.filter((org: any) => org.subscriptionStatus === 'active').length,
      trialSubscriptions: data.data.filter((org: any) => org.subscriptionStatus === 'trial').length,
      monthlyRevenue: data.data.reduce((sum: number, org: any) => {
        return sum + Number(org.plan?.monthlyPrice || 0);
      }, 0)
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Resumen general del SaaS</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Organizaciones Totales"
          value={stats.totalOrganizations}
          icon="🏢"
          color="indigo"
        />
        <DashboardCard
          title="Suscripciones Activas"
          value={stats.activeSubscriptions}
          icon="✅"
          color="green"
        />
        <DashboardCard
          title="En Trial"
          value={stats.trialSubscriptions}
          icon="🔶"
          color="orange"
        />
        <DashboardCard
          title="Ingresos Mensuales"
          value={`$${stats.monthlyRevenue.toFixed(2)}`}
          icon="💰"
          color="purple"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Actividad Reciente</h2>
        <p className="text-gray-600 text-sm">
          Últimas organizaciones creadas...
        </p>
      </div>
    </div>
  );
}

function DashboardCard({ title, value, icon, color }: any) {
  const colorClasses = {
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500'
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${colorClasses[color as keyof typeof colorClasses]} flex items-center justify-center text-white text-2xl`}>
          {icon}
        </div>
      </div>
      <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
    </div>
  );
}
```

---

### 3.4 Lista de Organizaciones

**Archivo:** `app/src/features/platform/organizations/OrganizationsList.tsx`

```typescript
import { useState, useEffect } from 'react';

export default function OrganizationsList() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    plan: ''
  });

  useEffect(() => {
    loadOrganizations();
  }, [filters]);

  const loadOrganizations = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status) params.set('status', filters.status);
    if (filters.plan) params.set('plan', filters.plan);

    const response = await fetch(`/api/platform/organizations?${params}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('platform_token')}`
      }
    });
    
    const data = await response.json();
    setOrganizations(data.data || []);
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Organizaciones</h1>
        <p className="text-gray-600">Gestión de organizaciones del SaaS</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl"
            placeholder="Nombre o slug..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl"
            >
              <option value="">Todos</option>
              <option value="trial">Trial</option>
              <option value="active">Activas</option>
              <option value="suspended">Suspendidas</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Plan</label>
            <select
              value={filters.plan}
              onChange={(e) => setFilters({ ...filters, plan: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl"
            >
              <option value="">Todos</option>
              <option value="Basic">Básico</option>
              <option value="Pro">Pro</option>
              <option value="Elite">Elite</option>
            </select>
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando organizaciones...</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Plan</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Miembros</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Órdenes</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {organizations.map((org: any) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">{org.name}</div>
                      <div className="text-sm text-gray-500">{org.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                      {org.plan?.name || 'Sin plan'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={org.subscriptionStatus} />
                  </td>
                  <td className="px-6 py-4 text-gray-900">{org.memberCount || 0}</td>
                  <td className="px-6 py-4 text-gray-900">{org.stats?.orders || 0}</td>
                  <td className="px-6 py-4">
                    <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {organizations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No hay organizaciones</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    trial: 'bg-orange-100 text-orange-800',
    active: 'bg-green-100 text-green-800',
    suspended: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
      colors[status] || 'bg-gray-100 text-gray-800'
    }`}>
      {status || 'N/A'}
    </span>
  );
}
```

---

### 3.5 Actualizar Router

**Archivo:** `app/src/config/navigation.tsx` - Actualizar

```typescript
// Agregar rutas de platform
{
  path: '/platform',
  element: <PlatformProtectedRoute />,
  children: [
    {
      element: <Layout />,
      children: [
        {
          path: 'dashboard',
          element: <PlatformDashboard />
        },
        {
          path: 'organizations',
          element: <OrganizationsList />
        }
      ]
    }
  ]
}
```

---

### Entregables Fase 3

| Componente | Ubicación | Estado |
|:-----------|:---------|:--------|
| Platform Layout | `app/src/features/platform/layout/` | ⏳ Pendiente |
| Platform Dashboard | `app/src/features/platform/dashboard/` | ⏳ Pendiente |
| Organizations List | `app/src/features/platform/organizations/` | ⏳ Pendiente |
| Router Updates | `app/src/config/navigation.tsx` | ⏳ Pendiente |
| Tests End-to-End | `app/src/_tests/platform/` | ⏳ Pendiente |

---

## 📊 RESUMEN DE ENTREGABLES

| Fase | Duración | Componentes | Estimación de Tareas |
|:------|:---------|:------------|:-------------:|:|
| 1. Auth | 1-2 sem | 9 componentes (backend + frontend) | ~15 tareas |
| 2. Backend Services | 2-3 sem | 6 servicios + routers | ~20 tareas |
| 3. Frontend Core | 3-4 sem | Estructura + Dashboard + Organizations | ~25 tareas |
| **TOTAL** | **6-9 sem** | **~60 tareas** | **~12 días de desarrollo** |

---

## 🔧 PRE-REQUISITOS

### Backend
- [ ] Node.js 18+ 
- [ ] PostgreSQL 14+
- [ ] Prisma Client actualizado
- [ ] Variables de entorno configuradas

### Frontend  
- [ ] React 19
- [ ] Vite
- [ ] Zustand (para stores)
- [ ] React Router v6+
- [ ] TanStack Query o axios (opcional para API calls)

### DevOps
- [ ] node-cron para jobs
- [ ] Tests: Vitest/Jest para backend, RTL/Testing Library para frontend

---

## 🚨 RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|:-------|:-------------|:---------|:-----------|
| Cambio de scope | Alta | Alto | MVP claro, iteraciones posteriores |
| JWT simple no es producción | Media | Alto | Plan de migración a library de JWT real |
| Performance con muchas orgs | Baja | Medio | Pagination, caching en queries |
| Frontend scope creep | Alta | Medio | Design system definido, componentes reusables |

---

## ✅ CRITERIOS DE ACEPTACIÓN POR FASE

### Fase 1 - Auth
- [ ] Login/logout/me funcionales y testeados
- [ ] Token JWT funciona y expira correctamente
- [ ] Store de frontend persiste sesión
- [ ] Login page funcional con diseño responsive
- [ ] Protected routes redirigen a login

### Fase 2 - Backend Services
- [ ] Subscriptions: assign, change, cancel, get, validate
- [ ] Usage: tracking, alerts, monthly stats
- [ ] Billing: generate invoice, list, mark paid
- [ ] Job scheduler ejecuta tracking diario
- [ ] Todos los tests pasan

### Fase 3 - Frontend Core
- [ ] Layout platform-admin implementado
- [ ] Dashboard con stats cards básicos
- [ ] Organizations list con filtros functional
- [ ] Navegación entre rutas funciona
- [ ] Tests E2E básicos (login → dashboard → orgs)

---

## 📅 CRONOGRAMA SUGERIDO

**Semana 1-2: Fase 1 - Auth**
- Día 1-2: Variables de entorno + tests auth
- Día 3-4: Frontend auth store + login page
- Día 5: Protected routes + router config
- Día 6-7: Testing y debugging

**Semana 3-5: Fase 2 - Backend Services**
- Semana 3: Subscriptions Service + Routes
- Semana 4: Usage + Billing Services  
- Semana 5: Job Scheduler + Integration + Testing

**Semana 6-9: Fase 3 - Frontend Core**
- Semana 6: Layout + Dashboard
- Semana 7: Organizations List
- Semana 8: Organization Detail + Subscriptions
- Semana 9: Integration + Testing + Polish

---

## 📝 NOTAS FINALES

1. Este plan es un **MVP** funcional; iteraciones futuras pueden agregar:
   - Reports avanzados
   - Integración con pasarela de pagos (Stripe)
   - Notifications en tiempo real
   - Analytics avanzados

2. **Secret Management**: El JWT simple es solo para desarrollo/MVP. Para producción:
   - Usar `jsonwebtoken` library
   - Almacenar secret en Secrets Manager
   - Rotar secretos periódicamente

3. **Frontend Architecture**: El plan usa Zustand para state management por simplicidad. Para apps más grandes, considera:
   - React Query para datos
   - Context API para theming
   - Zustand solo para auth state

---

**Estado del Plan:** 📝 Borrador para Revisión y Aprobación

**Siguiente Paso después de Aprobación:**
1. Comenzar con Fase 1 - Corrección Auth
2. Crear backlog detallado de tickets
3. Configurar CI/CD para automated tests

---

¿Listo para revisar y aprobar?