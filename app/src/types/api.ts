import { InferResponseType, InferRequestType } from 'hono/client';
import { client } from '../lib/api-client';
import { LucideIcon } from 'lucide-react';

// Centralización de Tipos Derivados de la API
// Eliminamos ApiResponse helper si causa problemas de inferencia anidada
export type ApiResponse<T extends (...args: any[]) => any> = InferResponseType<T>;

export interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    trend?: string;
    color: string;
}

// Entidades Principales
export type Customer = ApiResponse<typeof client.api.customers.$get>[number];
export type Member = ApiResponse<typeof client.api.members.$get>[number];
export type Asset = ApiResponse<typeof client.api.assets.$get>[number];
export type Order = ApiResponse<typeof client.api.orders.$get>[number];
export type OrderDetailResponse = ApiResponse<typeof client.api.orders[':orderId']['$get']>;
export type OrderFull = OrderDetailResponse extends { order: infer O } ? O : never;
export type Product = InferResponseType<typeof client.api.inventory.products.$get>[number];
export type Service = ApiResponse<typeof client.api.inventory.services.$get>[number];
export type Category = ApiResponse<typeof client.api.categories.$get>[number];
export type Expense = ApiResponse<typeof client.api.expenses.$get>[number];
export type Supplier = ApiResponse<typeof client.api.expenses.suppliers.$get>[number];
export type Appointment = ApiResponse<typeof client.api.appointments.$get>[number];

// Tipos para Formularios / Mutations (Inferencia de JSON body)
export type CreateCustomerInput = InferRequestType<typeof client.api.customers.$post>['json'];
export type UpdateCustomerInput = InferRequestType<typeof client.api.customers[':id']['$patch']>['json'];

export type CreateMemberInput = InferRequestType<typeof client.api.members.$post>['json'];
export type UpdateMemberInput = InferRequestType<typeof client.api.members[':id']['$patch']>['json'];

export type CreateAssetInput = InferRequestType<typeof client.api.assets.$post>['json'];
export type UpdateAssetInput = InferRequestType<typeof client.api.assets[':id']['$put']>['json'];

export type CreateOrderInput = InferRequestType<typeof client.api.orders.$post>['json'];
export type UpdateOrderInput = InferRequestType<typeof client.api.orders[':id']['$put']>['json'];

export type CreateProductInput = InferRequestType<typeof client.api.inventory.products.$post>['json'];
export type UpdateProductInput = InferRequestType<typeof client.api.inventory.products[':id']['$put']>['json'];

export type CreateServiceInput = InferRequestType<typeof client.api.inventory.services.$post>['json'];
export type UpdateServiceInput = InferRequestType<typeof client.api.inventory.services[':id']['$put']>['json'];

// Dashboard
export type DashboardStats = ApiResponse<typeof client.api.dashboard.stats.$get>;

// Settings
export type OrganizationSettings = ApiResponse<typeof client.api.settings.$get>;
