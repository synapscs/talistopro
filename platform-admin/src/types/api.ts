// Centralización de Tipos Derivados de la API Platform Admin
// Manually defined to avoid Hono client type inference issues
export type ApiResponse<T> = T extends (...args: any[]) => any ? any : never;

// Platform Auth Types
export type LoginInput = { email: string; password: string };
export type LoginResponse = { success: boolean; token: string; user: { email: string } };

// Platform Organizations Types
export type OrganizationListItem = any;
export type OrganizationDetail = any;
export type UpdateOrganizationInput = any;

// Platform Subscriptions Types
export type Subscription = any;
export type ChangePlanInput = any;

// Platform Billing Types
export type PlatformInvoice = any;
export type PlatformInvoiceDetail = any;
export type GenerateInvoiceInput = any;

// Platform Dashboard Types
export type PlatformDashboardStats = any;
export type PlatformUsageStats = any;

// Platform Members Types
export type PlatformMember = any;
export type PlatformMemberDetail = any;
export type InviteMemberInput = any;

// Platform Plans Types
export type PlatformPlan = any;
export type CreatePlanInput = any;
export type UpdatePlanInput = any;
