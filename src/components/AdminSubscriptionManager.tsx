import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Search,
  Filter,
  Download,
  Edit2,
  Plus,
  Trash2,
  Eye,
  Key,
  Globe,
  RefreshCw,
  Copy,
  Check,
  Tv,
  Sparkles,
  Lock,
  Layers,
  Activity,
  FileText,
  UserCheck,
  X,
  RotateCcw,
} from 'lucide-react';
import {
  SubscriptionPlan,
  IMBGatewaySettings,
  PaymentOrder,
  PaymentTransaction,
  UserSubscription,
  PaymentWebhookLog,
  SubscriptionActivityLog,
} from '../types/subscription';
import {
  getSubscriptionPlans,
  updateSubscriptionPlan,
  resetDefaultSubscriptionPlans,
  getIMBGatewaySettings,
  saveIMBGatewaySettings,
  testIMBConnection,
  getPaymentOrders,
  getPaymentTransactions,
  getUserSubscriptions,
  getWebhookLogs,
  getSubscriptionActivityLogs,
  manualReconcileOrder,
} from '../services/subscriptionStorage';

interface AdminSubscriptionManagerProps {
  adminName: string;
}

export const AdminSubscriptionManager: React.FC<AdminSubscriptionManagerProps> = ({
  adminName,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'analytics' | 'plans' | 'gateway' | 'orders' | 'logs'
  >('analytics');

  // Subscription Plans
  const [plans, setPlans] = useState<SubscriptionPlan[]>(getSubscriptionPlans());
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [newFeatureText, setNewFeatureText] = useState('');

  // Gateway Settings
  const [gatewaySettings, setGatewaySettingsState] = useState<IMBGatewaySettings>(
    getIMBGatewaySettings()
  );
  const [rawSecretInput, setRawSecretInput] = useState('');
  const [rawWebhookSecretInput, setRawWebhookSecretInput] = useState('');
  const [showSecretInput, setShowSecretInput] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [isTestingGateway, setIsTestingGateway] = useState(false);
  const [gatewaySaveSuccess, setGatewaySaveSuccess] = useState<string | null>(null);

  // Orders & Transactions
  const [orders, setOrders] = useState<PaymentOrder[]>(getPaymentOrders());
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(getPaymentTransactions());
  const [userSubs, setUserSubs] = useState<UserSubscription[]>(getUserSubscriptions());
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [orderPlanFilter, setOrderPlanFilter] = useState<string>('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<PaymentOrder | null>(null);

  // Manual Reconciliation
  const [reconcileReason, setReconcileReason] = useState('');
  const [reconcileError, setReconcileError] = useState<string | null>(null);

  // Webhook Logs & Audit Trail
  const [webhookLogs, setWebhookLogs] = useState<PaymentWebhookLog[]>(getWebhookLogs());
  const [activityLogs, setActivityLogs] = useState<SubscriptionActivityLog[]>(
    getSubscriptionActivityLogs()
  );

  // Copied Webhook URL feedback
  const [copiedWebhookUrl, setCopiedWebhookUrl] = useState(false);

  // Metrics
  const successfulTxns = transactions.filter((t) => t.status === 'success');
  const totalRevenue = successfulTxns.reduce((sum, t) => sum + Number(t.amountInr), 0);
  const activeSubsCount = userSubs.filter((s) => s.status === 'active').length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'pending' || o.status === 'created').length;
  const failedOrdersCount = orders.filter((o) => o.status === 'failed' || o.status === 'cancelled').length;

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.userEmail.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      (o.transactionRef && o.transactionRef.toLowerCase().includes(orderSearchQuery.toLowerCase()));

    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const matchesPlan = orderPlanFilter === 'all' || o.planId === orderPlanFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  // Handler: Save Edited Plan
  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;

    const next = updateSubscriptionPlan(editingPlan, adminName);
    setPlans(next);
    setEditingPlan(null);
  };

  // Handler: Add feature to plan
  const handleAddFeatureToPlan = () => {
    if (!editingPlan || !newFeatureText.trim()) return;
    setEditingPlan({
      ...editingPlan,
      features: [...editingPlan.features, newFeatureText.trim()],
    });
    setNewFeatureText('');
  };

  // Handler: Remove feature from plan
  const handleRemoveFeatureFromPlan = (index: number) => {
    if (!editingPlan) return;
    setEditingPlan({
      ...editingPlan,
      features: editingPlan.features.filter((_, i) => i !== index),
    });
  };

  // Handler: Save Gateway Settings
  const handleSaveGateway = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveIMBGatewaySettings(
      gatewaySettings,
      rawSecretInput,
      rawWebhookSecretInput,
      adminName
    );
    setGatewaySettingsState(updated);
    setRawSecretInput('');
    setRawWebhookSecretInput('');
    setShowSecretInput(false);
    setGatewaySaveSuccess('IMB Payment Gateway configuration updated and secured.');
    setTimeout(() => setGatewaySaveSuccess(null), 4000);
  };

  // Handler: Test IMB Connection
  const handleTestConnection = () => {
    setIsTestingGateway(true);
    setTimeout(() => {
      const res = testIMBConnection(adminName);
      setTestResult(res);
      setGatewaySettingsState(getIMBGatewaySettings());
      setIsTestingGateway(false);
    }, 800);
  };

  // Handler: Copy Webhook URL
  const handleCopyWebhookUrl = () => {
    navigator.clipboard.writeText(gatewaySettings.webhookUrl).then(() => {
      setCopiedWebhookUrl(true);
      setTimeout(() => setCopiedWebhookUrl(false), 2000);
    });
  };

  // Handler: Export CSV Report
  const handleExportCSV = () => {
    const headers = [
      'Order Number',
      'Transaction Ref',
      'User Email',
      'Plan Name',
      'Amount (INR)',
      'Status',
      'Payment Method',
      'Date & Time',
    ];

    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.transactionRef || 'N/A'}"`,
      `"${o.userEmail}"`,
      `"${o.planName}"`,
      o.amountInr,
      o.status.toUpperCase(),
      `"${o.paymentMethod || 'IMB Gateway'}"`,
      `"${new Date(o.createdAt).toLocaleString()}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `IMB_OTT_Transactions_Report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handler: Manual Order Reconciliation
  const handleManualReconcile = (newStatus: 'success' | 'failed') => {
    if (!selectedOrderDetails) return;
    setReconcileError(null);

    const res = manualReconcileOrder(
      selectedOrderDetails.id,
      newStatus,
      reconcileReason,
      adminName
    );

    if (res.success) {
      setOrders(getPaymentOrders());
      setTransactions(getPaymentTransactions());
      setUserSubs(getUserSubscriptions());
      setActivityLogs(getSubscriptionActivityLogs());
      setSelectedOrderDetails(null);
      setReconcileReason('');
    } else {
      setReconcileError(res.error || 'Failed to reconcile order.');
    }
  };

  return (
    <div className="space-y-6 select-none">
      {/* 1. Header & Section Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">
              Payment & Subscriptions Hub
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold font-mono">
              IMB GATEWAY CERTIFIED
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage plans, configure IMB credentials, verify transactions, and reconcile orders.
          </p>
        </div>

        {/* Sub-tab Pills */}
        <div className="flex items-center p-1 bg-zinc-950 border border-zinc-800 rounded-xl overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveSubTab('analytics')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeSubTab === 'analytics'
                ? 'bg-zinc-800 text-amber-400 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('plans')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeSubTab === 'plans'
                ? 'bg-zinc-800 text-amber-400 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Manage Plans ({plans.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('gateway')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeSubTab === 'gateway'
                ? 'bg-zinc-800 text-amber-400 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>IMB Gateway</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('orders')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeSubTab === 'orders'
                ? 'bg-zinc-800 text-amber-400 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Transactions ({orders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('logs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
              activeSubTab === 'logs'
                ? 'bg-zinc-800 text-amber-400 shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Audit & Logs</span>
          </button>
        </div>
      </div>

      {/* SUB-TAB 1: ANALYTICS & OVERVIEW */}
      {activeSubTab === 'analytics' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 mb-1">
                <span className="text-xs font-semibold">Total Revenue</span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white">₹{totalRevenue.toLocaleString()}</p>
              <p className="text-[11px] text-emerald-400 mt-1">Verified via IMB Gateway</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 mb-1">
                <span className="text-xs font-semibold">Active Subscribers</span>
                <UserCheck className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-2xl font-black text-white">{activeSubsCount}</p>
              <p className="text-[11px] text-zinc-400 mt-1">With valid entitlement</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 mb-1">
                <span className="text-xs font-semibold">Successful Orders</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-2xl font-black text-white">{successfulTxns.length}</p>
              <p className="text-[11px] text-zinc-400 mt-1">Captured payments</p>
            </div>

            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
              <div className="flex items-center justify-between text-zinc-400 mb-1">
                <span className="text-xs font-semibold">Failed / Pending</span>
                <AlertCircle className="w-4 h-4 text-red-400" />
              </div>
              <p className="text-2xl font-black text-white">{failedOrdersCount + pendingOrdersCount}</p>
              <p className="text-[11px] text-red-400 mt-1">{pendingOrdersCount} pending</p>
            </div>
          </div>

          {/* Plan Distribution */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((p) => {
              const planSubs = userSubs.filter((s) => s.planId === p.id && s.status === 'active');
              const planRevenue = transactions
                .filter((t) => t.planId === p.id && t.status === 'success')
                .reduce((acc, t) => acc + Number(t.amountInr), 0);

              return (
                <div key={p.id} className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-sm text-white">{p.name} Plan</span>
                    <span className="text-xs font-bold text-amber-400">₹{p.priceInr} / {p.billingPeriodLabel}</span>
                  </div>
                  <div className="space-y-1.5 text-xs text-zinc-400">
                    <div className="flex justify-between">
                      <span>Active Users:</span>
                      <strong className="text-white">{planSubs.length}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Earned:</span>
                      <strong className="text-emerald-400">₹{planRevenue.toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Hardware Limit:</span>
                      <span className="text-zinc-300">{p.maxScreens} Screen ({p.videoQuality})</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Gateway Status Banner */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-white">
                  IMB Gateway Engine Status: {gatewaySettings.connectionStatus.toUpperCase()}
                </p>
                <p className="text-[11px] text-zinc-400">
                  Mode: <span className="text-amber-400 uppercase font-mono font-bold">{gatewaySettings.environment}</span> · Dual Webhook & Signature Verification Active
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveSubTab('gateway')}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
            >
              Configure Gateway
            </button>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: SUBSCRIPTION PLANS MANAGEMENT */}
      {activeSubTab === 'plans' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
            <div>
              <h3 className="text-base font-bold text-white">Three Configurable User Plans</h3>
              <p className="text-xs text-zinc-400">
                All prices, durations, descriptions, and feature entitlements are dynamically editable here.
              </p>
            </div>
            <button
              onClick={() => setResetConfirmOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-medium transition-colors cursor-pointer"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div
                key={p.id}
                className={`p-6 rounded-3xl border flex flex-col justify-between transition-all ${
                  p.isFeatured
                    ? 'bg-zinc-900/90 border-amber-500 shadow-lg shadow-amber-500/10'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-black text-white">{p.name}</h4>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                      {p.billingPeriodLabel}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 mb-4">{p.description}</p>

                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800/80 mb-4 space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-white">₹{p.priceInr}</span>
                      <span className="text-xs text-zinc-500">/ {p.durationDays} days</span>
                    </div>
                    <p className="text-[10px] text-zinc-400">
                      Screens: <strong className="text-zinc-200">{p.maxScreens}</strong> · Quality:{' '}
                      <strong className="text-zinc-200">{p.videoQuality}</strong>
                    </p>
                  </div>

                  <div className="space-y-1.5 mb-6 text-xs text-zinc-300">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Features List ({p.features.length})
                    </p>
                    {p.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight text-zinc-300">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      p.isActive
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {p.isActive ? 'Active' : 'Disabled'}
                  </span>

                  <button
                    onClick={() => setEditingPlan({ ...p })}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Plan</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* EDIT PLAN MODAL */}
          {editingPlan && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
              <div className="w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Edit2 className="w-4 h-4 text-amber-400" />
                      <span>Edit Subscription Plan: {editingPlan.name}</span>
                    </h4>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Configure live pricing, billing duration, hardware limits, and bullet features.
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingPlan(null)}
                    className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSavePlan} className="space-y-4 text-xs">
                  {/* Basic Identifiers */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-300 font-bold mb-1">Plan Display Name</label>
                      <input
                        type="text"
                        required
                        value={editingPlan.name}
                        onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-semibold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-bold mb-1">Badge (Optional)</label>
                      <input
                        type="text"
                        value={editingPlan.badge || ''}
                        onChange={(e) => setEditingPlan({ ...editingPlan, badge: e.target.value })}
                        placeholder="e.g. Most Popular, Best Value"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Pricing and Billing Interval */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-zinc-300 font-bold mb-1">Price in INR (₹)</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={editingPlan.priceInr}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, priceInr: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-400 font-mono font-bold text-sm focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-bold mb-1">Duration (Days)</label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={editingPlan.durationDays}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, durationDays: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-bold mb-1">Billing Label</label>
                      <input
                        type="text"
                        required
                        value={editingPlan.billingPeriodLabel}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, billingPeriodLabel: e.target.value })
                        }
                        placeholder="e.g. 30 Days, 1 Year"
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Plan Description</label>
                    <textarea
                      rows={2}
                      value={editingPlan.description}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, description: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-amber-500 resize-none"
                    />
                  </div>

                  {/* Hardware & Spec Limits */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-zinc-300 font-bold mb-1">Max Screens</label>
                      <select
                        value={editingPlan.maxScreens}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, maxScreens: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white cursor-pointer"
                      >
                        <option value={1}>1 Screen (Personal)</option>
                        <option value={2}>2 Screens (Dual)</option>
                        <option value={4}>4 Screens (Family)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-bold mb-1">Max Video Quality</label>
                      <select
                        value={editingPlan.videoQuality}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            videoQuality: e.target.value as SubscriptionPlan['videoQuality'],
                          })
                        }
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white cursor-pointer"
                      >
                        <option value="HD 720p">HD 720p</option>
                        <option value="Full HD 1080p">Full HD 1080p</option>
                        <option value="4K Ultra HD + Dolby">4K Ultra HD + Dolby</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-300 font-bold mb-1">Featured / Highlight</label>
                      <select
                        value={editingPlan.isFeatured ? 'true' : 'false'}
                        onChange={(e) =>
                          setEditingPlan({ ...editingPlan, isFeatured: e.target.value === 'true' })
                        }
                        className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white cursor-pointer"
                      >
                        <option value="false">Standard Card</option>
                        <option value="true">Featured (Border Highlight)</option>
                      </select>
                    </div>
                  </div>

                  {/* Editable Features List */}
                  <div>
                    <label className="block text-zinc-300 font-bold mb-1">Included Benefits</label>
                    <div className="space-y-2 mb-2">
                      {editingPlan.features.map((feat, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={feat}
                            onChange={(e) => {
                              const updatedFeatures = [...editingPlan.features];
                              updatedFeatures[index] = e.target.value;
                              setEditingPlan({ ...editingPlan, features: updatedFeatures });
                            }}
                            className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveFeatureFromPlan(index)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Add new feature inline */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        placeholder="Add another benefit bullet..."
                        value={newFeatureText}
                        onChange={(e) => setNewFeatureText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddFeatureToPlan();
                          }
                        }}
                        className="flex-1 px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs placeholder-zinc-500"
                      />
                      <button
                        type="button"
                        onClick={handleAddFeatureToPlan}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>

                  {/* Save Buttons */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={() => setEditingPlan(null)}
                      className="px-4 py-2 text-zinc-400 hover:text-white rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl shadow-lg cursor-pointer"
                    >
                      Save Plan Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 3: IMB PAYMENT GATEWAY SETTINGS */}
      {activeSubTab === 'gateway' && (
        <div className="space-y-6 max-w-4xl">
          {gatewaySaveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
              <span className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{gatewaySaveSuccess}</span>
              </span>
              <button onClick={() => setGatewaySaveSuccess(null)} className="text-emerald-400 hover:text-white">
                ✕
              </button>
            </div>
          )}

          {/* Gateway Status Header */}
          <div className="p-5 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500 text-zinc-950 font-black text-lg flex items-center justify-center shadow-md">
                IMB
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white">IMB Payment Gateway Integration</h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono ${
                      gatewaySettings.connectionStatus === 'connected'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-red-950 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {gatewaySettings.connectionStatus === 'connected' ? 'Connected & Verified' : 'Untested'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Direct merchant API with HMAC-SHA256 digital signature validation.
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isTestingGateway}
              onClick={handleTestConnection}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-750 text-amber-400 hover:text-amber-300 font-bold text-xs flex items-center justify-center gap-2 border border-zinc-700 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTestingGateway ? 'animate-spin' : ''}`} />
              <span>{isTestingGateway ? 'Testing Connection...' : 'Test IMB Sandbox Connection'}</span>
            </button>
          </div>

          {/* Test Result Alert */}
          {testResult && (
            <div
              className={`p-4 rounded-xl text-xs flex items-start gap-2.5 ${
                testResult.success
                  ? 'bg-emerald-950/70 border border-emerald-500/30 text-emerald-300'
                  : 'bg-red-950/70 border border-red-500/30 text-red-300'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-bold">{testResult.success ? 'IMB Connection Test Passed' : 'Connection Test Failed'}</p>
                <p className="mt-0.5">{testResult.message}</p>
              </div>
            </div>
          )}

          {/* Settings Form */}
          <form onSubmit={handleSaveGateway} className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 space-y-5 text-xs">
            <h4 className="text-sm font-bold text-white border-b border-zinc-800 pb-3 flex items-center gap-2">
              <Key className="w-4 h-4 text-amber-400" />
              <span>Gateway Credentials & Environment</span>
            </h4>

            {/* Enable + Environment Mode */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-300 font-bold mb-1.5">Gateway Status</label>
                <select
                  value={gatewaySettings.isEnabled ? 'enabled' : 'disabled'}
                  onChange={(e) =>
                    setGatewaySettingsState({
                      ...gatewaySettings,
                      isEnabled: e.target.value === 'enabled',
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-semibold cursor-pointer"
                >
                  <option value="enabled">Enabled (Accept Customer Payments)</option>
                  <option value="disabled">Disabled (Maintenance Mode)</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1.5">Operating Environment</label>
                <select
                  value={gatewaySettings.environment}
                  onChange={(e) =>
                    setGatewaySettingsState({
                      ...gatewaySettings,
                      environment: e.target.value as 'sandbox' | 'production',
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-amber-400 font-bold cursor-pointer"
                >
                  <option value="sandbox">Sandbox (Testing / Safe Simulation)</option>
                  <option value="production">Production (Real Bank Transactions)</option>
                </select>
              </div>
            </div>

            {/* Merchant ID & Client ID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-zinc-300 font-bold mb-1.5">IMB Merchant Identifier</label>
                <input
                  type="text"
                  required
                  value={gatewaySettings.merchantId}
                  onChange={(e) =>
                    setGatewaySettingsState({ ...gatewaySettings, merchantId: e.target.value })
                  }
                  placeholder="e.g. IMB_MERCHANT_8829"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1.5">IMB Client ID</label>
                <input
                  type="text"
                  required
                  value={gatewaySettings.clientId}
                  onChange={(e) =>
                    setGatewaySettingsState({ ...gatewaySettings, clientId: e.target.value })
                  }
                  placeholder="e.g. imb_client_key_..."
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* API Secret / Token (Masked + Security protection) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-zinc-300 font-bold">
                  API Secret Token <span className="text-amber-400">(Never exposed in frontend)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowSecretInput(!showSecretInput)}
                  className="text-amber-400 hover:text-amber-300 text-[11px] font-semibold cursor-pointer"
                >
                  {showSecretInput ? 'Cancel Editing Secret' : 'Update Secret...'}
                </button>
              </div>

              {showSecretInput ? (
                <div>
                  <input
                    type="password"
                    value={rawSecretInput}
                    onChange={(e) => setRawSecretInput(e.target.value)}
                    placeholder="Enter new IMB API Secret (leave blank to keep current secret intact)"
                    className="w-full px-3.5 py-2.5 bg-zinc-950 border border-amber-500/80 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Security protection: Leaving this blank will safely preserve the existing encrypted token.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-400 font-mono tracking-widest">
                    {gatewaySettings.clientSecretMasked}
                  </div>
                  <span className="px-2.5 py-2 rounded-xl bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold">
                    ✓ Configured
                  </span>
                </div>
              )}
            </div>

            {/* Base URL & Webhook URL */}
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <div>
                <label className="block text-zinc-300 font-bold mb-1">IMB API Base URL</label>
                <input
                  type="url"
                  required
                  value={gatewaySettings.apiBaseUrl}
                  onChange={(e) =>
                    setGatewaySettingsState({ ...gatewaySettings, apiBaseUrl: e.target.value })
                  }
                  placeholder="https://sandbox.imbpayments.com/api/v1"
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-zinc-300 font-bold mb-1">
                  Webhook / IPN Callback URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={gatewaySettings.webhookUrl}
                    className="flex-1 px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 font-mono text-[11px]"
                  />
                  <button
                    type="button"
                    onClick={handleCopyWebhookUrl}
                    className="px-3 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copiedWebhookUrl ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    <span>{copiedWebhookUrl ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Paste this URL into your IMB Merchant Dashboard under Webhook / Event Notifications.
                </p>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-zinc-800 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold rounded-xl text-xs shadow-lg cursor-pointer transition-all"
              >
                Save IMB Gateway Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SUB-TAB 4: TRANSACTIONS & PAYMENT ORDERS */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  placeholder="Search order #, user, or txn..."
                  className="w-full pl-9 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 cursor-pointer"
              >
                <option value="all">All Statuses</option>
                <option value="success">Success / Verified</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Plan Filter */}
              <select
                value={orderPlanFilter}
                onChange={(e) => setOrderPlanFilter(e.target.value)}
                className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 cursor-pointer"
              >
                <option value="all">All Plans</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer self-end md:self-auto transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export CSV Report</span>
            </button>
          </div>

          {/* Orders Table */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
                  <tr>
                    <th className="py-3 px-4">Order / Txn Ref</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Plan</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-zinc-500">
                        No transactions found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o) => (
                      <tr key={o.id} className="hover:bg-zinc-850/40 transition-colors">
                        <td className="py-3 px-4">
                          <p className="font-mono text-zinc-200 font-bold">{o.orderNumber}</p>
                          <p className="font-mono text-[10px] text-zinc-400 mt-0.5">
                            {o.transactionRef || 'Awaiting Authorization'}
                          </p>
                        </td>

                        <td className="py-3 px-4">
                          <p className="font-semibold text-white">{o.userName || 'Subscriber'}</p>
                          <p className="text-[11px] text-zinc-400">{o.userEmail}</p>
                        </td>

                        <td className="py-3 px-4 text-zinc-300 font-medium">
                          {o.planName}
                        </td>

                        <td className="py-3 px-4 font-black text-amber-400 font-mono">
                          ₹{o.amountInr}
                        </td>

                        <td className="py-3 px-4 text-zinc-400">
                          {o.paymentMethod || 'IMB Gateway'}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              o.status === 'success'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                : o.status === 'pending' || o.status === 'created'
                                ? 'bg-amber-950 text-amber-400 border border-amber-500/30'
                                : 'bg-red-950 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setSelectedOrderDetails(o)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                            title="View details & reconciliation"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ORDER DETAILS & RECONCILIATION MODAL */}
          {selectedOrderDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none">
              <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4 shadow-2xl text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <h4 className="text-base font-bold text-white">
                    Order Details: {selectedOrderDetails.orderNumber}
                  </h4>
                  <button
                    onClick={() => setSelectedOrderDetails(null)}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-2 text-zinc-300">
                  <div className="flex justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-500">Customer:</span>
                    <span className="font-semibold text-white">
                      {selectedOrderDetails.userName} ({selectedOrderDetails.userEmail})
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-500">Plan:</span>
                    <span>{selectedOrderDetails.planName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-500">Amount:</span>
                    <span className="text-amber-400 font-bold">₹{selectedOrderDetails.amountInr}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-500">Transaction Ref:</span>
                    <span className="font-mono">{selectedOrderDetails.transactionRef || 'None'}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-500">Status:</span>
                    <span className="uppercase font-bold text-amber-400">
                      {selectedOrderDetails.status}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-500">Date:</span>
                    <span>{new Date(selectedOrderDetails.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Audit Reconciliation Section */}
                <div className="pt-3 border-t border-zinc-800 space-y-2">
                  <p className="font-bold text-zinc-200">Manual Administrative Reconciliation</p>
                  <p className="text-[11px] text-zinc-400">
                    All status modifications require a mandatory audit reason and will be permanently recorded.
                  </p>

                  {reconcileError && (
                    <p className="text-red-400 text-[11px]">{reconcileError}</p>
                  )}

                  <input
                    type="text"
                    value={reconcileReason}
                    onChange={(e) => setReconcileReason(e.target.value)}
                    placeholder="Enter mandatory reason (e.g. Bank settlement ticket #...)"
                    className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white text-xs"
                  />

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => handleManualReconcile('success')}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer"
                    >
                      Reconcile as Success
                    </button>
                    <button
                      type="button"
                      onClick={() => handleManualReconcile('failed')}
                      className="flex-1 py-2 rounded-xl bg-red-900/60 hover:bg-red-800 text-red-200 font-bold cursor-pointer"
                    >
                      Flag as Failed
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 5: WEBHOOK & ACTIVITY AUDIT LOGS */}
      {activeSubTab === 'logs' && (
        <div className="space-y-6">
          {/* Webhook logs */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-400" />
              <span>IMB Webhook Callback Logs ({webhookLogs.length})</span>
            </h4>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] border-b border-zinc-800">
                  <tr>
                    <th className="py-2.5 px-4">Event Type</th>
                    <th className="py-2.5 px-4">Txn / Order</th>
                    <th className="py-2.5 px-4">Signature Validation</th>
                    <th className="py-2.5 px-4">Processing Status</th>
                    <th className="py-2.5 px-4 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {webhookLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-zinc-500">
                        No webhook callbacks received yet. Initiate a test transaction to generate logs.
                      </td>
                    </tr>
                  ) : (
                    webhookLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-zinc-850/40">
                        <td className="py-2.5 px-4 font-mono font-bold text-zinc-200">
                          {log.eventType}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[11px] text-zinc-400">
                          {log.transactionRef || log.orderId}
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.isVerified
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-950 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {log.isVerified ? '✓ Valid Signature' : '✗ Mismatch'}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 uppercase text-[10px] font-bold text-zinc-300">
                          {log.processingStatus}
                        </td>
                        <td className="py-2.5 px-4 text-right text-zinc-500 font-mono text-[10px]">
                          {new Date(log.receivedAt).toLocaleTimeString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity audit logs */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Subscription Audit Trail</span>
            </h4>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl divide-y divide-zinc-800/60 max-h-64 overflow-y-auto">
              {activityLogs.map((log) => (
                <div key={log.id} className="p-3 text-xs flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{log.action}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">by {log.adminName}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{log.details}</p>
                  </div>
                  <span className="text-[10px] text-zinc-500 shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* IN-APP RESET PLANS CONFIRMATION MODAL */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs select-none animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reset All 3 Subscription Plans?</h3>
                <p className="text-xs text-zinc-400 mt-1">
                  This will restore the Starter (₹199), Gold (₹399), and VIP All-Access (₹999) plans to default prices, billing cycles, and feature lists.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const reset = resetDefaultSubscriptionPlans(adminName);
                  setPlans(reset);
                  setResetConfirmOpen(false);
                }}
                className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
              >
                <span>Reset to Defaults</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
