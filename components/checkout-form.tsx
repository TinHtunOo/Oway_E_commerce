"use client";

import { useState, useEffect } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import type { Address } from "@/types";
import { supabase } from "@/lib/supabase/client";

interface CartItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

interface CheckoutFormProps {
  cartItems: CartItem[];
  total: number;
}

interface AddressForm {
  line1: string;
  line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

const emptyAddress: AddressForm = {
  line1: "",
  line2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
};

export default function CheckoutForm({ cartItems, total }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-fill address if user has one saved
  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const res = await fetch("/api/addresses");
        const { address: saved }: { address: Address | null } =
          await res.json();

        if (saved) {
          setAddress({
            line1: saved.line1,
            line2: saved.line2 ?? "",
            city: saved.city,
            state: saved.state ?? "",
            postal_code: saved.postal_code ?? "",
            country: saved.country,
          });
        }
      } catch (err) {
        console.error("Failed to fetch address:", err);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddress();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError("");

    try {
      // 1. Get userId
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) throw new Error("Not authenticated");

      // 2. Validate Stripe fields
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message ?? "Form error.");
        return;
      }

      // 3. Save address → get addressId
      const addressRes = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(address),
      });
      const { addressId, error: addressError } = await addressRes.json();
      if (addressError) throw new Error(addressError);

      // 4. Create order in DB → get orderId
      const orderRes = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId,
          cartItems,
          total,
          shippingAddressId: addressId,
        }),
      });
      const { orderId, error: orderError } = await orderRes.json();
      if (orderError) throw new Error(orderError);

      // 5. Create PaymentIntent
      const intentRes = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: total, orderId, userId }),
      });
      const { clientSecret, error: intentError } = await intentRes.json();
      if (intentError) throw new Error(intentError);

      // 6. Confirm payment
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/success`,
          receipt_email: email,
        },
      });

      if (stripeError) setError(stripeError.message ?? "Payment failed.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 max-w-lg mx-auto p-6"
    >
      {/* Order Summary */}
      <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-2">
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex justify-between text-sm text-gray-600"
          >
            <span>
              {item.name} × {item.qty}
            </span>
            <span>${(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex justify-between font-medium text-gray-900 pt-2 border-t border-gray-200 mt-1">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          required
          className="border border-gray-200 rounded-lg px-3 h-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Shipping Address */}
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Shipping address{" "}
          {loadingAddress && (
            <span className="text-gray-300">— loading...</span>
          )}
        </p>

        <input
          name="line1"
          value={address.line1}
          onChange={handleChange}
          placeholder="Address line 1"
          required
          className="border border-gray-200 rounded-lg px-3 h-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <input
          name="line2"
          value={address.line2}
          onChange={handleChange}
          placeholder="Address line 2 (optional)"
          className="border border-gray-200 rounded-lg px-3 h-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />

        <div className="grid grid-cols-2 gap-3">
          <input
            name="city"
            value={address.city}
            onChange={handleChange}
            placeholder="City"
            required
            className="border border-gray-200 rounded-lg px-3 h-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            name="state"
            value={address.state}
            onChange={handleChange}
            placeholder="State (optional)"
            className="border border-gray-200 rounded-lg px-3 h-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            name="postal_code"
            value={address.postal_code}
            onChange={handleChange}
            placeholder="Postal code"
            className="border border-gray-200 rounded-lg px-3 h-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            name="country"
            value={address.country}
            onChange={handleChange}
            placeholder="Country"
            required
            className="border border-gray-200 rounded-lg px-3 h-10 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Stripe Card Fields */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Card details
        </label>
        <PaymentElement />
      </div>

      {error && (
        <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || loading || loadingAddress}
        className="h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
      >
        {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
      </button>

      <p className="text-center text-xs text-gray-400">
        🔒 Secured by Stripe · SSL encrypted
      </p>
    </form>
  );
}
