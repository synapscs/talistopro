import { hc } from 'hono/client';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:3000';

// Using a more permissive type to avoid Hono client type incompatibilities
// The client works at runtime, but TypeScript type inference can be complex with Hono
type AppType = any;

export const client = hc<AppType>(API_URL, {
  // No credentials needed - we use Authorization header for auth
});
