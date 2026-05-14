"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { OrderWithDetails, OrderStatus } from "@/types";
import { formatPrice } from "@/app/men/page";
import { ChevronRight, LogOut, Package } from "lucide-react";
import Link from "next/link";

type FormData = {
  full_name: string;
  phone: string;
};

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> =
  {
    pending: {
      label: "Pending",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    },
    confirmed: {
      label: "Confirmed",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    },
    shipped: {
      label: "Shipped",
      className: "bg-purple-50 text-purple-700 border-purple-200",
    },
    delivered: {
      label: "Delivered",
      className: "bg-green-50 text-green-700 border-green-200",
    },
    cancelled: {
      label: "Cancelled",
      className: "bg-red-50 text-red-600 border-red-200",
    },
  };

type Tab = "orders" | "profile";

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  const { register, handleSubmit, reset } = useForm<FormData>();

  useEffect(() => {
    const init = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        router.push("/login");
        return;
      }
      setUser(authData.user);

      // Fetch profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (profile) {
        setUserProfile(profile);
        reset({
          full_name: profile.full_name ?? "",
          phone: profile.phone ?? "",
        });
      }

      // Fetch orders with items + address
      const { data: ordersData } = await supabase
        .from("orders")
        .select(
          `
          *,
          order_items (
            *,
            products (
              name,
              slug,
              product_images (url, is_primary)
            )
          ),
          addresses (*)
        `,
        )
        .eq("user_id", authData.user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      setOrders((ordersData as OrderWithDetails[]) ?? []);
      setLoading(false);
    };

    init();
  }, [router, reset]);

  const onSubmit = async (formData: FormData) => {
    if (!user) return;

    setSaving(true);
    setSaveSuccess(false);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
      })
      .eq("id", user.id);

    setSaving(false);

    if (!error) {
      setUserProfile((prev: any) => ({
        ...prev,
        full_name: formData.full_name,
        phone: formData.phone,
      }));

      setSaveSuccess(true);

      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("cart-merged");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/10 border-t-black" />
          <p className="text-xs tracking-[2px] uppercase text-foreground-muted">
            Loading
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Page header */}
      <div className="border-b border-black/10 max-w-360 mx-auto">
        <div className="max-w-360 mx-auto px-6 sm:px-10 md:px-16 py-12 md:py-16 flex items-end justify-between">
          <div>
            <p className="text-[11px] tracking-[3px] uppercase text-foreground-muted mb-2">
              My Account
            </p>
            <h1 className="font-newsreader text-3xl md:text-4xl text-foreground">
              {userProfile?.full_name ?? "Welcome back"}
            </h1>
            <p className="text-sm text-foreground-muted mt-1">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="hidden sm:flex items-center gap-2 text-[11px] tracking-[2px] uppercase text-foreground-muted hover:text-black transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>

        {/* Tabs */}
        <div className="max-w-360 mx-auto px-6 sm:px-10 md:px-16 flex gap-8">
          {(["orders", "profile"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-[11px] tracking-[2px] uppercase transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-black text-foreground"
                  : "border-transparent text-foreground-muted hover:text-foreground"
              }`}
            >
              {tab === "orders" ? "Orders" : "Profile"}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-360 mx-auto px-6 sm:px-10 md:px-16 py-10 md:py-14">
        {/* ── Orders tab ── */}
        {activeTab === "orders" && (
          <div className="max-w-2xl mx-auto">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <Package
                  size={40}
                  strokeWidth={1}
                  className="text-black/10 mb-6"
                />
                <p className="font-newsreader text-2xl text-foreground mb-2">
                  No orders yet
                </p>
                <p className="text-sm text-foreground-muted tracking-[1px] mb-8">
                  When you place an order it will appear here.
                </p>
                <Link
                  href="/men"
                  className="px-6 py-2.5 text-[11px] tracking-[2px] uppercase bg-black text-white hover:bg-black/80 transition-colors rounded-lg"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <ul className="space-y-4">
                {orders.map((order) => {
                  const status = STATUS_CONFIG[order.status];
                  const itemCount = order.order_items?.length ?? 0;
                  const firstItem = order.order_items?.[0];
                  const firstImage =
                    firstItem?.products?.product_images?.find(
                      (i: any) => i.is_primary,
                    ) ?? firstItem?.products?.product_images?.[0];

                  return (
                    <li
                      key={order.id}
                      className="border border-black/10 rounded-xl overflow-hidden hover:border-black/30 transition-colors"
                    >
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="flex items-center gap-5 p-5"
                      >
                        {/* First item thumbnail */}
                        <div className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden bg-[#f5f5f5]">
                          {firstImage ? (
                            <img
                              src={firstImage.url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-black/5" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] tracking-[1px] uppercase border font-medium ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </div>
                          <p className="text-sm text-foreground-primary truncate">
                            {itemCount === 1
                              ? firstItem?.products?.name
                              : `${firstItem?.products?.name} + ${itemCount - 1} more`}
                          </p>
                          <p className="text-xs text-foreground-muted mt-0.5">
                            {new Date(order.created_at).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </p>
                        </div>

                        {/* Total + chevron */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <p className="text-sm font-medium text-foreground-primary">
                            {formatPrice(order.total)} MMK
                          </p>
                          <ChevronRight size={16} className="text-black/30" />
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}

        {/* ── Profile tab ── */}
        {activeTab === "profile" && (
          <div className="max-w-sm">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email — read only */}
              <div className="space-y-1.5">
                <label className="block text-[11px] tracking-[2px] uppercase text-foreground-muted">
                  Email
                </label>
                <div className="w-full border border-black/10 bg-[#f5f5f5] rounded-lg px-4 py-2.5 text-sm text-foreground-muted cursor-not-allowed">
                  {user?.email}
                </div>
              </div>

              {/* Full name */}
              <div className="space-y-1.5">
                <label className="block text-[11px] tracking-[2px] uppercase text-foreground-muted">
                  Full Name
                </label>
                <input
                  {...register("full_name")}
                  placeholder="Ko Aung"
                  className="w-full border border-black/10 bg-[#f9f9f9] rounded-lg px-4 py-2.5 text-sm tracking-[0.5px] text-foreground-primary placeholder:text-foreground-muted outline-none focus:border-black transition-colors"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-[11px] tracking-[2px] uppercase text-foreground-muted">
                  Phone
                </label>
                <input
                  {...register("phone")}
                  placeholder="+95 9 xxx xxx xxx"
                  className="w-full border border-black/10 bg-[#f9f9f9] rounded-lg px-4 py-2.5 text-sm tracking-[0.5px] text-foreground-primary placeholder:text-foreground-muted outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-black text-white text-[11px] tracking-[2px] uppercase rounded-lg hover:bg-black/80 disabled:opacity-40 transition-colors"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </button>
                {saveSuccess && (
                  <p className="text-xs tracking-[1px] text-green-600">
                    Saved ✓
                  </p>
                )}
              </div>
            </form>

            {/* Logout — mobile only (desktop has it in header) */}
            <div className="sm:hidden mt-10 pt-6 border-t border-black/10">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-[11px] tracking-[2px] uppercase text-foreground-muted hover:text-black transition-colors"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
