import { createFileRoute, createRoute, createRootRoute } from 'hono/file';
import { z } from 'zod';

// Esquemas de validación
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});

const organizationIdSchema = z.string().optional();

// Esquema para crear usuario admin
const createAdminSchema = z.object({
    email: z.string().email('Email de usuario admin').optional(),
    name: z.string().min(2, 'Nombre es requerido'),
});

// Esquema para actualizar usuario admin
const updateAdminSchema = z.object({
    name: z.string().min(2, 'Nombre es requerido'),
});

// Esquemas para crear plataforma/organización
const createOrgSchema = z.object({
    name: z.string().min(2),
    slug: z.string().min(2).regex(/^[a-z0-9]+-$/),
    businessType: z.enum(['AUTOMOTIVE', 'ELECTRONICS', 'MANUFACTURING', 'OTHER']),
    country: z.enum(['VE', 'CO', 'MX', 'OT']).default('VE'),
    primaryCurrency: z.enum(['USD', 'VES', 'COP', 'MXN']).default('USD'),
    secondaryCurrency: z.enum(['USD', 'VES', 'COP', 'MXN']).optional(),
    timezone: z.string().default('America/Caracas'),
    logo: z.string().url().optional(),
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).default('#6366F1'),
    themeKey: z.string().default('obsidian'),
});

// Tipos de respuesta de API
const ApiResponse = <T>(data: T, message?: string) => ({
    success: data !== undefined,
    message
});

const AuthError = z.object({
    success: z.literal(false),
    error: z.string()
});

export const authActions = {
    login: async (c: any) => {
        const body = c.req.valid('json');
        
        // Verificar si las credenciales del platform admin existen
        const email = process.env.PLATFORM_ADMIN_EMAIL || 'admin@talinto.pro';
        const password = process.env.PLATFORM_ADMIN_PASSWORD || 'admin123'; // Password por defecto, el primer login debería cambiarla
        
        const response = await fetch(`${process.env.VITE_API_URL}/api/platform/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        
        const data = await response.json();
        
        if (!data.success) {
            return c.json(data, 401);
        }
        
        // Crear sesión en Better-Auth para el backend del tenant
        const loginResponse = await fetch(`${process.env.VITE_API_URL}/api/auth/sign-in`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include credentials',
            body: JSON.stringify({
                email: body.email,
                password: password
            }),
        });
        
        const loginData = await loginResponse.json();
        
        if (!loginData.success) {
            return c.json(loginData, 401);
        }
        
        const user = loginData.user;
        
        // Guardar token
        localStorage.setItem('platform_token', user.sessionToken);
        localStorage.setItem('platform_user', JSON.stringify(user));
        
        // Verificar si es platform admin
        const isPlatformAdmin = await checkPlatformAdmin(user.id);
        
        return c.json({
            success: true,
            data: {
                user,
                isPlatformAdmin,
                // TODO: Obtener permisos específicos del platform admin
                token: user.sessionToken
            }
        });
    },

    logout: async (c: any) => {
        // Eliminar sesión
        localStorage.removeItem('platform_token');
        localStorage.removeItem('platform_user');
        
        return c.json({ success: true });
    },

    me: async (c: any) => {
        // Verificar sesión actual
        const token = localStorage.getItem('platform_token');
        const userStr = localStorage.getItem('platform_user');
        
        if (!token || !userStr) {
            return c.json({ success: false, error: 'No hay sesión activa' }, 401);
        }
        
        const user = JSON.parse(userStr);
        
        return c.json({
            success: true,
            data: { user }
        });
    },

    // Crear usuario admin (solo platform admin)
    createPlatformAdmin: async (c: any) => {
        const body = c.req.valid('json');
        
        const admin = await prisma.platformAdmin.findFirst({
            where: { userId: user.id }
        });
        
        if (admin) {
            return c.json({ success: false, error: 'Ya existe un platform admin con ese email' }, 400);
        }
        
        const platformAdmin = await prisma.platformAdmin.create({
            data: {
                userId: user.id,
                role: 'admin',
                permissions: ['all']
            }
        });
        
        return c.json({
            success: true,
            data: platformAdmin
        }, 201);
    },

    // Verificar si un usuario es platform admin
    checkPlatformAdmin: async (userId: string) => {
        const admin = await prisma.platformAdmin.findUnique({
            where: { userId }
        });
        
        return !!admin;
    }
};