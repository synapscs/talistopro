export class StorageService {
    /**
     * Simula la subida de un archivo a R2.
     * En producción, esto usaría @aws-sdk/client-s3.
     */
    async uploadFile(file, fileName, contentType) {
        console.log(`[MockR2] Subiendo archivo: ${fileName} (${contentType})`);
        // Simulamos un delay de red
        await new Promise(resolve => setTimeout(resolve, 800));
        // Retornamos una URL ficticia
        return `https://storage.talistopro.com/uploads/${Date.now()}-${fileName}`;
    }
    async deleteFile(url) {
        console.log(`[MockR2] Eliminando archivo: ${url}`);
    }
}
export const storage = new StorageService();
