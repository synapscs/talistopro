# TaListoPro - Plan de Proyecto para Despliegue en VPS y Producción

Propósito
- Estabilizar y desplegar TaListoPro como solución multi‑tenant segura en VPS, con pipeline reproducible, monitoreo, backups y plan de recuperación ante incidentes.

Alcance
- Inclusivo: Backend API (Node/TS, Hono, Prisma), servicios multi‑tenant (appointments, invoices, payments, orders), integración Evolution API (WhatsApp), plataforma admin SaaS, y frontend Desktop/Mobile.
- Exclusivo: Nuevas características funcionales fuera del MVP de producción, migraciones de datos que no impacten la seguridad/multi‑tenant.

Objetivos de alto nivel
- Aislamiento multi‑tenant completo a nivel de acceso y datos.
- Implementación de rotación de credenciales y secretos usando un Secrets Manager.
- Pipeline CI/CD reproducible para staging y producción en VPS.
- Pruebas de seguridad multi‑tenant, pruebas de regresión y pruebas de rendimiento (RTO/RPO definidos).
- Monitoreo, logging, alertas y planes de continuidad.

Arquitectura objetivo en VPS (alto nivel)
- Infraestructura: VPS Linux (Ubuntu), Nginx como reverse proxy y TLS, Node.js en prod, Prisma con PostgreSQL.
- Seguridad: Secrets Manager, TLS, firewall, acceso SSH restringido, MFA para admin.
- Observabilidad: Prometheus/Grafana, Loki, OpenTelemetry.
- Despliegue: Docker Compose para MVP, Kubernetes si escala; migrations gestionadas por Prisma.

Planificación y entregables
- Fase 0 — Preparación y Alcance (1–2 sem): plan, blueprint de entorno, checklist de seguridad, plantillas de env, runbooks.
- Fase 1 — Endurecimiento y correcciones críticas (2–4 sem): aplicar correcciones en queries multi‑tenant, reforzar tenantGuard, rotar credenciales, crear env.template, revisar código y tests básicos.
- Fase 2 — Infraestructura VPS y DB (2–3 sem): provisionar VPS, configurar proxy TLS, secrets, backup strategy, CI/CD, pipelines de migración.
- Fase 3 — Pruebas y Validación (3–6 sem): pruebas E2E multi‑tenant, pruebas de seguridad, pruebas de rendimiento, smoke tests, pruebas de DR.
- Fase 4 — Go‑live y Operación (1–2 sem): despliegue en producción, runbooks activos, monitoreo intensivo y soporte.

Roles y responsabilidades
- Product Owner / Arquitecto: definir alcance y criterios de aceptación.
- DevOps/SRE: infraestructura, seguridad, monitoreo, pipelines y go‑live.
- Backend/QA: endurecimiento, tests, validación de seguridad y aislamiento.
- Frontend: estabilidad de UI y pruebas de integración.

Criterios de aceptación (alto nivel)
- Todas las rutas críticas aplican filtros de organizationId en UPDATE/DELETE y consultas que mutan datos.
- Membership verificado en todas las rutas y roles persistidos.
- Secrets rotados y secretos en Secrets Manager; no hay credenciales en repos.
- Tests de seguridad multi‑tenant implementados y ejecutados.
- Pipeline de CI/CD estable con deploy reproducible a staging y producción.
- Backups verificados, monitoreo activo y dashboards configurados.

Riesgos y mitigaciones
- Fuga de datos entre tenants: mitigación con filtros compuestos y pruebas específicas.
- Rotación de credenciales: mitigación mediante Secrets Manager y política de rotación.
- Complejidad de migraciones: mitigación con migrations controladas y rollback.
- Dependencias y vulnerabilidades: escaneo continuo y actualización de dependencias.

Plan de revisión y aprobación
- Revisión de seguridad y arquitectura con stakeholders clave.
- Aprobación del plan de despliegue y runbooks.
- Firma de DR/BCP y SLA acordados.

Notas finales
- Este plan es un documento vivo; se va ajustando a medida que se obtienen más datos y resultados de pruebas.
