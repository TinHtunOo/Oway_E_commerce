"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/checkout-form";
import { useCart } from "@/hooks/useCart";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

// Replace with your real cart state/context

export default function CheckoutPage() {
  const { items, total, isLoggedIn } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login");
      return;
    }
    if (items.length === 0) {
      router.replace("/cart");
    }
  }, [isLoggedIn, items]);

  const cartItems = items.map((item) => ({
    id: item.product_id,
    name: item.product?.name ?? "",
    qty: item.quantity,
    price: item.product?.price ?? 0,
  }));

  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: "payment",
        amount: Math.round(total * 100), // in cents
        currency: "usd",
      }}
    >
      <CheckoutForm cartItems={cartItems} total={total} />
    </Elements>
  );
}
