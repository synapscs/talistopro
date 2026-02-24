# TaListoPro - Runbook Rollback (Producción)

Propósito
- Proveer un plan detallado para regresar a una versión estable en caso de fallo crítico tras go-live.

Precondiciones
- Copias de seguridad de base de datos, imágenes de contenedores y artefactos de despliegue.
- Controles de cambios y autorización de rollback.
- Accesos de producción disponibles para revisión.

Escenarios de rollback
- Fallo crítico de servicios en producción (latencia, errores, caídas).
- Incompatibilidad de migraciones o datos corruptos.
- Compromiso de seguridad (exposición de secretos, violación de aislamiento).

Pasos de rollback
- Paso 1: Notificar incidente y poner en modo mantenimiento.
- Paso 2: Restaurar base de datos desde snapshot/backup más reciente funcionando.
- Paso 3: Revertir imágenes/artefactos a la versión previa y redeploy.
- Paso 4: Verificar salud de API y frontend, realizar smoke tests críticos.
- Paso 5: Recalibrar configuraciones y secretos a versión anterior si aplica.
- Paso 6: Revisar logs y auditoría; documentar incidente y plan de aprendizaje.
- Paso 7: Reanudar operaciones con manuales si el sistema no está estable.

Criterios de aceptación de rollback
- Sistema operativo y servicios en estado estable similar a la versión anterior.
- Migraciones revertidas o no ejecutadas de forma que no afecten datos.
- Backups disponibles y verificados.
- Registro de incidentes y acciones de mitigación documentado.
