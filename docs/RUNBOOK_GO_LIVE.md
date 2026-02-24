# TaListoPro - Runbook Go-Live (Producción)

Propósito
- Guía paso a paso para desplegar TaListoPro en VPS en producción con mínimo downtime y rollback seguro.

Precondiciones
- Secrets gestionados en Secrets Manager; variables cargadas en entorno de runtime.
- Base de datos respaldada y verificada; migraciones aplicadas en staging y listos para producción.
- Certificados TLS válidos y configurados en Nginx.
- Entorno de staging verificado y pruebas exitosas.

Checklist de despliegue
- [ ] Actualizar/verificar versión de código a la versión a desplegar.
- [ ] Ejecutar migrations ( Prisma migrate/prisma db push conforme flujo ) en la base de datos de producción.
- [ ] Construir y desplegar contenedores/servicios en producción (backend, frontend, workers).
- [ ] Cargar secrets desde Secrets Manager en todos los servicios.
- [ ] Verificar TLS y configuración de Nginx (proxy y headers HSTS).
- [ ] Iniciar servicios y validar logs de arranque sin errores.
- [ ] Ejecutar health checks de API y frontend (endpoints críticos, login, multi-tenant isolation).
- [ ] Verificar capacidad de escalar nodos/instancias si el tráfico aumenta.
- [ ] Validar que la auditoría de acciones funcione y persista correctamente.
- [ ] Encender monitoreo (Prometheus/Grafana/Loki) y validar dashboards.
- [ ] Notificar a stakeholders y publicar estado de go-live.

Criterios de aceptación (Go-Live)
- Todas las respuestas de health checks están OK; 99.9% de disponibilidad esperada.
- No hay errores críticos en logs de arranque ni en 24h post deployment.
- Migraciones aplicadas con éxito y rollback disponible si falla.
- Secrets cargados sin exponer credenciales en logs.
- Auditoría y monitoreo operan correctamente.

Procedimiento de rollback (en caso de fallo crítico)
- Detener despliegue actual y revertir a la versión previa (rollback de contenedores).
- Restaurar base de datos a snapshot anterior si falla migración.
- Reintentar despliegue estable de versión anterior.
- Verificar sistema tras rollback y notificar a equipos.
