# HANDOFF - TaListoPro

> Última actualización: 27 de Febrero, 2026

## Contexto General

TaListoPro es una aplicación multi-tenant de gestión de talleres de servicio y manufactura ligera. Incluye gestión de clientes, activos (vehículos/equipos), órdenes de servicio, inventario, citas, gastos y facturación. La aplicación tiene dos interfaces: Desktop y Mobile, usando el mismo motor de datos.

---

## Goal

Desarrollar TaListoPro como una aplicación completa de gestión de talleres con:
- Gestión de clientes y activos
- Órdenes de servicio con workflow configurable
- Sistema de citas con integración WhatsApp
- Inventario y catálogo de servicios
- Sistema de notificaciones automatizado
- Módulo de gastos y facturación

---

## Instrucciones

- Usar `Estilos_y_Personalizacion.md` como referencia de estilo
- Seguir los patrones establecidos en componentes existentes
- El usuario es el único desarrollador - commits directos, sin branches
- Los bordes redondeados deben usar `rounded-2xl` consistentemente
- Las notificaciones WhatsApp se envían vía Evolution API
- El usuario prefiere implementación por componentes individuales
- Construir primero el backend/API antes del frontend
- Verificar builds con `npx vite build --mode development`
- **SEGURIDAD**: Siempre incluir `organizationId` en queries UPDATE/DELETE

---

## Discoveries

1. **Identidad Progresiva**: Las citas pueden crearse sin cliente registrado (tempClient, tempAsset). La limpieza de datos maestros ocurre en la conversión a orden.
2. **WhatsApp Integration**: Evolution API configurada por organización. Cada tenant tiene su instancia.
3. **Two-Interface Architecture**: Desktop y Mobile comparten backend pero tienen UI diferente. Mobile elimina bordes para parecer app nativa.
4. **Workflow Configurable**: Etapas configurables en GeneralSettings > Flujo de Trabajo. Cada etapa puede enviar notificación automática.
5. **Terminología Dinámica**: El sistema usa terminology basada en businessType (AUTOMOTIVE, MOTORCYCLE, APPLIANCE, OTHER) con personalización por tenant.
6. **Multi-Tenancy Seguro**: El `tenantGuard` valida membership activo antes de permitir acceso a recursos.

---

## Accomplished

### Febrero 2026

#### 🐛 Corrección Crítica del Servidor API - 27/02/2026

**Problema Identificado:**
El servidor API no mostraba el mensaje "Server is running on port 3000" debido a dos errores críticos en `api/src/index.ts`:

1. **Error de Sintaxis**: Línea 43 tenía `(c, => auth.handler(c.req.raw))` sin el parámetro `next`
2. **Regresión en Estructura**: El archivo `index.ts` (72 líneas) estaba incompleto comparado con `index_old.ts` (102 líneas)
   - Faltaban imports de todas las rutas tenant
   - No se registraban las rutas con `app.route()`
   - Documentación OpenAPI eliminada

**Correcciones Aplicadas:**

1. **Restaurar Imports de Rutas Tenant** (Líneas 7-26):
   ```typescript
   import { customers } from "./routes/customers";
   import { assets } from "./routes/assets";
   import { orders } from "./routes/orders";
   // ... etc (14 rutas en total)
   ```

2. **Corregir Error de Sintaxis** (Línea 58):
   ```typescript
   // ANTES: (c, => auth.handler(c.req.raw));
   // DESPUÉS: (c, next) => auth.handler(c.req.raw));
   ```

3. **Registrar Rutas con tenantGuard** (Líneas 60-103):
   ```typescript
   app.use("/api/customers", tenantGuard);
   app.use("/api/customers", (c, next) => customers.handler(c.req));
   
   app.use("/api/assets", tenantGuard);
   app.route("/api/assets", assets);
   
   // ... similar para todas las rutas tenant
   ```

4. **Restaurar Documentación OpenAPI** (Líneas 108-121):
   ```typescript
   app.doc('/doc', {
       openapi: '3.0.0',
       info: {
           version: '1.0.0',
           title: 'TaListoPro API',
           description: 'Gestión de talleres y servicios residenciales E2E Type-Safe API',
       },
   });

   app.get('/ui', apiReference({
       theme: 'mars',
       url: '/doc',
   }));
   ```

