import 'dotenv/config';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { apiReference } from '@scalar/hono-api-reference';
import { auth } from "./auth";

// Platform Routes
import { organizations } from "./routes/platform/organizations";
import { platformAuthRouter } from "./routes/platform/auth";
import { platformAuthGuard } from "./middleware/platform-auth";
import { platformSubscriptionsRouter } from "./routes/platform/subscriptions";
import { platformBillingRouter } from "./routes/platform/billing";

// Tenant Routes
import { customers } from "./routes/customers";
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

// Global Middleware
app.use("*", cors({
    origin: (origin) => origin,
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With", "better-auth-agent"],
    allowMethods: ["POST", "GET", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length", "Set-Cookie"],
    maxAge: 600,
    credentials: true,
}));

// --- PLATFORM ROUTES ---
app.route("/api/platform/auth", platformAuthRouter);
app.use("/api/platform/organizations", platformAuthGuard);
app.route("/api/platform/organizations", organizations);
app.use("/api/platform/subscriptions", platformAuthGuard);
app.route("/api/platform/subscriptions", platformSubscriptionsRouter);
app.use("/api/platform/billing", platformAuthGuard);
app.route("/api/platform/billing", platformBillingRouter);

// --- AUTH ROUTE ---
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// --- TENANT ROUTES (Protected by tenantGuard) ---
app.use("/api/*", (c, next) => {
    // Skip tenant guard for auth and platform
    if (c.req.path.startsWith("/api/auth") || c.req.path.startsWith("/api/platform")) {
        return next();
    }
    return tenantGuard(c, next);
});

app.route("/api/customers", customers);
app.route("/api/assets", assets);
app.route("/api/orders", orders);
app.route("/api/inventory", inventory);
app.route("/api/expenses", expenses);
app.route("/api/settings", settings);
app.route("/api/workflow", workflow);
app.route("/api/members", members);
app.route("/api/appointments", appointments);
app.route("/api/dashboard", dashboard);
app.route("/api/upload", upload);
app.route("/api/categories", categories);
app.route("/api/notifications", notifications);
app.route("/api/payments", payments);
app.route("/api/invoices", invoices);

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
