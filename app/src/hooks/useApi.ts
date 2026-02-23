import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authClient } from '../lib/auth-client';
import { client } from '../lib/api-client';
import type { InferRequestType } from 'hono/client';

// -- CLIENTES (Typed via OpenAPI) --

export const useCustomers = () => {
    const { data: session } = authClient.useSession();
    const activeOrgId = session?.session?.activeOrganizationId;

    return useQuery({
        queryKey: ['customers'],
        queryFn: async () => {
            const res = await client.api.customers.$get();
            if (!res.ok) throw new Error('Error al cargar clientes');
            return await res.json();
        },
        enabled: !!activeOrgId,
    });
};

export const useCreateCustomer = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.customers.$post>['json'];
    return useMutation({
        mutationFn: async (customerData: ReqType) => {
            const res = await client.api.customers.$post({ json: customerData });
            if (!res.ok) throw new Error('Error al crear cliente');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
};

export const useUpdateCustomer = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.customers[':id']['$put']>['json'];
    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string } & ReqType) => {
            const res = await client.api.customers[':id'].$put({
                param: { id },
                json: data
            });
            if (!res.ok) throw new Error('Error al actualizar cliente');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
};

export const useDeleteCustomer = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (customerId: string) => {
            const res = await client.api.customers[':id'].$delete({
                param: { id: customerId }
            });
            if (!res.ok) throw new Error('Error al eliminar cliente');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['customers'] });
        },
    });
};

// -- MIEMBROS --

export const useMembers = () => {
    const { data: session } = authClient.useSession();
    const activeOrgId = session?.session?.activeOrganizationId;

    return useQuery({
        queryKey: ['members'],
        queryFn: async () => {
            const res = await client.api.members.$get();
            if (!res.ok) throw new Error('Error al cargar miembros');
            return await res.json();
        },
        enabled: !!activeOrgId,
    });
};

export const useCreateMember = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.members.$post>['json'];
    return useMutation({
        mutationFn: async (memberData: ReqType) => {
            const res = await client.api.members.$post({ json: memberData });
            if (!res.ok) throw new Error('Error al añadir miembro');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
        },
    });
};

export const useUpdateMember = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.members[':id']['$patch']>['json'];
    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string } & ReqType) => {
            const res = await client.api.members[':id'].$patch({
                param: { id },
                json: data
            });
            if (!res.ok) throw new Error('Error al actualizar miembro');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
        },
    });
};

export const useDeleteMember = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await client.api.members[':id'].$delete({ param: { id } });
            if (!res.ok) throw new Error('Error al eliminar miembro');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['members'] });
        },
    });
};

// -- ACTIVOS --

export const useAssets = (customerName?: string, customerId?: string) => {
    const { data: session } = authClient.useSession();
    const activeOrgId = session?.session?.activeOrganizationId;

    return useQuery({
        queryKey: ['assets', customerName, customerId],
        queryFn: async () => {
            const res = await client.api.assets.$get({
                query: { customerId, customerName }
            });
            if (!res.ok) throw new Error('Error al cargar activos');
            return await res.json();
        },
        enabled: !!activeOrgId,
    });
};

export const useCreateAsset = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.assets.$post>['json'];
    return useMutation({
        mutationFn: async (assetData: ReqType) => {
            const res = await client.api.assets.$post({ json: assetData });
            if (!res.ok) throw new Error('Error al crear activo');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets'] });
        },
    });
};

export const useUpdateAsset = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.assets[':id']['$put']>['json'];
    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string } & ReqType) => {
            const res = await client.api.assets[':id'].$put({
                param: { id },
                json: data
            });
            if (!res.ok) throw new Error('Error al actualizar activo');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets'] });
        },
    });
};

export const useDeleteAsset = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await client.api.assets[':id'].$delete({ param: { id } });
            if (!res.ok) throw new Error('Error al eliminar activo');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assets'] });
        },
    });
};

// -- ÓRDENES --

export const useOrders = () => {
    const { data: session } = authClient.useSession();
    const activeOrgId = session?.session?.activeOrganizationId;

    return useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const res = await client.api.orders.$get();
            if (!res.ok) throw new Error('Error al cargar órdenes');
            return await res.json();
        },
        enabled: !!activeOrgId,
    });
};

