"use client";

import { useEffect, useState } from "react";
import { useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/useCart";

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

  if (status === "loading") return <p>Checking payment...</p>;
  if (status === "success")
    return (
      <div className="text-center p-10">
        <h1 className="text-2xl font-semibold text-green-600">
          Payment successful!
        </h1>
        <p className="text-gray-500 mt-2">
          Thanks for your order. Check your email for a receipt.
        </p>
      </div>
    );
  return (
    <div className="text-center p-10">
      <h1 className="text-2xl font-semibold text-red-500">Payment failed</h1>
      <p className="text-gray-500 mt-2">Please try again.</p>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Elements stripe={stripePromise}>
      <SuccessContent />
    </Elements>
  );
}
