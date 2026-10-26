import React, { useState } from 'react';
import {
  Check,
  Crown,
  Sparkles,
  ShieldCheck,
  Tv,
  Zap,
  HelpCircle,
  Clock,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { SubscriptionPlan, UserSubscription, PaymentOrder } from '../types/subscription';
import { User } from '../types/ott';
import {
  getSubscriptionPlans,
  getUserActiveSubscription,
  createPaymentOrder,
} from '../services/subscriptionStorage';
import { IMBCheckoutModal } from './IMBCheckoutModal';

interface SubscriptionPageProps {
  currentUser: User | null;
  onOpenUserAuth: () => void;
  onSubscriptionUpdated: () => void;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({
  currentUser,
  onOpenUserAuth,
  onSubscriptionUpdated,
}) => {
  const plans = getSubscriptionPlans();
  const activeSub = currentUser ? getUserActiveSubscription(currentUser.id) : null;

  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [activeOrder, setActiveOrder] = useState<PaymentOrder | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setOrderError(null);
    if (!currentUser) {
      onOpenUserAuth();
      return;
    }

    const result = createPaymentOrder(currentUser, plan.id);
    if (result.success && result.order) {
      setSelectedPlan(plan);
      setActiveOrder(result.order);
      setCheckoutModalOpen(true);
    } else {
      setOrderError(result.error || 'Failed to initiate payment order.');
    }
  };

  const handlePaymentSuccess = (sub: UserSubscription) => {
    onSubscriptionUpdated();
  };

  // Calculate days remaining
  const daysRemaining = activeSub
    ? Math.max(
        0,
        Math.ceil(
          (new Date(activeSub.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        )
      )
    : 0;

  return (
    <div className="space-y-12 pb-16 select-none max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
          <Crown className="w-3.5 h-3.5" />
          <span>VIP Premium Access</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
          Choose Your Entertainment Pass
        </h1>
        <p className="text-sm sm:text-base text-zinc-400">
          Unlock blockbuster Tamil movies, exclusive web series seasons, and 130+ Live TV channels.
          Cancel anytime, zero hidden fees, secured by <strong className="text-amber-400 font-semibold">IMB Payment Gateway</strong>.
        </p>
      </div>

      {/* 2. Active Subscription Notification (if active) */}
      {activeSub && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-zinc-900 to-zinc-900 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-zinc-950 flex items-center justify-center font-black text-lg shadow-md shrink-0">
              <Crown className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-base">
                  Active Subscription: {activeSub.planName}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold uppercase">
                  Active
                </span>
              </div>
              <p className="text-xs text-zinc-300 mt-0.5">
                Valid until{' '}
                <strong className="text-amber-400 font-semibold">
                  {new Date(activeSub.expiryDate).toLocaleDateString()}
                </strong>{' '}
                · <span className="text-emerald-400 font-mono font-bold">{daysRemaining} days remaining</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-400 hidden md:inline">
              Need more screens or 4K quality?
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
              Upgrade Options Below
            </span>
          </div>
        </div>
      )}

      {/* Global Order Error Alert */}
      {orderError && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center justify-between gap-3">
          <span>{orderError}</span>
          <button onClick={() => setOrderError(null)} className="text-red-400 hover:text-white font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* 3. THREE CONFIGURABLE PLANS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {plans.map((plan) => {
          const isCurrent = activeSub?.planId === plan.id;
          const isFeatured = plan.isFeatured;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between rounded-3xl p-6 sm:p-8 transition-all duration-300 ${
                isFeatured
                  ? 'bg-gradient-to-b from-zinc-900 to-zinc-950 border-2 border-amber-500 shadow-2xl shadow-amber-500/10 md:-translate-y-2'
                  : 'bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 shadow-xl'
              }`}
            >
              {/* Featured Badge */}
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 font-black text-xs uppercase tracking-wider shadow-md">
                  {plan.badge}
                </div>
              )}

              <div>
                {/* Plan Title & Description */}
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black text-white">{plan.name}</h3>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {plan.billingPeriodLabel}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 min-h-[36px]">{plan.description}</p>

                {/* Price Display */}
                <div className="my-6 pb-6 border-b border-zinc-800">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      ₹{plan.priceInr}
                    </span>
                    <span className="text-xs font-bold text-zinc-400">
                      / {plan.billingPeriodLabel}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 block mt-1">
                    Direct payment via IMB (UPI, Cards, NetBanking)
                  </span>
                </div>

                {/* Hardware & Spec Badges */}
                <div className="grid grid-cols-2 gap-2 mb-6 text-xs">
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-2">
                    <Tv className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-zinc-300 font-semibold">{plan.maxScreens} Screen{plan.maxScreens > 1 ? 's' : ''}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="text-zinc-300 font-semibold truncate">{plan.videoQuality}</span>
                  </div>
                </div>

                {/* Features Checklist */}
                <div className="space-y-3 mb-8">
                  <p className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Included Benefits
                  </p>
                  <ul className="space-y-2.5 text-xs text-zinc-300">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                        <span className="leading-tight">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3.5 rounded-2xl bg-zinc-800 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 cursor-default border border-zinc-700"
                  >
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Your Current Plan</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-98 ${
                      isFeatured
                        ? 'bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 shadow-amber-500/20'
                        : 'bg-zinc-800 hover:bg-amber-500 hover:text-zinc-950 text-white border border-zinc-700 hover:border-amber-500'
                    }`}
                  >
                    <span>
                      {!currentUser
                        ? 'Sign In & Subscribe'
                        : activeSub
                        ? `Switch to ${plan.name}`
                        : `Subscribe to ${plan.name}`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Payment Gateway Trust Bar */}
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <ShieldCheck className="w-6 h-6 stroke-[2]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Bank-Grade Payment Security</h4>
            <p className="text-xs text-zinc-400">
              Transactions processed through certified <strong className="text-zinc-200">IMB Payment Gateway</strong> with 256-bit SSL encryption.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-[11px]">
            UPI · Cards · NetBanking · Wallets
          </span>
        </div>
      </div>

      {/* 5. Frequently Asked Questions */}
      <div className="pt-8 border-t border-zinc-800 space-y-6">
        <h3 className="text-xl font-bold text-white text-center flex items-center justify-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto text-xs">
          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
            <h5 className="font-bold text-white">When does my subscription take effect?</h5>
            <p className="text-zinc-400 leading-relaxed">
              Instantly! As soon as your payment is verified by IMB gateway, your account is immediately granted VIP access.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
            <h5 className="font-bold text-white">Can I change or upgrade my plan?</h5>
            <p className="text-zinc-400 leading-relaxed">
              Yes, you can upgrade anytime. Any remaining days from your existing subscription will be seamlessly extended.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
            <h5 className="font-bold text-white">What payment methods are supported on IMB?</h5>
            <p className="text-zinc-400 leading-relaxed">
              We support Google Pay, PhonePe, Paytm, BHIM UPI, Visa/Mastercard credit & debit cards, and Indian NetBanking.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-1">
            <h5 className="font-bold text-white">Are all 130+ TV channels available to subscribers?</h5>
            <p className="text-zinc-400 leading-relaxed">
              Yes! All subscribers enjoy uninterrupted, premium streaming on all 130+ Live TV feeds and studio broadcasts.
            </p>
          </div>
        </div>
      </div>

      {/* 6. IMB Checkout Modal */}
      <IMBCheckoutModal
        isOpen={checkoutModalOpen}
        order={activeOrder}
        plan={selectedPlan}
        onClose={() => setCheckoutModalOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
