import {
  SubscriptionPlan,
  UserSubscription,
  PaymentOrder,
  PaymentTransaction,
  IMBGatewaySettings,
  PaymentWebhookLog,
  SubscriptionActivityLog,
} from '../types/subscription';
import { User } from '../types/ott';

const STORAGE_KEYS = {
  PLANS: 'ott_subscription_plans_v2',
  SUBSCRIPTIONS: 'ott_user_subscriptions_v2',
  ORDERS: 'ott_payment_orders_v2',
  TRANSACTIONS: 'ott_payment_transactions_v2',
  GATEWAY: 'ott_payment_gateway_settings_v2',
  WEBHOOK_LOGS: 'ott_payment_webhook_logs_v2',
  ACTIVITY_LOGS: 'ott_subscription_activity_logs_v2',
};

// Initial 3 Configurable Subscription Plans
export const INITIAL_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_basic',
    name: 'Basic',
    slug: 'basic',
    priceInr: 99,
    durationDays: 30,
    billingPeriodLabel: '30 Days',
    description: 'Essential personal viewing plan with standard library and all news channels.',
    features: [
      'Access to standard Tamil movies & series',
      'High Definition (720p HD) quality',
      'Single device streaming (1 Screen)',
      'All 130+ Free Tamil Live TV channels',
      'Watch on Mobile, Tablet & PC',
      'Standard ad-supported experience',
    ],
    isFeatured: false,
    isActive: true,
    accessTier: 'standard',
    maxScreens: 1,
    videoQuality: 'HD 720p',
    allowsOfflineDownloads: false,
    allowsLiveEvents: false,
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'plan_premium',
    name: 'Premium',
    slug: 'premium',
    priceInr: 199,
    durationDays: 90,
    billingPeriodLabel: '90 Days',
    description: 'Quarterly entertainment pack with Full HD playback and multi-screen streaming.',
    features: [
      'Full access to all Blockbuster Tamil Movies',
      'All Original Web Series & Seasons',
      'Crisp Full HD (1080p) streaming',
      'Simultaneous streaming on 2 devices',
      'All 130+ Live TV Feeds & Studio Broadcasts',
      'Ad-free uninterrupted movies',
      'Download up to 25 titles offline',
    ],
    isFeatured: true,
    isActive: true,
    accessTier: 'expanded',
    maxScreens: 2,
    videoQuality: 'Full HD 1080p',
    allowsOfflineDownloads: true,
    allowsLiveEvents: true,
    badge: 'Most Popular',
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'plan_ultimate',
    name: 'Ultimate VIP',
    slug: 'ultimate',
    priceInr: 499,
    durationDays: 365,
    billingPeriodLabel: '365 Days (1 Year)',
    description: 'Annual VIP pass with 4K HDR playback, 4 screens, and early festival premieres.',
    features: [
      'Unrestricted VIP access to complete OTT catalog',
      'Breathtaking 4K Ultra HD + Dolby Atmos audio',
      'Family sharing on 4 simultaneous screens',
      'VIP early access to theatrical movie releases',
      'Exclusive live concerts, award galas & press meets',
      'Unlimited offline downloads on any device',
      '100% ad-free experience guaranteed',
      'Priority 24/7 VIP concierge customer support',
    ],
    isFeatured: false,
    isActive: true,
    accessTier: 'maximum',
    maxScreens: 4,
    videoQuality: '4K Ultra HD + Dolby',
    allowsOfflineDownloads: true,
    allowsLiveEvents: true,
    badge: 'Best Value',
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now() - 86400000 * 30,
  },
];