export const useOrder = (id?: string) => {
    return useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            if (!id) return null;
            const res = await client.api.orders[':orderId'].$get({
                param: { orderId: id }
            });
            if (!res.ok) throw new Error('Error al cargar orden');
            const data = await res.json();
            return data.order; // useOrder usually returns just the order object
        },
        enabled: !!id,
    });
};

export const useOrderDetail = (id?: string) => {
    return useQuery({
        queryKey: ['order-detail', id],
        queryFn: async () => {
            if (!id) return null;
            const res = await client.api.orders[':orderId'].$get({
                param: { orderId: id }
            });
            if (!res.ok) throw new Error('Error al cargar detalle de orden');
            return await res.json(); // Returns { order, workflowConfig }
        },
        enabled: !!id,
    });
};

export const useCreateOrder = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.orders.$post>['json'];
    return useMutation({
        mutationFn: async (orderData: ReqType) => {
            const res = await client.api.orders.$post({ json: orderData });
            if (!res.ok) throw new Error('Error al crear orden');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
};

export const useUpdateOrder = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.orders[':id']['$put']>['json'];
    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string } & ReqType) => {
            const res = await client.api.orders[':id'].$put({
                param: { id },
                json: data
            });
            if (!res.ok) throw new Error('Error al actualizar orden');
            return await res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['order-detail', variables.id] });
        },
    });
};

export const useDeleteOrder = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await client.api.orders[':id'].$delete({ param: { id } });
            if (!res.ok) throw new Error('Error al eliminar orden');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
};

// -- INVENTARIO (PRODUCTOS) --

export const useProducts = () => {
    const { data: session } = authClient.useSession();
    const activeOrgId = session?.session?.activeOrganizationId;

    return useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await client.api.inventory.products.$get();
            if (!res.ok) throw new Error('Error al cargar productos');
            return await res.json();
        },
        enabled: !!activeOrgId,
    });
};

export const useCreateProduct = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.inventory.products.$post>['json'];
    return useMutation({
        mutationFn: async (productData: ReqType) => {
            const res = await client.api.inventory.products.$post({ json: productData });
            if (!res.ok) throw new Error('Error al crear producto');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.inventory.products[':id']['$put']>['json'];
    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string } & ReqType) => {
            const res = await client.api.inventory.products[':id'].$put({
                param: { id },
                json: data
            });
            if (!res.ok) throw new Error('Error al actualizar producto');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

export const useDeleteProduct = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await client.api.inventory.products[':id'].$delete({ param: { id } });
            if (!res.ok) throw new Error('Error al eliminar producto');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
        },
    });
};

// -- SERVICIOS --

export const useServices = () => {
    return useQuery({
        queryKey: ['services'],
        queryFn: async () => {
            const res = await client.api.inventory.services.$get();
            if (!res.ok) throw new Error('Error al cargar servicios');
            return await res.json();
        },
    });
};

export const useCreateService = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.inventory.services.$post>['json'];
    return useMutation({
        mutationFn: async (serviceData: ReqType) => {
            const res = await client.api.inventory.services.$post({ json: serviceData });
            if (!res.ok) throw new Error('Error al crear servicio');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
};

export const useUpdateService = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.inventory.services[':id']['$put']>['json'];
    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string } & ReqType) => {
            const res = await client.api.inventory.services[':id'].$put({
                param: { id },
                json: data
            });
            if (!res.ok) throw new Error('Error al actualizar servicio');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
};

export const useDeleteService = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await client.api.inventory.services[':id'].$delete({ param: { id } });
            if (!res.ok) throw new Error('Error al eliminar servicio');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services'] });
        },
    });
};

// -- CATEGORÍAS --

export const useCategories = (type?: 'product' | 'service' | 'expense') => {
    const { data: session } = authClient.useSession();
    const activeOrgId = session?.session?.activeOrganizationId;

    return useQuery({
        queryKey: ['categories', type],
        queryFn: async () => {
            const res = await client.api.categories.$get({
                query: { type }
            });
            if (!res.ok) throw new Error('Error al cargar categorías');
            return await res.json();
        },
        enabled: !!activeOrgId,
    });
};

