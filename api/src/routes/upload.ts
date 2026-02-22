import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { storage } from '../services/storage';
import { prisma } from '../lib/db';
import type { AppEnv } from '../types/env';

const uploadSchema = z.object({
    fileName: z.string().min(1),
    fileType: z.string().min(1), // e.g., 'image/png'
});

// Ruta encadenada para inferencia de tipos Hono RPC
const upload = new Hono<AppEnv>()
    .post('/presign', zValidator('json', uploadSchema), async (c) => {
        const { fileName, fileType } = c.req.valid('json');
        const orgId = c.get('orgId');

        try {
            // Fetch organization slug for folder structure
            const org = await prisma.organization.findUnique({
                where: { id: orgId },
                select: { slug: true }
            });

            const folder = org?.slug || 'uploads';

            const { uploadUrl, publicUrl } = await storage.getPresignedUploadUrl(fileName, fileType, folder);
            return c.json({ uploadUrl, publicUrl });
        } catch (error) {
            console.error('Presign Error:', error);
            return c.json({ error: 'Failed to generate upload URL' }, 500);
        }
    });

export { upload };