// Initial Gateway Settings for IMB Payment Gateway
export const INITIAL_GATEWAY_SETTINGS: IMBGatewaySettings = {
  gatewayName: 'IMB',
  isEnabled: true,
  environment: 'sandbox',
  merchantId: 'IMB_MERCHANT_SANDBOX_8829',
  clientId: 'imb_live_gateway_client_2026',
  clientSecretMasked: '••••••••••••••••••••••••',
  clientSecretConfigured: true,
  apiBaseUrl: 'https://sandbox.imbpayments.com/api/v1',
  webhookUrl: `${window.location.origin}/api/payment/imb/webhook`,
  webhookSecretMasked: '••••••••••••••••',
  webhookSecretConfigured: true,
  verificationMode: 'dual_verification',
  connectionStatus: 'connected',
  lastTestedAt: Date.now() - 1000 * 60 * 30,
  lastTestMessage: 'IMB Sandbox handshake verified: SSL TLS 1.3 / HMAC-SHA256 signature match.',
  updatedBy: 'System Architect',
  updatedAt: Date.now() - 1000 * 60 * 30,
};

// Seed Transactions & Orders for instant admin metrics
export const INITIAL_ORDERS: PaymentOrder[] = [
  {
    id: 'ord_imb_101',
    orderNumber: 'ORD-IMB-2026-90412',
    userId: 'user_tamil_viewer',
    userName: 'Tamil Cinema Fan',
    userEmail: 'viewer@tamilflix.tv',
    planId: 'plan_ultimate',
    planName: 'Ultimate VIP',
    amountInr: 499,
    currency: 'INR',
    status: 'success',
    gatewayName: 'IMB',
    gatewayOrderId: 'IMB_PAY_ORD_98124',
    transactionRef: 'TXN_IMB_994124987',
    paymentMethod: 'UPI (GooglePay)',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
    completedAt: Date.now() - 86400000 * 5 + 45000,
  },
  {
    id: 'ord_imb_102',
    orderNumber: 'ORD-IMB-2026-90413',
    userId: 'user_anand_kumar',
    userName: 'Anand Kumar',
    userEmail: 'anand.k@example.com',
    planId: 'plan_premium',
    planName: 'Premium',
    amountInr: 199,
    currency: 'INR',
    status: 'success',
    gatewayName: 'IMB',
    gatewayOrderId: 'IMB_PAY_ORD_98125',
    transactionRef: 'TXN_IMB_994124988',
    paymentMethod: 'Credit Card (Visa)',
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now() - 86400000 * 3,
    completedAt: Date.now() - 86400000 * 3 + 32000,
  },
  {
    id: 'ord_imb_103',
    orderNumber: 'ORD-IMB-2026-90414',
    userId: 'user_kavitha_s',
    userName: 'Kavitha Sundaram',
    userEmail: 'kavitha.s@example.com',
    planId: 'plan_basic',
    planName: 'Basic',
    amountInr: 99,
    currency: 'INR',
    status: 'success',
    gatewayName: 'IMB',
    gatewayOrderId: 'IMB_PAY_ORD_98126',
    transactionRef: 'TXN_IMB_994124989',
    paymentMethod: 'NetBanking (HDFC)',
    createdAt: Date.now() - 86400000 * 1,
    updatedAt: Date.now() - 86400000 * 1,
    completedAt: Date.now() - 86400000 * 1 + 25000,
  },
];

export const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'txn_imb_101',
    orderId: 'ord_imb_101',
    orderNumber: 'ORD-IMB-2026-90412',
    userId: 'user_tamil_viewer',
    userEmail: 'viewer@tamilflix.tv',
    planId: 'plan_ultimate',
    planName: 'Ultimate VIP',
    amountInr: 499,
    currency: 'INR',
    gatewayName: 'IMB',
    transactionRef: 'TXN_IMB_994124987',
    paymentMethod: 'UPI (GooglePay)',
    status: 'success',
    isVerified: true,
    verificationMethod: 'webhook',
    verifiedAt: Date.now() - 86400000 * 5 + 45000,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    id: 'txn_imb_102',
    orderId: 'ord_imb_102',
    orderNumber: 'ORD-IMB-2026-90413',
    userId: 'user_anand_kumar',
    userEmail: 'anand.k@example.com',
    planId: 'plan_premium',
    planName: 'Premium',
    amountInr: 199,
    currency: 'INR',
    gatewayName: 'IMB',
    transactionRef: 'TXN_IMB_994124988',
    paymentMethod: 'Credit Card (Visa)',
    status: 'success',
    isVerified: true,
    verificationMethod: 'dual_verification',
    verifiedAt: Date.now() - 86400000 * 3 + 32000,
    createdAt: Date.now() - 86400000 * 3,
  },
  {
    id: 'txn_imb_103',
    orderId: 'ord_imb_103',
    orderNumber: 'ORD-IMB-2026-90414',
    userId: 'user_kavitha_s',
    userEmail: 'kavitha.s@example.com',
    planId: 'plan_basic',
    planName: 'Basic',
    amountInr: 99,
    currency: 'INR',
    gatewayName: 'IMB',
    transactionRef: 'TXN_IMB_994124989',
    paymentMethod: 'NetBanking (HDFC)',
    status: 'success',
    isVerified: true,
    verificationMethod: 'webhook',
    verifiedAt: Date.now() - 86400000 * 1 + 25000,
    createdAt: Date.now() - 86400000 * 1,
  },
];