export const useCreateCategory = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.categories.$post>['json'];
    return useMutation({
        mutationFn: async (categoryData: ReqType) => {
            const res = await client.api.categories.$post({ json: categoryData });
            if (!res.ok) throw new Error('Error al crear categoría');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useUpdateCategory = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.categories[':id']['$put']>['json'];
    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string } & ReqType) => {
            const res = await client.api.categories[':id'].$put({
                param: { id },
                json: data
            });
            if (!res.ok) throw new Error('Error al actualizar categoría');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

export const useDeleteCategory = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await client.api.categories[':id'].$delete({ param: { id } });
            if (!res.ok) throw new Error('Error al eliminar categoría');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['categories'] });
        },
    });
};

// -- GASTOS --

export const useExpenses = () => {
    const { data: session } = authClient.useSession();
    const activeOrgId = session?.session?.activeOrganizationId;

    return useQuery({
        queryKey: ['expenses'],
        queryFn: async () => {
            const res = await client.api.expenses.$get();
            if (!res.ok) throw new Error('Error al cargar gastos');
            return await res.json();
        },
        enabled: !!activeOrgId,
    });
};

export const useCreateExpense = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.expenses.$post>['json'];
    return useMutation({
        mutationFn: async (expenseData: ReqType) => {
            const res = await client.api.expenses.$post({ json: expenseData });
            if (!res.ok) throw new Error('Error al registrar gasto');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
    });
};

export const useUpdateExpense = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.expenses[':id']['$put']>['json'];
    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string } & ReqType) => {
            const res = await client.api.expenses[':id'].$put({
                param: { id },
                json: data
            });
            if (!res.ok) throw new Error('Error al actualizar gasto');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
    });
};

export const useDeleteExpense = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await client.api.expenses[':id'].$delete({ param: { id } });
            if (!res.ok) throw new Error('Error al eliminar gasto');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
        },
    });
};

// -- PROVEEDORES --

export const useSuppliers = () => {
    const { data: session } = authClient.useSession();
    const activeOrgId = session?.session?.activeOrganizationId;

    return useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => {
            const res = await client.api.expenses.suppliers.$get();
            if (!res.ok) throw new Error('Error al cargar proveedores');
            return await res.json();
        },
        enabled: !!activeOrgId,
    });
};

export const useCreateSupplier = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.expenses.suppliers.$post>['json'];
    return useMutation({
        mutationFn: async (supplierData: ReqType) => {
            const res = await client.api.expenses.suppliers.$post({ json: supplierData });
            if (!res.ok) throw new Error('Error al registrar proveedor');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        },
    });
};

export const useUpdateSupplier = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.expenses.suppliers[':id']['$put']>['json'];
    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string } & ReqType) => {
            const res = await client.api.expenses.suppliers[':id'].$put({
                param: { id },
                json: data
            });
            if (!res.ok) throw new Error('Error al actualizar proveedor');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        },
    });
};

export const useDeleteSupplier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await client.api.expenses.suppliers[':id'].$delete({ param: { id } });
            if (!res.ok) throw new Error('Error al eliminar proveedor');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        },
    });
};

// -- DASHBOARD --

export const useDashboardStats = () => {
    const { data: session } = authClient.useSession();
    const activeOrgId = session?.session?.activeOrganizationId;

    return useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: async () => {
            const res = await client.api.dashboard.stats.$get();
            if (!res.ok) throw new Error('Error al cargar estadísticas');
            return await res.json();
        },
        enabled: !!activeOrgId,
    });
};

// -- APPOINTMENTS --

export const useAppointments = (start?: string, end?: string) => {
    const { data: session } = authClient.useSession();
    const activeOrgId = session?.session?.activeOrganizationId;

    return useQuery({
        queryKey: ['appointments', start, end],
        queryFn: async () => {
            const res = await client.api.appointments.$get({
                query: { start, end }
            });
            if (!res.ok) throw new Error('Error al cargar citas');
            return await res.json();
        },
        enabled: !!activeOrgId,
    });
};

