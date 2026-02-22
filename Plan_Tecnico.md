# 📋 TaListoPro - Plan Técnico y de Negocio

## 1. Visión y Lógica del SaaS
TaListoPro es una plataforma SaaS **Multi-tenant** y **Multi-Rubro** diseñada bajo un enfoque **Agent-First**. Permite a dueños de talleres y centros de servicio gestionar su operación de manera inteligente, adaptándose a la terminología específica de su industria (Mecánica, Electrónica, Manufactura, etc.) mediante un sistema de **Presets de Configuración**.

### Diferenciadores Clave:
- **Inteligencia Operativa**: Flujos de trabajo configurables con notificaciones automatizadas vía WhatsApp.
- **Doble Moneda Nativa**: Gestión de precios en USD con conversión dinámica a monedas locales (VES, COP, MXN).
- **Enfoque Móvil**: Interfaz optimizada para el uso rudo en taller desde smartphones.

---

## 2. Estructura de Datos (Schema Prisma)
Se utilizará **PostgreSQL** con **Prisma ORM**. Implementamos **UUIDv7** para Primary Keys por su eficiencia en ordenamiento cronológico y escalabilidad.

```prisma
// ==========================================
// TALISTOPRO - CORE SCHEMA
// ==========================================

enum BusinessType {
  AUTOMOTIVE
  ELECTRONICS
  MANUFACTURING
  OTHER
}

enum Currency {
  USD
  VES
  COP
  MXN
}

model Organization {
  id                String       @id // UUIDv7
  name              String
  slug              String       @unique
  businessType      BusinessType
  country           String       @default("VE")
  
  // Finanzas
  primaryCurrency   Currency     @default(USD)
  secondaryCurrency Currency?    // VES para Venezuela
  exchangeRate      Decimal?     @map("exchange_rate")
  
  // WhatsApp / Integración
  evolutionInstance String?      @map("evolution_instance")
  n8nWebhookUrl     String?      @map("n8n_webhook_url")

  // Relaciones
  members           Member[]
  customers         Customer[]
  assets            Asset[]
  serviceOrders     ServiceOrder[]
  products          Product[]
  
  createdAt         DateTime     @default(now()) @map("created_at")
  updatedAt         DateTime     @updatedAt @map("updated_at")

  @@map("organizations")
}

model Asset {
  id             String       @id // UUIDv7
  // Campos dinámicos (terminología según rubro)
  field1         String       // Marca
  field2         String       // Modelo
  field3         String?      // Año/Serial
  field4         String?      // Placa/IMEI
  field5         String?      // Color
  field6         String?      // Kilometraje/Obs
  
  customerId     String       @map("customer_id")
  customer       Customer     @relation(fields: [customerId], references: [id])
  
  organizationId String       @map("organization_id")
  organization   Organization @relation(fields: [organizationId], references: [id])

  serviceOrders  ServiceOrder[]

  @@map("assets")
}

model ServiceOrder {
  id                String       @id // UUIDv7
  orderNumber       String       @map("order_number")
  status            String       @default("RECEIVED")
  
  // Asset & Client
  assetId           String       @map("asset_id")
  asset             Asset        @relation(fields: [assetId], references: [id])
  
  // Fotos (Max 6)
  photos            OrderPhoto[]
  
  // Lógica Financiera
  totalUsd          Decimal      @map("total_usd")
  totalLocal        Decimal?     @map("total_local")
  
  @@map("service_orders")
}

model OrderPhoto {
  id             String       @id // UUIDv7
  url            String
  type           String       // ENTRY, PROCESS, EXIT
  serviceOrderId String       @map("service_order_id")
  serviceOrder   ServiceOrder @relation(fields: [serviceOrderId], references: [id])
  
  @@map("order_photos")
}
```

---

## 3. Lógica Financiera (Soporte Venezuela)
El sistema utiliza el **Dólar Americano (USD)** como moneda base para la estabilidad de precios.
- **Doble Moneda (VE)**: Los precios en el inventario se fijan en USD. Al facturar en Venezuela, el sistema multiplica por la tasa configurada (BCV/Paralelo) para mostrar el monto en Bolívares (VES).
- **Actualización de Tasa**: Integración manual o vía n8n para actualizar el `exchangeRate` de la organización diariamente.

