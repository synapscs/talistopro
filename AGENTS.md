# AGENTS.md - TaListoPro Development Guide

This document provides guidelines for agentic coding agents working on TaListoPro.

---

## Project Overview

TaListoPro is a multi-tenant application for managing service and light manufacturing workshops. It includes:
- Customer and asset management
- Service orders with configurable workflows
- Appointments with WhatsApp integration (Evolution API)
- Inventory, expenses, and invoicing (multi-currency: USD/VES/COP)
- Platform admin for subscription and tenant management

**Tech Stack:**
- **Backend:** Hono + Zod + Prisma + TypeScript
- **Frontend:** React 19 + TanStack Router + TanStack Query + Tailwind CSS
- **Auth:** better-auth
- **Database:** PostgreSQL (via Prisma)

---

## Build Commands

### Root Workspace (Monorepo)
```bash
npm run dev:api         # Start API development server
npm run dev:app         # Start frontend development server
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run Prisma migrations
```

### API (`/api`)
```bash
cd api
npm run dev             # Development with tsx (hot reload)
npm run build           # Compile TypeScript to dist/
npm run start           # Start production server (node dist/index.js)
npx vitest              # Run all tests
npx vitest run          # Run tests once
npx vitest src/_tests/platform/auth.test.ts  # Run single test file
```

### App (`/app`)
```bash
cd app
npm run dev             # Start Vite dev server
npm run build           # TypeScript check + Vite build
npm run typecheck       # TypeScript only (no emit)
npm run preview         # Preview production build
```

### Platform Admin (`/platform-admin`)
```bash
cd platform-admin
npm run dev
npm run build
npm run lint            # ESLint with TypeScript support
npm run preview
```

---

## Code Style Guidelines

### General Principles

1. **Multi-Tenant Security (CRITICAL)**
   - Every UPDATE/DELETE operation MUST include `organizationId` in the `where` clause
   - Use `updateMany`/`deleteMany` instead of `update`/`delete` to guarantee isolation
   ```typescript
   // ✅ CORRECTO
   await prisma.resource.updateMany({
       where: { id, organizationId },
       data: { ... }
   });
   
   // ❌ WRONG - Can cause cross-tenant access
   await prisma.resource.update({ where: { id }, data: { ... }});
   ```

2. **Audit Logging**
   - Use `recordAudit(c, action, entity, ...)` for all master data modifications
   - Services should call audit functions for create/update/delete operations

3. **Type Safety**
   - Use Zod for input validation at API boundaries
   - Use OpenAPIHono with `createRoute` for type-safe API contracts
   - Leverage Hono RPC for type-safe frontend-backend communication

### Backend (API) Conventions

**File Organization:**
```
api/src/
├── index.ts           # Entry point, route registration
├── auth.ts            # better-auth configuration
├── routes/            # Route handlers (grouped by feature)
│   ├── orders/
│   │   ├── index.ts
│   │   ├── get-detail.ts
│   │   └── send-message.ts
│   └── ...
├── services/          # Business logic
├── middleware/        # Tenant guards, auth, etc.
├── lib/              # DB, constants, utilities
└── types/            # TypeScript types
```

**Route Pattern:**
```typescript
import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { myService } from '../services/my-service';
import type { AppEnv } from '../types/env';

const schema = z.object({
    field: z.string().min(1),
    // ...
});

const routes = new Hono<AppEnv>()
    .get('/', async (c) => {
        const orgId = c.get('orgId');
        const result = await myService.getData(orgId);
        return c.json(result);
    })
    .post('/', zValidator('json', schema), async (c) => {
        const data = c.req.valid('json');
        const orgId = c.get('orgId');
        const result = await myService.createData(c, orgId, data);
        return c.json(result, 201);
    });

export { routes };
```

**Service Pattern:**
- Services handle business logic and database operations
- Services receive `c` (context) for audit logging
- Services filter by `organizationId` for tenant isolation

### Frontend (App) Conventions