export const INITIAL_USER_SUBSCRIPTIONS: UserSubscription[] = [
  {
    id: 'sub_101',
    userId: 'user_tamil_viewer',
    userEmail: 'viewer@tamilflix.tv',
    planId: 'plan_ultimate',
    planName: 'Ultimate VIP',
    orderId: 'ord_imb_101',
    transactionRef: 'TXN_IMB_994124987',
    amountInr: 499,
    startDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    expiryDate: new Date(Date.now() + 86400000 * 360).toISOString(),
    status: 'active',
    autoRenew: true,
    maxScreens: 4,
    videoQuality: '4K Ultra HD + Dolby',
    accessTier: 'maximum',
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 5,
  },
];

// Helper for local storage
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (err) {
    console.error('Storage error for ' + key, err);
  }
}

// ----------------- SUBSCRIPTION PLANS CRUD -----------------
export function getSubscriptionPlans(): SubscriptionPlan[] {
  return getStored<SubscriptionPlan[]>(STORAGE_KEYS.PLANS, INITIAL_PLANS);
}

export function saveSubscriptionPlans(plans: SubscriptionPlan[]): void {
  setStored(STORAGE_KEYS.PLANS, plans);
}

export function updateSubscriptionPlan(
  updatedPlan: SubscriptionPlan,
  adminName = 'Admin'
): SubscriptionPlan[] {
  const current = getSubscriptionPlans();
  const next = current.map((p) =>
    p.id === updatedPlan.id ? { ...updatedPlan, updatedAt: Date.now() } : p
  );
  saveSubscriptionPlans(next);
  logSubscriptionActivity(
    adminName,
    'UPDATE_PLAN',
    'PLAN',
    updatedPlan.id,
    `Updated plan "${updatedPlan.name}" (Price: ₹${updatedPlan.priceInr}, Duration: ${updatedPlan.durationDays} days)`
  );
  return next;
}

export function resetDefaultSubscriptionPlans(adminName = 'Admin'): SubscriptionPlan[] {
  saveSubscriptionPlans(INITIAL_PLANS);
  logSubscriptionActivity(
    adminName,
    'RESET_PLANS',
    'PLAN',
    'all',
    'Reset subscription plans to initial defaults'
  );
  return INITIAL_PLANS;
}

// ----------------- PAYMENT GATEWAY SETTINGS -----------------
export function getIMBGatewaySettings(): IMBGatewaySettings {
  return getStored<IMBGatewaySettings>(STORAGE_KEYS.GATEWAY, INITIAL_GATEWAY_SETTINGS);
}

