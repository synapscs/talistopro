# TaListoPro - Checklists por Fase (Con Criterios de Aceptación)

Este documento describe las listas de verificación detalladas para cada fase del plan de implementación en VPS y producción.

Fase 0: Preparación y Planificación
- Objetivo: Alinear alcance, riesgos y entregables.
- Actividades:
  - Definir alcance mínimo viable (MVP) para producción.
  - Crear entorno staging vs producción y plan de migración de datos.
  - Establecer runbooks y plantillas de env/template deSecrets.
  - Preparar backlog y estimaciones.
- Entradas: Plan de proyecto, auditoría de seguridad, inventario de endpoints críticos.
- Salidas: Documento maestro de plan, plantillas de environment, checklist de seguridad.
- Criterios de aceptación:
  - Alcance aprobado y firmado por stakeholders.
  - Entornos staging/producción definidos y configurados.
  - Secret management plan documentado.
- Roles: PM, Arquitecto, DevOps, Seguridad.

Fase 1: Endurecimiento y Correcciones Críticas
- Objetivo: Cerrado de vulnerabilidades críticas y endurecimiento de seguridad multi‑tenant.
- Actividades:
  - Asegurar filtros organizationId en UPDATE/DELETE en endpoints críticos.
  - Reforzar tenantGuard para verificación de membresía.
  - Rotar credenciales y mover a Secrets Manager.
  - Añadir tests de seguridad básicos y E2E multi‑tenant.
- Entradas: Auditoría, código fuente, plan de secrets.
- Salidas: Código endurecido, pruebas ejecutadas, env.template actualizado.
- Criterios de aceptación:
  - No exista endpoint crítico con UPDATE/DELETE sin organizationId.
  - membership verificado en todas las rutas relevantes.
  - Secrets rotados y gestionados externamente.
- Roles: BackEnd Lead, Security Engineer, QA.

Fase 2: Infraestructura VPS y DB
- Objetivo: Provisión de entorno productivo seguro y reproducible.
- Actividades:
  - Provisionar VPS, firewall, Nginx, TLS, backups.
  - Configurar PostgreSQL, migrations y vault/Secrets Manager.
  - Configurar CI/CD para staging/producción.
- Entradas: Plan de entorno, políticas de backup, plan de secretos.
- Salidas: Entorno de producción en VPS, pipelines configurados.
- Criterios de aceptación:
  - Entorno accesible solo por puertos necesarios; TLS activo.
  - Migrations ejecutables y rollback probado.
- Roles: DevOps, DBA, Security.

Fase 3: Pruebas y Validación
- Objetivo: Validar seguridad, integridad y rendimiento multi‑tenant.
- Actividades:
  - Pruebas E2E multi‑tenant, pruebas de carga, pruebas de seguridad.
  - Verificar aislamiento de datos entre tenants.
  - Verificar logging/monitoring y alertas.
- Entradas: Entorno prod, suites de pruebas, planes de prueba.
- Salidas: Reportes de pruebas, dashboards, lista de issues.
- Criterios de aceptación:
  - Pasan todas las pruebas críticas y de seguridad.
  - Observabilidad operativa con alertas configuradas.
- Roles: QA Lead, Security, SRE, Backend.

Fase 4: Go-live y Operación
- Objetivo: Despliegue oficial a producción y operación estable.
- Actividades:
  - Despliegue controlado a producción.
  - Verificar endpoints críticos y backups activos.
  - Monitoreo intensivo y respuesta a incidentes.
  - Entrenar al equipo de soporte y operaciones.
- Entradas: Plan de go-live, runbooks, siglas de rollback.
- Salidas: Producción estable, runbooks activos, SLA acordados.
- Criterios de aceptación:
  - Producción en funcionamiento 99.9% durante 30 días.
  - Respuesta a incidentes documentada y probada.
- Roles: DevOps, QA, Seguridad, Ops.

Anexos: plantillas y plantillas de runbooks, plantillas de revisión de seguridad.