5. **Corregir Import de apiReference** (Línea 5):
   ```typescript
   // ANTES: from '@scalar/hono/zod-openapi';
   // DESPUÉS: from '@scalar/hono-api-reference';
   ```

**Rutas Restauradas y Funcionales:**
- ✅ `/api/customers` - Clientes
- ✅ `/api/assets` - Activos
- ✅ `/api/orders` - Órdenes de servicio
- ✅ `/api/inventory` - Inventario
- ✅ `/api/expenses` - Gastos
- ✅ `/api/settings` - Configuración
- ✅ `/api/workflow` - Flujo de trabajo
- ✅ `/api/members` - Miembros
- ✅ `/api/appointments` - Citas
- ✅ `/api/dashboard` - Métricas
- ✅ `/api/upload` - Archivos
- ✅ `/api/categories` - Categorías
- ✅ `/api/notifications` - Notificaciones
- ✅ `/api/payments` - Pagos
- ✅ `/api/invoices` - Facturas

**Verificación:**
- ✅ Servidor inicia correctamente
- ✅ Muestra "Server is running on port 3000"
- ✅ Endpoint `/` responde: "TaListoPro API is running! 🚀"
- ✅ Documentación OpenAPI disponible en `/doc`
- ✅ Rutas responden con códigos HTTP correctos (401 para rutas protegidas)

**Impacto:** Esta corrección reestableció completamente la funcionalidad del servidor API que fue perdida en el commit "feat(platform-admin): implement Phase 2 - Backend Services".

#### 🔒 Auditoría de Seguridad y Correcciones - 24/02/2026

Se realizó auditoría exhaustiva del sistema. Se identificaron y corrigieron vulnerabilidades críticas:

**1. Fugas de Datos entre Tenants (CRÍTICO) - CORREGIDO**
Archivos modificados:
- `api/src/routes/appointments.ts` - Cambiado `update()` a `updateMany()` con filtro `organizationId`
- `api/src/services/invoices.ts` - Queries UPDATE/DELETE con filtro compuesto
- `api/src/services/payments.ts` - Queries UPDATE/DELETE con filtro compuesto
- `api/src/services/orders.ts` - Queries `workflowStage.findUnique` a `findFirst` con filtro

Patrón aplicado:
```typescript
// ANTES (VULNERABLE)
await prisma.resource.update({
    where: { id },
    data: { ... }
});

// DESPUÉS (SEGURO)
await prisma.resource.updateMany({
    where: { id, organizationId },
    data: { ... }
});
```

**2. Validación de Membership Incompleta (ALTA) - CORREGIDO**
- `api/src/middleware/tenant.ts` ahora verifica que el usuario sea miembro activo
- Excluye rutas `/api/platform` del tenantGuard
- Guarda `memberRole` en contexto para autorización granular

**3. Credenciales Expuestas - GESTIONADO**
- Creado `.env.template` como guía de variables
- `.env` ya estaba en `.gitignore`
- **PENDIENTE**: Rotar credenciales expuestas (DATABASE_URL, BETTER_AUTH_SECRET)

**4. Código Residual Huérfano - CORREGIDO**
- `payments.ts` tenía código duplicado huérfano que causaba fallo de compilación
- `appointments.ts` usaba `update()` con `organizationId` en where (no válido en Prisma)
- `invoices.ts` intentaba obtener registro después de eliminarlo

#### Módulo de Citas (Appointments) - COMPLETADO

**Backend:**
- Schema Prisma actualizado con:
  - `customerId` y `assetId` opcionales (para identidad progresiva)
  - `tempClientName`, `tempClientPhone`, `tempAssetInfo` para clientes nuevos
  - `endTime` calculado automáticamente
  - `serviceOrderId` para vinculación con órdenes
  - Campos de recordatorio: `reminder24h`, `reminder1h`, `reminderSent24`, `reminderSent1h`
  - Campos de confirmación: `confirmationSent`, `confirmedAt`, `confirmedByReply`
