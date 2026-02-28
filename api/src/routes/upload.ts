import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { storage } from '../services/storage';
import { prisma } from '../lib/db';
import type { AppEnv } from '../types/env';

const upload = new OpenAPIHono<AppEnv>();

// --- SCHEMAS ---

const UploadSchema = z.object({
    fileName: z.string().min(1),
    fileType: z.string().min(1),
}).openapi('UploadRequest');

const PresignResponseSchema = z.object({
    uploadUrl: z.string(),
    publicUrl: z.string(),
}).openapi('PresignResponse');

const ErrorSchema = z.object({ error: z.string() }).openapi('Error');

// --- ROUTES ---

const presignRoute = createRoute({
    method: 'post',
    path: '/presign',
    request: {
        body: { content: { 'application/json': { schema: UploadSchema } } }
    },
    responses: {
        200: {
            content: { 'application/json': { schema: PresignResponseSchema } },
            description: 'URL de subida generada'
        },
        500: {
            content: { 'application/json': { schema: ErrorSchema } },
            description: 'Error de servidor'
        }
    }
});

// --- IMPLEMENTATION ---

upload.openapi(presignRoute, async (c) => {
    const { fileName, fileType } = c.req.valid('json');
    const orgId = c.get('orgId');

    try {
        const org = await prisma.organization.findUnique({
            where: { id: orgId },
            select: { slug: true }
        });

        const folder = org?.slug || 'uploads';

        const { uploadUrl, publicUrl } = await storage.getPresignedUploadUrl(fileName, fileType, folder);
        return c.json({ uploadUrl, publicUrl }, 200);
    } catch (error) {
        console.error('Presign Error:', error);
        return c.json({ error: 'Failed to generate upload URL' }, 500);
    }
});

export { upload };