**File Organization:**
```
app/src/
├── main.tsx
├── AuthenticatedApp.tsx
├── pages/             # Route pages
├── features/          # Feature-based components (grouped by domain)
│   ├── orders/
│   ├── appointments/
│   ├── customers/
│   └── ...
├── components/
│   ├── ui/            # Reusable UI components
│   └── layout/        # Layout components
├── hooks/             # Custom hooks
├── stores/            # Zustand stores
└── lib/               # Utilities, API client, constants
```

**Component Pattern:**
- Use functional components with TypeScript
- Use TanStack Query for server state (`useQuery`, `useMutation`)
- Use Zustand for client state
- Use `clsx` + `tailwind-merge` for conditional classes

```typescript
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// Component example
export const MyComponent = ({ 
    className, 
    variant = 'default' 
}: { 
    className?: string;
    variant?: 'default' | 'primary';
}) => {
    return (
        <div className={cn(
            'base-styles',
            variant === 'primary' && 'primary-styles',
            className
        )}>
            {/* content */}
        </div>
    );
};
```

**Design System (Obsidian Design):**
- Background: `bg-slate-900` or `bg-slate-950`
- Borders: `border-slate-800`, `rounded-2xl` consistently
- Cards: `bg-slate-900/50 backdrop-blur-xl`
- Primary color: `indigo-500/600`

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Files (TS/TSX) | kebab-case | `order-details.tsx`, `auth-service.ts` |
| Components | PascalCase | `LoginPage.tsx`, `OrderCard.tsx` |
| Functions | camelCase | `getOrders()`, `createOrder()` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE`, `DEFAULT_PAGE_SIZE` |
| Types/Interfaces | PascalCase | `Order`, `OrderItem`, `CreateOrderInput` |
| Database Models | PascalCase (Prisma) | `Order`, `Customer`, `Organization` |
| API Routes | kebab-case | `/orders`, `/customers`, `/appointments` |

### Error Handling

**Backend:**
- Return appropriate HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Use `c.json({ error: 'message' }, status)` for errors
- Validate inputs with Zod and return 400 for validation errors
- Log errors with context for debugging

**Frontend:**
- Handle errors in TanStack Query `onError` callbacks
- Display user-friendly error messages in UI
- Use try/catch for async operations

---

## Testing

Tests are located in `api/src/_tests/` using **Vitest**.

**Running Tests:**
```bash
cd api
npx vitest              # Watch mode
npx vitest run          # Single run
npx vitest run src/_tests/platform/auth.test.ts  # Single file
```

**Test Structure:**
```typescript
import { describe, test, expect } from 'vitest';
import { MyService } from '../services/my-service';

describe('MyService', () => {
    test('should do something', () => {
        const result = MyService.doSomething();
        expect(result).toBe('expected');
    });
});
```

---

## Database (Prisma)

**Commands:**
```bash
npm run db:generate     # Generate Prisma client
npm run db:migrate      # Run migrations (dev)
npx prisma studio       # Open database GUI
npx prisma db push      # Push schema to DB (quick)
```

**Prisma Patterns:**
- Always include `organizationId` in where clauses
- Use `updateMany` for updates to ensure tenant isolation
- Run `db:generate` after schema changes

---

## Important Notes

1. **Environment Variables:**
   - Copy `.env.template` to `.env` and fill in values
   - Never commit `.env` files (already in `.gitignore`)

2. **Before Submitting Work:**
   - Run `npm run build` in relevant workspace
   - Verify no TypeScript errors
   - Test the feature manually if possible

3. **API Reference:**
   - API documentation available via Scalar at `/reference` endpoint (when running dev)

4. **WhatsApp Integration:**
   - Uses Evolution API for WhatsApp messaging
   - Templates use variables: `{cliente}`, `{orden}`, `{etapa}`, `{taller}`

---

## Quick Reference

| Task | Command |
|------|---------|
| Start API | `npm run dev:api` |
| Start App | `npm run dev:app` |
| Type check | `npm run typecheck` (in app) |
| Run tests | `npx vitest run` (in api) |
| Prisma generate | `npm run db:generate` |
| Prisma migrate | `npm run db:migrate` |
