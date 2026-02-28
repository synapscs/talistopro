import 'dotenv/config';
import { OpenAPIHono } from '@hono/zod-openapi';
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { apiReference } from '@scalar/hono-api-reference';

const app = new OpenAPIHono();

// Cors
app.use("*", cors({
    origin: (origin) => origin,
    allowHeaders: ["Content-Type", "Authorization", "X-Requested-With", "better-auth-agent"],
    allowMethods: ["POST", "GET", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length", "Set-Cookie"],
    maxAge: 600,
    credentials: true,
}));

// Root endpoint
app.get("/", (c) => c.text("TaListoPro API is running! 🚀"));

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
    fetch: app.fetch,
    port,
});

export type AppType = typeof app;
export default app;
