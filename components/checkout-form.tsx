"use client";

import { useState, useEffect } from "react";
import {
  useStripe,
  useElements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import type { Address } from "@/types";
import { supabase } from "@/lib/supabase/client";
import { Lock, MapPin, ShoppingBag } from "lucide-react";

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

function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

const inputClass =
  "w-full border border-black/10 bg-[#f9f9f9] rounded-lg px-4 py-2.5 text-sm tracking-[0.5px] text-foreground-primary placeholder:text-foreground-muted outline-none focus:border-black transition-colors";

const labelClass =
  "block text-[11px] tracking-[2px] uppercase text-foreground-muted mb-1.5";

export default function CheckoutForm({ cartItems, total }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [email, setEmail] = useState("");
  const [address, setAddress] = useState<AddressForm>(emptyAddress);
  const [loadingAddress, setLoadingAddress] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) throw new Error("Not authenticated");

      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message ?? "Form error.");
        return;
      }

      const addressRes = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(address),
      });
      const { addressId, error: addressError } = await addressRes.json();
      if (addressError) throw new Error(addressError);

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

      const intentRes = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: total, orderId, userId }),
      });
      const { clientSecret, error: intentError } = await intentRes.json();
      if (intentError) throw new Error(intentError);

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
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-black/10">
        <div className="max-w-360 mx-auto px-6 sm:px-10 md:px-16 py-12 md:py-16">
          <p className="text-[11px] tracking-[3px] uppercase text-foreground-muted mb-2">
            Checkout
          </p>
          <h1 className="font-newsreader text-3xl md:text-4xl text-foreground">
            Complete Your Order
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-360 mx-auto px-6 sm:px-10 md:px-16 py-10 md:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* ── Left col: contact + address + payment ── */}
            <div className="lg:col-span-2 space-y-10">
              {/* Contact */}
              <section>
                <p className="text-[11px] tracking-[2px] uppercase text-foreground-muted mb-5">
                  Contact
                </p>
                <div className="space-y-1.5">
                  <label className={labelClass}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className={inputClass}
                  />
                </div>
              </section>

              {/* Shipping address */}
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <MapPin size={13} className="text-foreground-muted" />
                  <p className="text-[11px] tracking-[2px] uppercase text-foreground-muted">
                    Shipping Address
                    {loadingAddress && (
                      <span className="ml-2 text-black/20">— loading…</span>
                    )}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className={labelClass}>Address Line 1</label>
                    <input
                      name="line1"
                      value={address.line1}
                      onChange={handleChange}
                      placeholder="Street address"
                      required
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={labelClass}>Address Line 2</label>
                    <input
                      name="line2"
                      value={address.line2}
                      onChange={handleChange}
                      placeholder="Apartment, suite, etc. (optional)"
                      className={inputClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className={labelClass}>City</label>
                      <input
                        name="city"
                        value={address.city}
                        onChange={handleChange}
                        placeholder="Yangon"
                        required
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>State</label>
                      <input
                        name="state"
                        value={address.state}
                        onChange={handleChange}
                        placeholder="Optional"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className={labelClass}>Postal Code</label>
                      <input
                        name="postal_code"
                        value={address.postal_code}
                        onChange={handleChange}
                        placeholder="Optional"
                        className={inputClass}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={labelClass}>Country</label>
                      <input
                        name="country"
                        value={address.country}
                        onChange={handleChange}
                        placeholder="Myanmar"
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment */}
              <section>
                <div className="flex items-center gap-2 mb-5">
                  <Lock size={13} className="text-foreground-muted" />
                  <p className="text-[11px] tracking-[2px] uppercase text-foreground-muted">
                    Payment
                  </p>
                </div>
                <p className="text-[13px] tracking-[2px] uppercase text-foreground-muted">
                  Note:Use the Card Number 4242 4242 4242 4242
                </p>
                <div className="border border-black/10 rounded-xl p-4 bg-[#f9f9f9]">
                  <PaymentElement />
                </div>
              </section>

              {/* Error */}
              {error && (
                <div className="border border-red-200 bg-red-50 text-red-600 text-xs tracking-[0.5px] px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}
            </div>

            {/* ── Right col: order summary ── */}
            <div>
              <div className="border border-black/10 rounded-xl p-5 sticky top-24 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingBag size={13} className="text-foreground-muted" />
                  <p className="text-[11px] tracking-[2px] uppercase text-foreground-muted">
                    Order Summary
                  </p>
                </div>

                {/* Items */}
                <ul className="space-y-2">
                  {cartItems.map((item) => (
                    <li key={item.id} className="flex justify-between text-sm">
                      <span className="text-foreground-muted truncate mr-4">
                        {item.name} × {item.qty}
                      </span>
                      <span className="text-foreground-primary whitespace-nowrap">
                        {formatPrice(item.price * item.qty)} MMK
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-black/10 pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Subtotal</span>
                    <span className="text-foreground-primary">
                      {formatPrice(total)} MMK
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-muted">Shipping</span>
                    <span className="text-foreground-primary">Free</span>
                  </div>
                </div>

                <div className="border-t border-black/10 pt-3 flex justify-between">
                  <span className="text-[11px] tracking-[2px] uppercase text-foreground">
                    Total
                  </span>
                  <span className="text-sm font-semibold text-foreground-primary">
                    {formatPrice(total)} MMK
                  </span>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!stripe || loading || loadingAddress}
                  className="w-full bg-black text-white py-3 rounded-lg text-[12px] tracking-[2px] uppercase hover:bg-black/80 disabled:opacity-40 transition-colors flex items-center justify-center gap-2"
                >
                  <Lock size={13} />
                  {loading ? "Processing…" : `Pay ${formatPrice(total)} MMK`}
                </button>

                <p className="text-center text-[10px] tracking-[1px] text-foreground-muted">
                  Secured by Stripe · SSL encrypted
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