## 4. Descripción Detallada de Formularios

### 4.1 Formulario de Onboarding (Tenant Setup)
*   **Propósito**: Configurar la identidad visual y operativa del taller.
*   **Campos**:
    *   `businessName`: String (required) -> `Organization.name`
    *   `businessType`: Enum (AUTOMOTIVE, ELECTRONICS, etc.) -> Determina el preset de terminología.
    *   `country`: Enum (VE, CO, MX) -> Configura moneda e IVA por defecto.
    *   `currency`: Enum (USD, VES, COP, MXN) -> `Organization.primaryCurrency`.
*   **Backend**: Crea el registro `Organization` y el primer `Member` con rol `owner`.

### 4.2 Gestión de Activos (Asset Management)
*   **Propósito**: Registrar el vehículo o equipo asociado al cliente.
*   **Campos Dinámicos (Ej. Automotriz)**:
    *   `field1` (Marca): String (req)
    *   `field2` (Modelo): String (req)
    *   `field4` (Placa): String (unique index per org)
*   **Conexión**: Se asocia a un `CustomerId`. Los labels de los campos se consumen desde un JSON en el frontend basado en el `businessType`.

### 4.3 Orden de Servicio (Service Order)
*   **Propósito**: Documentar el ingreso, diagnóstico y proceso de reparación.
*   **Campos**:
    *   `description`: Text (req) -> Problema reportado.
    *   `priority`: Enum (LOW, NORMAL, HIGH).
    *   `photos`: Array de archivos (Max 6) -> Subida a **Cloudflare R2** y persistencia de URLs en `OrderPhoto`.
*   **Workflow**: Cada cambio de estado dispara un Webhook hacia **n8n** para notificar al cliente vía **Evolution-API**.

---

## 5. Lógica Financiera Detallada
### 5.1 Gestión de Impuestos
- **Venezuela**: 16% IVA por defecto.
- **Colombia**: 19% IVA por defecto.
- **México**: 16% IVA por defecto.
El sistema permite sobreescribir el porcentaje de impuesto a nivel de Organización.

### 5.2 Algoritmo de Doble Moneda (Conversión Dinámica)
Para Tenants en Venezuela:
1.  **Costo/Venta Base**: Todo se registra en USD (`Decimal`).
2.  **Display Dual**: `precio_local = precio_usd * organization.exchange_rate`.
3.  **Facturación**: Se genera una tabla de pagos con `amount`, `currency` y `exchange_rate` capturado en el momento de la transacción para auditoría financiera.

---

## 6. Schema Prisma Refinado (Producción)
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// User & Auth (Integration with Better-Auth)
model User {
  id            String    @id // UUIDv7
  email         String    @unique
  name          String
  memberships   Member[]
  
  @@map("users")
}

model Member {
  id             String       @id // UUIDv7
  role           String       @default("technician")
  userId         String       @map("user_id")
  user           User         @relation(fields: [userId], references: [id])
  organizationId String       @map("organization_id")
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  @@unique([userId, organizationId])
  @@map("members")
}

// ... (Resto del schema detallado en Documentacion_Tecnica.md adaptado a UUIDv7)
```

### 4.4 Módulo de Citas y Agendamiento
*   **Propósito**: Permitir al cliente reservar un espacio y al taller organizar su carga de trabajo.
*   **Campos**: `scheduledAt`, `duration`, `notes`, `status` (SCHEDULED, CONFIRMED, etc.).
*   **Automatización**: Envío de recordatorio vía WhatsApp 24h antes a través de una tarea programada en n8n.

### 4.5 Checklist de Entrada (Exclusivo Automotriz)
*   **Propósito**: Registro del estado físico del vehículo para deslinde de responsabilidades.
*   **Estructura**: Categorías (Exterior, Interior, Documentos) con estados (Good, Damaged, Missing) y soporte para notas por ítem.

---

## 8. Plan de Implementación Consolidado
1.  **Hito 1**: Backend sólido con Hono + Prisma (UUIDv7) + BetterAuth.
2.  **Hito 2**: Frontend Pro con TanStack Query/Router y UI de Lujo.
3.  **Hito 3**: Integración WhatsApp y Automatizaciones n8n.
4.  **Hito 4**: QA Financiero y Lanzamiento MVP.
