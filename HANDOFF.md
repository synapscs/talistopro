# HANDOFF - TaListoPro

> Última actualización: 23 de Febrero, 2026

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

---

## Discoveries

1. **Identidad Progresiva**: Las citas pueden crearse sin cliente registrado (tempClient, tempAsset). La limpieza de datos maestros ocurre en la conversión a orden.
2. **WhatsApp Integration**: Evolution API configurada por organización. Cada tenant tiene su instancia.
3. **Two-Interface Architecture**: Desktop y Mobile comparten backend pero tienen UI diferente. Mobile elimina bordes para parecer app nativa.
4. **Workflow Configurable**: Etapas configurables en GeneralSettings > Flujo de Trabajo. Cada etapa puede enviar notificación automática.
5. **Terminología Dinámica**: El sistema usa terminology basada en businessType (AUTOMOTIVE, MOTORCYCLE, APPLIANCE, OTHER) con personalización por tenant.

---

## Accomplished

### Febrero 2026

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

**Integración:**
- Botón prominente en panel de detalle de cita
- Solo visible si la cita no tiene orden vinculada
- Si ya tiene orden, muestra botón "Ver Orden" que navega al detalle

#### Mejoras de UI/UX

- Bordes redondeados unificados a `rounded-2xl` en todos los componentes de órdenes
- Checklist rediseñado (`DesktopChecklist.tsx`, `MobileChecklist.tsx`):
  - 4 estados con iconos y texto: Bien, Regular, Mal, N/A
  - Notas/observaciones por ítem cuando estado es Mal o Regular
  - Solo editable en etapa inicial (`isInitial=true`)
- Sidebar mantiene "Órdenes de Servicio" activo al ver detalle de orden
- Corregido error USDNaN en tabla de items (usa `item.unitPrice || item.price`)

#### Módulo de Activos (Assets)

- `AssetsPage.tsx` - Listado con filtro por cliente (dropdown)
- `AssetDetail.tsx` - Formulario de edición (sin campo cliente, sin asset_id)
- Campo `nextAppointmentNote` añadido al schema
- Hook `useAssets(customerName?, customerId?)` corregido para filtrar correctamente
- Integración con módulo de citas (actualiza `nextAppointmentAt` del asset)

#### Panel de Detalles del Cliente

- Eliminado botón "Llamar"
- Botón WhatsApp abre `CustomerWhatsAppModal.tsx` (usa Evolution API, no link externo)
- Assets del cliente visibles en el panel con opción de editar
- Corregido `useAssets(undefined, customer.id)` para filtrar por customerId

---

## Relevant files / directories

### Backend (API)
```
api/src/
├── routes/
│   ├── orders/
│   │   ├── index.ts          # Rutas principales de órdenes
│   │   ├── get-detail.ts     # GET /:orderId
│   │   └── send-message.ts   # POST /:orderId/send-message
│   ├── appointments.ts       # CRUD + confirm + send-reminder
│   ├── notifications.ts      # POST /whatsapp para clientes
│   └── assets.ts             # CRUD de activos
├── services/
│   ├── orders.ts             # Lógica + WhatsApp automático en avance
│   ├── appointments.ts       # Lógica de citas
│   └── whatsapp.ts           # Integración Evolution API
└── lib/
    ├── audit.ts              # Sistema de auditoría
    └── db.ts                 # Prisma client
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

### Frontend - Clientes y Activos
```
app/src/features/
├── customers/
│   ├── CustomerDetailPanel.tsx
│   └── CustomerWhatsAppModal.tsx
└── assets/
    ├── AssetsPage.tsx
    └── AssetDetail.tsx
```

### Configuración y Estilos
```
├── Estilos_y_Personalizacion.md
├── app/src/config/navigation.tsx
├── app/src/hooks/useApi.ts
├── app/src/AuthenticatedApp.tsx
└── prisma/schema.prisma
```

---

## Next Steps

1. ~~ConvertToOrder Modal~~ - ✅ COMPLETADO

2. ~~Versión Mobile del módulo de Citas~~ - ✅ COMPLETADO
   - `AppointmentManagerMobile.tsx` con tabs: Hoy | Semana | Todas
   - Tarjetas con botón WhatsApp prominente
   - Botón "Convertir a Orden" visible cuando aplica
   - Pull-to-refresh (usando refresco manual por ahora)

3. **Cron Job / n8n** - Recordatorios automáticos:
   - Job diario para recordatorios 24h antes
   - Job cada 15min para recordatorios 1h antes
   - Actualizar `reminderSent24` y `reminderSent1h`

4. **Bot WhatsApp** - Detección automática de respuesta "CONFIRMAR":
   - Webhook recibe mensajes entrantes
   - Busca cita por teléfono del remitente
   - Si mensaje contiene "CONFIRMAR", marca como confirmada
   - Si no entiende, notifica al operador

---

## Technical Notes

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

### Estados de Checklist
| Estado | Color | Icono |
|:-------|:------|:------|
| good | Verde | CheckCircle2 |
| regular | Ámbar | AlertTriangle |
| bad | Rojo | XCircle |
| na | Gris | MinusCircle |

### Flujo de Identidad Progresiva (Citas)
```
1. Cita creada → tempClientName + tempClientPhone
2. Cliente llega → Operador abre detalle de cita
3. "Convertir a Orden" → Mini-wizard:
   - Busca cliente por teléfono
   - Si existe: lo selecciona
   - Si no: lo crea con un clic
   - Completa datos del activo
4. Orden creada → Cita vinculada (serviceOrderId)
```

### Comandos Útiles
```bash
# Build frontend (dev)
cd app && npx vite build --mode development

# Push schema changes
npx prisma db push --accept-data-loss

# Generate Prisma client
npx prisma generate
```
