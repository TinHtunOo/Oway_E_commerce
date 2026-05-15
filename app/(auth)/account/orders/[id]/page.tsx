import { OrderWithDetails, OrderStatus } from "@/types";
import { formatPrice } from "@/app/men/page";
import { ArrowLeft, MapPin, Package } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Oway: Orders",
};

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; className: string; step: number }
> = {
  pending: {
    label: "Pending",
    className: "bg-yellow-50 text-yellow-700 border-yellow-200",
    step: 1,
  },
  confirmed: {
    label: "Confirmed",
    className: "bg-blue-50 text-blue-700 border-blue-200",
    step: 2,
  },
  shipped: {
    label: "Shipped",
    className: "bg-purple-50 text-purple-700 border-purple-200",
    step: 3,
  },
  delivered: {
    label: "Delivered",
    className: "bg-green-50 text-green-700 border-green-200",
    step: 4,
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-50 text-red-600 border-red-200",
    step: 0,
  },
};

const STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pending", label: "Order Placed" },
  { key: "confirmed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

interface PageProps {
  params: { id: string };
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Auth check
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) redirect("/login");

  // Fetch order
  const { data, error } = await supabase
    .from("orders")
    .select(
      `
      *,
      order_items (
        *,
        products (
          id,
          name,
          slug,
          product_images (url, is_primary)
        )
      ),
      addresses (*)
    `,
    )
    .eq("id", id)
    .eq("user_id", authData.user.id) // ensures users can't view others' orders
    .single();

  if (error || !data) notFound();

  const order = data as OrderWithDetails;
  const status = STATUS_CONFIG[order.status];
  const isCancelled = order.status === "cancelled";

  const subtotal = order.order_items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0,
  );

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-black/10">
        <div className="max-w-360 mx-auto px-6 sm:px-10 md:px-16 py-10 md:py-14">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-[11px] tracking-[2px] uppercase text-foreground-muted hover:text-black transition-colors mb-6"
          >
            <ArrowLeft size={13} />
            My Orders
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <p className="text-[11px] tracking-[3px] uppercase text-foreground-muted mb-2">
                Order Details
              </p>
              <h1 className="font-newsreader text-3xl md:text-4xl text-foreground">
                #{order.id.slice(0, 8).toUpperCase()}
              </h1>
              <p className="text-sm text-foreground-muted mt-1">
                Placed on{" "}
                {new Date(order.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            <span
              className={`self-start sm:self-auto inline-flex items-center px-3 py-1 rounded-lg text-[11px] tracking-[1.5px] uppercase border font-medium ${status.className}`}
            >
              {status.label}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-360 mx-auto px-6 sm:px-10 md:px-16 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Left col — items + tracker */}
          <div className="lg:col-span-2 space-y-10">
            {/* Cancelled notice */}
            {isCancelled && (
              <div className="border border-red-200 bg-red-50 rounded-xl px-5 py-4">
                <p className="text-sm text-red-600 tracking-[0.5px]">
                  This order has been cancelled.
                </p>
              </div>
            )}

            {/* Order items */}
            <div>
              <p className="text-[11px] tracking-[2px] uppercase text-foreground-muted mb-4">
                Items ({order.order_items.length})
              </p>
              <ul className="space-y-4">
                {order.order_items.map((item) => {
                  const primaryImage =
                    item.products?.product_images?.find((i) => i.is_primary) ??
                    item.products?.product_images?.[0];

                  return (
                    <li
                      key={item.id}
                      className="flex items-center gap-4 border border-black/10 rounded-xl p-4"
                    >
                      {/* Image */}
                      <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-[#f5f5f5]">
                        {primaryImage ? (
                          <Image
                            src={primaryImage.url}
                            alt={item.products?.name ?? ""}
                            width={80}
                            height={80}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full bg-black/5 flex items-center justify-center">
                            <Package
                              size={20}
                              className="text-black/20"
                              strokeWidth={1}
                            />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.products?.slug}`}
                          className="text-sm font-newsreader text-foreground hover:underline underline-offset-4 truncate block"
                        >
                          {item.products?.name}
                        </Link>
                        <p className="text-xs text-foreground-muted mt-1">
                          Qty: {item.quantity}
                        </p>
                        <p className="text-xs text-foreground-muted">
                          {formatPrice(item.unit_price)} MMK each
                        </p>
                      </div>

                      {/* Line total */}
                      <p className="text-sm font-medium text-foreground-primary whitespace-nowrap flex-shrink-0">
                        {formatPrice(item.unit_price * item.quantity)} MMK
                      </p>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* Right col — summary + address */}
          <div className="space-y-6 mt-0 md:mt-8">
            {/* Order summary */}
            <div className="border border-black/10 rounded-xl p-5 space-y-3">
              <p className="text-[11px] tracking-[2px] uppercase text-foreground-muted mb-4">
                Order Summary
              </p>

              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Subtotal</span>
                <span className="text-foreground-primary">
                  {formatPrice(subtotal)} MMK
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-foreground-muted">Shipping</span>
                <span className="text-foreground-primary">
                  {order.total - subtotal === 0
                    ? "Free"
                    : `${formatPrice(order.total - subtotal)} MMK`}
                </span>
              </div>

              <div className="border-t border-black/10 pt-3 flex justify-between">
                <span className="text-[11px] tracking-[2px] uppercase text-foreground">
                  Total
                </span>
                <span className="text-sm font-semibold text-foreground-primary">
                  {formatPrice(order.total)} MMK
                </span>
              </div>
            </div>

            {/* Shipping address */}
            {order.addresses && (
              <div className="border border-black/10 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin size={13} className="text-foreground-muted" />
                  <p className="text-[11px] tracking-[2px] uppercase text-foreground-muted">
                    Shipping Address
                  </p>
                </div>
                <div className="space-y-1 text-sm text-foreground-primary leading-relaxed">
                  <p>{order.addresses.line1}</p>
                  {order.addresses.line2 && <p>{order.addresses.line2}</p>}
                  <p>
                    {order.addresses.city}
                    {order.addresses.state ? `, ${order.addresses.state}` : ""}
                    {order.addresses.postal_code
                      ? ` ${order.addresses.postal_code}`
                      : ""}
                  </p>
                  <p className="text-foreground-muted">
                    {order.addresses.country}
                  </p>
                </div>
              </div>
            )}

            {/* Back button */}
            <Link
              href="/account"
              className="flex items-center justify-center gap-2 w-full py-3 border border-black/10 rounded-xl text-[11px] tracking-[2px] uppercase text-foreground-muted hover:border-black hover:text-black transition-colors"
            >
              <ArrowLeft size={13} />
              Back to Orders
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
