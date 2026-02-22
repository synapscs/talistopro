import { hc } from 'hono/client';
import type { AppType } from 'api';

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/api$/, '') || 'http://localhost:3000';

export const client = hc<AppType>(API_URL, {
    init: {
        credentials: 'include',
    },
});