export const useCreateAppointment = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.appointments.$post>['json'];
    return useMutation({
        mutationFn: async (appointmentData: ReqType) => {
            const res = await client.api.appointments.$post({ json: appointmentData });
            if (!res.ok) throw new Error('Error al crear cita');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
};

export const useUpdateAppointment = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.appointments[':id']['$patch']>['json'];
    return useMutation({
        mutationFn: async ({ id, ...data }: { id: string } & ReqType) => {
            const res = await client.api.appointments[':id'].$patch({
                param: { id },
                json: data
            });
            if (!res.ok) throw new Error('Error al actualizar cita');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
};

export const useDeleteAppointment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await client.api.appointments[':id'].$delete({ param: { id } });
            if (!res.ok) throw new Error('Error al eliminar cita');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
        },
    });
};

// -- CONFIGURACIÓN (SETTINGS) --

export const useSettings = () => {
    const { data: session } = authClient.useSession();
    const activeOrgId = session?.session?.activeOrganizationId;

    return useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await client.api.settings.$get();
            if (!res.ok) throw new Error('Error al cargar configuración');
            return await res.json();
        },
        enabled: !!activeOrgId,
    });
};

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.settings.$patch>['json'];
    return useMutation({
        mutationFn: async (settingsData: ReqType) => {
            const res = await client.api.settings.$patch({ json: settingsData });
            if (!res.ok) throw new Error('Error al actualizar configuración');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
    });
};

export const useSeedPresets = () => {
    return useMutation({
        mutationFn: async () => {
            const res = await client.api.settings['seed-presets'].$post();
            if (!res.ok) throw new Error('Error al cargar presets');
            return await res.json();
        },
    });
};

// -- FLUJO DE TRABAJO (WORKFLOW) --

export const useWorkflowStages = () => {
    const { data: session } = authClient.useSession();
    const activeOrgId = session?.session?.activeOrganizationId;

    return useQuery({
        queryKey: ['workflow-stages'],
        queryFn: async () => {
            const res = await client.api.workflow.$get();
            if (!res.ok) throw new Error('Error al cargar etapas del flujo');
            return await res.json();
        },
        enabled: !!activeOrgId,
    });
};

export const useSyncWorkflow = () => {
    const queryClient = useQueryClient();
    type ReqType = InferRequestType<typeof client.api.workflow.sync.$post>['json'];
    return useMutation({
        mutationFn: async (stages: ReqType) => {
            const res = await client.api.workflow.sync.$post({ json: stages });
            if (!res.ok) throw new Error('Error al sincronizar flujo');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflow-stages'] });
        },
    });
};

export const useDeleteWorkflowStage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await client.api.workflow[':id'].$delete({ param: { id } });
            if (!res.ok) throw new Error('Error al eliminar etapa');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workflow-stages'] });
        },
    });
};

// -- ONBOARDING --

export const useOnboardingResolveSlug = () => {
    return useMutation({
        mutationFn: async (slug: string) => {
            const res = await client.api.onboarding['resolve-slug'][':slug'].$get({
                param: { slug }
            });
            if (!res.ok) throw new Error('Error al validar identificador');
            return await res.json();
        },
    });
};

export const useOnboardingSetup = () => {
    type ReqType = InferRequestType<typeof client.api.onboarding.setup.$post>['json'];
    return useMutation({
        mutationFn: async (data: ReqType) => {
            const res = await client.api.onboarding.setup.$post({ json: data });
            if (!res.ok) throw new Error('Error al completar configuración');
            return await res.json();
        },
    });
};

// -- UPLOAD --

export const usePresignUpload = () => {
    return useMutation({
        mutationFn: async (data: { fileName: string; fileType: string }) => {
            const res = await client.api.upload.presign.$post({ json: data });
            if (!res.ok) throw new Error('Error al generar URL de subida');
            return await res.json();
        },
    });
};

// -- ORDERS: SEND MESSAGE --

export const useSendOrderMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { orderId: string; message: string; saveToHistory?: boolean }) => {
            const res = await client.api.orders[':orderId']['send-message'].$post({
                param: { orderId: data.orderId },
                json: {
                    message: data.message,
                    saveToHistory: data.saveToHistory ?? true,
                },
            });
            if (!res.ok) {
                const error = await res.json();
                throw new Error((error as any).message || 'Error al enviar mensaje');
            }
            return await res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['order-detail', variables.orderId] });
        },
    });
};

