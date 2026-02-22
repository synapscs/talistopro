import 'dotenv/config';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { apiReference } from '@scalar/hono-api-reference';
import { auth } from "./auth";
import { customers } from "./routes/customers";
import { assets } from "./routes/assets";
import { orders } from "./routes/orders";
import { inventory } from "./routes/inventory";
import { onboarding } from "./routes/onboarding";
import { expenses } from "./routes/expenses";
import { settings } from "./routes/settings";
import { workflow } from "./routes/workflow";
import { members } from "./routes/members";
import { appointments } from "./routes/appointments";
import { dashboard } from "./routes/dashboard";
import { upload } from "./routes/upload";
import { categories } from "./routes/categories";

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

// Route Handlers (Auth and Onboarding do NOT need tenantGuard initially)
app.all("/api/auth/*", (c) => {
    return auth.handler(c.req.raw);
});

app.route("/api/onboarding", onboarding);

// Protected Routes (Everything after this needs a session and activeOrg)
app.use("/api/*", tenantGuard);

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

app.get("/", (c) => {
    return c.text("TaListoPro API is running! 🚀");
});

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
