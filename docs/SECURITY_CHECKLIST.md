# TaListoPro - Security Checklist (Revisión Final para Producción)

Este checklist debe ser ejecutado antes de go-live y al menos cada mes de operación para asegurar que el entorno se mantiene dentro de los estándares de seguridad.

1) Gobernanza y Políticas
- [ ] Políticas de acceso y roles claros (RBAC) para backend, SaaS admin y API.
- [ ] Registro de cambios y auditoría habilitado para operaciones críticas.
- [ ] Revisión de cumplimiento (privacidad de datos, retención, consentimiento si aplica).

2) Autenticación y Autorización
- [ ] TenantGuard valida membership real para todas las rutas sensibles.
- [ ] Tokens/IDs no expuestos; expiración y ROTACIÓN de tokens.
- [ ] MFA para accesos administrativos y deploys sensibles.

3) Aislamiento Multi‑Tenant
- [ ] Todas las operaciones UPDATE/DELETE usan filtros compuestos con organizationId.
- [ ] Pruebas de aislamiento entre tenants en entornos de staging.
- [ ] Verificación de que no hay escaping de datos entre tenants en logs o respuestas.

4) Secrets y Configuración
- [ ] Secrets almacenados en Secrets Manager o vault; no en repos.
- [ ] Rotación de credenciales programada.
- [ ] Acceso a secretos restringido y auditado.

5) Logs, Monitoreo y Alertas
- [ ] Logs estructurados y centralizados (backend, servicios, base de datos).
- [ ] Dashboards de rendimiento, seguridad y disponibilidad (APM).
- [ ] Alertas configuradas para fallos críticos y caídas.

6) Seguridad de Dependencias
- [ ] Escaneo de dependencias (Snyk/Dependabot) y actualización regular.
- [ ] Imágenes de contenedores escaneadas (Trivy o similar).

7) Pruebas de Seguridad
- [ ] Pruebas estáticas y dinámicas en pipeline (SAST/DAST).
- [ ] Pruebas de penetración enfocadas en multi‑tenant.
- [ ] Plan de respuesta a incidentes y ejercicios de simulación.

8) Backups y Recuperación
- [ ] Backups de base de datos y archivos críticos diarios/semanares.
- [ ] Procedimiento de restauración probado y documentado.
- [ ] Verificación de integridad de backups.

Notas finales
- Este checklist debe ser ejecutado antes de go-live y al menos cada sprint de mantenimiento.