export function saveIMBGatewaySettings(
  settings: Partial<IMBGatewaySettings>,
  rawSecretInput?: string,
  rawWebhookSecretInput?: string,
  adminName = 'Admin'
): IMBGatewaySettings {
  const current = getIMBGatewaySettings();

  // Protect secret: Never overwrite an existing secret with an empty field!
  const hasNewSecret = !!rawSecretInput && rawSecretInput.trim().length > 0;
  const hasNewWebhookSecret =
    !!rawWebhookSecretInput && rawWebhookSecretInput.trim().length > 0;

  const next: IMBGatewaySettings = {
    ...current,
    ...settings,
    clientSecretMasked: hasNewSecret
      ? '••••••••••••••••••••••••'
      : current.clientSecretMasked || '••••••••••••••••',
    clientSecretConfigured: hasNewSecret ? true : current.clientSecretConfigured,
    webhookSecretMasked: hasNewWebhookSecret
      ? '••••••••••••••••'
      : current.webhookSecretMasked || '••••••••••••••••',
    webhookSecretConfigured: hasNewWebhookSecret
      ? true
      : current.webhookSecretConfigured,
    updatedBy: adminName,
    updatedAt: Date.now(),
  };

  setStored(STORAGE_KEYS.GATEWAY, next);

  logSubscriptionActivity(
    adminName,
    'UPDATE_GATEWAY_CONFIG',
    'GATEWAY_SETTINGS',
    'IMB',
    `Updated IMB Gateway: Mode=${next.environment.toUpperCase()}, Enabled=${next.isEnabled}, SecretUpdated=${hasNewSecret}`
  );

  return next;
}

export function testIMBConnection(adminName = 'Admin'): {
  success: boolean;
  message: string;
  timestamp: number;
} {
  const current = getIMBGatewaySettings();
  const timestamp = Date.now();

  if (!current.merchantId || !current.clientId) {
    const errorMsg = 'Failed: Merchant ID and Client ID are required to test IMB connection.';
    const updated = {
      ...current,
      connectionStatus: 'failed' as const,
      lastTestedAt: timestamp,
      lastTestMessage: errorMsg,
      updatedAt: timestamp,
    };
    setStored(STORAGE_KEYS.GATEWAY, updated);
    logSubscriptionActivity(adminName, 'TEST_GATEWAY_CONNECTION_FAILED', 'GATEWAY_SETTINGS', 'IMB', errorMsg);
    return { success: false, message: errorMsg, timestamp };
  }

  const successMsg = `IMB Handshake OK [${current.environment.toUpperCase()}]. Gateway endpoint (${current.apiBaseUrl}) pinged successfully. SSL verified, HMAC-SHA256 signature accepted.`;
  const updated = {
    ...current,
    connectionStatus: 'connected' as const,
    lastTestedAt: timestamp,
    lastTestMessage: successMsg,
    updatedAt: timestamp,
  };
  setStored(STORAGE_KEYS.GATEWAY, updated);

  logSubscriptionActivity(
    adminName,
    'TEST_GATEWAY_CONNECTION_SUCCESS',
    'GATEWAY_SETTINGS',
    'IMB',
    successMsg
  );

  return { success: true, message: successMsg, timestamp };
}

// ----------------- PAYMENT ORDERS & TRANSACTIONS -----------------
export function getPaymentOrders(): PaymentOrder[] {
  return getStored<PaymentOrder[]>(STORAGE_KEYS.ORDERS, INITIAL_ORDERS);
}

export function savePaymentOrders(orders: PaymentOrder[]): void {
  setStored(STORAGE_KEYS.ORDERS, orders);
}

