TaListo Pro — Roadmap MVP (MVP + Assets + Appointments)

Fecha: 2026-02-22

Resumen ejecutivo
- Objetivo: desplegar un MVP funcional con gestión de órdenes, flujo de trabajo configurable, auditoría, y stock, complementado con módulos de Assets y Appointments. Despliegue final en VPS con Easypanel; pruebas por un tercero antes de producción.
- Alcance: MVP core + Assets + Appointments; luego integraciones (WhatsApp/n8n), analítica, pruebas automatizadas y CI/CD.

1) Epics y características (MVP)
Epic 1 — Core de Ordenes y Flujo de Trabajo (MVP core)
- Característica 1.1: Autenticación multi-tenant y aislamiento de datos (TenantGuard). 
- Característica 1.2: CRUD de Órdenes (crear, leer, actualizar, eliminar) con relaciones a Cliente, Activo y Empleados; soporte para photos, checklist e items.
- Característica 1.3: Flujo de trabajo configurables (ETAPAS). 
- Característica 1.4: Historia de estado y auditoría de cambios (STAGE_CHANGE, NOTES_UPDATE, DELETE, STOCK_ADJUSTMENT).
- Característica 1.5: Stock management y ajuste de productos al crear órdenes.
- Característica 1.6: Validación de payload con Zod y end-to-end type safety entre frontend y backend.
- Critérios de aceptación: endpoints CRUD funcionando; transacciones atómicas; historial y auditoría generados; integración con UI base para órdenes.

Epic 2 — Assets (MVP)  
- Característica 2.1: CRUD de Assets (vehículos/equipos) por organización; campos dinámicos 6; asociar a cliente; fotos y notas. 
- Característica 2.2: Integración UI para visualizar y editar activos en el flujo de órdenes.
- Criterios de aceptación: CRUD funcional; relación con clientes; enlaces a órdenes.

Epic 3 — Appointments (MVP)
- Característica 3.1: CRUD/gestión de citas; calendario y notificaciones configurables; integración con clientes.
- Característica 3.2: Vista móvil y desktop; UI basada en patrones existentes.
- Criterios de aceptación: crear/editar/eliminar citas; visualización en dashboard; notificaciones configurables.

2) Entorno y despliegue
- Desarrollo local: montar backend (API Hono) y frontend (Vite) en entorno local.
- Despliegue a VPS con Easypanel para staging/producción; gestionar con un repositorio de código para versiones futuras.
- Pruebas con tercero: plan de pruebas de aceptación y validación de negocio (QA externa).

3) CI/CD y pruebas (plantilla de inicio)
- Requisitos: PR checks, pruebas unitarias e integraciones; despliegue a staging y luego a producción con rollback.
- Propuesta: utilizar GitHub Actions o equivalente para ejecutar typecheck, tests y migraciones de base de datos; automatizar despliegue a VPS tras aprobación.

4) Gobernanza y estándar de código
- Referencias a .agent (skills y rules) para guiar desarrollo, validaciones y patterns de UI.
- Checklist de aceptación basada en reglas UI_patterns, validation_rules y code-quality.

5) Dependencias y migraciones
- Prisma: seeds, migraciones y manejo de datos (seed de rubro bloqueado post onboarding; categorías y terminología editables).
- Revisión de schema para garantizar compatibilidad con MVP (OrderStatus, WorkflowStage, Terminology, etc.).

6) Anexo – Roadmap detallado (Tareas y Due Dates)
- Fase 1: Preparación y planificación (Días 1–2)
- Fase 2: Implementación MVP core (Días 3–14)
- Fase 3: Assets y Appointments (Días 15–28)
- Fase 4: Pruebas y QA (Días 29–34)
- Fase 5: Despliegue y entrega (Días 35–40)

7) Métricas de éxito
- Funcionalidad core: CRUD de órdenes, flujo de etapas, auditoría, y stock funcionando.
- Asset y Appointment: endpoints y UI disponibles.
- Despliegue en VPS y pruebas de terceros con aceptación formal.

Anexo – Anexo de reglas y mapeo con .agent
- Conexión entre Roadmap y .agent: heurísticas de arquitectura (tech-architecture), calidad de código (code-quality), prisma-expert, ui_patterns, validation_rules, verification_standards.
