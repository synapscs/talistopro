TaListo Pro – Auditoría de Estado y Plan MVP

Actualizado: 2026-02-22

Resumen ejecutivo
- Propósito: documentar el estado actual de TaListo Pro, identificar brechas respecto al HANDOFF original y planificar las próximas fases de desarrollo (MVP + Assets + Appointments).
- Alcance: backend (API Hono), multi-tenant, orders/workflow, auditoría, stock, assets, appointments; frontend base para órdenes, clientes e inventario; integraciones (WhatsApp Evolution API, n8n), y despliegue local con VPS en Easypanel para pruebas externas.
- Fuente de verdad para decisiones y alcance: HANDOFF 022120261357.md y las Skills/Rules en .agent. Este documento es una consolidación para permitir decisiones de producto y plan de entrega.

1) Terminología y presets
- MVP actual: soporte para terminología por rubro existe en presets y OrganizationSettings. Los presets están cubiertos en el archivo business-presets.ts (ver API). Los casos de terminología pueden ser editados por el administrador de tenant en Configuracion - Personalizacion (customTerminology) y persistir en OrganizationSettings.
- Conclusión: no se requieren nuevos presets; la personalización posterior es posible a través de la UI de Settings.

2) Alcance de MVP y alcance de personalizacion
- MVP propuesto: MVP + Assets + Appointments (tal como indicas). Backend cubre órdenes, flujo de trabajo configurable, auditoría, stock y notificaciones; frontend provee interfaces base para órdenes, clientes e inventario, con potencial para extensiones.
- Despliegue: desarrollo en local; despliegue a VPS con Easypanel; pruebas con tercero antes de producción.
- Rubro (BusinessType) bloqueado tras onboarding; Terminología, Categorías y Etapas de Proceso son editables por el administrador de tenant en cualquier momento.

3) Modelo de datos y gobernanza de datos
- Arquitectura multi-tenant: TenantGuard extrae activeOrganizationId y expone orgId y user al contexto. Queries Prisma filtran por organizationId.
- Principales entidades: Organization, OrganizationSettings, ServiceOrder (ordenes), Asset, Customer, Category, WorkflowStage, etc. UUIDv7 para IDs y timestamps para trazabilidad.
- Auditoría: AuditLog y recordAudit para acciones sensibles (STOCK_ADJUSTMENT, STAGE_CHANGE, DELETE, etc.). Registros incluyen userId y organizationId.
- Transacciones: creación de órdenes utiliza Prisma.transaction; se maneja stock y objetos relacionados (photos, checklist, items) dentro de la transacción. Auditoría de stock fuera de la tx para no bloquear la operación principal ante fallo de auditoría.

4) Seguridad y cumplimiento
- Seguridad: multi-tenant con mencionados guards y filtros; UUIDs; Organization context. CORS configurado en desarrollo; se recomienda endurecimiento para producción (restriccion de origins, políticas de cabeceras, etc.).
- Alcances de RBAC/roles para negocio: no especificado exhaustivamente; plan para detallar en próximas iteraciones.

5) Lógica de negocio y flujos clave
- Ordenes: crear, actualizar (incluye currentStage y calculo de status), eliminar; manejo de photos, checklist e items; registro de historial y notificaciones según configuración de etapas.
- Stock: decremento de stock de productos al crear órdenes; se evalúa la necesidad de compensaciones ante fallas.
- Workflow: sincronización de etapas por organización; manejo de IDs temporales para evitar colisiones; se retorna la lista actualizada de etapas.

6) Integraciones, almacenamiento y UI
- Almacenamiento: Cloudflare R2 para fotos; generación de URLs firmadas para uploads (credenciales en .env).
- WhatsApp/Evolution API y n8n: estado a auditar; se requiere verificación profunda para entender la configuración actual y las brechas.
- UI: base para órdenes y dashboards; Assets y Appointments requieren diseño acorde con patterns existentes; sin maquetas formales en este momento.

7) Pruebas, calidad y gobernanza de código
- Pruebas: existen pruebas, pero no cubren todo el MVP; se propone un plan de pruebas unitarias y de integración para cubrir core flows (orders, workflow, audit, stock).
- Estándares: guidelines de .agent (tech-architecture, code-quality, ui_patterns, validation_rules, verification_standards) deben aplicarse en la implementación de cada historia; HANDOFF sirve como referencia viva para la gobernanza.

8) Despliegue y entorno
- Entorno de desarrollo: local. Despliegue en VPS con Easypanel para pruebas de preproducción y producción. No hay pipeline CI/CD en GitHub aún (según conversación); se recomienda planificar un pipeline básico para PR checks, tests y despliegue.
- Pruebas con tercero: plan de pruebas de aceptación por parte de un tercero antes de producción.

9) Deuda técnica y roadmap propuesto
- Ver apartado ROADMAP.md para las fases y entregables detallados. En resumen: MVP core + Assets + Appointments, seguido de mejoras en integraciones, IA de analítica, y pipeline de CI/CD.

10) Anexo: preguntas y respuestas (Q&A)
- Se adjunta la lista de Q&A proporcionada en la sesión previa, con respuestas alineadas al estado real del código (ver Appendice). Este bloque se puede copiar tal cual o adaptar según el feedback.

11) Anexo: mapeo con .agent
- Referencias a .agent/skills y .agent/rules usadas para cada tema del handoff (tech-architecture, code-quality, prisma-expert, ui_patterns, validation_rules, verification_standards).

Appendix – Preguntas y respuestas de la sesión previa (Q&A)
1) Terminologia por rubro
- R: Especificado en presets (business-presets.ts); no hay casos no cubiertos. Los usuarios pueden modificar terminología post-configuración en Configuracion - Personalizacion (customTerminology).
2) Etapas y reglas de negocio
- R: Etapas son configurables vía UI (módulo configuracion-flujo). Reglas de negocio: historial de avance, notificaciones por etapa, mensajes configurables; integración de WhatsApp planificada para fases futuras.
3) Seed de datos
- R: Seed puede ejecutarse durante onboarding; planean bloquear el cambio de rubro tras onboarding. Categorias/editables por usuario en Settings.
4) Modulos faltantes (Assets/Appointments)
- R: Basarse en patrones existentes; no hay maquetas; validaciones documentadas; ajustes puntuales posibles.
5) Integraciones
- R: Requiere revisión profunda de WhatsApp y Evolution-API; credenciales para Cloudflare R2 en .env.
6) Pruebas y Calidad
- R: Pruebas existentes, pero no completas; se propone un plan de pruebas, y se indica que hay reglas de estilo en .agent y HANDOFF.
7) Despliegue y Entorno
- R: Despliegue en VPS con Easypanel; GitHub no está siendo utilizado para despliegue aún; CI/CD aún no establecido.
8) Priorización
- R: Priorizar según criterio técnico; se sugiere MVP con opciones para añadir Assets/Appointments y futuras integraciones.

Anexo – Archivos citados (ejemplos)
- prisma/schema.prisma
- api/src/lib/audit.ts
- api/src/middleware/tenant.ts
- api/src/routes/orders/index.ts
- api/src/services/orders.ts
- api/src/routes/workflow.ts
- app/src/lib/auth-client.ts
- app/src/features/appointments.ts
- .agent/skills/tech-architecture/SKILL.md
- .agent/rules/ui_patterns.md
