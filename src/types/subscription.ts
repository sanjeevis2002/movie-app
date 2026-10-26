// Subscription & Payment Gateway Types

export type PlanDurationUnit = 'days' | 'months' | 'years';

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string; // 'basic' | 'premium' | 'ultimate'
  priceInr: number;
  durationDays: number;
  billingPeriodLabel: string; // e.g. "30 Days", "3 Months", "1 Year"
  description: string;
  features: string[];
  isFeatured: boolean;
  isActive: boolean;
  accessTier: 'standard' | 'expanded' | 'maximum';
  maxScreens: number;
  videoQuality: 'HD 720p' | 'Full HD 1080p' | '4K Ultra HD + Dolby';
  allowsOfflineDownloads: boolean;
  allowsLiveEvents: boolean;
  badge?: string; // e.g. "Most Popular", "Best Value"
  createdAt: number;
  updatedAt: number;
}

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled' | 'pending';

export interface UserSubscription {
  id: string;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  orderId: string;
  transactionRef: string;
  amountInr: number;
  startDate: string; // ISO date string
  expiryDate: string; // ISO date string
  status: SubscriptionStatus;
  autoRenew: boolean;
  maxScreens: number;
  videoQuality: string;
  accessTier: 'standard' | 'expanded' | 'maximum';
  createdAt: number;
  updatedAt: number;
}

export type PaymentOrderStatus =
  | 'created'
  | 'pending'
  | 'success'
  | 'failed'
  | 'cancelled'
  | 'expired';

export interface PaymentOrder {
  id: string;
  orderNumber: string; // e.g. "ORD-IMB-1740578..."
  userId: string;
  userName: string;
  userEmail: string;
  planId: string;
  planName: string;
  amountInr: number;
  currency: string; // 'INR'
  status: PaymentOrderStatus;
  gatewayName: string; // 'IMB'
  gatewayOrderId?: string;
  checkoutUrl?: string;
  transactionRef?: string;
  paymentMethod?: string; // 'UPI' | 'Card' | 'NetBanking' | 'Wallet'
  errorMessage?: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
}

export interface PaymentTransaction {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  amountInr: number;
  currency: string;
  gatewayName: string;
  transactionRef: string;
  paymentMethod: string;
  status: 'success' | 'failed' | 'refunded' | 'pending';
  gatewayResponse?: Record<string, unknown>;
  isVerified: boolean;
  verificationMethod: 'webhook' | 'status_api' | 'manual_audit' | 'dual_verification';
  verifiedAt: number;
  createdAt: number;
}

export interface IMBGatewaySettings {
  gatewayName: string; // 'IMB'
  isEnabled: boolean;
  environment: 'sandbox' | 'production';
  merchantId: string;
  clientId: string;
  clientSecretMasked: string; // masked in UI: ••••••••••••
  clientSecretConfigured: boolean;
  apiBaseUrl: string;
  webhookUrl: string;
  webhookSecretMasked: string;
  webhookSecretConfigured: boolean;
  verificationMode: 'auto_webhook' | 'poll_status_api' | 'dual_verification';
  connectionStatus: 'connected' | 'untested' | 'failed';
  lastTestedAt?: number;
  lastTestMessage?: string;
  updatedBy: string;
  updatedAt: number;
}

export interface PaymentWebhookLog {
  id: string;
  gatewayName: string;
  eventType: string;
  orderId: string;
  transactionRef?: string;
  payload: Record<string, unknown>;
  signature: string;
  isVerified: boolean;
  processingStatus: 'success' | 'duplicate_ignored' | 'failed' | 'signature_mismatch';
  errorMessage?: string;
  ipAddress?: string;
  receivedAt: number;
}

export interface SubscriptionActivityLog {
  id: string;
  adminName: string;
  action: string;
  entityType: 'PLAN' | 'SUBSCRIPTION' | 'ORDER' | 'GATEWAY_SETTINGS';
  entityId: string;
  details: string;
  timestamp: number;
}
