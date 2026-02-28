# HANDOFF - TaListoPro

> Última actualización: 28 de Febrero, 2026 (Post-Auditoría Técnica)

## Contexto General

TaListoPro es una aplicación multi-tenant de gestión de talleres de servicio y manufactura ligera. Incluye gestión de clientes, activos (vehículos/equipos), órdenes de servicio, inventario, citas, gastos y facturación. 

**Estado Actual:** La aplicación ha superado una fase de corrección crítica de regresiones y se encuentra estable, con seguridad multi-tenant reforzada y auditoría extendida.

---

## Goal

Desarrollar TaListoPro como una aplicación completa de gestión de talleres con:
- Gestión de clientes y activos (Identidad Progresiva).
- Órdenes de servicio con workflow configurable y notificaciones automáticas.
- Sistema de citas con integración WhatsApp (Evolution API).
- Inventario, Gastos y Facturación Bi-moneda (USD/VES/COP).
- Plataforma de administración global para gestión de suscripciones y tenants.

---

## Instrucciones Críticas

- **ESTILO**: Seguir `Obsidian Design` (Fondo Slate-900/950, bordes `rounded-2xl` consistentemente).
- **API**: Usar `OpenAPIHono` y `createRoute` para mantener el contrato type-safe con el frontend.
- **SEGURIDAD**: Toda operación de escritura (UPDATE/DELETE) **DEBE** incluir `organizationId` en el filtro `where`. Usar `updateMany` para garantizar aislamiento.
- **AUDITORÍA**: Usar `recordAudit(c, action, entity, ...)` en servicios para todas las acciones que modifiquen datos maestros.
- **BUILD**: Verificar con `npx vite build --mode development` antes de considerar una tarea finalizada.

---

## Discoveries & Fixes (Febrero 2026)

1.  **Regresión de Rutas**: Se detectó y corrigió una pérdida masiva de rutas tenant en `api/src/index.ts`. La API está de nuevo al 100% operativa.
2.  **Seguridad Multi-Tenant**: Se estandarizó el uso de `organizationId` en los servicios de Citas, Facturas y Pagos para evitar accesos cruzados.
3.  **Auditoría**: Se integró el sistema de Logs de Auditoría en los módulos de Citas y Pagos, asegurando trazabilidad financiera.
4.  **OpenAPI Unificado**: Se migraron los endpoints de Citas, Pagos e Inventario al estándar OpenAPI para coherencia con el resto del sistema.

---

## Accomplished (Reciente)

### ✅ Estabilización de Infraestructura API
- Restauración de 14 rutas de tenant protegidas.
- Implementación de `tenantGuard` global bajo `/api/*`.
- Eliminación de archivos de respaldo obsoletos para limpiar el workspace.

### ✅ Módulo de Citas (Appointments) - REFORZADO
- CRUD completo con validación Zod.
- Integración con Auditoría.
- Notificaciones WhatsApp automáticas al crear cita y recordatorios manuales (24h/1h).

### ✅ Gestión Financiera (Pagos y Facturas) - REFORZADO
- Flujo de pagos con actualización automática del estado de la orden (PENDING -> PARTIAL -> PAID).
- Generación de facturas con validación de existencia previa y cálculo de impuestos.

---

## Relevant Files

### Backend (API)
- `api/src/index.ts`: Punto de entrada unificado y seguro.
- `api/src/middleware/tenant.ts`: Guardián de seguridad multi-tenant.
- `api/src/services/`: Lógica de negocio con aislamiento de datos y auditoría.

### Frontend
- `app/src/hooks/useApi.ts`: Hooks basados en el cliente RPC tipado.
- `app/src/features/`: Componentes organizados por dominio (orders, appointments, customers, etc).

---

## Next Steps (Priorizados)

1.  **Rotar Credenciales Expuestas** (CRÍTICO):
    - `DATABASE_URL`
    - `BETTER_AUTH_SECRET`
    - Evolution API credentials.
2.  **Automatización de Citas** (Cron Jobs):
    - Implementar el job para el envío automático de recordatorios 24h/1h antes de la cita.
3.  **Refactor Platform Admin**:
    - Migrar `platform-admin` al uso del RPC Client tipado para eliminar el uso de `fetch` manual.
4.  **Bot de Respuesta WhatsApp**:
    - Implementar el Webhook para procesar la respuesta "CONFIRMAR" de los clientes.

---

## Technical Notes

### Variables WhatsApp (Templates)
| Variable | Uso |
| :--- | :--- |
| `{cliente}` | Nombre del cliente |
| `{orden}` | OS-YYYY-XXXX |
| `{etapa}` | Estado actual del flujo |
| `{taller}` | Nombre de la organización |

### Seguridad Multi-Tenant (Patrón Obligatorio)
```typescript
// ✅ CORRECTO
await prisma.resource.updateMany({
    where: { id, organizationId },
    data: { ... }
});
```
