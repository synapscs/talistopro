#!/bin/bash

echo "=========================================="
echo "Actualizando Prisma Client"
echo "=========================================="
echo ""

# Ir a la carpeta API
cd /home/victor_ignacio/proyectos/talistopro/api

echo "1. Regenerando cliente de Prisma..."
npx prisma generate

echo ""
echo "2. Aplicando migraciones..."
npx prisma migrate deploy

echo ""
echo "=========================================="
echo "✅ Prisma client actualizado exitosamente"
echo "=========================================="