// -- PAGOS --

export const usePayments = (orderId?: string) => {
    const { data: session } = authClient.useSession();
    const activeOrgId = session?.session?.activeOrganizationId;

    return useQuery({
        queryKey: ['payments', orderId],
        queryFn: async () => {
            const res = await client.api.payments.$get({
                query: orderId ? { orderId } : undefined
            });
            if (!res.ok) throw new Error('Error al cargar pagos');
            return await res.json();
        },
        enabled: !!activeOrgId,
    });
};

export const useCreatePayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { orderId: string; amount: number; currency?: string; exchangeRate?: number; method: string; reference?: string; notes?: string }) => {
            const res = await client.api.payments.$post({ json: data });
            if (!res.ok) throw new Error('Error al crear pago');
            return await res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['payments', variables.orderId] });
            queryClient.invalidateQueries({ queryKey: ['order-detail', variables.orderId] });
            queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
        },
    });
};

export const useUpdatePayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { id: string; amount?: number; currency?: string; exchangeRate?: number; method?: string; reference?: string; notes?: string }) => {
            const res = await client.api.payments[':id'].$put({
                param: { id: data.id },
                json: data
            });
            if (!res.ok) throw new Error('Error al actualizar pago');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
};

export const useDeletePayment = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await client.api.payments[':id'].$delete({ param: { id } });
            if (!res.ok) throw new Error('Error al eliminar pago');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        },
    });
};

// -- FACTURAS --

export const useInvoices = (filters?: { status?: string; customerId?: string; start?: string; end?: string }) => {
    const { data: session } = authClient.useSession();
    const activeOrgId = session?.session?.activeOrganizationId;

    return useQuery({
        queryKey: ['invoices', filters],
        queryFn: async () => {
            const res = await client.api.invoices.$get({
                query: filters as any
            });
            if (!res.ok) throw new Error('Error al cargar facturas');
            return await res.json();
        },
        enabled: !!activeOrgId,
    });
};

export const useInvoiceById = (id?: string) => {
    return useQuery({
        queryKey: ['invoice', id],
        queryFn: async () => {
            if (!id) return null;
            const res = await client.api.invoices[':id'].$get({
                param: { id }
            });
            if (!res.ok) throw new Error('Error al cargar factura');
            return await res.json();
        },
        enabled: !!id,
    });
};

export const useInvoiceByOrder = (orderId?: string) => {
    return useQuery({
        queryKey: ['invoice-by-order', orderId],
        queryFn: async () => {
            if (!orderId) return null;
            const res = await client.api.invoices['order'][':orderId'].$get({
                param: { orderId }
            });
            if (!res.ok) throw new Error('Error al cargar factura');
            return await res.json();
        },
        enabled: !!orderId,
    });
};

export const useCreateInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { orderId: string }) => {
            const res = await client.api.invoices.$post({ json: data });
            if (!res.ok) {
                const error = await res.json();
                throw new Error((error as any).message || 'Error al crear factura');
            }
            return await res.json();
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['invoice-by-order', variables.orderId] });
            queryClient.invalidateQueries({ queryKey: ['order-detail', variables.orderId] });
        },
    });
};

export const useUpdateInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { id: string; customerName?: string; customerDoc?: string; customerAddress?: string; status?: string }) => {
            const res = await client.api.invoices[':id'].$put({
                param: { id: data.id },
                json: data
            });
            if (!res.ok) throw new Error('Error al actualizar factura');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
    });
};

export const useUpdateInvoiceStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (data: { id: string; status: 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED' }) => {
            const res = await client.api.invoices[':id']['status'].$patch({
                param: { id: data.id },
                json: { status: data.status }
            });
            if (!res.ok) throw new Error('Error al actualizar estado de factura');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
    });
};

export const useDeleteInvoice = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await client.api.invoices[':id'].$delete({ param: { id } });
            if (!res.ok) throw new Error('Error al eliminar factura');
            return await res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
        },
    });
};
