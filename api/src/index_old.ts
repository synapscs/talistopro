import 'dotenv/config';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { apiReference } from '@scalar/hono/zod-openapi';
import { auth } from "./auth";
import { customers } from "./routes/customers";
import { organizations } from "./routes/platform/organizations";
import { platformAuthRouter } from "./routes/platform/auth";
import { platformAuthGuard } from "./middleware/platform-auth";
import { platformSubscriptionsRouter } from "./routes/platform/subscriptions";
import { platformBillingRouter } from "./routes/platform/billing";
import { assets } from "./routes/assets";
import { orders } from "./routes/orders";
import { inventory } from "./routes/inventory";
import { expenses } from "./routes/expenses";
import { settings } from "./routes/settings";
import { workflow } from "./routes/workflow";
import { members } from "./routes/members";
import { appointments } from "./routes/appointments";
import { dashboard } from "./routes/dashboard";
import { upload } from "./routes/upload";
import { categories } from "./routes/categories";
import { notifications } from "./routes/notifications";
import { payments } from "./routes/payments";
import { invoices } from "./routes/invoices";

import { tenantGuard } from "./middleware/tenant";

const app = new OpenAPIHono();

// Middlewares
app.use("*", cors({
    origin: (origin) => origin,
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With", "better-auth-agent"],
    allowMethods: ["POST", "GET", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length", "Set-Cookie"],
    maxAge: 600,
    credentials: true,
}));

// Platform Admin Routes (no tenantGuard needed)
app.route("/api/platform/auth", platformAuthRouter);
app.route("/api/platform/organizations", organizations);
app.route("/api/platform/subscriptions", platformSubscriptionsRouter);
app.route("/api/platform/billing", platformBillingRouter);

// Helper: Apply platformAuthGuard to specific paths
app.use(async (c, next) => {
    const path = c.req.path;
    if (path.startsWith('/api/platform') && !path.startsWith('/api/platform/auth')) {
        return platformAuthGuard(c, next);
    }
    return next();
});

// Tenant Routes (with tenantGuard)
app.use("/api/auth/*", (c, => auth.handler(c.req.raw)));
app.use("/api/customers", tenantGuard);
app.use("/api/customers", (c, => customers.handler(c.req)));
app.use("/api/assets", tenantGuard);
app.use("/api/orders", tenantGuard);
app.use("/api/inventory", tenantGuard);
app.use("/api/expenses", tenantGuard);
app.use("/api/settings", tenantGuard);
app.use("/api/workflow", tenantGuard);
app.use("/api/members", tenantGuard);
app.use("/api/appointments", tenantGuard);
app.use("/api/dashboard", tenantGuard);
app.use("/api/upload", tenantGuard);
app.use("/api/categories", tenantGuard);
app.use("/api/notifications", tenantGuard);
app.use("/api/payments", tenantGuard);
app.use("/api/invoices", tenantGuard);

app.get("/", (c) => c.text("TaListoPro API is running! 🚀"));

// OpenAPI Documentation
app.doc('/doc', {
    openapi: '3.0.0',
    info: {
        version: '1.0.0',
        title: 'TaListoPro API',
        description: 'Gestión de talleres y servicios residenciales E2E Type-Safe API',
    },
});

app.get('/ui', apiReference({
    theme: 'mars',
    url: '/doc',
}));

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
    fetch: app.fetch,
    port,
});

export type AppType = typeof app;
export default app;
