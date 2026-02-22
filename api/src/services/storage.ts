import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || '';
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || '';

console.log('[Storage] Config R2:', {
    accountId: R2_ACCOUNT_ID ? '***' + R2_ACCOUNT_ID.slice(-4) : 'MISSING',
    bucket: R2_BUCKET_NAME
});

if (!R2_ACCOUNT_ID) {
    console.error("[Storage] CRITICAL: R2_ACCOUNT_ID is missing in .env");
}

const S3 = new S3Client({
    region: 'auto',
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});

export class StorageService {

    /**
     * Genera una URL firmada para subir un archivo directamente al bucket (Presigned URL).
     * El frontend usará esta URL con un PUT request.
     */
    async getPresignedUploadUrl(fileName: string, fileType: string, folder: string = 'uploads'): Promise<{ uploadUrl: string, publicUrl: string }> {
        const uniqueFileName = `${Date.now()}-${fileName}`;
        // Sanitize folder name to prevent directory traversal or invalid chars
        // Remove leading/trailing slashes just in case
        const safeFolder = folder.replace(/^\/+|\/+$/g, '');
        const key = `${safeFolder}/${uniqueFileName}`;

        const command = new PutObjectCommand({
            Bucket: R2_BUCKET_NAME,
            Key: key,
            ContentType: fileType,
        });

        // La URL firmada expira en 5 minutos
        const uploadUrl = await getSignedUrl(S3, command, { expiresIn: 300 });

        // URL pública final (si R2.dev o dominio custom está configurado)
        let publicUrl = '';
        if (R2_PUBLIC_URL) {
            const protocol = R2_PUBLIC_URL.startsWith('http') ? '' : 'https://';
            publicUrl = `${protocol}${R2_PUBLIC_URL}/${key}`;
        } else {
            publicUrl = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET_NAME}/${key}`;
        }

        return { uploadUrl, publicUrl };
    }

    async deleteFile(fileUrl: string): Promise<void> {
        try {
            // Extraer la key de la URL
            const urlParts = fileUrl.split('/');
            const key = urlParts[urlParts.length - 1];

            await S3.send(new DeleteObjectCommand({
                Bucket: R2_BUCKET_NAME,
                Key: key,
            }));
            console.log(`[R2] Archivo eliminado: ${key}`);
        } catch (error) {
            console.error(`[R2] Error eliminando archivo:`, error);
        }
    }
}

export const storage = new StorageService();
