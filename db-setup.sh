#!/bin/bash
# Script para configurar la base de datos con Prisma Accelerate

# Asegurar que estamos en el directorio correcto
cd "$(dirname "$0")"

# Definir rutas nativas
NODE="/usr/bin/node"

echo "[*] Cargando configuracion de TalistoPro..."

# Comprobar si existe .env en la raíz
if [ ! -f .env ]; then
    echo "[!] Error: Archivo .env no encontrado en la raiz."
    exit 1
fi

echo "[*] Generando Prisma Client..."
# Esto usara DATABASE_URL (Accelerate) para el cliente
npx prisma generate --schema=./prisma/schema.prisma

echo "[*] Nota: Para sincronizar el esquema (db push), se requiere conexion directa."
echo "[*] Si db push falla por puerto 5432, contacta al administrador."

# Intentamos db push usando la DIRECT_URL definida en schema.prisma
# Prisma detectara automaticamente que debe usar DirectUrl si la URL principal es prisma:// o prisma+postgres://
npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss

echo "[OK] Proceso completado."
