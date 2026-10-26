import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  CreditCard,
  QrCode,
  Building,
  Wallet,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronRight,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { SubscriptionPlan, PaymentOrder, UserSubscription } from '../types/subscription';
import { processAndVerifyPayment, getIMBGatewaySettings } from '../services/subscriptionStorage';

interface IMBCheckoutModalProps {
  isOpen: boolean;
  order: PaymentOrder | null;
  plan: SubscriptionPlan | null;
  onClose: () => void;
  onSuccess: (subscription: UserSubscription) => void;
}

export const IMBCheckoutModal: React.FC<IMBCheckoutModalProps> = ({
  isOpen,
  order,
  plan,
  onClose,
  onSuccess,
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [upiId, setUpiId] = useState('viewer@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('421');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState<string>('');
  const [paymentResult, setPaymentResult] = useState<{
    status: 'success' | 'failed' | 'cancelled';
    message: string;
    subscription?: UserSubscription;
    txnRef?: string;
  } | null>(null);

  if (!isOpen || !order || !plan) return null;

  const gateway = getIMBGatewaySettings();

  const handlePay = async (
    outcome: 'success' | 'failure' | 'cancelled' = 'success',
    tamperSig = false
  ) => {
    setIsProcessing(true);
    setProcessStep('Connecting to IMB Payment Gateway...');

    // Simulate realistic SSL and 3D-Secure bank roundtrip
    await new Promise((r) => setTimeout(r, 600));
    setProcessStep('Verifying order checksum and amount with IMB servers...');

    await new Promise((r) => setTimeout(r, 700));
    setProcessStep(
      outcome === 'success'
        ? 'Authorizing payment with bank & checking HMAC-SHA256 signature...'
        : 'Processing gateway response...'
    );

    await new Promise((r) => setTimeout(r, 800));

    const signature = tamperSig ? 'tampered_invalid_signature' : 'valid_hmac_sha256';
    const methodLabel =
      paymentMethod === 'upi'
        ? `UPI (${upiId})`
        : paymentMethod === 'card'
        ? `Card (Visa ends in 8892)`
        : paymentMethod === 'netbanking'
        ? `NetBanking (${selectedBank})`
        : 'IMB Wallet';

    const result = processAndVerifyPayment(order.id, methodLabel, outcome, signature);

    setIsProcessing(false);

    if (result.success && result.subscription) {
      setPaymentResult({
        status: 'success',
        message: 'Payment completed and verified successfully!',
        subscription: result.subscription,
        txnRef: result.transaction?.transactionRef || order.transactionRef,
      });
      onSuccess(result.subscription);
    } else {
      setPaymentResult({
        status: outcome === 'cancelled' ? 'cancelled' : 'failed',
        message: result.error || 'Payment failed. Please check credentials or retry.',
        txnRef: result.order.transactionRef,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* IMB Gateway Top Security Header */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 p-4 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-400 flex items-center justify-center text-zinc-950 font-black text-sm shadow-md">
              IMB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white tracking-tight">
                  IMB Secure Checkout
                </span>
                <span className="px-1.5 py-0.2 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-mono uppercase">
                  {gateway.environment.toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-400" />
                <span>256-Bit TLS Encryption · Merchant #{gateway.merchantId}</span>
              </p>
            </div>
          </div>

          {!isProcessing && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Order Summary Strip */}
          <div className="p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800/90 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Subscription Order
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <h4 className="text-base font-extrabold text-white">{plan.name} Plan</h4>
                <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-semibold">
                  {plan.billingPeriodLabel}
                </span>
              </div>
              <p className="text-[11px] font-mono text-zinc-400 mt-1">
                Order: <span className="text-zinc-200">{order.orderNumber}</span>
              </p>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                Total Amount
              </span>
              <div className="text-2xl font-black text-amber-400 tracking-tight">
                ₹{plan.priceInr}
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">All taxes included</span>
            </div>
          </div>

          {/* Result view: Success or Failure */}
          {paymentResult ? (
            <div className="py-6 text-center space-y-4">
              {paymentResult.status === 'success' ? (
                <div className="space-y-4 animate-scaleUp">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                    <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white">Payment Verified & Activated!</h3>
                    <p className="text-xs text-zinc-300 mt-1 max-w-md mx-auto">
                      Your subscription to <strong className="text-amber-400">{plan.name}</strong> is now live.
                      You have full access to all VIP movies, web series, and live streaming.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 max-w-sm mx-auto text-left text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Transaction Ref:</span>
                      <span className="font-mono text-zinc-200 font-bold">{paymentResult.txnRef}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Order Number:</span>
                      <span className="font-mono text-zinc-200">{order.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Valid Until:</span>
                      <span className="text-emerald-400 font-semibold">
                        {paymentResult.subscription
                          ? new Date(paymentResult.subscription.expiryDate).toLocaleDateString()
                          : `${plan.durationDays} days from now`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={onClose}
                    className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold rounded-xl text-xs transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                  >
                    Start Streaming Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-10 h-10 stroke-[2.5]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {paymentResult.status === 'cancelled'
                        ? 'Payment Cancelled'
                        : 'Payment Authorization Failed'}
                    </h3>
                    <p className="text-xs text-red-300 mt-1 max-w-md mx-auto">
                      {paymentResult.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => setPaymentResult(null)}
                      className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Try Again
                    </button>
                    <button
                      onClick={onClose}
                      className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : isProcessing ? (
            /* Processing Screen */
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full border-4 border-amber-500 border-t-transparent animate-spin mx-auto" />
              <div>
                <h4 className="text-base font-bold text-white">Contacting IMB Gateway</h4>
                <p className="text-xs text-amber-400 mt-1 font-medium animate-pulse">{processStep}</p>
                <p className="text-[11px] text-zinc-500 mt-3">
                  Please do not refresh or close this window while your transaction is being verified.
                </p>
              </div>
            </div>
          ) : (
            /* Payment Method Selection & Checkout */
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2.5">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'upi'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span className="text-[11px] font-bold">UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span className="text-[11px] font-bold">Cards</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'netbanking'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <Building className="w-5 h-5" />
                    <span className="text-[11px] font-bold">NetBanking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('wallet')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'wallet'
                        ? 'bg-amber-500/10 border-amber-500 text-amber-400 shadow-md'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850'
                    }`}
                  >
                    <Wallet className="w-5 h-5" />
                    <span className="text-[11px] font-bold">Wallets</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Payment Method Fields */}
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                {paymentMethod === 'upi' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-zinc-300">
                      Enter UPI ID / VPA
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@bank"
                        className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                      />
                      <span className="absolute right-3 top-2.5 text-[10px] text-emerald-400 font-bold">
                        Verified VPA
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500">
                      Supports Google Pay, PhonePe, Paytm, BHIM, and bank UPI apps.
                    </p>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-300 mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          Expiry (MM/YY)
                        </label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-zinc-300 mb-1">
                          CVV
                        </label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-mono text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-zinc-300">
                      Select Your Bank
                    </label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-xs font-semibold text-white cursor-pointer focus:outline-none focus:border-amber-500"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                    </select>
                  </div>
                )}

                {paymentMethod === 'wallet' && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold text-zinc-300">
                      Choose Digital Wallet
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-zinc-200">
                        <span>Amazon Pay Balance</span>
                        <span className="text-[10px] text-emerald-400 font-bold">Connected</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-zinc-200">
                        <span>Paytm Wallet</span>
                        <span className="text-[10px] text-zinc-400">Available</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Primary Action Button: Pay Amount via IMB */}
              <button
                type="button"
                onClick={() => handlePay('success')}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
                <span>Pay ₹{plan.priceInr} via IMB Gateway</span>
              </button>

              {/* Sandbox Gateway Testing Strip (for Module 10 verification) */}
              <div className="pt-2 border-t border-zinc-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>IMB Gateway Test Cases</span>
                  </span>
                  <span className="text-[9px] text-zinc-500">Official IMB Verification Engine</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handlePay('failure')}
                    className="py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-red-400 border border-red-500/20 text-[10px] font-semibold transition-colors cursor-pointer"
                    title="Simulate bank authorization failure"
                  >
                    Simulate Decline
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePay('cancelled')}
                    className="py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-amber-400 border border-amber-500/20 text-[10px] font-semibold transition-colors cursor-pointer"
                    title="Simulate user cancelling at gateway checkout"
                  >
                    Simulate Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePay('success', true)}
                    className="py-1.5 px-2 rounded-lg bg-zinc-900 hover:bg-zinc-850 text-purple-400 border border-purple-500/20 text-[10px] font-semibold transition-colors cursor-pointer"
                    title="Simulate tampered signature to test rejection"
                  >
                    Test Bad Signature
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Security Footer */}
        <div className="bg-zinc-950 p-3 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            <span>PCI-DSS Level 1 Compliant</span>
          </span>
          <span className="text-[10px] text-zinc-400">Powered by IMB Payment Gateway</span>
        </div>
      </div>
    </div>
  );
};