- API routes en `api/src/routes/appointments.ts`:
  - GET `/` - Listar con filtros (start, end, status, customerId)
  - GET `/:id` - Obtener detalle
  - POST `/` - Crear con envío opcional de confirmación WhatsApp
  - PATCH `/:id` - Actualizar
  - POST `/:id/confirm` - Confirmar cita
  - POST `/:id/send-reminder` - Enviar recordatorio manual
  - DELETE `/:id` - Eliminar

**Frontend Desktop:**
- `AppointmentManager.tsx` - Wrapper que detecta mobile vs desktop
- `AppointmentManagerDesktop.tsx` - Vista con 3 modos (Día/Semana/Lista)
- `AppointmentForm.tsx` - Modal de creación/edición con:
  - Búsqueda de clientes existentes
  - Creación de cliente temporal (identidad progresiva)
  - Selección de activo del cliente o activo temporal
  - Configuración de recordatorios
- `MiniCalendar.tsx` - Calendario interactivo con indicadores de citas
- `AppointmentCard.tsx` - Tarjeta individual con estado y acciones
- Panel de detalle con acciones (confirmar, editar, eliminar, WhatsApp)

**Frontend Mobile:**
- `AppointmentManagerMobile.tsx` - UI optimizada para técnicos:
  - Tabs: Hoy | Semana | Todas
  - Tarjetas grandes con información completa
  - Botón WhatsApp prominente
  - Botón "Convertir a Orden" cuando aplica
  - Botón "Ver Orden" si ya tiene orden vinculada

#### ConvertToOrder Modal - COMPLETADO

**Componente:**
- `ConvertToOrderModal.tsx` - Modal para convertir cita a orden de servicio
- Flujo de 2 pasos:
  1. **Validación**: Muestra datos heredados de la cita
  2. **Enriquecimiento**: Permite completar/editar datos
- Búsqueda automática de cliente por teléfono
- Creación de cliente nuevo si no existe
- Creación de activo nuevo si no existe
- Asignación de prioridad y técnico
- Vinculación con orden creada (`serviceOrderId`)
- Redirección automática a la orden después de crear

---

## Relevant files / directories

### Backend (API)
```
api/src/
├── middleware/
│   └── tenant.ts              # tenantGuard con validación de membership
├── routes/
│   ├── orders/
│   │   ├── index.ts           # Rutas principales de órdenes
│   │   ├── get-detail.ts      # GET /:orderId
│   │   └── send-message.ts    # POST /:orderId/send-message
│   ├── appointments.ts        # CRUD + confirm + send-reminder (SEGURO)
│   ├── notifications.ts       # POST /whatsapp para clientes
│   └── assets.ts              # CRUD de activos
├── services/
│   ├── orders.ts              # Lógica + WhatsApp automático
│   ├── invoices.ts            # Facturación (SEGURO)
│   ├── payments.ts            # Pagos (SEGURO)
│   ├── appointments.ts        # Lógica de citas
│   └── whatsapp.ts            # Integración Evolution API
└── lib/
    ├── audit.ts               # Sistema de auditoría
    └── db.ts                  # Prisma client
```

### Frontend - Órdenes de Servicio
```
app/src/features/orders/
├── details/
│   ├── OrderDetailsContainer.tsx
│   ├── desktop/
│   │   └── OrderDetailsDesktop.tsx
│   ├── mobile/
│   │   └── OrderDetailsMobile.tsx
│   └── components/
│       ├── OrderHeader.tsx
│       ├── WhatsAppMessageModal.tsx
│       ├── ConfirmAdvanceStage.tsx
│       ├── DesktopChecklist.tsx
│       └── WorkflowStepper.tsx
└── components/
    └── desktop/
        └── OrderItemsTable.tsx
```

### Frontend - Citas
```
app/src/features/appointments/
├── AppointmentManager.tsx         # Wrapper (detecta mobile)
├── AppointmentManagerDesktop.tsx  # UI Desktop (Día/Semana/Lista)
├── AppointmentManagerMobile.tsx   # UI Mobile (Hoy/Semana/Todas)
└── components/
    ├── AppointmentForm.tsx
    ├── MiniCalendar.tsx
    ├── AppointmentCard.tsx
    └── ConvertToOrderModal.tsx
```

