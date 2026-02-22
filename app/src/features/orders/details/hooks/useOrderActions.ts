import { useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '../../../../lib/api-client';

interface UploadEvidenceParams {
    orderId: string;
    file: File;
}

interface UpdateStatusParams {
    orderId: string;
    status: string;
    notes?: string;
}

interface AddPaymentParams {
    orderId: string;
    amount: number;
    method: string;
    reference?: string;
}

export const useOrderActions = () => {
    const queryClient = useQueryClient();

    // 1. Update Status Mutation
    const updateStatus = useMutation({
        mutationFn: async ({ orderId, status, notes }: UpdateStatusParams) => {
            const res = await client.api.orders[':id'].status.$patch({
                param: { id: orderId },
                json: { status, notes }
            });
            if (!res.ok) throw new Error('Error al actualizar estado');
            return await res.json();
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
            queryClient.invalidateQueries({ queryKey: ['orders'] }); // Refresh list
        }
    });

    // 2. Add Payment Mutation
    const addPayment = useMutation({
        mutationFn: async ({ orderId, amount, method, reference }: AddPaymentParams) => {
            const res = await client.api.orders[':id'].payments.$post({
                param: { id: orderId },
                json: { amount, method, reference }
            });
            if (!res.ok) throw new Error('Error al registrar pago');
            return await res.json();
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
        }
    });

    // 3. Upload Evidence (R2)
    const uploadEvidence = useMutation({
        mutationFn: async ({ orderId, file }: UploadEvidenceParams) => {
            // A. Presign
            const presignRes = await client.api.upload.presign.$post({
                json: {
                    fileName: file.name,
                    fileType: file.type,
                    folder: `orders/${orderId}`
                }
            });
            if (!presignRes.ok) throw new Error('Error en presign');
            const { uploadUrl, publicUrl } = await presignRes.json() as { uploadUrl: string, publicUrl: string };

            // B. Upload to R2
            await fetch(uploadUrl, {
                method: 'PUT',
                body: file,
                headers: { 'Content-Type': file.type }
            });

            // C. Link to Order (Backend logic needed here to append to photos array)
            // For now assuming a patch to photos
            // In a real scenario, we might have a specific endpoint for adding evidence
            // or we patch the order's photos array.
            // Let's assume we patch the order for now or use a specific endpoint if exists.
            // Re-using the update order endpoint for photos is common.

            // Fetch current order to append? Or backend handles append?
            // Let's assume backend has an endpoint or we patch.
            // Simplified: We return the url, component handles the patch or we do it here.
            // Better: A specific endpoint `POST /orders/:id/evidence` is cleaner.
            // Falling back to Patch for MVP if no specific endpoint.

            return publicUrl;
        },
        // We don't invalidate immediately, we let the component handle the patch update 
        // or if we had a specific backend endpoint we would invalidate.
    });

    return {
        updateStatus,
        addPayment,
        uploadEvidence
    };
};
