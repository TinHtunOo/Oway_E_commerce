"use client";

import { useEffect, useState } from "react";
import { useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";
import { ArrowRight, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

function SuccessContent() {
  const stripe = useStripe();
  const router = useRouter();
  const { clearCart } = useCart();
  const [status, setStatus] = useState<"loading" | "success" | "failed">(
    "loading",
  );

  // ── Original logic, untouched ──────────────────────────────────────────
  useEffect(() => {
    if (!stripe) return;

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret",
    );

    if (!clientSecret) {
      router.replace("/");
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      setStatus(paymentIntent?.status === "succeeded" ? "success" : "failed");
      if (paymentIntent?.status === "succeeded") {
        setStatus("success");
        clearCart();
      } else {
        setStatus("failed");
      }
    });
  });
  // ──────────────────────────────────────────────────────────────────────

  if (status === "loading") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-black" />
        <p className="text-xs tracking-[2px] uppercase text-foreground-muted">
          Verifying payment…
        </p>
      </main>
    );
  }

  if (status === "success") {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <div className="max-w-sm w-full space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-black flex items-center justify-center">
              <CheckCircle size={30} stroke="white" strokeWidth={1.5} />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[11px] tracking-[3px] uppercase text-foreground-muted">
              Order Confirmed
            </p>
            <h1 className="font-newsreader text-3xl md:text-4xl text-foreground">
              Thank you!
            </h1>
            <p className="text-sm text-foreground-muted tracking-[0.5px] leading-relaxed">
              Your order has been placed successfully.
              {/* You&lsquo;ll receive a
              confirmation email shortly. */}
            </p>
          </div>

          <div className="border-t border-black/10" />

          <div className="flex flex-col gap-3">
            <Link
              href="/account"
              className="flex items-center justify-center gap-2 w-full bg-black text-white py-3 rounded-lg text-[12px] tracking-[2px] uppercase hover:bg-black/80 transition-colors"
            >
              View My Orders
              <ArrowRight size={13} />
            </Link>
            <Link
              href="/men"
              className="flex items-center justify-center w-full py-3 border border-black/10 rounded-lg text-[11px] tracking-[2px] uppercase text-foreground-muted hover:border-black hover:text-black transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-sm w-full space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
            <XCircle size={30} className="text-red-500" strokeWidth={1.5} />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] tracking-[3px] uppercase text-foreground-muted">
            Payment Failed
          </p>
          <h1 className="font-newsreader text-3xl md:text-4xl text-foreground">
            Something went wrong
          </h1>
          <p className="text-sm text-foreground-muted tracking-[0.5px] leading-relaxed">
            Your payment could not be processed. No charge was made to your
            account.
          </p>
        </div>

        <div className="border-t border-black/10" />

        <div className="flex flex-col gap-3">
          <Link
            href="/checkout"
            className="flex items-center justify-center gap-2 w-full bg-black text-white py-3 rounded-lg text-[12px] tracking-[2px] uppercase hover:bg-black/80 transition-colors"
          >
            Try Again
            <ArrowRight size={13} />
          </Link>
          <Link
            href="/"
            className="flex items-center justify-center w-full py-3 border border-black/10 rounded-lg text-[11px] tracking-[2px] uppercase text-foreground-muted hover:border-black hover:text-black transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Elements stripe={stripePromise}>
      <SuccessContent />
    </Elements>
  );
}
