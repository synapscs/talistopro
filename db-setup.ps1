# Script para configurar la base de datos con Prisma Accelerate

Write-Host "[*] Configurando entorno TalistoPro (Accelerate)..." -ForegroundColor Cyan

if (-not (Test-Path ".env")) {
    Write-Host "[!] Error: Archivo .env no encontrado en la raiz." -ForegroundColor Red
    exit
}

Write-Host "[*] Generando Prisma Client..."
# El cliente usara Accelerate (puerto 443) para mayor velocidad y bypass de firewalls
npx prisma generate --schema=./prisma/schema.prisma

Write-Host "[*] Sincronizando base de datos (Requiere conexion directa)..."
# Prisma usara DIRECT_URL del .env para esta operacion
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss

Write-Host "[OK] Proceso completado exitosamente." -ForegroundColor Green
