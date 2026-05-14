"use client";

import { useCart } from "@/hooks/useCart";
import { ProductImage } from "@/types";
import { Lock, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export default function CartPage() {
  const {
    items,
    total,
    removeItem,
    increaseQty,
    decreaseQty,
    isLoggedIn,
    clearCart,
  } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
        <ShoppingBag size={48} strokeWidth={1} className="text-black/10" />
        <div className="text-center">
          <p className="font-newsreader text-2xl text-foreground mb-2">
            Your cart is empty
          </p>
          <p className="text-sm text-foreground-muted tracking-[1px]">
            Looks like you haven&apos;t added anything yet.
          </p>
        </div>
        <div className="flex gap-3 mt-2">
          {[
            { label: "Men", href: "/men" },
            { label: "Women", href: "/women" },
            { label: "Kids", href: "/kids" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="px-5 py-2 text-[11px] tracking-[2px] uppercase border border-black/20 hover:bg-black hover:text-white transition-colors rounded-lg"
            >
              {label}
            </Link>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-black/10">
        <div className="max-w-360 mx-auto px-6 sm:px-10 md:px-16 py-12 md:py-16 flex items-end justify-between">
          <div>
            <p className="text-[11px] tracking-[3px] uppercase text-foreground-muted mb-2">
              My Cart
            </p>
            <h1 className="font-newsreader text-3xl md:text-4xl text-foreground">
              {items.length} {items.length === 1 ? "Item" : "Items"}
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="hidden sm:flex items-center gap-2 text-[11px] tracking-[2px] uppercase text-foreground-muted hover:text-black transition-colors"
          >
            <Trash2 size={13} />
            Clear Cart
          </button>
        </div>
      </div>

      <div className="max-w-360 mx-auto px-6 sm:px-10 md:px-16 py-10 md:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Items list */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => {
              const product = item.product;
              const primaryImage =
                product?.product_images?.find(
                  (img: ProductImage) => img.is_primary,
                )?.url ??
                product?.product_images?.[0]?.url ??
                null;

              return (
                <div
                  key={item.product_id}
                  className="flex gap-4 items-center border border-black/10 rounded-xl p-4 hover:border-black/20 transition-colors"
                >
                  {/* Image */}
                  <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-[#f5f5f5] shrink-0">
                    {primaryImage ? (
                      <Image
                        src={primaryImage}
                        alt={product?.name ?? "Product"}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-black/5 flex items-center justify-center">
                        <ShoppingBag
                          size={18}
                          className="text-black/20"
                          strokeWidth={1}
                        />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-newsreader text-[16px] text-foreground truncate">
                      {product?.name ?? "Loading..."}
                    </p>
                    <p className="text-xs tracking-[1px] text-foreground-muted mt-0.5">
                      {formatPrice(product?.price ?? 0)} MMK
                    </p>
                  </div>

                  {/* Quantity */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => decreaseQty(item.product_id)}
                      className="h-7 w-7 rounded-lg border border-black/10 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-colors"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="w-6 text-center text-sm text-foreground-primary">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQty(item.product_id)}
                      className="h-7 w-7 rounded-lg border border-black/10 flex items-center justify-center hover:bg-black hover:text-white hover:border-black transition-colors"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Line total */}
                  <p className="text-sm font-medium text-foreground-primary whitespace-nowrap shrink-0 hidden sm:block">
                    {formatPrice((product?.price ?? 0) * item.quantity)} MMK
                  </p>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.product_id)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-foreground-muted hover:bg-black hover:text-white transition-colors shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
              );
            })}

            {/* Mobile clear cart */}
            <div className="sm:hidden pt-2">
              <button
                onClick={clearCart}
                className="flex items-center gap-2 text-[11px] tracking-[2px] uppercase text-foreground-muted hover:text-black transition-colors"
              >
                <Trash2 size={13} />
                Clear Cart
              </button>
            </div>
          </div>

          {/* Order summary */}
          <div className="space-y-4">
            <div className="border border-black/10 rounded-xl p-5 space-y-3 sticky top-24">
              <p className="text-[11px] tracking-[2px] uppercase text-foreground-muted mb-4">
                Order Summary
              </p>

              {/* Item breakdown */}
              <div className="space-y-2">
                {items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-foreground-muted truncate mr-4">
                      {item.product?.name} × {item.quantity}
                    </span>
                    <span className="text-foreground-primary whitespace-nowrap">
                      {formatPrice((item.product?.price ?? 0) * item.quantity)}{" "}
                      MMK
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-black/10 pt-3 flex justify-between">
                <span className="text-[11px] tracking-[2px] uppercase text-foreground">
                  Total
                </span>
                <span className="text-sm font-semibold text-foreground-primary">
                  {formatPrice(total)} MMK
                </span>
              </div>

              {/* Checkout button */}
              {isLoggedIn ? (
                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full bg-black text-white py-3 rounded-lg text-[12px] tracking-[2px] uppercase hover:bg-black/80 transition-colors mt-2"
                >
                  Checkout
                </button>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="w-full bg-black text-white py-3 rounded-lg text-[12px] tracking-[2px] uppercase hover:bg-black/80 transition-colors mt-2 flex items-center justify-center gap-2"
                >
                  <Lock size={13} />
                  Sign in to Checkout
                </button>
              )}

              <Link
                href="/men"
                className="flex items-center justify-center w-full py-3 border border-black/10 rounded-lg text-[11px] tracking-[2px] uppercase text-foreground-muted hover:border-black hover:text-black transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
