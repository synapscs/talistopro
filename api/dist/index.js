import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth.js";
import { customers } from "./routes/customers";
import { assets } from "./routes/assets";
import { orders } from "./routes/orders";
import { inventory } from "./routes/inventory";
const app = new Hono();
// Middlewares
app.use("*", cors({
    origin: (origin) => origin,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
}));
// Route Handlers
app.route("/api/customers", customers);
app.route("/api/assets", assets);
app.route("/api/orders", orders);
app.route("/api/inventory", inventory);
// Auth handler
app.on(["POST", "GET"], "/api/auth/**", (c) => {
    return auth.handler(c.req.raw);
});
app.get("/", (c) => {
    return c.text("TaListoPro API is running! 🚀");
});
export default app;