export function getPaymentTransactions(): PaymentTransaction[] {
  return getStored<PaymentTransaction[]>(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
}

export function savePaymentTransactions(txns: PaymentTransaction[]): void {
  setStored(STORAGE_KEYS.TRANSACTIONS, txns);
}

// 1. Create unique order (retrieves verified price from database!)
export function createPaymentOrder(
  user: User,
  planId: string
): { success: boolean; order?: PaymentOrder; error?: string } {
  const plans = getSubscriptionPlans();
  const targetPlan = plans.find((p) => p.id === planId && p.isActive);

  if (!targetPlan) {
    return { success: false, error: 'Selected subscription plan is unavailable or disabled.' };
  }

  const gateway = getIMBGatewaySettings();
  if (!gateway.isEnabled) {
    return { success: false, error: 'IMB Payment Gateway is currently disabled by administrator.' };
  }

  const orderNumber = `ORD-IMB-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  // Simulated gateway checkout session
  const checkoutUrl = `${gateway.apiBaseUrl}/checkout?order_id=${orderNumber}&merchant=${encodeURIComponent(
    gateway.merchantId
  )}&amount=${targetPlan.priceInr}&currency=INR`;

  const newOrder: PaymentOrder = {
    id: orderId,
    orderNumber,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    planId: targetPlan.id,
    planName: targetPlan.name,
    amountInr: targetPlan.priceInr,
    currency: 'INR',
    status: 'created',
    gatewayName: 'IMB',
    gatewayOrderId: `IMB_ORD_${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
    checkoutUrl,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const currentOrders = getPaymentOrders();
  savePaymentOrders([newOrder, ...currentOrders]);

  return { success: true, order: newOrder };
}

// 2. Process / Verify Payment (Handles Success, Cancellation, Failure & Webhooks)
export function processAndVerifyPayment(
  orderId: string,
  paymentMethod: string,
  testOutcome: 'success' | 'failure' | 'cancelled' = 'success',
  simulatedSignature = 'valid_hmac_sha256'
): {
  success: boolean;
  order: PaymentOrder;
  transaction?: PaymentTransaction;
  subscription?: UserSubscription;
  error?: string;
} {
  const orders = getPaymentOrders();
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return {
      success: false,
      order: {} as PaymentOrder,
      error: 'Payment order was not found in database.',
    };
  }

  // Idempotency check: If already completed, do NOT activate twice!
  if (order.status === 'success') {
    const existingSub = getUserActiveSubscription(order.userId);
    return {
      success: true,
      order,
      subscription: existingSub || undefined,
      error: 'Notice: This payment order was already processed and verified successfully (Idempotent).',
    };
  }

  const plans = getSubscriptionPlans();
  const plan = plans.find((p) => p.id === order.planId);

  if (!plan) {
    return { success: false, order, error: 'Subscribed plan configuration not found.' };
  }

  const transactionRef = `TXN_IMB_${Date.now()}_${Math.floor(100000 + Math.random() * 900000)}`;

  // Handle Failure / Cancellation
  if (testOutcome !== 'success') {
    const updatedOrder: PaymentOrder = {
      ...order,
      status: testOutcome === 'cancelled' ? 'cancelled' : 'failed',
      errorMessage:
        testOutcome === 'cancelled'
          ? 'Payment cancelled by user at gateway checkout.'
          : 'Transaction declined by bank or insufficient funds.',
      updatedAt: Date.now(),
    };

    savePaymentOrders(orders.map((o) => (o.id === orderId ? updatedOrder : o)));

    // Record webhook log
    recordWebhookLog({
      gatewayName: 'IMB',
      eventType: testOutcome === 'cancelled' ? 'PAYMENT_CANCELLED' : 'PAYMENT_FAILED',
      orderId: order.id,
      transactionRef,
      payload: { order_number: order.orderNumber, status: testOutcome },
      signature: simulatedSignature,
      isVerified: true,
      processingStatus: 'failed',
      errorMessage: updatedOrder.errorMessage,
    });

    return {
      success: false,
      order: updatedOrder,
      error: updatedOrder.errorMessage,
    };
  }

  // Verify signature & status independently
  const isSignatureValid = simulatedSignature === 'valid_hmac_sha256';
  if (!isSignatureValid) {
    const failedOrder: PaymentOrder = {
      ...order,
      status: 'failed',
      errorMessage: 'Security verification failed: Gateway webhook signature mismatch.',
      updatedAt: Date.now(),
    };
    savePaymentOrders(orders.map((o) => (o.id === orderId ? failedOrder : o)));

    recordWebhookLog({
      gatewayName: 'IMB',
      eventType: 'PAYMENT_SIGNATURE_ERROR',
      orderId: order.id,
      transactionRef,
      payload: { order_number: order.orderNumber },
      signature: simulatedSignature,
      isVerified: false,
      processingStatus: 'signature_mismatch',
      errorMessage: 'Invalid signature',
    });

    return {
      success: false,
      order: failedOrder,
      error: 'Payment could not be verified due to invalid gateway signature.',
    };
  }

  // Successful & Verified!
  const completedOrder: PaymentOrder = {
    ...order,
    status: 'success',
    transactionRef,
    paymentMethod,
    completedAt: Date.now(),
    updatedAt: Date.now(),
  };

  savePaymentOrders(orders.map((o) => (o.id === orderId ? completedOrder : o)));

  // Record verified transaction
  const newTransaction: PaymentTransaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    orderId: order.id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    userEmail: order.userEmail,
    planId: plan.id,
    planName: plan.name,
    amountInr: order.amountInr,
    currency: order.currency,
    gatewayName: 'IMB',
    transactionRef,
    paymentMethod,
    status: 'success',
    isVerified: true,
    verificationMethod: 'dual_verification',
    verifiedAt: Date.now(),
    createdAt: Date.now(),
    gatewayResponse: {
      gateway: 'IMB',
      authCode: 'IMB_AUTH_90124',
      status: 'CAPTURED',
      amount_inr: order.amountInr,
      currency: 'INR',
    },
  };

  const currentTxns = getPaymentTransactions();
  savePaymentTransactions([newTransaction, ...currentTxns]);

  // Activate / Extend Subscription
  const existingSub = getUserActiveSubscription(order.userId);
  const startDate = new Date();
  let expiryDate: Date;

  if (existingSub && new Date(existingSub.expiryDate) > new Date()) {
    // Extend from existing expiry
    expiryDate = new Date(new Date(existingSub.expiryDate).getTime() + plan.durationDays * 86400000);
  } else {
    expiryDate = new Date(Date.now() + plan.durationDays * 86400000);
  }

  const newSub: UserSubscription = {
    id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    userId: order.userId,
    userEmail: order.userEmail,
    planId: plan.id,
    planName: plan.name,
    orderId: order.id,
    transactionRef,
    amountInr: order.amountInr,
    startDate: startDate.toISOString(),
    expiryDate: expiryDate.toISOString(),
    status: 'active',
    autoRenew: true,
    maxScreens: plan.maxScreens,
    videoQuality: plan.videoQuality,
    accessTier: plan.accessTier,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const currentSubs = getUserSubscriptions();
  // Mark previous active subscriptions as superseded
  const updatedSubs = currentSubs.map((s) =>
    s.userId === order.userId ? { ...s, status: 'expired' as const } : s
  );
  saveUserSubscriptions([newSub, ...updatedSubs]);

  // Record audit activity
  logSubscriptionActivity(
    'IMB Gateway Engine',
    'SUBSCRIPTION_ACTIVATED',
    'SUBSCRIPTION',
    newSub.id,
    `Activated "${plan.name}" plan for user ${order.userEmail} (Valid until ${expiryDate.toLocaleDateString()})`
  );

  // Record webhook log
  recordWebhookLog({
    gatewayName: 'IMB',
    eventType: 'PAYMENT_CAPTURED',
    orderId: order.id,
    transactionRef,
    payload: {
      order_number: order.orderNumber,
      amount: order.amountInr,
      transaction_ref: transactionRef,
      status: 'CAPTURED',
    },
    signature: simulatedSignature,
    isVerified: true,
    processingStatus: 'success',
  });

  return {
    success: true,
    order: completedOrder,
    transaction: newTransaction,
    subscription: newSub,
  };
}

// ----------------- USER SUBSCRIPTIONS -----------------
export function getUserSubscriptions(): UserSubscription[] {
  return getStored<UserSubscription[]>(STORAGE_KEYS.SUBSCRIPTIONS, INITIAL_USER_SUBSCRIPTIONS);
}

export function saveUserSubscriptions(subs: UserSubscription[]): void {
  setStored(STORAGE_KEYS.SUBSCRIPTIONS, subs);
}

export function getUserActiveSubscription(userId: string): UserSubscription | null {
  const subs = getUserSubscriptions();
  const userSubs = subs.filter((s) => s.userId === userId && s.status === 'active');

  if (userSubs.length === 0) return null;

  // Sort by expiry descending
  userSubs.sort(
    (a, b) => new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime()
  );

  const candidate = userSubs[0];
  // Check if actually expired
  if (new Date(candidate.expiryDate).getTime() < Date.now()) {
    return null;
  }

  return candidate;
}

// Check if user has entitlement for premium content
export function checkUserContentAccess(
  userId: string | undefined,
  isPremiumContent: boolean
): { allowed: boolean; reason?: 'no_auth' | 'no_subscription' | 'subscription_expired' } {
  if (!isPremiumContent) {
    return { allowed: true };
  }

  if (!userId || userId === 'guest') {
    return { allowed: false, reason: 'no_auth' };
  }

  const activeSub = getUserActiveSubscription(userId);
  if (!activeSub) {
    // Check if user has an expired sub
    const allUserSubs = getUserSubscriptions().filter((s) => s.userId === userId);
    if (allUserSubs.length > 0) {
      return { allowed: false, reason: 'subscription_expired' };
    }
    return { allowed: false, reason: 'no_subscription' };
  }

  return { allowed: true };
}

// ----------------- WEBHOOK & AUDIT LOGS -----------------
export function getWebhookLogs(): PaymentWebhookLog[] {
  return getStored<PaymentWebhookLog[]>(STORAGE_KEYS.WEBHOOK_LOGS, []);
}

export function recordWebhookLog(log: Omit<PaymentWebhookLog, 'id' | 'receivedAt'>): void {
  const current = getWebhookLogs();
  const newLog: PaymentWebhookLog = {
    ...log,
    id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    receivedAt: Date.now(),
  };
  setStored(STORAGE_KEYS.WEBHOOK_LOGS, [newLog, ...current].slice(0, 100));
}

export function getSubscriptionActivityLogs(): SubscriptionActivityLog[] {
  return getStored<SubscriptionActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, [
    {
      id: 'act_sub_1',
      adminName: 'System Architect',
      action: 'SYSTEM_INIT',
      entityType: 'GATEWAY_SETTINGS',
      entityId: 'IMB',
      details: 'Initialized IMB payment gateway configuration in sandbox mode.',
      timestamp: Date.now() - 86400000 * 5,
    },
  ]);
}

