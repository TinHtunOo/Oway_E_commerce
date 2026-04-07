"use client";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "@/components/checkout-form";
import { useCart } from "@/hooks/useCart";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

export default function CheckoutPage() {
  const { items, total } = useCart();
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/login");
        return;
      }

      setAuthChecked(true);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (authChecked && items.length === 0) {
      router.replace("/cart");
    }
  }, [authChecked, items]);

  const cartItems = items.map((item) => ({
    id: item.product_id,
    name: item.product?.name ?? "",
    qty: item.quantity,
    price: item.product?.price ?? 0,
  }));

  if (!authChecked || items.length === 0 || total <= 0) {
    return null; // or a loading spinner
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        mode: "payment",
        amount: Math.round(total * 100),
        currency: "usd",
      }}
    >
      <CheckoutForm cartItems={cartItems} total={total} />
    </Elements>
  );
}
