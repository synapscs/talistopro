import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

const API_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

export const authClient = createAuthClient({
    baseURL: API_URL,
    plugins: [
        organizationClient()
    ]
});