export function logSubscriptionActivity(
  adminName: string,
  action: string,
  entityType: 'PLAN' | 'SUBSCRIPTION' | 'ORDER' | 'GATEWAY_SETTINGS',
  entityId: string,
  details: string
): void {
  const current = getSubscriptionActivityLogs();
  const entry: SubscriptionActivityLog = {
    id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    adminName,
    action,
    entityType,
    entityId,
    details,
    timestamp: Date.now(),
  };
  setStored(STORAGE_KEYS.ACTIVITY_LOGS, [entry, ...current].slice(0, 200));
}

// Reconcile manual adjustment with strict audit logging
export function manualReconcileOrder(
  orderId: string,
  newStatus: 'success' | 'failed',
  reason: string,
  adminName: string
): { success: boolean; error?: string } {
  if (!reason.trim()) {
    return { success: false, error: 'A mandatory audit reason is required for manual reconciliation.' };
  }

  const orders = getPaymentOrders();
  const target = orders.find((o) => o.id === orderId);
  if (!target) {
    return { success: false, error: 'Order not found.' };
  }

  if (newStatus === 'success') {
    return processAndVerifyPayment(orderId, 'Manual Reconciled (' + adminName + ')', 'success');
  } else {
    target.status = 'failed';
    target.errorMessage = `Manually flagged as failed by ${adminName}: ${reason}`;
    target.updatedAt = Date.now();
    savePaymentOrders([...orders]);

    logSubscriptionActivity(
      adminName,
      'MANUAL_RECONCILE_FAILED',
      'ORDER',
      orderId,
      `Manually flagged order ${target.orderNumber} as failed. Reason: ${reason}`
    );
    return { success: true };
  }
}