### Configuración y Estilos
```
├── Estilos_y_Personalizacion.md
├── .env.template               # Template de variables de entorno
├── app/src/config/navigation.tsx
├── app/src/hooks/useApi.ts
├── app/src/AuthenticatedApp.tsx
└── prisma/schema.prisma
```

---

## Next Steps

1. ~~ConvertToOrder Modal~~ - ✅ COMPLETADO

2. ~~Versión Mobile del módulo de Citas~~ - ✅ COMPLETADO

3. ~~Auditoría de Seguridad~~ - ✅ COMPLETADO (24/02/2026)

4. **Rotar Credenciales Expuestas** - PENDIENTE:
   - DATABASE_URL (Prisma Cloud)
   - BETTER_AUTH_SECRET
   - Evolution API credentials

5. **Cron Job / n8n** - Recordatorios automáticos:
   - Job diario para recordatorios 24h antes
   - Job cada 15min para recordatorios 1h antes
   - Actualizar `reminderSent24` y `reminderSent1h`

6. **Bot WhatsApp** - Detección automática de respuesta "CONFIRMAR":
   - Webhook recibe mensajes entrantes
   - Busca cita por teléfono del remitente
   - Si mensaje contiene "CONFIRMAR", marca como confirmada
   - Si no entiende, notifica al operador

7. **Tests de Seguridad Multi-Tenant**:
   - Implementar suite de tests E2E
   - Validar aislamiento entre tenants

---

## Technical Notes

### Seguridad Multi-Tenant (CRÍTICO)

**Regla de Oro**: Toda operación UPDATE/DELETE debe incluir `organizationId` en el filtro.

```typescript
// ✅ CORRECTO - updateMany/deleteMany con filtro compuesto
await prisma.resource.updateMany({
    where: { id, organizationId },
    data: { ... }
});

// ❌ INCORRECTO - update/delete solo por id
await prisma.resource.update({
    where: { id },  // Permite cross-tenant access!
    data: { ... }
});
```

**tenantGuard** (`api/src/middleware/tenant.ts`):
1. Verifica sesión válida
2. Valida `activeOrganizationId` presente
3. **Verifica membership activo** (consulta tabla Member)
4. Guarda `orgId`, `user`, `session`, `memberRole` en contexto
5. Excluye `/api/auth` y `/api/platform`

### Variables para mensajes WhatsApp
| Variable | Descripción | Ejemplo |
|:---------|:------------|:--------|
| `{cliente}` | Nombre del cliente | "Juan Pérez" |
| `{orden}` | Número de orden | "OS-2026-0015" |
| `{vehiculo}` | Info del activo | "Toyota Corolla 2020" |
| `{placa}` | Field4 del activo | "ABC-123J" |
| `{etapa}` | Nombre de la etapa | "Diagnosticando" |
| `{total}` | Total de la orden | "$150.00" |
| `{taller}` | Nombre de la organización | "AutoShop Pro" |

### Estados de Cita
| Estado | Color | Descripción |
|:-------|:------|:------------|
| SCHEDULED | Amarillo | Pendiente de confirmación |
| CONFIRMED | Verde | Cliente confirmó |
| IN_PROGRESS | Azul | En curso |
| COMPLETED | Gris | Finalizada |
| CANCELLED | Rojo | Cancelada |
| NO_SHOW | Gris | Cliente no asistió |

### Comandos Útiles
```bash
# Iniciar API
cd api && npm run dev

# Build frontend (dev)
cd app && npx vite build --mode development

# Push schema changes
npx prisma db push --accept-data-loss

# Generate Prisma client
npx prisma generate

# Type check API
cd api && npx tsc --noEmit
```

---

## Historial de Sesiones

| Fecha | Archivo | Descripción |
|:------|:--------|:------------|
| 23/02/2026 | HANDOFF_2026-02-23.md | Módulo de citas, convertToOrder, mejoras UI |
| 24/02/2026 | HANDOFF.md | Auditoría seguridad, correcciones críticas |
| 27/02/2026 | HANDOFF.md | **CRÍTICO**: Corrección servidor API - restauración de rutas tenant y documentación OpenAPI |
